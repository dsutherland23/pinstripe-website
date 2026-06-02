import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json({ success: true, ...settings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}
