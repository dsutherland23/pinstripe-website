"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import Categories from "@/components/Categories";
import FeaturedRentals, { type RentalItem } from "@/components/FeaturedRentals";
import TentLayoutSimulator from "@/components/TentLayoutSimulator";
import Packages from "@/components/Packages";
import Testimonials from "@/components/Testimonials";
import StatsBar from "@/components/StatsBar";
import Footer from "@/components/Footer";
import QuoteBuilder from "@/components/QuoteBuilder";
import ProductDetail from "@/components/ProductDetail";
import AboutContactModal from "@/components/AboutContactModal";
import Reveal from "@/components/Reveal";
import MobileBottomNav from "@/components/MobileBottomNav";


// ---- Category data ----
const categories = [
  { name: "Bounce Houses",         icon: "castle",  featured: true },
  { name: "Water Slides",          icon: "water",   featured: true },
  { name: "Tents",                 icon: "tent",    featured: true },
  { name: "Tables",                icon: "table",   featured: false },
  { name: "Chairs",                icon: "chair",   featured: false },
  { name: "Cotton Candy Machines", icon: "candy",   featured: false },
  { name: "Popcorn Machines",      icon: "popcorn", featured: false },
  { name: "Photo Booths",          icon: "camera",  featured: false },
];

export default function Home() {
  const [quoteOpen, setQuoteOpen]             = useState(false);
  const [selectedItem, setSelectedItem]       = useState<RentalItem | null>(null);
  const [activeCategory, setActiveCategory]   = useState("All");
  const [searchQuery, setSearchQuery]         = useState("");
  const [searchDate, setSearchDate]           = useState("2026-06-20");
  const [quotePreItem, setQuotePreItem]       = useState<RentalItem | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [aboutContactOpen, setAboutContactOpen] = useState(false);
  const [aboutContactTab, setAboutContactTab]   = useState<"about" | "contact">("about");
  const [plannerEnabled, setPlannerEnabled]     = useState(true);

  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.tentPlannerEnabled === "boolean") {
          setPlannerEnabled(data.tentPlannerEnabled);
        }
      })
      .catch(() => {});
  }, []);

  // Listen for category selections from the Navbar rental dropdown
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.category) {
        setActiveCategory(detail.category === "All" ? "All" : detail.category);
      }
    };
    window.addEventListener("pinstripe:selectCategory", handler);
    return () => window.removeEventListener("pinstripe:selectCategory", handler);
  }, []);

  // Check query parameters on mount (for cross-page category routing)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) {
      setActiveCategory(cat === "All" ? "All" : cat);
      // Small delay to allow DOM/inventory to load before scrolling
      setTimeout(() => {
        const rentalsSection = document.getElementById("rentals");
        if (rentalsSection) {
          const navbarHeight = 90;
          const top = rentalsSection.getBoundingClientRect().top + window.scrollY - navbarHeight;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 150);
    }
  }, []);

  const handleOpenAbout = () => {
    setAboutContactTab("about");
    setAboutContactOpen(true);
  };

  const handleOpenContact = () => {
    setAboutContactTab("contact");
    setAboutContactOpen(true);
  };

  const handleOpenQuote = (pkgName?: string) => {
    setQuotePreItem(null);
    setSelectedPackage(pkgName || null);
    setQuoteOpen(true);
  };

  const handleOpenQuoteWithItem = (item: RentalItem) => {
    setQuotePreItem(item);
    setSelectedPackage(null);
    setQuoteOpen(true);
  };

  const handleSearch = (q: string, cat: string, d: string) => {
    setSearchQuery(q);
    setActiveCategory(cat === "All Categories" ? "All" : cat);
    setSearchDate(d);
  };

  return (
    <main className="pb-18 lg:pb-0" style={{ fontFamily: "var(--font-body)", transition: "padding 0.3s ease" }}>
      <Navbar
        onOpenQuote={handleOpenQuote}
        onOpenAbout={handleOpenAbout}
        onOpenContact={handleOpenContact}
      />

      <Hero onOpenQuote={handleOpenQuote} />

      <Reveal delay={100}>
        <StatsBar />
      </Reveal>

      <SearchBar
        onSearch={handleSearch}
        categories={categories.map((c) => c.name)}
      />

      <Categories
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <Reveal>
        <FeaturedRentals
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          searchDate={searchDate}
          onSelectItem={setSelectedItem}
          onOpenQuote={(item) => item ? handleOpenQuoteWithItem(item) : handleOpenQuote()}
        />
      </Reveal>

      <Reveal>
        <div style={{ textAlign: "center", margin: "1rem 0 5rem" }}>
          <a
            href="/inventory"
            className="btn-primary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            Browse Full Catalog →
          </a>
        </div>
      </Reveal>

      {plannerEnabled && (
        <Reveal>
          <TentLayoutSimulator onOpenQuoteWithItem={handleOpenQuoteWithItem} />
        </Reveal>
      )}

      <Reveal>
        <Packages onOpenQuote={handleOpenQuote} />
      </Reveal>

      <Reveal>
        <Testimonials />
      </Reveal>

      {/* ---- Footer needs top spacing for CTA overlap ---- */}
      <div style={{ paddingTop: "4rem", background: "#ffffff" }}>
        <Footer
          onOpenQuote={handleOpenQuote}
          onOpenAbout={handleOpenAbout}
          onOpenContact={handleOpenContact}
        />
      </div>

      {/* ---- Modals ---- */}
      <ProductDetail
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenQuoteWithItem={handleOpenQuoteWithItem}
      />

      <QuoteBuilder
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        selectedItemFromInventory={quotePreItem}
        selectedPackageFromUI={selectedPackage}
        defaultDate={searchDate}
      />

      <AboutContactModal
        isOpen={aboutContactOpen}
        onClose={() => setAboutContactOpen(false)}
        defaultTab={aboutContactTab}
      />

      <MobileBottomNav
        onOpenQuote={handleOpenQuote}
        onOpenAbout={handleOpenAbout}
        onOpenContact={handleOpenContact}
      />
    </main>
  );
}
