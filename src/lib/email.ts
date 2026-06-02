import { Resend } from "resend";
import { mockInventory } from "@/data/mockInventory";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface EmailQuotePayload {
  ref: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  event: {
    type: string;
    date: string;
    location: string;
    guestCount: number;
  };
  delivery: {
    address: string;
    city: string;
    zipCode: string;
  };
  items: Record<string, number>;
  itemCount: number;
  estimatedTotal: number;
  paymentMethod: string;
  notes?: string;
  submittedAt: string;
}

/**
 * Sends a premium HTML email notification for a new quote request using Resend.
 * Falls back to logging to console if RESEND_API_KEY is not defined.
 */
export async function sendQuoteEmail(payload: EmailQuotePayload): Promise<{ success: boolean; id?: string; error?: string }> {
  // Resolve item details
  const resolvedItems = Object.entries(payload.items).map(([id, qty]) => {
    const item = mockInventory.find((inv) => inv.id === id);
    return {
      title: item ? item.title : `Item #${id}`,
      price: item ? item.price : 0,
      qty,
      total: item ? item.price * qty : 0,
    };
  });

  const itemsListHtml = resolvedItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333;">
          <strong>${item.title}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #666666; text-align: center;">
          ${item.qty}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #666666; text-align: right;">
          $${item.price.toFixed(2)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333; text-align: right; font-weight: bold;">
          $${item.total.toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Quote Request - ${payload.ref}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e1e1e1;">
          <!-- Header -->
          <div style="background-color: #0f0f0f; padding: 30px; text-align: center; border-bottom: 3px solid #D4AF37;">
            <p style="color: #D4AF37; font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 5px 0;">Pinstripes Party &amp; Event Rentals</p>
            <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.02em;">New Quote Request</h1>
            <div style="display: inline-block; background-color: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3); border-radius: 9999px; padding: 4px 12px; font-size: 12px; color: #D4AF37; font-weight: 600; margin-top: 12px;">
              Ref: ${payload.ref}
            </div>
          </div>

          <div style="padding: 30px;">
            <!-- Customer Section -->
            <h2 style="font-size: 16px; border-bottom: 1px solid #D4AF37; padding-bottom: 8px; color: #0f0f0f; margin-top: 0;">Customer Information</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #666666; width: 120px;">Name:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #0f0f0f; font-weight: 600;">${payload.customer.name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #666666;">Email:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #0f0f0f;"><a href="mailto:${payload.customer.email}" style="color: #D4AF37; text-decoration: none; font-weight: 500;">${payload.customer.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #666666;">Phone:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #0f0f0f;"><a href="tel:${payload.customer.phone}" style="color: #D4AF37; text-decoration: none; font-weight: 500;">${payload.customer.phone}</a></td>
              </tr>
            </table>

            <!-- Event Details -->
            <h2 style="font-size: 16px; border-bottom: 1px solid #D4AF37; padding-bottom: 8px; color: #0f0f0f;">Event &amp; Delivery Details</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #666666; width: 120px;">Event Type:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #0f0f0f; font-weight: 500;">${payload.event.type}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #666666;">Event Date:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #0f0f0f; font-weight: 500;">${payload.event.date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #666666;">Guest Count:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #0f0f0f;">${payload.event.guestCount} guests</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #666666;">Delivery Address:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #0f0f0f;">
                  ${payload.delivery.address}<br>
                  ${payload.delivery.city}, VA ${payload.delivery.zipCode}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #666666;">Setup Location:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #0f0f0f;">${payload.event.location}</td>
              </tr>
            </table>

            <!-- Requested Items -->
            <h2 style="font-size: 16px; border-bottom: 1px solid #D4AF37; padding-bottom: 8px; color: #0f0f0f;">Requested Rentals</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <thead>
                <tr style="background-color: #f9f9f9;">
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #666666; text-align: left; border-bottom: 2px solid #eeeeee;">Item</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #666666; text-align: center; border-bottom: 2px solid #eeeeee; width: 60px;">Qty</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #666666; text-align: right; border-bottom: 2px solid #eeeeee; width: 80px;">Rate</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #666666; text-align: right; border-bottom: 2px solid #eeeeee; width: 90px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
            </table>

            <!-- Financials / Notes -->
            <div style="background-color: #fdfbf7; border: 1px solid #f3ebd3; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="font-size: 14px; color: #666666; padding-bottom: 8px;">Payment Method Preference:</td>
                  <td style="font-size: 14px; color: #0f0f0f; font-weight: 600; text-align: right; padding-bottom: 8px;">${payload.paymentMethod}</td>
                </tr>
                <tr style="border-top: 1px dashed #e5dec9; font-size: 16px;">
                  <td style="font-weight: 700; color: #0f0f0f; padding-top: 12px;">Estimated Rental Total:</td>
                  <td style="font-weight: 800; color: #0f0f0f; text-align: right; padding-top: 12px; font-size: 18px;">$${payload.estimatedTotal.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            ${
              payload.notes
                ? `
              <div style="margin-bottom: 25px;">
                <h3 style="font-size: 14px; color: #0f0f0f; margin-bottom: 6px;">Customer Notes / Special Requests:</h3>
                <div style="background-color: #f9f9f9; padding: 12px 15px; border-left: 3px solid #D4AF37; font-size: 13px; color: #555555; line-height: 1.5; border-radius: 0 4px 4px 0;">
                  ${payload.notes}
                </div>
              </div>
            `
                : ""
            }

            <p style="font-size: 12px; color: #999999; margin: 0; text-align: center;">
              Submitted on ${new Date(payload.submittedAt).toLocaleString()}
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f7f7f7; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="font-size: 12px; color: #999999; margin: 0;">
              This is an automated request notification from the Pinstripes Rentals website portal.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log("[EMAIL FALLBACK - NO RESEND API KEY SET]");
    console.log(`To: pinstripesrentals@gmail.com`);
    console.log(`Subject: New Quote Request - ${payload.ref} from ${payload.customer.name}`);
    console.log(`HTML Body Content generated successfully.`);
    return {
      success: true,
      error: "Resend API key missing; logged successfully to server console.",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Pinstripes Rentals <onboarding@resend.dev>", // default sender for free/testing tier, user can configure their verified domain
      to: ["pinstripesrentals@gmail.com"],
      replyTo: payload.customer.email,
      subject: `New Quote Request: ${payload.ref} - ${payload.customer.name}`,
      html: emailHtml,
    });

    if (error) {
      console.error("[Resend Error]:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Email Sending Exception]:", err);
    return { success: false, error: err.message || "Unknown error occurred" };
  }
}
