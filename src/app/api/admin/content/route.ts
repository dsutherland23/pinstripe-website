import { NextRequest, NextResponse } from "next/server";
import { getSiteContent, updateSiteContent } from "@/lib/db";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "pinstripes2024";

function isAuthorized(req: NextRequest): boolean {
  return req.headers.get("x-admin-passcode") === ADMIN_PASSCODE;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const content = getSiteContent();
  return NextResponse.json({ success: true, content });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json({ error: "section and data are required" }, { status: 400 });
    }

    const current = getSiteContent();
    const updated = { ...current, [section]: { ...(current as any)[section], ...data } };
    updateSiteContent(updated);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Content API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
