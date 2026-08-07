import { NextResponse } from "next/server";
import { getDeliveryEngineConfig } from "@/lib/db";
import { calculateDeliveryFee } from "@/lib/delivery-engine";
import { DeliveryCalculationInput } from "@/types/delivery";

export async function POST(req: Request) {
  try {
    const body: DeliveryCalculationInput = await req.json();

    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: "Invalid calculation input. 'items' array is required." },
        { status: 400 }
      );
    }

    const config = await getDeliveryEngineConfig();
    const result = calculateDeliveryFee(body, config);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    console.error("❌ Delivery calculation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to calculate delivery fee." },
      { status: 500 }
    );
  }
}
