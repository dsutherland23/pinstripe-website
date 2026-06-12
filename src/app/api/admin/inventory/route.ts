import { NextRequest, NextResponse } from "next/server";
import { getInventory, updateInventoryItem, addInventoryItem, deleteInventoryItem } from "@/lib/db";
import type { RentalItem } from "@/data/mockInventory";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "pinstripes2024";

function isAuthorized(req: NextRequest): boolean {
  return req.headers.get("x-admin-passcode") === ADMIN_PASSCODE;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = getInventory();
  return NextResponse.json({ success: true, items });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, item } = body;

    if (action === "create" && item) {
      const inventory = getInventory();
      const newId = String(
        inventory.reduce((max, i) => Math.max(max, parseInt(i.id, 10) || 0), 0) + 1
      );
      const newItem: RentalItem = {
        id: newId,
        title: item.title,
        category: item.category,
        description: item.description || "",
        price: parseFloat(item.price) || 0,
        depositAmount: parseFloat(item.depositAmount) || parseFloat(item.price) * 0.3 || 0,
        availability: item.availability !== false,
        dimensions: item.dimensions || "",
        capacity: item.capacity || "",
        image: item.image || "/images/canopy-tent.png",
        rating: parseFloat(item.rating) || 4.8,
        reviews: parseInt(item.reviews, 10) || 0,
        stock: parseInt(item.stock, 10) || 5,
      };
      addInventoryItem(newItem);
      return NextResponse.json({ success: true, item: newItem });
    }

    if (action === "update" && item?.id) {
      const updated = updateInventoryItem(item.id, {
        title: item.title,
        category: item.category,
        description: item.description,
        price: parseFloat(item.price) || 0,
        depositAmount: parseFloat(item.depositAmount) || parseFloat(item.price) * 0.3 || 0,
        availability: item.availability,
        dimensions: item.dimensions,
        capacity: item.capacity,
        image: item.image,
        rating: parseFloat(item.rating) || 4.8,
        reviews: parseInt(item.reviews, 10) || 0,
        stock: parseInt(item.stock, 10) || 5,
      });
      if (!updated) return NextResponse.json({ error: "Item not found" }, { status: 404 });
      return NextResponse.json({ success: true, item: updated });
    }

    if (action === "delete" && item?.id) {
      const deleted = deleteInventoryItem(item.id);
      if (!deleted) return NextResponse.json({ error: "Item not found" }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Inventory API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
