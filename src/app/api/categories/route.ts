import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const categories = await getCategories();
  return NextResponse.json({ success: true, categories });
}
