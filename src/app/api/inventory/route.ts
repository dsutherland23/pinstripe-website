export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getInventory } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const items = await getInventory();
  return NextResponse.json({ success: true, items });
}
