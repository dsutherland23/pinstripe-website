import { NextRequest, NextResponse } from "next/server";
import { getBookings } from "@/lib/db";

export const dynamic = "force-dynamic";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "pinstripes123";

function checkAuth(req: NextRequest): boolean {
  const passcode = req.headers.get("x-admin-passcode");
  return passcode === ADMIN_PASSCODE;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = getBookings();
    // Sort bookings: newest submitted first
    const sorted = [...bookings].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return NextResponse.json({ success: true, bookings: sorted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to load bookings" }, { status: 500 });
  }
}
