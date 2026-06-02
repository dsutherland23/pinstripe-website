import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Pinstripes Party & Event Rentals",
  description:
    "Learn how Pinstripes Party & Event Rentals collects, uses, and protects your personal information when you use our services in the Hampton Roads area of Virginia.",
  robots: { index: true, follow: true },
};

const TOC = [
  { id: "information-collected", title: "Information We Collect", level: 1 },
  { id: "how-we-use", title: "How We Use Your Information", level: 1 },
  { id: "information-sharing", title: "Information Sharing", level: 1 },
  { id: "data-security", title: "Data Security", level: 1 },
  { id: "cookies", title: "Cookies & Tracking", level: 1 },
  { id: "your-rights", title: "Your Rights", level: 1 },
  { id: "children", title: "Children's Privacy", level: 1 },
  { id: "changes", title: "Changes to This Policy", level: 1 },
  { id: "contact", title: "Contact Us", level: 1 },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="We respect your privacy and are committed to protecting your personal information."
      lastUpdated="June 1, 2026"
      tocItems={TOC}
    >
      <div className="highlight-box">
        <p>
          This Privacy Policy applies to Pinstripes Party &amp; Event Rentals, a Virginia-based
          party and event rental company serving Norfolk, Virginia Beach, Chesapeake, Portsmouth,
          Suffolk, Newport News, Hampton, and surrounding areas. By using our website or services,
          you agree to the terms of this policy.
        </p>
      </div>

      <h2 id="information-collected">1. Information We Collect</h2>
      <p>
        We collect information you provide directly to us, as well as information gathered
        automatically when you interact with our website.
      </p>
      <h3>Information You Provide</h3>
      <ul>
        <li>
          <strong>Contact details:</strong> Name, email address, phone number, and mailing address
        </li>
        <li>
          <strong>Event information:</strong> Event date, type, location, guest count, and rental
          preferences
        </li>
        <li>
          <strong>Payment information:</strong> Preferred payment method (we do not store full card
          numbers)
        </li>
        <li>
          <strong>Communications:</strong> Messages, quotes, and correspondence you send us
        </li>
      </ul>
      <h3>Information Collected Automatically</h3>
      <ul>
        <li>
          <strong>Usage data:</strong> Pages visited, time spent, clicks, and navigation patterns
        </li>
        <li>
          <strong>Device information:</strong> Browser type, operating system, screen resolution
        </li>
        <li>
          <strong>IP address:</strong> Used for security, rate limiting, and general geographic
          region identification
        </li>
        <li>
          <strong>Cookies:</strong> See our Cookies section below
        </li>
      </ul>

      <h2 id="how-we-use">2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Process and respond to your rental quote requests</li>
        <li>Communicate with you about your event and rental order</li>
        <li>Send order confirmations, invoices, and delivery schedules</li>
        <li>Improve our website, services, and customer experience</li>
        <li>Protect against fraudulent submissions and abuse</li>
        <li>Comply with applicable Virginia state and federal laws</li>
        <li>Send promotional communications if you have opted in</li>
      </ul>
      <div className="highlight-box">
        <p>
          <strong>We will never sell your personal information</strong> to third parties for their
          own marketing purposes.
        </p>
      </div>

      <h2 id="information-sharing">3. Information Sharing</h2>
      <p>
        We may share your information only in the following limited circumstances:
      </p>
      <ul>
        <li>
          <strong>Service providers:</strong> Third-party vendors who help us operate our business
          (e.g., email providers, payment processors), subject to confidentiality agreements
        </li>
        <li>
          <strong>Legal requirements:</strong> When required by law, court order, or government
          request
        </li>
        <li>
          <strong>Business transfers:</strong> In connection with a merger, sale, or transfer of
          business assets
        </li>
        <li>
          <strong>With your consent:</strong> Any other sharing with your explicit permission
        </li>
      </ul>

      <h2 id="data-security">4. Data Security</h2>
      <p>
        We implement reasonable technical and organizational measures to protect your personal
        information against unauthorized access, alteration, disclosure, or destruction. These
        include:
      </p>
      <ul>
        <li>HTTPS encryption for all data transmitted to and from our website</li>
        <li>Input validation and sanitization to prevent injection attacks</li>
        <li>Rate limiting on form submissions to prevent abuse</li>
        <li>Access controls limiting who can view your data internally</li>
      </ul>
      <p>
        However, no method of internet transmission or electronic storage is 100% secure. While we
        strive to protect your information, we cannot guarantee absolute security.
      </p>

      <h2 id="cookies">5. Cookies &amp; Tracking</h2>
      <p>
        Our website may use cookies and similar tracking technologies to enhance your experience.
        These include:
      </p>
      <ul>
        <li>
          <strong>Essential cookies:</strong> Required for the website to function properly
        </li>
        <li>
          <strong>Analytics cookies:</strong> Help us understand how visitors use our site
          (e.g., Google Analytics)
        </li>
        <li>
          <strong>Preference cookies:</strong> Remember your settings and preferences
        </li>
      </ul>
      <p>
        You can control cookies through your browser settings. Disabling certain cookies may affect
        site functionality.
      </p>

      <h2 id="your-rights">6. Your Rights</h2>
      <p>
        Depending on your location and applicable law, you may have the right to:
      </p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of your personal data</li>
        <li>Opt out of marketing communications at any time</li>
        <li>Lodge a complaint with a supervisory authority</li>
      </ul>
      <p>
        To exercise any of these rights, please contact us using the information in the Contact Us
        section below.
      </p>

      <h2 id="children">7. Children&apos;s Privacy</h2>
      <p>
        Our website and services are not directed to children under the age of 13. We do not
        knowingly collect personal information from children. If you believe we have inadvertently
        collected information from a child, please contact us immediately and we will promptly
        delete that information.
      </p>

      <h2 id="changes">8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of material changes
        by updating the &quot;Last updated&quot; date at the top of this page. We encourage you to
        review this policy periodically. Your continued use of our services after any changes
        constitutes your acceptance of the updated policy.
      </p>

      <h2 id="contact">9. Contact Us</h2>
      <p>
        If you have questions, concerns, or requests regarding this Privacy Policy or our privacy
        practices, please contact us:
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
          <br />
          <strong>Service Area:</strong> Norfolk, Virginia Beach, Chesapeake, Portsmouth, Suffolk,
          Newport News, Hampton &amp; surrounding areas
        </p>
      </div>
    </LegalPageLayout>
  );
}
