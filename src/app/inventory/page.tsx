import { Metadata } from "next";
import InventoryClientPage from "@/components/InventoryClientPage";

export const metadata: Metadata = {
  title: "Premium Party & Event Rental Catalog | Pinstripes Rentals",
  description: "Browse our full collection of high-peak wedding tents, folding tables, chairs, bounce houses, water slides, photo booths, and concessions. Safe, clean, and delivered on time.",
  alternates: {
    canonical: "/inventory",
  },
};

export default function InventoryPage() {
  return <InventoryClientPage />;
}
