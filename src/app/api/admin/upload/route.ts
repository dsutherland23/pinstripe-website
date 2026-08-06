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
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Save to public/images/uploads directory
    const localUploadDir = path.join(process.cwd(), "public", "images", "uploads");
    await mkdir(localUploadDir, { recursive: true });
    await writeFile(path.join(localUploadDir, filename), buffer);

    // If custom server path exists, save there as well
    const isProduction = process.env.NODE_ENV === "production";
    const hostingerDir = "/home/u887289907/domains/pinstripesrentals.com/public_html/images/uploads";
    if (isProduction) {
      try {
        await mkdir(hostingerDir, { recursive: true });
        await writeFile(path.join(hostingerDir, filename), buffer);
      } catch (e) {
        console.warn("Could not write to hostinger custom upload dir:", e);
      }
    }

    const mimeType = file.type || (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");
    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    const imagePath = `/images/uploads/${filename}`;

    // Store dataUrl / imagePath in database
    if (safeItemId && safeItemId !== "new" && !safeItemId.startsWith("special")) {
      await updateInventoryItem(safeItemId, { image: dataUrl });
    }

    return NextResponse.json({ success: true, imagePath, url: imagePath, dataUrl });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
