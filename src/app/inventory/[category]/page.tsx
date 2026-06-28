import { notFound } from "next/navigation";
import { Metadata } from "next";
import InventoryClientPage from "@/components/InventoryClientPage";

const CATEGORIES: Record<string, string> = {
  tents: "Tents",
  tables: "Tables",
  chairs: "Chairs",
  inflatables: "Inflatables",
  photobooth: "Photo Booth",
  "concession-equipment": "Concession Equipment",
  products: "Products",
};

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({
    category: slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryName = CATEGORIES[category.toLowerCase()];
  if (!categoryName) return {};

  return {
    title: `Premium Event ${categoryName} Rentals | Pinstripes Rentals`,
    description: `Rent clean, commercial-grade ${categoryName.toLowerCase()} for weddings, corporate events, and parties. Safe setup & professional delivery.`,
    alternates: {
      canonical: `/inventory/${category.toLowerCase()}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const slug = category.toLowerCase();
  const categoryName = CATEGORIES[slug];

  if (!categoryName) {
    notFound();
  }

  return <InventoryClientPage selectedCategorySlug={slug} />;
}
