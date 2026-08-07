import { NextResponse } from "next/server";
import { getDeliveryEngineConfig, updateDeliveryEngineConfig, getDeliveryAuditLogs } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const config = await getDeliveryEngineConfig();
    const auditLogs = await getDeliveryAuditLogs();
    return NextResponse.json({ success: true, config, auditLogs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch delivery engine config." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { updates, reason } = body;

    if (!updates) {
      return NextResponse.json({ error: "Missing 'updates' object in request body." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const updatedConfig = await updateDeliveryEngineConfig(
      updates,
      "Admin CMS",
      reason || "Updated via Delivery CMS",
      ip
    );

    const auditLogs = await getDeliveryAuditLogs();
    return NextResponse.json({ success: true, config: updatedConfig, auditLogs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update delivery engine config." }, { status: 500 });
  }
}
