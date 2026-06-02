import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBookingById } from "@/lib/db";
import { mockInventory } from "@/data/mockInventory";
import InvoiceControls from "@/components/InvoiceControls";

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: InvoicePageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Invoice ${id} | Pinstripes Party & Event Rentals`,
    robots: { index: false },
  };
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const booking = getBookingById(id.toUpperCase());

  if (!booking) {
    notFound();
  }

  const resolvedItems = Object.entries(booking.items).map(([itemId, qty]) => {
    const item = mockInventory.find((i) => i.id === itemId);
    return {
      title: item ? item.title : `Rental Item #${itemId}`,
      category: item ? item.category : "Rental",
      unitPrice: item ? item.price : 0,
      qty,
      lineTotal: item ? item.price * qty : 0,
    };
  });

  const depositEstimate = booking.estimatedTotal * 0.3;
  const issueDate = new Date(booking.submittedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const eventDateFormatted = new Date(booking.event.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #ffffff !important; color: #000000 !important; }
          .invoice-page { box-shadow: none !important; max-width: 100% !important; }
        }
        @media screen {
          body { background: #f4f4f4; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      `}</style>

      {/* Screen controls */}
      <InvoiceControls />

      {/* Invoice Document */}
      <div className="invoice-page" style={{ maxWidth: "780px", margin: "2rem auto", background: "#ffffff", boxShadow: "0 4px 32px rgba(0,0,0,0.12)", color: "#1a1a1a" }}>

        {/* Header */}
        <div style={{ background: "#0f0f0f", padding: "2.5rem 3rem", borderBottom: "4px solid #D4AF37" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.4rem" }}>Pinstripes Party &amp; Event Rentals</div>
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.82rem", lineHeight: 1.8 }}>
                Norfolk, Virginia 23502<br />
                (757) 200-2600<br />
                pinstripesrentals@gmail.com
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em" }}>INVOICE</div>
              <div style={{ fontFamily: "monospace", fontSize: "1.1rem", color: "#D4AF37", fontWeight: 700, marginTop: "0.25rem" }}>{booking.id}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginTop: "0.5rem" }}>Issued: {issueDate}</div>
            </div>
          </div>
        </div>

        {/* Bill To + Event Info */}
        <div style={{ padding: "2rem 3rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", borderBottom: "1px solid #eeeeee" }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.75rem" }}>Bill To</div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0f0f0f", marginBottom: "0.25rem" }}>{booking.customer.name}</div>
            <div style={{ color: "#555", fontSize: "0.85rem", lineHeight: 1.7 }}>
              {booking.customer.email}<br />
              {booking.customer.phone}<br />
              {booking.delivery.address}<br />
              {booking.delivery.city}, VA {booking.delivery.zipCode}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.75rem" }}>Event Details</div>
            <table style={{ borderCollapse: "collapse", fontSize: "0.85rem", width: "100%" }}>
              <tbody>
                {[
                  ["Event Type", booking.event.type],
                  ["Event Date", eventDateFormatted],
                  ["Guest Count", `${booking.event.guestCount} guests`],
                  ["Setup Location", booking.event.location],
                  ["Payment Method", booking.paymentMethod],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: "0.2rem 0", color: "#888", verticalAlign: "top", paddingRight: "1rem", whiteSpace: "nowrap" }}>{label}:</td>
                    <td style={{ padding: "0.2rem 0", color: "#1a1a1a", fontWeight: 500 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Line Items */}
        <div style={{ padding: "0 3rem 2rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "2rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #0f0f0f" }}>
                <th style={{ padding: "0.75rem 0", textAlign: "left", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888" }}>Rental Item</th>
                <th style={{ padding: "0.75rem 0", textAlign: "center", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888" }}>Category</th>
                <th style={{ padding: "0.75rem 0", textAlign: "center", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888" }}>Qty</th>
                <th style={{ padding: "0.75rem 0", textAlign: "right", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888" }}>Daily Rate</th>
                <th style={{ padding: "0.75rem 0", textAlign: "right", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {resolvedItems.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "0.875rem 0", fontWeight: 600, color: "#0f0f0f", fontSize: "0.9rem" }}>{item.title}</td>
                  <td style={{ padding: "0.875rem 0", textAlign: "center", fontSize: "0.82rem", color: "#666" }}>{item.category}</td>
                  <td style={{ padding: "0.875rem 0", textAlign: "center", fontSize: "0.9rem", color: "#0f0f0f" }}>{item.qty}</td>
                  <td style={{ padding: "0.875rem 0", textAlign: "right", fontSize: "0.9rem", color: "#555" }}>${item.unitPrice.toFixed(2)}</td>
                  <td style={{ padding: "0.875rem 0", textAlign: "right", fontSize: "0.9rem", fontWeight: 700, color: "#0f0f0f" }}>${item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals block */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <div style={{ width: "280px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontSize: "0.88rem", color: "#555", borderBottom: "1px dashed #e0e0e0" }}>
                <span>Subtotal</span>
                <span>${booking.estimatedTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontSize: "0.88rem", color: "#555", borderBottom: "1px dashed #e0e0e0" }}>
                <span>Deposit Required (30%)</span>
                <span>${depositEstimate.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.875rem 0", fontSize: "1.1rem", fontWeight: 900, color: "#0f0f0f", borderTop: "2px solid #0f0f0f", marginTop: "0.25rem" }}>
                <span>Total Estimate</span>
                <span style={{ color: "#b8860b" }}>${booking.estimatedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div style={{ padding: "0 3rem 2rem" }}>
            <div style={{ background: "#fdfbf4", border: "1px solid #e8d99a", borderLeft: "3px solid #D4AF37", borderRadius: "0.25rem", padding: "1rem 1.25rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b8860b", marginBottom: "0.4rem" }}>Customer Notes</div>
              <p style={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.6 }}>{booking.notes}</p>
            </div>
          </div>
        )}

        {/* Terms */}
        <div style={{ background: "#f8f8f8", padding: "2rem 3rem", borderTop: "1px solid #e8e8e8" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", marginBottom: "0.75rem" }}>Terms &amp; Conditions</div>
          <ul style={{ fontSize: "0.78rem", color: "#666", lineHeight: 1.7, paddingLeft: "1.25rem" }}>
            <li>A 30% deposit is required to confirm your booking. The remaining balance is due on event day.</li>
            <li>Cancellations made less than 48 hours before the event forfeit the deposit.</li>
            <li>Customer is responsible for any damage to equipment beyond normal wear.</li>
            <li>All prices are estimates. Final invoice will be provided after event confirmation.</li>
          </ul>
        </div>

        {/* Signature Block */}
        <div style={{ padding: "2rem 3rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", borderTop: "1px solid #e0e0e0" }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: "2.5rem" }}>Customer Signature</div>
            <div style={{ borderBottom: "1px solid #aaa", marginBottom: "0.4rem" }}>&nbsp;</div>
            <div style={{ fontSize: "0.72rem", color: "#aaa" }}>Signature / Date</div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: "2.5rem" }}>Authorized Signature</div>
            <div style={{ borderBottom: "1px solid #aaa", marginBottom: "0.4rem" }}>&nbsp;</div>
            <div style={{ fontSize: "0.72rem", color: "#aaa" }}>Pinstripes Rentals Representative</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#0f0f0f", padding: "1.25rem 3rem", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>
            Thank you for choosing Pinstripes Party &amp; Event Rentals — Norfolk, VA · (757) 200-2600 · pinstripesrentals@gmail.com
          </p>
        </div>
      </div>
    </>
  );
}
