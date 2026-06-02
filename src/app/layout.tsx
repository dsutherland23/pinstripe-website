import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pinstripes Party & Event Rentals | Creating Unforgettable Events",
  description:
    "Premium party & event rental company serving Norfolk, Virginia Beach, Chesapeake, Portsmouth, Suffolk, Newport News, Hampton, Yorktown, and Williamsburg. Bounce houses, water slides, tents, tables, chairs, concession machines, wedding décor and more.",
  keywords:
    "bounce house rentals Virginia, water slide rentals Virginia Beach, tent rentals Norfolk, wedding decor rentals Chesapeake, party supply rentals Portsmouth, event equipment Suffolk, corporate events Williamsburg, table chair rentals Newport News",
  openGraph: {
    title: "Pinstripes Party & Event Rentals",
    description: "Creating Unforgettable Events — One Rental At A Time",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pinstripes Party & Event Rentals",
    "alternateName": "Pinstripes Rentals",
    "url": "https://pinstripesrentals.com",
    "logo": "https://pinstripesrentals.com/images/logo.jpg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "(757) 200-2600",
      "contactType": "customer service",
      "areaServed": "US",
      "availableLanguage": "en"
    }
  };

  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
