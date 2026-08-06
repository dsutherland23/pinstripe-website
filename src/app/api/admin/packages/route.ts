import { NextRequest, NextResponse } from "next/server";
import { getPhotoBoothPackages, createPhotoBoothPackage, updatePhotoBoothPackage, deletePhotoBoothPackage } from "@/lib/db";
import type { PhotoBoothPackage } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/auth-security";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const packages = await getPhotoBoothPackages();
    return NextResponse.json({ success: true, packages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, item, id } = body;

    if (action === "create" && item) {
      const existing = await getPhotoBoothPackages();
      const newId = `pkg-${Date.now()}`;
      const order = existing.reduce((max, p) => Math.max(max, p.order || 0), 0) + 1;
      const newPkg: PhotoBoothPackage = {
        id: newId,
        name: item.name || "New Package",
        tagline: item.tagline || "",
        description: item.description || "",
        price: parseFloat(item.price) || 0,
        duration: item.duration || "4 hrs",
        extraHourPrice: parseFloat(item.extraHourPrice) || 65,
        color: item.color || "#D4AF37",
        popular: item.popular === true,
        order,
        items: Array.isArray(item.items) ? item.items : [],
        addons: Array.isArray(item.addons) ? item.addons : [],
      };
      await createPhotoBoothPackage(newPkg);
      return NextResponse.json({ success: true, item: newPkg });
    }

    if (action === "update" && item?.id) {
      const updated = await updatePhotoBoothPackage(item.id, {
        name: item.name,
        tagline: item.tagline,
        description: item.description,
        price: parseFloat(item.price) || 0,
        duration: item.duration,
        extraHourPrice: parseFloat(item.extraHourPrice) || 65,
        color: item.color,
        popular: item.popular === true,
        order: parseInt(item.order, 10) || 0,
        items: Array.isArray(item.items) ? item.items : [],
        addons: Array.isArray(item.addons) ? item.addons : [],
      });
      return NextResponse.json({ success: true, item: updated });
    }

    if (action === "delete" && id) {
      const ok = await deletePhotoBoothPackage(id);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
