import { NextResponse } from "next/server";
import { getInventory } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Public GET /api/inventory
 * Returns all inventory items that are currently available (not suspended).
 * Suspended items (availability: false) are excluded from the customer-facing catalog.
 */
export async function GET() {
  try {
    const allItems = getInventory();
    const available = allItems.filter((item) => item.availability !== false);
    return NextResponse.json({ success: true, items: available });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load inventory" },
      { status: 500 }
    );
  }
}
