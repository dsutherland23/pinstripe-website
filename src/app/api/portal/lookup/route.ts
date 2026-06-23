import { NextRequest, NextResponse } from "next/server";
import { getBookingById, getUserBookings, updateBookingPayment } from "@/lib/db";
import { getAdminPasscode } from "@/lib/auth-security";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia" as any,
    })
  : null;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || searchParams.get("ref");
  const email = searchParams.get("email");
  const passcode = searchParams.get("passcode");
  const sessionId = searchParams.get("session_id");

  if (!id) {
    if (email) {
      const bookings = await getUserBookings(email);
      return NextResponse.json({ success: true, bookings });
    }
    return NextResponse.json({ error: "Booking reference (id or ref) or email is required" }, { status: 400 });
  }

  let booking = await getBookingById(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Auth check: either correct admin passcode or matching customer email
  const adminPasscode = getAdminPasscode();
  const isAdmin = passcode === adminPasscode || req.headers.get("x-admin-passcode") === adminPasscode;
  const isCustomer = email && booking.customer.email.trim().toLowerCase() === email.trim().toLowerCase();

  // Stripe Checkout verification
  if (sessionId && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" && session.metadata?.bookingId === id) {
        const amountInDollars = (session.amount_total || 0) / 100;
        
        // Prevent duplicate logs of the same session
        const alreadyRecorded = booking.payments?.some(p => p.id === sessionId);
        
        if (!alreadyRecorded && amountInDollars > 0) {
          await updateBookingPayment(id, amountInDollars, "Stripe Checkout", sessionId);
          const reloaded = await getBookingById(id);
          if (reloaded) {
            booking = reloaded;
          }
        }
      }
    } catch (stripeErr) {
      console.error("Stripe session verification error in lookup:", stripeErr);
    }
  }

  if (!isAdmin && !isCustomer) {
    return NextResponse.json({ error: "Unauthorized access to this booking" }, { status: 401 });
  }

  return NextResponse.json({ success: true, booking });
}

