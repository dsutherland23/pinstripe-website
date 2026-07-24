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

    // 1. Validate file size (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    // 2. Validate file extension (whitelisted image types only)
    const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif", "svg"]);
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed extensions: jpg, jpeg, png, webp, gif, avif, svg" },
        { status: 400 }
      );
    }

    // 3. Sanitize itemId to prevent path traversal
    const safeItemId = String(itemId).replace(/[^a-zA-Z0-9_-]/g, "");
    if (!safeItemId) {
      return NextResponse.json({ error: "Invalid itemId format" }, { status: 400 });
    }

    const filename = `rental-${safeItemId}-${Date.now()}.${ext}`;
    const isProduction = process.env.NODE_ENV === "production";
    const uploadDir = isProduction
      ? "/home/u887289907/domains/pinstripesrentals.com/public_html/images/uploads"
      : path.join(process.cwd(), "public", "images", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const imagePath = `/images/uploads/${filename}`;
    await updateInventoryItem(safeItemId, { image: imagePath });

    return NextResponse.json({ success: true, imagePath });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
