import { NextRequest, NextResponse } from "next/server";
import { getBookingById, getUserBookings } from "@/lib/db";
import { getAdminPasscode } from "@/lib/auth-security";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || searchParams.get("ref");
  const email = searchParams.get("email");
  const passcode = searchParams.get("passcode");

  if (!id) {
    if (email) {
      const bookings = await getUserBookings(email);
      return NextResponse.json({ success: true, bookings });
    }
    return NextResponse.json({ error: "Booking reference (id or ref) or email is required" }, { status: 400 });
  }

  const booking = await getBookingById(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Auth check: either correct admin passcode or matching customer email
  const adminPasscode = getAdminPasscode();
  const isAdmin = passcode === adminPasscode || req.headers.get("x-admin-passcode") === adminPasscode;
  const isCustomer = email && booking.customer.email.trim().toLowerCase() === email.trim().toLowerCase();

  if (!isAdmin && !isCustomer) {
    return NextResponse.json({ error: "Unauthorized access to this booking" }, { status: 401 });
  }

  return NextResponse.json({ success: true, booking });
}
