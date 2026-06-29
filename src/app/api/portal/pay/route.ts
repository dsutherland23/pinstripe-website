import { NextRequest, NextResponse } from "next/server";
import { getBookingById, updateBookingPayment } from "@/lib/db";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia" as any,
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, amount } = body;

    if (!bookingId || !amount) {
      return NextResponse.json({ error: "bookingId and amount are required" }, { status: 400 });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    if (stripe) {
      // Create a PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parsedAmount * 100), // convert to cents
        currency: "usd",
        description: `Payment for Booking #${bookingId}`,
        metadata: {
          bookingId,
          amount: String(parsedAmount),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return NextResponse.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } else {
      // Stripe is not configured - simulate local success immediately
      console.warn("Stripe is not configured. Simulating payment immediately.");
      const success = await updateBookingPayment(bookingId, parsedAmount, "Simulated Card");
      if (!success) {
        return NextResponse.json({ error: "Failed to apply simulated payment" }, { status: 500 });
      }
      const updatedBooking = await getBookingById(bookingId);
      return NextResponse.json({
        success: true,
        simulated: true,
        booking: updatedBooking,
      });
    }
  } catch (err: any) {
    console.error("Payment API error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

