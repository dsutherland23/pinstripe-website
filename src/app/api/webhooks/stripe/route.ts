import { NextRequest, NextResponse } from "next/server";
import { getBookingById, updateBookingPayment } from "@/lib/db";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia" as any,
    })
  : null;

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured on server" }, { status: 500 });
  }

  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      console.warn("⚠️ STRIPE_WEBHOOK_SECRET is not configured. Parsing raw event body directly.");
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    console.log(`🔔 Stripe Webhook Received: ${event.type}`);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.bookingId;
        const amountString = paymentIntent.metadata.amount;
        const amount = amountString ? parseFloat(amountString) : (paymentIntent.amount / 100);

        if (bookingId) {
          const booking = await getBookingById(bookingId);
          if (booking) {
            const hasPayment = booking.payments?.some((p: any) => p.id === paymentIntent.id);
            if (!hasPayment) {
              const success = await updateBookingPayment(bookingId, amount, "Stripe", paymentIntent.id);
              if (success) {
                console.log(`✅ Payment of $${amount} successfully applied to Booking ${bookingId}`);
              } else {
                console.error(`❌ Failed to update booking payment for Booking ${bookingId}`);
              }
            } else {
              console.log(`ℹ️ Payment ${paymentIntent.id} already applied to Booking ${bookingId}. Skipping.`);
            }
          } else {
            console.error(`❌ Booking ${bookingId} not found for succeeded PaymentIntent`);
          }
        } else {
          console.warn(`⚠️ No bookingId in PaymentIntent ${paymentIntent.id} metadata`);
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        const paymentIntentId = session.payment_intent as string;
        const amountTotal = session.amount_total ? (session.amount_total / 100) : 0;

        if (bookingId) {
          const booking = await getBookingById(bookingId);
          if (booking) {
            const hasPayment = booking.payments?.some((p: any) => p.id === paymentIntentId);
            if (!hasPayment) {
              const success = await updateBookingPayment(bookingId, amountTotal, "Stripe Checkout", paymentIntentId || session.id);
              if (success) {
                console.log(`✅ Checkout payment of $${amountTotal} successfully applied to Booking ${bookingId}`);
              } else {
                console.error(`❌ Failed to update checkout booking payment for Booking ${bookingId}`);
              }
            } else {
              console.log(`ℹ️ Checkout payment ${paymentIntentId || session.id} already applied to Booking ${bookingId}. Skipping.`);
            }
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`❌ Payment failed for PaymentIntent ${paymentIntent.id}: ${paymentIntent.last_payment_error?.message}`);
        break;
      }

      case "payment_intent.processing": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`⏳ Payment is processing for PaymentIntent ${paymentIntent.id}`);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log(`💸 Charge ${charge.id} was refunded.`);
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        console.warn(`⚠️ Dispute created for charge ${dispute.charge}: status ${dispute.status}`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook event handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}