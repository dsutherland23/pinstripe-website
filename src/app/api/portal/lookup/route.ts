import { NextRequest, NextResponse } from "next/server";
import { getBookingById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref")?.trim().toUpperCase();
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!ref || !email) {
    return NextResponse.json(
      { success: false, error: "Both ref and email parameters are required." },
      { status: 400 }
    );
  }

  const booking = getBookingById(ref);

  if (!booking) {
    return NextResponse.json(
      { success: false, error: "No booking found with that reference number." },
      { status: 404 }
    );
  }

  // Verify that the email matches the booking (case-insensitive)
  if (booking.customer.email.toLowerCase() !== email) {
    return NextResponse.json(
      { success: false, error: "Email address does not match our records for that booking reference." },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true, booking });
}
