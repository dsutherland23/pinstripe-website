import { NextRequest, NextResponse } from "next/server";
import { addBooking } from "@/lib/db";

function generateId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "PSR-MPW";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const booking = {
      id: generateId(),
      ...body,
      submittedAt: new Date().toISOString(),
    };
    addBooking(booking);
    return NextResponse.json({ success: true, id: booking.id });
  } catch (err) {
    console.error("Quote API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
