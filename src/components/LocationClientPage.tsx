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

interface LocationClientPageProps {
  cityKey: string;
  cityName: string;
}

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

export default function LocationClientPage({ cityKey, cityName }: LocationClientPageProps) {
  const [quoteOpen, setQuoteOpen]             = useState(false);
  const [selectedItem, setSelectedItem]       = useState<RentalItem | null>(null);
  const [activeCategory, setActiveCategory]   = useState("All");
  const [searchQuery, setSearchQuery]         = useState("");
  const [searchDate, setSearchDate]           = useState("2026-06-20");
  const [quotePreItem, setQuotePreItem]       = useState<RentalItem | null>(null);
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

  const handleOpenAbout = () => {
    setAboutContactTab("about");
    setAboutContactOpen(true);
  };

  const handleOpenContact = () => {
    setAboutContactTab("contact");
    setAboutContactOpen(true);
  };

  const handleOpenQuote = () => {
    setQuotePreItem(null);
    setQuoteOpen(true);
  };

  const handleOpenQuoteWithItem = (item: RentalItem) => {
    setQuotePreItem(item);
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

      {/* Localized Hero */}
      <Hero 
        onOpenQuote={handleOpenQuote} 
        customTitle={`Premium Party & Event Rentals in ${cityName}, VA`}
        customSubtitle={`The ultimate collection of high-peak tents, commercial inflatables, and sweet treats delivered right to your location in ${cityName}.`}
      />

      <Reveal delay={100}>
        <StatsBar />
      </Reveal>

      {/* Local Intro Text Block */}
      <Reveal>
        <div style={{ maxWidth: "1200px", margin: "2rem auto 0", padding: "0 1.5rem" }}>
          <div style={{ background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: "1rem", padding: "2rem", textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", color: "#ffffff", fontSize: "1.5rem", marginBottom: "0.75rem", fontWeight: 800 }}>
              Serving Your Special Events in {cityName}, Virginia
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: "800px", margin: "0 auto", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Planning a party, backyard birthday, graduation celebration, or outdoor wedding reception in {cityName}? 
              Pinstripes Rentals offers premium delivery, setup, and teardown services across the entire city. 
              We ensure all units are clean, fully sanitized, and securely anchored for your event's absolute safety and success.
            </p>
          </div>
        </div>
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

      <div style={{ paddingTop: "4rem", background: "#ffffff" }}>
        <Footer
          onOpenQuote={handleOpenQuote}
          onOpenAbout={handleOpenAbout}
          onOpenContact={handleOpenContact}
        />
      </div>

      <ProductDetail
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenQuoteWithItem={handleOpenQuoteWithItem}
      />

      <QuoteBuilder
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        selectedItemFromInventory={quotePreItem}
        defaultDate={searchDate}
        defaultCity={cityName}
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
