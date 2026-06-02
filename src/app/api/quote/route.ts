import { NextRequest, NextResponse } from "next/server";
import { validateQuotePayload, sanitizeQuotePayload, QuotePayload } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rateLimit";
import { sendQuoteEmail } from "@/lib/email";
import { addBooking } from "@/lib/db";

/** Helper to get client IP from request headers */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export async function POST(req: NextRequest) {
  // 1. Rate limiting — 5 requests per 15 minutes per IP
  const ip = getClientIp(req);
  const rateLimitResult = rateLimit(ip, { maxRequests: 5, windowMs: 15 * 60 * 1000 });
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please wait a few minutes before submitting again.",
        retryAfter: rateLimitResult.retryAfterMs,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimitResult.retryAfterMs ?? 0) / 1000)),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      }
    );
  }

  // 2. Parse JSON body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }

  // 3. Basic type check
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: "Invalid request format." },
      { status: 400 }
    );
  }

  const rawData = body as QuotePayload;

  // 4. Sanitize inputs
  const sanitized = sanitizeQuotePayload(rawData);

  // 5. Validate
  const errors = validateQuotePayload(sanitized);
  if (errors) {
    return NextResponse.json(
      { success: false, error: "Validation failed.", fieldErrors: errors },
      { status: 422 }
    );
  }

  // 6. Format quote summary for logging / notification
  const itemCount = Object.values(sanitized.selectedItems).reduce((a, b) => a + b, 0);
  const deliveryCity = sanitized.city === "Other" ? sanitized.customCity : sanitized.city;
  const quoteRef = `PSR-${Date.now().toString(36).toUpperCase()}`;

  const quoteSummary = {
    ref: quoteRef,
    customer: {
      name: `${sanitized.firstName} ${sanitized.lastName}`,
      email: sanitized.email,
      phone: sanitized.phone,
    },
    event: {
      type: sanitized.eventType,
      date: sanitized.eventDate,
      location: sanitized.eventLocation,
      guestCount: parseInt(sanitized.guestCount, 10) || 0,
    },
    delivery: {
      address: sanitized.address,
      city: deliveryCity,
      zipCode: sanitized.zipCode,
    },
    items: sanitized.selectedItems,
    itemCount,
    estimatedTotal: sanitized.estimatedTotal,
    paymentMethod: sanitized.paymentMethod,
    notes: sanitized.notes,
    submittedAt: new Date().toISOString(),
    ip: ip === "unknown" ? undefined : ip,
  };

  // 7. Log to console (replace with email/CRM integration in production)
  console.log("[QUOTE SUBMISSION]", JSON.stringify(quoteSummary, null, 2));

  // 8. Send email notification via Resend (gracefully falls back if no API key is configured)
  await sendQuoteEmail(quoteSummary);

  // 9. Persist booking to local database
  addBooking({
    id: quoteRef,
    customer: quoteSummary.customer,
    event: quoteSummary.event,
    delivery: quoteSummary.delivery,
    items: quoteSummary.items,
    itemCount: quoteSummary.itemCount,
    estimatedTotal: quoteSummary.estimatedTotal,
    paymentMethod: quoteSummary.paymentMethod,
    notes: quoteSummary.notes,
    submittedAt: quoteSummary.submittedAt,
  });

  // 9. Respond with success
  return NextResponse.json(
    {
      success: true,
      message: "Your quote request has been received! We'll contact you within 24 hours.",
      quoteRef,
    },
    {
      status: 200,
      headers: {
        "X-Quote-Ref": quoteRef,
      },
    }
  );
}

/** Only POST is supported */
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed." },
    { status: 405, headers: { Allow: "POST" } }
  );
}
