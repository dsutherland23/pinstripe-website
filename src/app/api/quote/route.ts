import { NextRequest, NextResponse } from "next/server";
import { addBooking } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { validateQuotePayload } from "@/lib/sanitize";
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
    // 1. Rate limiting (max 10 quotes per 15 minutes per IP)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const limit = rateLimit(`quote_${ip}`, { maxRequests: 10, windowMs: 15 * 60 * 1000 });
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many quote requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 2. Input validation
    const validationErrors = validateQuotePayload(body);
    if (validationErrors) {
      return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 400 });
    }

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
      discount,
      deliveryMethod,
      deliveryFee,
    } = body;

    const deliveryCity = city === "Other" ? customCity : city;
    const finalItems = selectedItems || {};
    const itemCount = Number(Object.values(finalItems).reduce((a: any, b: any) => a + Number(b), 0)) || 0;
    const safeTotal = Math.max(0, Number(estimatedTotal) || 0);

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
        method: deliveryMethod || "delivery",
        fee: Number(deliveryFee) || 0,
      },
      items: finalItems,
      itemCount,
      estimatedTotal: safeTotal,
      discount: Number(discount) || 0,
      paymentMethod: paymentMethod || "",
      status: "pending" as const,
      notes: notes || "",
      submittedAt: new Date().toISOString(),
      amountPaid: 0,
      paymentStatus: "unpaid" as const,
      payments: [],
    };

    await addBooking(booking);

    if (paymentMethod === "Pay Online Now" && stripe && safeTotal > 0) {
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
                unit_amount: Math.round(safeTotal * 100),
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

