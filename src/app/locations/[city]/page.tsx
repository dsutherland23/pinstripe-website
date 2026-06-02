import { notFound } from "next/navigation";
import { Metadata } from "next";
import LocationClientPage from "@/components/LocationClientPage";

// Map slugs to display names
const CITIES: Record<string, string> = {
  norfolk: "Norfolk",
  "virginia-beach": "Virginia Beach",
  chesapeake: "Chesapeake",
  portsmouth: "Portsmouth",
  suffolk: "Suffolk",
  "newport-news": "Newport News",
  hampton: "Hampton",
  yorktown: "Yorktown",
  williamsburg: "Williamsburg",
};

interface LocationPageProps {
  params: Promise<{
    city: string;
  }>;
}

// Generate static params at build time
export async function generateStaticParams() {
  return Object.keys(CITIES).map((slug) => ({
    city: slug,
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = CITIES[city.toLowerCase()];
  if (!cityName) return {};

  return {
    title: `Premium Party & Event Rentals in ${cityName}, VA | Pinstripes`,
    description: `Rent high-peak wedding tents, commercial bounce houses, water slides, tables, and chairs in ${cityName}, VA. Professional delivery, setup, and sanitization.`,
    alternates: {
      canonical: `/locations/${city.toLowerCase()}`,
    },
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { city } = await params;
  const slug = city.toLowerCase();
  const cityName = CITIES[slug];

  if (!cityName) {
    notFound();
  }

  // Structured JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Pinstripes Party & Event Rentals - ${cityName}`,
    "description": `Premium party and event rental services in ${cityName}, VA. Rent clean, commercial-grade tents, tables, chairs, slides, and bounce houses.`,
    "url": `https://pinstripesrentals.com/locations/${slug}`,
    "telephone": "(757) 200-2600",
    "email": "pinstripesrentals@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "100 Gold Coast Parkway",
      "addressLocality": "Norfolk",
      "addressRegion": "VA",
      "postalCode": "23502",
      "addressCountry": "US"
    },
    "areaServed": [
      {
        "@type": "AdministrativeArea",
        "name": cityName
      },
      {
        "@type": "AdministrativeArea",
        "name": "Hampton Roads"
      }
    ],
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "08:00",
      "closes": "20:00"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LocationClientPage cityKey={slug} cityName={cityName} />
    </>
  );
}
