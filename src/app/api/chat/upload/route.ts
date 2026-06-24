import { NextRequest, NextResponse } from "next/server";
import { getBookingById } from "@/lib/db";
import { getAdminPasscode } from "@/lib/auth-security";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bookingId = formData.get("bookingId") as string | null;
    const email = formData.get("email") as string | null;
    const passcode = formData.get("passcode") as string | null;

    if (!file || !bookingId) {
      return NextResponse.json({ error: "file and bookingId are required" }, { status: 400 });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Auth check
    const adminPasscode = getAdminPasscode();
    const isAdmin = passcode === adminPasscode || req.headers.get("x-admin-passcode") === adminPasscode || formData.get("adminPasscode") === adminPasscode;
    const isCustomer = email && booking.customer?.email?.trim().toLowerCase() === email.trim().toLowerCase();

    if (!isAdmin && !isCustomer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `chat-${bookingId}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "images", "chats");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const mediaUrl = `/images/chats/${filename}`;
    return NextResponse.json({ success: true, mediaUrl });
  } catch (err: any) {
    console.error("Chat upload API error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
