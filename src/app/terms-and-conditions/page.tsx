import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions | Pinstripes Party & Event Rentals",
  description:
    "Read the terms and conditions governing your use of Pinstripes Party & Event Rentals services in the Hampton Roads area of Virginia, including booking, cancellations, and liability.",
  robots: { index: true, follow: true },
};

const TOC = [
  { id: "acceptance", title: "Acceptance of Terms", level: 1 },
  { id: "services", title: "Our Services", level: 1 },
  { id: "booking", title: "Booking & Reservations", level: 1 },
  { id: "payment", title: "Payment & Pricing", level: 1 },
  { id: "cancellation", title: "Cancellation & Refunds", level: 1 },
  { id: "delivery", title: "Delivery & Setup", level: 1 },
  { id: "customer-responsibilities", title: "Customer Responsibilities", level: 1 },
  { id: "damage-loss", title: "Damage & Loss", level: 1 },
  { id: "liability", title: "Limitation of Liability", level: 1 },
  { id: "intellectual-property", title: "Intellectual Property", level: 1 },
  { id: "governing-law", title: "Governing Law", level: 1 },
  { id: "contact", title: "Contact Us", level: 1 },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using our services or placing an order."
      lastUpdated="June 1, 2026"
      tocItems={TOC}
    >
      <div className="highlight-box">
        <p>
          These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of Pinstripes Party
          &amp; Event Rentals&apos; website and services. By submitting a quote request, making a
          reservation, or using any of our services, you agree to be bound by these Terms. If you
          do not agree, please do not use our services.
        </p>
      </div>

      <h2 id="acceptance">1. Acceptance of Terms</h2>
      <p>
        By accessing our website at{" "}
        <a href="https://www.pinstripesrentals.com">pinstripesrentals.com</a> or using any of our
        rental services, you confirm that you are at least 18 years of age, have the legal capacity
        to enter into a binding agreement, and agree to these Terms in full.
      </p>

      <h2 id="services">2. Our Services</h2>
      <p>
        Pinstripes Party &amp; Event Rentals provides party and event equipment rental services in
        the Hampton Roads region of Virginia, including but not limited to:
      </p>
      <ul>
        <li>Tent and canopy rentals</li>
        <li>Table and chair rentals</li>
        <li>Linens and decorative accessories</li>
        <li>Bounce houses, inflatables, and entertainment equipment</li>
        <li>Generator and power equipment rentals</li>
        <li>Lighting and d&eacute;cor items</li>
        <li>Event setup and breakdown services</li>
      </ul>
      <p>
        We reserve the right to modify, suspend, or discontinue any service at any time without
        prior notice.
      </p>

      <h2 id="booking">3. Booking &amp; Reservations</h2>
      <p>
        All reservations are subject to equipment availability. A reservation is only confirmed
        upon receipt of a signed rental agreement and the required deposit. Verbal or online quote
        requests do not constitute a confirmed booking.
      </p>
      <ul>
        <li>
          <strong>Deposit:</strong> A non-refundable deposit of 25–50% of the total rental amount
          is required to secure your reservation date
        </li>
        <li>
          <strong>Balance due:</strong> The remaining balance is due no later than 7 days before
          your event date
        </li>
        <li>
          <strong>Advance notice:</strong> Reservations must be made at least 48 hours in advance;
          last-minute bookings are subject to availability and may incur additional fees
        </li>
      </ul>

      <h2 id="payment">4. Payment &amp; Pricing</h2>
      <p>
        We accept cash, Zelle, Venmo, Cash App, and major credit/debit cards. All prices are
        quoted in US dollars and are subject to change without notice. Quoted prices are valid for
        30 days from the date of quote issuance.
      </p>
      <ul>
        <li>
          <strong>Taxes &amp; fees:</strong> Applicable Virginia sales taxes and delivery fees will
          be added to your final invoice
        </li>
        <li>
          <strong>Overages:</strong> Any additional items added or extended rental periods will be
          charged at standard rates
        </li>
        <li>
          <strong>Price adjustments:</strong> Confirmed reservations with paid deposits will not be
          subject to price increases
        </li>
      </ul>

      <h2 id="cancellation">5. Cancellation &amp; Refunds</h2>
      <p>
        We understand events can change. Our cancellation policy is as follows:
      </p>
      <ul>
        <li>
          <strong>30+ days before event:</strong> Full refund of deposit, minus a $50 processing
          fee
        </li>
        <li>
          <strong>15–29 days before event:</strong> 50% of deposit refunded
        </li>
        <li>
          <strong>7–14 days before event:</strong> 25% of deposit refunded
        </li>
        <li>
          <strong>Less than 7 days before event:</strong> No refund; deposit is forfeited
        </li>
        <li>
          <strong>Weather cancellations:</strong> We will work with you to reschedule within 90
          days at no charge for weather-related cancellations made at least 24 hours before delivery
        </li>
      </ul>
      <div className="highlight-box">
        <p>
          <strong>No-shows:</strong> If we arrive for scheduled delivery and cannot access the
          venue, or if the event is cancelled without notice, the full rental amount will be
          charged.
        </p>
      </div>

      <h2 id="delivery">6. Delivery &amp; Setup</h2>
      <p>
        Delivery areas include Norfolk, Virginia Beach, Chesapeake, Portsmouth, Suffolk, Newport
        News, Hampton, Yorktown, and Williamsburg. Delivery fees vary by location and are quoted at
        time of booking.
      </p>
      <ul>
        <li>
          <strong>Access:</strong> You are responsible for ensuring adequate access for our
          delivery vehicles and team
        </li>
        <li>
          <strong>Permits:</strong> You are responsible for obtaining any required permits for
          tents, inflatables, or generators
        </li>
        <li>
          <strong>Setup area:</strong> Please ensure the setup area is clear of obstacles, debris,
          and utility hazards before our arrival
        </li>
        <li>
          <strong>Utilities:</strong> You are responsible for locating underground utilities before
          any staking or anchoring
        </li>
      </ul>

      <h2 id="customer-responsibilities">7. Customer Responsibilities</h2>
      <p>
        As the customer, you are responsible for:
      </p>
      <ul>
        <li>
          Ensuring all rental equipment is used safely and in accordance with provided instructions
        </li>
        <li>
          Supervising children at all times when using inflatables or entertainment equipment
        </li>
        <li>
          Not allowing overcrowding beyond the rated capacity of any rented item
        </li>
        <li>
          Protecting equipment from damage due to misuse, vandalism, or negligence
        </li>
        <li>
          Returning all equipment in the same condition as received, normal wear and tear excepted
        </li>
        <li>
          Complying with all applicable local, state, and federal laws and regulations
        </li>
      </ul>

      <h2 id="damage-loss">8. Damage &amp; Loss</h2>
      <p>
        You are financially responsible for any damage to or loss of rented equipment during the
        rental period, including:
      </p>
      <ul>
        <li>
          <strong>Damage charges:</strong> Repair or replacement costs for damaged items will be
          billed at current market rates
        </li>
        <li>
          <strong>Lost items:</strong> Lost or stolen items will be charged at full replacement
          cost
        </li>
        <li>
          <strong>Cleaning fees:</strong> Excessively soiled equipment may incur cleaning fees of
          $50–$200 depending on the item
        </li>
      </ul>
      <p>
        A damage inspection will be conducted upon pickup. Any damage identified will be
        documented and communicated to you promptly.
      </p>

      <h2 id="liability">9. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by Virginia law, Pinstripes Party &amp; Event Rentals
        shall not be liable for:
      </p>
      <ul>
        <li>Indirect, incidental, or consequential damages arising from use of our services</li>
        <li>Personal injury or property damage resulting from misuse of rented equipment</li>
        <li>Service delays or cancellations due to weather, acts of God, or circumstances beyond
          our control</li>
        <li>Third-party actions or failures</li>
      </ul>
      <p>
        Our maximum liability in any dispute shall not exceed the amount paid by you for the
        specific rental order in question.
      </p>

      <h2 id="intellectual-property">10. Intellectual Property</h2>
      <p>
        All content on this website, including text, graphics, logos, images, and software, is the
        property of Pinstripes Party &amp; Event Rentals and is protected by applicable copyright
        and intellectual property laws. You may not reproduce, distribute, or create derivative
        works without our express written permission.
      </p>

      <h2 id="governing-law">11. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the
        Commonwealth of Virginia, without regard to its conflict of law provisions. Any disputes
        arising under these Terms shall be subject to the exclusive jurisdiction of the courts
        located in Norfolk, Virginia.
      </p>
      <p>
        These Terms constitute the entire agreement between you and Pinstripes Party &amp; Event
        Rentals with respect to your use of our services.
      </p>

      <h2 id="contact">12. Contact Us</h2>
      <p>
        For questions about these Terms &amp; Conditions, please contact us:
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
