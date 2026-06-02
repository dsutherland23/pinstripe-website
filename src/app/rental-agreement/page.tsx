import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Rental Agreement | Pinstripes Party & Event Rentals",
  description:
    "Standard rental agreement for Pinstripes Party & Event Rentals in Hampton Roads, Virginia. Covers equipment use, delivery, damage, insurance, and terms of rental.",
  robots: { index: true, follow: true },
};

const TOC = [
  { id: "parties", title: "Parties to the Agreement", level: 1 },
  { id: "rental-period", title: "Rental Period", level: 1 },
  { id: "equipment-care", title: "Equipment Care & Use", level: 1 },
  { id: "prohibited-uses", title: "Prohibited Uses", level: 1 },
  { id: "delivery-pickup", title: "Delivery & Pickup", level: 1 },
  { id: "payment-deposit", title: "Payment & Deposit", level: 1 },
  { id: "damage-liability", title: "Damage & Liability", level: 1 },
  { id: "insurance", title: "Insurance", level: 1 },
  { id: "weather-policy", title: "Weather Policy", level: 1 },
  { id: "indemnification", title: "Indemnification", level: 1 },
  { id: "dispute-resolution", title: "Dispute Resolution", level: 1 },
  { id: "agreement-acknowledgment", title: "Acknowledgment", level: 1 },
];

export default function RentalAgreementPage() {
  return (
    <LegalPageLayout
      title="Rental Agreement"
      subtitle="Standard terms governing the rental of equipment from Pinstripes Party & Event Rentals."
      lastUpdated="June 1, 2026"
      tocItems={TOC}
    >
      <div className="highlight-box">
        <p>
          <strong>Important:</strong> This Rental Agreement (&quot;Agreement&quot;) is entered into
          between Pinstripes Party &amp; Event Rentals (&quot;Company&quot;) and the customer
          (&quot;Renter&quot;). By confirming a reservation or signing a rental order, the Renter
          agrees to all terms contained herein.
        </p>
      </div>

      <h2 id="parties">1. Parties to the Agreement</h2>
      <p>
        This Agreement is between:
      </p>
      <ul>
        <li>
          <strong>Company:</strong> Pinstripes Party &amp; Event Rentals, a Virginia-based event
          rental company operating in the Hampton Roads metropolitan area.
        </li>
        <li>
          <strong>Renter:</strong> The individual or organization named on the rental order who has
          accepted these terms by placing a reservation or making a payment.
        </li>
      </ul>
      <p>
        The Renter represents that they are at least 18 years of age and have the authority to
        enter into this Agreement.
      </p>

      <h2 id="rental-period">2. Rental Period</h2>
      <p>
        The rental period begins at the time of equipment delivery and ends at the time of pickup
        as specified in the rental order. Standard rental periods are typically 1 day (overnight)
        to 3 days. Multi-day rentals are available and priced accordingly.
      </p>
      <ul>
        <li>
          <strong>Late returns:</strong> Equipment not available for pickup at the agreed time may
          incur additional daily rental charges
        </li>
        <li>
          <strong>Early returns:</strong> Early returns do not qualify for partial refunds unless
          agreed upon in writing in advance
        </li>
        <li>
          <strong>Extensions:</strong> Rental extensions must be requested at least 24 hours before
          the scheduled pickup and are subject to availability
        </li>
      </ul>

      <h2 id="equipment-care">3. Equipment Care &amp; Use</h2>
      <p>
        The Renter agrees to:
      </p>
      <ul>
        <li>
          Use all rented equipment only for its intended purpose and in a safe, responsible manner
        </li>
        <li>
          Follow all safety guidelines, weight limits, and capacity restrictions provided with each
          item
        </li>
        <li>
          Protect equipment from weather damage when appropriate (cover tables and chairs during
          rain, do not use inflatables in high winds or lightning)
        </li>
        <li>
          Not attempt repairs, modifications, or alterations to any rented equipment
        </li>
        <li>
          Keep equipment at the agreed delivery address for the duration of the rental period unless
          prior written consent is obtained
        </li>
        <li>
          Return equipment in clean condition; linens should be free of excessive food, wax, or
          stains
        </li>
      </ul>

      <h2 id="prohibited-uses">4. Prohibited Uses</h2>
      <p>
        The following uses are strictly prohibited and may result in immediate termination of the
        rental agreement without refund:
      </p>
      <ul>
        <li>Subleasing or re-renting equipment to any third party</li>
        <li>Using equipment for any illegal purpose or activity</li>
        <li>Operating inflatables or bounce houses without required adult supervision</li>
        <li>
          Using equipment in weather conditions that exceed manufacturer safety specifications
          (winds above 25 mph, lightning within 8 miles, etc.)
        </li>
        <li>
          Allowing pets on or near linens or upholstered items without protective covers
        </li>
        <li>Using open flames near tents or fabric items without appropriate fire-retardant
          treatment</li>
      </ul>

      <h2 id="delivery-pickup">5. Delivery &amp; Pickup</h2>
      <p>
        Delivery and pickup times will be scheduled at time of booking. The Renter is responsible
        for:
      </p>
      <ul>
        <li>
          Ensuring the delivery location is accessible to our trucks (standard size: up to 26 ft
          box truck)
        </li>
        <li>
          Providing adequate space for equipment setup before our team arrives
        </li>
        <li>
          Having a responsible adult (18+) present at both delivery and pickup
        </li>
        <li>
          Informing us of any access restrictions, stairs, elevators, or special requirements at
          least 48 hours before delivery
        </li>
        <li>
          Calling 811 (Virginia &quot;Call Before You Dig&quot;) before any staking into ground is
          performed
        </li>
      </ul>
      <div className="highlight-box">
        <p>
          If our delivery team is unable to access the venue or set up equipment due to Renter
          failure to comply with the above, the full rental amount will be charged with no refund.
        </p>
      </div>

      <h2 id="payment-deposit">6. Payment &amp; Deposit</h2>
      <p>
        To secure your reservation:
      </p>
      <ul>
        <li>
          <strong>Reservation deposit:</strong> 25–50% of total is required; this deposit is
          non-refundable except as described in the cancellation policy
        </li>
        <li>
          <strong>Balance:</strong> Remaining balance is due 7 days prior to event date
        </li>
        <li>
          <strong>Same-week bookings:</strong> Full payment required at time of booking
        </li>
        <li>
          <strong>Accepted payments:</strong> Cash, Zelle, Venmo, Cash App, Visa, MasterCard,
          American Express, Discover
        </li>
      </ul>
      <p>
        A credit card may be required on file as a security deposit for certain high-value rentals
        or first-time customers.
      </p>

      <h2 id="damage-liability">7. Damage &amp; Liability</h2>
      <p>
        The Renter assumes full responsibility for all equipment from the time of delivery until
        the time of pickup. The Renter shall be liable for:
      </p>
      <ul>
        <li>
          <strong>Accidental damage:</strong> Repair costs as assessed by the Company at fair
          market rates
        </li>
        <li>
          <strong>Intentional or negligent damage:</strong> Full replacement cost of damaged items
        </li>
        <li>
          <strong>Theft or mysterious disappearance:</strong> Full replacement cost
        </li>
        <li>
          <strong>Cleaning fees:</strong> $50–$200 for excessively soiled equipment (candle wax
          on linens, food/beverage stains on fabric items, etc.)
        </li>
      </ul>
      <p>
        The Company will provide the Renter with an itemized damage assessment within 72 hours of
        equipment return. Payment for damages is due within 14 days of invoice.
      </p>

      <h2 id="insurance">8. Insurance</h2>
      <p>
        Pinstripes Party &amp; Event Rentals carries general liability insurance for its business
        operations. However, this insurance does not cover:
      </p>
      <ul>
        <li>Renter-caused damage to rented equipment</li>
        <li>Injuries to Renter&apos;s guests or third parties arising from misuse of equipment</li>
        <li>Property damage at the event venue caused by rented equipment</li>
      </ul>
      <p>
        The Renter is strongly encouraged to obtain event liability insurance to cover potential
        claims arising from their event. The Company may require proof of event insurance for large
        events or high-risk equipment rentals.
      </p>

      <h2 id="weather-policy">9. Weather Policy</h2>
      <p>
        Virginia weather can be unpredictable. Our weather policy:
      </p>
      <ul>
        <li>
          <strong>Rain:</strong> Most of our equipment can be used in light to moderate rain.
          Outdoor events should have contingency plans for heavy downpours.
        </li>
        <li>
          <strong>High winds:</strong> Tents and inflatables must be taken down when sustained
          winds exceed 25 mph or gusts exceed 35 mph. The Renter is responsible for monitoring
          conditions and acting accordingly.
        </li>
        <li>
          <strong>Lightning:</strong> All outdoor activities must cease during lightning within
          8 miles. Do not use tents or inflatables during electrical storms.
        </li>
        <li>
          <strong>Rescheduling:</strong> Weather-related reschedules made at least 24 hours before
          delivery may be accommodated at no charge within 90 days, subject to availability.
        </li>
      </ul>

      <h2 id="indemnification">10. Indemnification</h2>
      <p>
        The Renter agrees to indemnify, defend, and hold harmless Pinstripes Party &amp; Event
        Rentals, its officers, employees, agents, and contractors from and against any claims,
        damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos;
        fees) arising out of or related to:
      </p>
      <ul>
        <li>The Renter&apos;s use of rented equipment</li>
        <li>The Renter&apos;s breach of this Agreement</li>
        <li>Any injury or damage caused by the Renter, their guests, or invitees</li>
        <li>The Renter&apos;s violation of any applicable law or regulation</li>
      </ul>

      <h2 id="dispute-resolution">11. Dispute Resolution</h2>
      <p>
        In the event of a dispute, the parties agree to first attempt resolution through good-faith
        negotiation. If negotiation fails, disputes shall be subject to mediation before any legal
        action is commenced.
      </p>
      <p>
        This Agreement shall be governed by Virginia law. Any unresolved disputes shall be heard
        exclusively in the courts of Norfolk, Virginia. The prevailing party may be entitled to
        reasonable attorneys&apos; fees.
      </p>

      <h2 id="agreement-acknowledgment">12. Acknowledgment</h2>
      <div className="highlight-box">
        <p>
          By placing a reservation, submitting a quote request, or making a payment, the Renter
          acknowledges that they have read, understood, and agree to all terms of this Rental
          Agreement, the Terms &amp; Conditions, and the Privacy Policy of Pinstripes Party &amp;
          Event Rentals. This Agreement constitutes the entire agreement between the parties with
          respect to the rental of equipment.
        </p>
      </div>
      <p>
        For questions, please contact us before completing your reservation:
      </p>
      <div className="highlight-box">
        <p>
          <strong>Pinstripes Party &amp; Event Rentals</strong>
          <br />
          Hampton Roads, Virginia
          <br />
          <strong>Email:</strong>{" "}
          <a href="mailto:pinstripesrentals@gmail.com">pinstripesrentals@gmail.com</a>
          <br />
          <strong>Phone:</strong> <a href="tel:+17572002600">(757) 200-2600</a>
        </p>
      </div>
    </LegalPageLayout>
  );
}
