import { NextResponse } from "next/server";
import { getPhotoBoothPackages } from "@/lib/db";

export async function GET() {
  try {
    const packages = await getPhotoBoothPackages();
    return NextResponse.json({ success: true, packages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch packages" }, { status: 500 });
  }
}
