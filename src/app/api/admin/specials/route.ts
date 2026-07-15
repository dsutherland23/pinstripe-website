import { NextRequest, NextResponse } from "next/server";
import { getSpecials, createSpecial, updateSpecial, deleteSpecial } from "@/lib/db";
import type { SpecialItem } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/auth-security";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getSpecials();
  return NextResponse.json({ success: true, items });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, item } = body;

    if (action === "create" && item) {
      const specials = await getSpecials();
      const newId = `spec-${Date.now()}`;
      const order = specials.reduce((max, s) => Math.max(max, s.order || 0), 0) + 1;
      const newSpecial: SpecialItem = {
        id: newId,
        title: item.title,
        description: item.description || "",
        image: item.image || "",
        originalPrice: parseFloat(item.originalPrice) || 0,
        specialPrice: parseFloat(item.specialPrice) || 0,
        promoCode: item.promoCode || "",
        itemId: item.itemId || "",
        endDate: item.endDate || "",
        badge: item.badge || "",
        enabled: item.enabled !== false,
        featured: item.featured === true,
        order,
      };
      await createSpecial(newSpecial);
      return NextResponse.json({ success: true, item: newSpecial });
    }

    if (action === "update" && item?.id) {
      const updated = await updateSpecial(item.id, {
        title: item.title,
        description: item.description,
        image: item.image,
        originalPrice: parseFloat(item.originalPrice) || 0,
        specialPrice: parseFloat(item.specialPrice) || 0,
        promoCode: item.promoCode,
        itemId: item.itemId,
        endDate: item.endDate,
        badge: item.badge,
        enabled: item.enabled,
        featured: item.featured,
        order: parseInt(item.order, 10) || 0,
      });
      if (!updated) return NextResponse.json({ error: "Special not found" }, { status: 404 });
      return NextResponse.json({ success: true, item: updated });
    }

    if (action === "duplicate" && item?.id) {
      const specials = await getSpecials();
      const source = specials.find(s => s.id === item.id);
      if (!source) return NextResponse.json({ error: "Source special not found" }, { status: 404 });
      
      const newId = `spec-${Date.now()}`;
      const order = specials.reduce((max, s) => Math.max(max, s.order || 0), 0) + 1;
      const newSpecial: SpecialItem = {
        ...source,
        id: newId,
        title: `${source.title} (Copy)`,
        order,
      };
      await createSpecial(newSpecial);
      return NextResponse.json({ success: true, item: newSpecial });
    }

    if (action === "delete" && item?.id) {
      const deleted = await deleteSpecial(item.id);
      if (!deleted) return NextResponse.json({ error: "Special not found" }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Admin Specials API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
