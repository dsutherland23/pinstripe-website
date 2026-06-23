import { NextRequest, NextResponse } from "next/server";
import { updateBookingPayment, getBookingById } from "@/lib/db";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia" as any,
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, amount, paymentMethod, cardDetails } = body;

    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (paymentMethod === "Credit Card" && cardDetails) {
      const { number, expiry, cvc } = cardDetails;
      if (!number || number.replace(/\s/g, "").length < 15) {
        return NextResponse.json({ error: "Invalid credit card number" }, { status: 400 });
      }
      if (!expiry || !expiry.includes("/")) {
        return NextResponse.json({ error: "Invalid expiry date" }, { status: 400 });
      }
      if (!cvc || cvc.length < 3) {
        return NextResponse.json({ error: "Invalid CVC code" }, { status: 400 });
      }

      if (stripe) {
        // Parse expiry MM/YY
        const [expMonthStr, expYearStr] = expiry.split("/");
        const exp_month = parseInt(expMonthStr, 10);
        const shortYear = parseInt(expYearStr, 10);
        const exp_year = shortYear < 100 ? 2000 + shortYear : shortYear;

        try {
          // 1. Create a PaymentMethod with the card details
          const paymentMethodObj = await stripe.paymentMethods.create({
            type: "card",
            card: {
              number: number.replace(/\s/g, ""),
              exp_month,
              exp_year,
              cvc,
            },
          });

          // 2. Create and confirm a PaymentIntent
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(amount) * 100), // Stripe expects amount in cents
            currency: "usd",
            payment_method: paymentMethodObj.id,
            confirm: true,
            description: `Payment for Booking #${bookingId}`,
            automatic_payment_methods: {
              enabled: true,
              allow_redirects: "never",
            },
          });

          if (paymentIntent.status !== "succeeded") {
            return NextResponse.json(
              { error: `Payment failed with status: ${paymentIntent.status}` },
              { status: 400 }
            );
          }
        } catch (stripeErr: any) {
          console.error("Stripe payment processing error:", stripeErr);
          return NextResponse.json(
            { error: stripeErr.message || "Stripe transaction failed" },
            { status: 400 }
          );
        }
      } else {
        console.warn("Stripe is not configured. Simulating payment.");
      }
    }

    const success = await updateBookingPayment(bookingId, Number(amount), paymentMethod);
    if (!success) {
      return NextResponse.json({ error: "Failed to apply payment to booking" }, { status: 500 });
    }

    const updatedBooking = await getBookingById(bookingId);
    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err) {
    console.error("Payment API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

