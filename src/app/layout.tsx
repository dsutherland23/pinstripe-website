export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { getSiteContent, getSettings } from "@/lib/db";
import { generateAccentVariables, generateThemeCss } from "@/lib/theme";
import { ThemeListener } from "@/components/ThemeListener";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let phone = "(757) 200-2600";
  let accentColor = "#D4AF37";
  try {
    const [content, settings, cookieStore] = await Promise.all([
      getSiteContent().catch(() => null),
      getSettings().catch(() => null),
      cookies().catch(() => null),
    ]);
    if (content?.footer?.phone) {
      phone = content.footer.phone;
    }
    if (settings?.accentColor) {
      accentColor = settings.accentColor;
    } else if (cookieStore?.get("pinstripes_accent_color")?.value) {
      const cv = cookieStore.get("pinstripes_accent_color")!.value;
      if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(cv)) {
        accentColor = cv;
      }
    }
  } catch (e) {}

  const themeVars = generateAccentVariables(accentColor);
  const themeCss = generateThemeCss(themeVars);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pinstripes Party & Event Rentals",
    "alternateName": "Pinstripes Rentals",
    "url": "https://pinstripesrentals.com",
    "logo": "https://pinstripesrentals.com/images/pinstripes-logo-new.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": phone,
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
        <style
          id="site-accent-theme"
          dangerouslySetInnerHTML={{ __html: themeCss }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeListener initialColor={accentColor} />
        {children}
      </body>
    </html>
  );
}
