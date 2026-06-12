import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const settings = getSettings();
  return NextResponse.json({ success: true, ...settings });
}
