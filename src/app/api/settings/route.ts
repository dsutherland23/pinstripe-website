export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const settings = await getSettings();
  return NextResponse.json(
    { success: true, ...settings },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}
