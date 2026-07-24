import { NextRequest, NextResponse } from "next/server";
import { getSiteContent, updateSiteContent } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/auth-security";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const content = await getSiteContent();
  return NextResponse.json({ success: true, content });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json({ error: "section and data are required" }, { status: 400 });
    }

    const current = await getSiteContent();
    const sectionData = Array.isArray(data)
      ? data
      : typeof (current as any)[section] === "object" && !Array.isArray((current as any)[section])
      ? { ...(current as any)[section], ...data }
      : data;
    const updated = { ...current, [section]: sectionData };
    await updateSiteContent(updated);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Content API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
