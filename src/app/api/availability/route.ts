import { NextRequest, NextResponse } from "next/server";
import { getItemAvailability, getInventory } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  if (itemId) {
    const availability = getItemAvailability(itemId, date);
    return NextResponse.json({ success: true, ...availability });
  } else {
    const inventory = getInventory();
    const availability: Record<string, any> = {};
    for (const item of inventory) {
      availability[item.id] = getItemAvailability(item.id, date);
    }
    return NextResponse.json({ success: true, date, availability });
  }
}
