import { NextResponse } from "next/server";
import { rollbackDeliveryConfig, getDeliveryAuditLogs } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { auditId, reason } = body;

    if (!auditId) {
      return NextResponse.json({ error: "Missing 'auditId' in request body." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const restoredConfig = await rollbackDeliveryConfig(
      auditId,
      "Admin CMS",
      reason || "Manual rollback executed via CMS",
      ip
    );

    const auditLogs = await getDeliveryAuditLogs();
    return NextResponse.json({ success: true, config: restoredConfig, auditLogs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to execute rollback." }, { status: 500 });
  }
}
