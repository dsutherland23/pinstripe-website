export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSpecials, getSettings } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const settings = await getSettings();
    if (!settings.specialsEnabled) {
      return NextResponse.json({ success: true, enabled: false, items: [] });
    }

    const specials = await getSpecials();
    // Filter to show only enabled specials for the public view
    const enabledSpecials = specials.filter((s) => s.enabled);

    return NextResponse.json({ success: true, enabled: true, items: enabledSpecials });
  } catch (err) {
    console.error("Public Specials API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
