import { NextRequest, NextResponse } from "next/server";
import { getInventory, updateInventoryItem, addInventoryItem } from "@/lib/db";

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
    const items = getInventory();
    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to load inventory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, item } = body;

    if (action === "update") {
      if (!item?.id) {
        return NextResponse.json({ success: false, error: "Item ID is required for updates" }, { status: 400 });
      }
      const updated = updateInventoryItem(item.id, item);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, item: updated });
    }

    if (action === "create") {
      if (!item?.title || !item?.category) {
        return NextResponse.json({ success: false, error: "Title and Category are required" }, { status: 400 });
      }
      // Generate a new unique ID
      const newId = String(getInventory().length + 1);
      const newItem = {
        ...item,
        id: newId,
        rating: item.rating || 5.0,
        reviews: item.reviews || 0,
        availability: item.availability !== undefined ? item.availability : true,
      };
      const created = addInventoryItem(newItem);
      return NextResponse.json({ success: true, item: created });
    }

    return NextResponse.json({ success: false, error: "Invalid action. Expected 'update' or 'create'." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Error processing request" }, { status: 500 });
  }
}
