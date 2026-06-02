import { NextRequest, NextResponse } from "next/server";
import { updateSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "pinstripes123";

function checkAuth(req: NextRequest): boolean {
  const passcode = req.headers.get("x-admin-passcode");
  return passcode === ADMIN_PASSCODE;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (typeof body.tentPlannerEnabled !== "boolean") {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    updateSettings({ tentPlannerEnabled: body.tentPlannerEnabled });
    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
