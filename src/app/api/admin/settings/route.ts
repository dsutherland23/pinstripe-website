import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/auth-security";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getSettings();
  return NextResponse.json({ success: true, ...settings });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await updateSettings({
      tentPlannerEnabled: body.tentPlannerEnabled,
      maintenanceMode: body.maintenanceMode,
      analyticsId: body.analyticsId,
      payInPersonEnabled: body.payInPersonEnabled,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Settings API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
