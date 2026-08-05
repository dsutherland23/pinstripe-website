import { Metadata } from "next";
import InventoryClientPage from "@/components/InventoryClientPage";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const readable = category.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return {
    title: `Premium Event ${readable} Rentals | Pinstripes Rentals`,
    description: `Rent clean, commercial-grade ${readable.toLowerCase()} for weddings, corporate events, and parties. Safe setup & professional delivery.`,
    alternates: {
      canonical: `/inventory/${category.toLowerCase()}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  return <InventoryClientPage selectedCategorySlug={category.toLowerCase()} />;
}
