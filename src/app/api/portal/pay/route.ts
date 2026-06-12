import { NextRequest, NextResponse } from "next/server";
import { updateBookingPayment, getBookingById } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, amount, paymentMethod, cardDetails } = body;

    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    const booking = getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // In a real app we'd connect to Stripe API here:
    // const charge = await stripe.charges.create({ amount: amount * 100, ... })
    // For this demonstration, we simulate card validation
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
    }

    const success = updateBookingPayment(bookingId, Number(amount), paymentMethod);
    if (!success) {
      return NextResponse.json({ error: "Failed to apply payment to booking" }, { status: 500 });
    }

    const updatedBooking = getBookingById(bookingId);
    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err) {
    console.error("Payment API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
