import { NextRequest, NextResponse } from "next/server";
import { getBookingById, getMessages, addMessage, markMessagesAsRead, Message } from "@/lib/db";
import { getAdminPasscode } from "@/lib/auth-security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId") || searchParams.get("id");
    const email = searchParams.get("email");
    const passcode = searchParams.get("passcode");

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Auth check: either correct admin passcode or matching customer email
    const adminPasscode = getAdminPasscode();
    const isAdmin = passcode === adminPasscode || req.headers.get("x-admin-passcode") === adminPasscode;
    const isCustomer = email && booking.customer?.email?.trim().toLowerCase() === email.trim().toLowerCase();

    if (!isAdmin && !isCustomer) {
      return NextResponse.json({ error: "Unauthorized access to this booking chat" }, { status: 401 });
    }

    // Mark incoming messages as read
    const role = isAdmin ? "admin" : "customer";
    await markMessagesAsRead(bookingId, role);

    const messages = await getMessages(bookingId);
    return NextResponse.json({ success: true, messages });
  } catch (err: any) {
    console.error("Chat GET route error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, text, mediaUrl, email, passcode } = body;

    if (!bookingId || (!text && !mediaUrl)) {
      return NextResponse.json({ error: "bookingId and either text or mediaUrl are required" }, { status: 400 });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Auth check
    const adminPasscode = getAdminPasscode();
    const isAdmin = passcode === adminPasscode || req.headers.get("x-admin-passcode") === adminPasscode;
    const isCustomer = email && booking.customer?.email?.trim().toLowerCase() === email.trim().toLowerCase();

    if (!isAdmin && !isCustomer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const senderRole = isAdmin ? "admin" : "customer";
    const senderId = isAdmin ? "admin" : (booking.customer?.email || "customer");

    const message: Message = {
      id: "MSG-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Date.now(),
      bookingId,
      senderId,
      senderRole,
      text: text || "",
      mediaUrl: mediaUrl || undefined,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    const saved = await addMessage(message);
    return NextResponse.json({ success: true, message: saved });
  } catch (err: any) {
    console.error("Chat POST route error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
