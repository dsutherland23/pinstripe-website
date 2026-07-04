export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSiteContent } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const content = await getSiteContent();
    return NextResponse.json({ success: true, content });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load content" }, { status: 500 });
  }
}
