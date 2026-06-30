import { NextRequest, NextResponse } from "next/server";
import { updateInventoryItem } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { isAdminAuthorized } from "@/lib/auth-security";

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const itemId = formData.get("itemId") as string | null;

    if (!file || !itemId) {
      return NextResponse.json({ error: "file and itemId are required" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `rental-${itemId}-${Date.now()}.${ext}`;
    const isProduction = process.env.NODE_ENV === "production";
    const uploadDir = isProduction
      ? "/home/u887289907/domains/pinstripesrentals.com/public_html/images/uploads"
      : path.join(process.cwd(), "public", "images", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const imagePath = `/images/uploads/${filename}`;
    await updateInventoryItem(itemId, { image: imagePath });

    return NextResponse.json({ success: true, imagePath });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
