import { NextRequest, NextResponse } from "next/server";
import { getInventory, getItemAvailability } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ success: false, error: "Date parameter is required (format: YYYY-MM-DD)" }, { status: 400 });
  }

  // Basic regex check for YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ success: false, error: "Invalid date format. Expected YYYY-MM-DD" }, { status: 400 });
  }

  try {
    const inventory = getInventory();
    const availability: Record<string, { totalStock: number; rented: number; available: number }> = {};

    inventory.forEach((item) => {
      availability[item.id] = getItemAvailability(item.id, date);
    });

    return NextResponse.json({
      success: true,
      date,
      availability,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch availability data" }, { status: 500 });
  }
}
