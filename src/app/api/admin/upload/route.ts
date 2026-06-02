import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { updateInventoryItem } from "@/lib/db";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "pinstripes123";

function checkAuth(req: NextRequest): boolean {
  const passcode = req.headers.get("x-admin-passcode");
  return passcode === ADMIN_PASSCODE;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const itemId = formData.get("itemId") as string | null;

    if (!file || !itemId) {
      return NextResponse.json({ success: false, error: "File and Item ID are required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "public/images/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate safe unique filename
    const fileExt = path.extname(file.name) || ".png";
    const baseName = path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${itemId}_${Date.now()}_${baseName}${fileExt}`;
    const filePath = path.join(uploadDir, filename);

    // Save file
    fs.writeFileSync(filePath, new Uint8Array(buffer));
    const imagePath = `/images/uploads/${filename}`;

    // Update in database
    const updated = updateInventoryItem(itemId, { image: imagePath });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Item not found in database" }, { status: 404 });
    }

    return NextResponse.json({ success: true, imagePath });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to upload image" }, { status: 500 });
  }
}
