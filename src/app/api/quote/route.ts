import { NextRequest, NextResponse } from "next/server";
import { addBooking } from "@/lib/db";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia" as any,
    })
  : null;

function generateId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "PSR-MPW";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventType,
      eventDate,
      eventLocation,
      guestCount,
      selectedItems,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      customCity,
      zipCode,
      notes,
      paymentMethod,
      estimatedTotal,
    } = body;

    const deliveryCity = city === "Other" ? customCity : city;
    const finalItems = selectedItems || {};
    const itemCount = Number(Object.values(finalItems).reduce((a: any, b: any) => a + Number(b), 0)) || 0;

    const booking = {
      id: generateId(),
      customer: {
        name: `${firstName || ""} ${lastName || ""}`.trim(),
        email: email || "",
        phone: phone || "",
      },
      event: {
        type: eventType || "",
        date: eventDate || "",
        location: eventLocation || "",
        guestCount: Number(guestCount) || 0,
      },
      delivery: {
        address: address || "",
        city: deliveryCity || "",
        zipCode: zipCode || "",
      },
      items: finalItems,
      itemCount,
      estimatedTotal: Number(estimatedTotal) || 0,
      paymentMethod: paymentMethod || "",
      status: "pending" as const,
      notes: notes || "",
      submittedAt: new Date().toISOString(),
      amountPaid: 0,
      paymentStatus: "unpaid" as const,
      payments: [],
    };

    await addBooking(booking);

    if (paymentMethod === "Pay Online Now" && stripe) {
      const origin = req.headers.get("origin") || "https://pinstripesrentals.com";
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          customer_email: email,
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Booking Deposit/Total for ${booking.id}`,
                  description: "Pinstripes Party & Event Rentals reservation",
                },
                unit_amount: Math.round(Number(estimatedTotal) * 100),
              },
              quantity: 1,
            },
          ],
          success_url: `${origin}/portal?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}&success=true`,
          cancel_url: `${origin}/portal?bookingId=${booking.id}&cancel=true`,
          metadata: {
            bookingId: booking.id,
          },
        });

        return NextResponse.json({ 
          success: true, 
          id: booking.id, 
          checkoutUrl: session.url 
        });
      } catch (stripeErr: any) {
        console.error("Stripe Checkout session creation failed:", stripeErr);
      }
    }
    return NextResponse.json({ success: true, id: booking.id });
  } catch (err) {
    console.error("Quote API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

