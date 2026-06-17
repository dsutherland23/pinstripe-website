import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const settings = await getSettings();
  return NextResponse.json({ success: true, ...settings });
}
