"use client";

import React, { useState, useEffect } from "react";
import { 
  Star, Maximize2, Users, Calendar, Table2, Armchair, 
  Wind, Camera, Coffee, Tent, Search, Info, CheckCircle2, ShoppingBag 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteBuilder from "@/components/QuoteBuilder";
import ProductDetail from "@/components/ProductDetail";
import AboutContactModal from "@/components/AboutContactModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import Reveal from "@/components/Reveal";
import { RadialGlowCard } from "@/components/CursorReactive";
import type { RentalItem } from "@/data/mockInventory";
import Packages from "@/components/Packages";

const FALLBACK = "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=60";

interface InventoryClientPageProps {
  selectedCategorySlug?: string;
}

export default function InventoryClientPage({ selectedCategorySlug }: InventoryClientPageProps) {
  const [inventory, setInventory] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quotePreItem, setQuotePreItem] = useState<RentalItem | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [aboutContactOpen, setAboutContactOpen] = useState(false);
  const [aboutContactTab, setAboutContactTab] = useState<"about" | "contact">("about");
  
  // Client-side search queries
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`/api/inventory?t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setInventory(data.items);
      })
      .catch((err) => console.error("Error loading inventory:", err))
      .finally(() => setLoading(false));
  }, []);

  // Listen for the hash in the URL on load to scroll to correct section
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            const navbarHeight = 160; // Navbar + Sticky jump bar
            const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }, 400);
      }
    };

    if (!loading) {
      handleHash();
    }
  }, [loading]);

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

  // Filter helper
  const matchesSearch = (item: RentalItem) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  };

  // Group inventory items by category slugs and search filter
  const tents = inventory.filter((item) => item.category === "Tents" && matchesSearch(item));
  const tables = inventory.filter((item) => item.category === "Tables" && matchesSearch(item));
  const chairs = inventory.filter((item) => item.category === "Chairs" && matchesSearch(item));
  const inflatables = inventory.filter((item) => (item.category === "Bounce Houses" || item.category === "Water Slides") && matchesSearch(item));
  const photoBooths = inventory.filter((item) => item.category === "Photo Booths" && matchesSearch(item));
  const concessions = inventory.filter((item) => (item.category === "Cotton Candy Machines" || item.category === "Popcorn Machines" || item.category === "Snow-cone Machines") && matchesSearch(item));

  // Category listing configuration
  const rawSections = [
    { 
      title: "Premium High-Peak Tents", 
      id: "tents", 
      items: tents, 
      icon: <Tent size={18} />, 
      desc: "Elegant high-peak structures designed to withstand wind and rain. Perfect for wedding receptions, corporate gatherings, and VIP garden parties." 
    },
    { 
      title: "Heavy-Duty Event Tables", 
      id: "tables", 
      items: tables, 
      icon: <Table2 size={18} />, 
      desc: "Commercial-grade round, banquet, and high-top cocktail tables. Sturdy foundations for your formal sit-down dinners or casual buffets." 
    },
    { 
      title: "Premium Chairs & Seating", 
      id: "chairs", 
      items: chairs, 
      icon: <Armchair size={18} />, 
      desc: "Comfortable and pristine white fan-back folding chairs. Clean, professional seating options that blend into any decorative theme." 
    },
    { 
      title: "Commercial Inflatables & Slides", 
      id: "inflatables", 
      items: inflatables, 
      icon: <Wind size={18} />, 
      desc: "High-grade bounce houses, wet/dry water slides, and interactive obstacles. Thoroughly sanitized and anchored for safe, active play." 
    },
    { 
      title: "Interactive Open-Air Photo Booths", 
      id: "photobooth", 
      items: photoBooths, 
      icon: <Camera size={18} />, 
      desc: "Touchscreen open-air photo stations with instant SMS delivery, custom print layouts, backdrops, and fun wedding/birthday props." 
    },
    { 
      title: "Retro Concession Machinery", 
      id: "concession-equipment", 
      items: concessions, 
      icon: <Coffee size={18} />, 
      desc: "Vintage cotton candy carts and theatre-style popcorn machines. Complete with supplies to bring sweet concession stand vibes to your event." 
    },
  ];

  const sectionsConfig = selectedCategorySlug
    ? rawSections.filter((s) => s.id === selectedCategorySlug)
    : rawSections;

  return (
    <main className="pb-18 lg:pb-0" style={{ fontFamily: "var(--font-body)", background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      
      {/* Decorative ambient blurred radial spots */}
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)", top: "5%", left: "-100px", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)", top: "45%", right: "-150px", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      <Navbar
        onOpenQuote={() => handleOpenQuote()}
        onOpenAbout={handleOpenAbout}
        onOpenContact={handleOpenContact}
      />

      {/* Hero Header with Grid overlay and Search */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--bg-secondary) 0%, rgba(212,175,55,0.02) 60%, var(--bg-primary) 100%)",
          backgroundImage: "radial-gradient(var(--border-secondary) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          padding: "9rem 1.5rem 4.5rem",
          textAlign: "center",
          borderBottom: "1px solid var(--border-primary)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {(() => {
            const activeSection = rawSections.find((s) => s.id === selectedCategorySlug);
            return (
              <>
                <div className="section-label" style={{ justifyContent: "center", display: "inline-flex", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", padding: "0.4rem 1rem", borderRadius: "9999px", color: "#D4AF37", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  ★ {activeSection ? activeSection.title : "Commercial-Grade Rentals"} ★
                </div>
                <h1 className="section-title text-gradient" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "1.25rem", marginTop: "1rem" }}>
                  {activeSection ? activeSection.title : "The Full Inventory"}
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: "620px", margin: "0 auto 2.5rem" }}>
                  {activeSection ? activeSection.desc : "Explore our premium selection of sanitised, professional event gear. Filter by categories below or search to find the perfect assets for your date."}
                </p>
              </>
            );
          })()}

          {/* Premium Search input in Hero */}
          <div 
            style={{ 
              maxWidth: "500px", 
              margin: "0 auto", 
              position: "relative", 
              boxShadow: "0 12px 36px rgba(0,0,0,0.1)",
              borderRadius: "1rem",
              border: "1px solid rgba(212,175,55,0.2)",
              background: "var(--card-bg)"
            }}
          >
            <span style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "#D4AF37", display: "flex" }}>
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder={selectedCategorySlug ? `Search in this category...` : "Search tents, chairs, bounce houses..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "1rem 1.25rem 1rem 3.25rem",
                borderRadius: "1rem",
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "0.95rem",
                color: "var(--text-primary)",
              }}
            />
          </div>
          {selectedCategorySlug && (
            <div style={{ marginTop: "1.5rem" }}>
              <a
                href="/inventory"
                style={{
                  color: "#D4AF37",
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                ← View Full Catalog
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Sticky Glassmorphism Jump Bar */}
      {!selectedCategorySlug && (
        <div
          style={{
            position: "sticky",
            top: "72px",
            zIndex: 900,
            background: "rgba(10, 10, 10, 0.82)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border-primary)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            overflowX: "auto",
            whiteSpace: "nowrap",
            padding: "0.85rem 1.5rem",
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
          }}
          className="no-scrollbar"
        >
          {sectionsConfig.map((sec) => {
            const hasItems = sec.items.length > 0;
            return (
              <button
                key={sec.id}
                disabled={!hasItems && !!searchQuery}
                onClick={() => {
                  const el = document.getElementById(sec.id);
                  if (el) {
                    const navbarHeight = 155; // Navbar + Sticky jump bar
                    const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
                style={{
                  padding: "0.6rem 1.15rem",
                  borderRadius: "9999px",
                  background: "rgba(212,175,55,0.04)",
                  border: "1px solid rgba(212,175,55,0.15)",
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#D4AF37",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  opacity: (!hasItems && !!searchQuery) ? 0.3 : 1
                }}
                onMouseEnter={(e) => {
                  if (!hasItems && !!searchQuery) return;
                  e.currentTarget.style.background = "#D4AF37";
                  e.currentTarget.style.color = "#0f0f0f";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(212,175,55,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(212,175,55,0.04)";
                  e.currentTarget.style.color = "#D4AF37";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {sec.icon}
                {sec.title.split(" ").slice(-1)[0]} {/* Show last word for compact labels */}
                {searchQuery && <span style={{ fontSize: "0.6rem", opacity: 0.7 }}>({sec.items.length})</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Grouped Catalog Sections */}
      <div style={{ maxWidth: "1280px", margin: "4rem auto 7rem", padding: "0 1.5rem", display: "flex", flexDirection: "column", gap: "6rem", position: "relative", zIndex: 1 }}>
        {sectionsConfig.map((sec) => {
          // If searching and this section doesn't match anything, hide it.
          if (searchQuery && sec.items.length === 0) return null;

          return (
            <section 
              key={sec.id} 
              id={sec.id} 
              style={{ 
                scrollMarginTop: "160px", 
                borderBottom: "1px solid var(--border-primary)", 
                paddingBottom: "4.5rem" 
              }}
            >
              <Reveal>
                <div style={{ marginBottom: "2.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "0.75rem", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37" }}>
                      {sec.icon}
                    </div>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "1.6rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                      {sec.title}
                    </h2>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", maxWidth: "780px", lineHeight: 1.5 }}>
                    {sec.desc}
                  </p>
                </div>
              </Reveal>

              {sec.id === "photobooth" && !searchQuery && (
                <div style={{ marginBottom: "3.5rem" }}>
                  <Reveal>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <span className="section-label" style={{ display: "inline-flex", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", padding: "0.3rem 0.8rem", borderRadius: "9999px", color: "#D4AF37", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                        Curated Packages
                      </span>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                        All-Inclusive Photo Booth Packages
                      </h3>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5, maxWidth: "600px", marginBottom: "1.5rem" }}>
                        Select one of our popular all-inclusive options featuring delivery, backdrop, props, and staffing options.
                      </p>
                    </div>
                  </Reveal>
                  <Packages onOpenQuote={handleOpenQuote} isEmbedded={true} />
                  
                  {sec.items.length > 0 && (
                    <Reveal>
                      <div style={{ marginTop: "4.5rem", marginBottom: "2.5rem", borderTop: "1px solid var(--border-primary)", paddingTop: "3.5rem" }}>
                        <span className="section-label" style={{ display: "inline-flex", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", padding: "0.3rem 0.8rem", borderRadius: "9999px", color: "#D4AF37", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                          Individual Rentals
                        </span>
                        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                          A La Carte Options & Equipment
                        </h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5, maxWidth: "600px" }}>
                          Rent items individually or add them to your custom event plan.
                        </p>
                      </div>
                    </Reveal>
                  )}
                </div>
              )}

              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: "1.5rem" }}>
                  {[1, 2, 3, 4].map((n) => (
                    <div 
                      key={n} 
                      style={{ 
                        borderRadius: "1.5rem", 
                        overflow: "hidden", 
                        background: "var(--bg-secondary)", 
                        animation: "pulse 1.5s ease-in-out infinite", 
                        height: "360px" 
                      }} 
                    />
                  ))}
                </div>
              ) : sec.items.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: "1.75rem" }}>
                  {sec.items.map((item) => {
                    const isLowStock = item.stock !== undefined && item.stock <= 3;
                    return (
                      <Reveal key={item.id}>
                        <RadialGlowCard 
                          className="product-card" 
                          style={{ 
                            background: "var(--card-bg)",
                            border: "1px solid var(--border-primary)",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "1.5rem",
                            boxShadow: "0 8px 30px rgba(0,0,0,0.03)"
                          }}
                        >
                          {/* Card Image vignette */}
                          <div className="img-zoom" style={{ position: "relative", aspectRatio: "4/3", background: "var(--bg-secondary)", overflow: "hidden" }}>
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
                              loading="lazy" 
                              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }} 
                            />
                            
                            {/* Overlay gradient mask */}
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)", pointerEvents: "none" }} />
                            
                            {/* Premium Price Label */}
                            <div 
                              style={{ 
                                position: "absolute", 
                                bottom: "0.875rem", 
                                right: "0.875rem", 
                                background: "#0a0a0a", 
                                boxShadow: "0 6px 20px rgba(0,0,0,0.2)", 
                                borderRadius: "0.75rem", 
                                padding: "0.45rem 0.8rem", 
                                border: "1px solid rgba(212,175,55,0.3)",
                                textAlign: "center" 
                              }}
                            >
                              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "1.15rem", color: "#D4AF37", lineHeight: 1 }}>
                                ${item.price}
                              </div>
                              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                                per day
                              </div>
                            </div>

                            {/* In-Stock / Stock count Indicator */}
                            <div
                              style={{
                                position: "absolute",
                                top: "0.875rem",
                                right: "0.875rem",
                                background: isLowStock ? "rgba(245,158,11,0.92)" : "rgba(16,185,129,0.92)",
                                borderRadius: "9999px",
                                padding: "0.25rem 0.6rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.35rem",
                                border: "1px solid rgba(255,255,255,0.15)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                            >
                              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ffffff", animation: "pulse 1.2s infinite" }} />
                              <span style={{ fontSize: "0.58rem", fontWeight: 850, letterSpacing: "0.05em", color: "#ffffff", textTransform: "uppercase" }}>
                                {isLowStock ? `Only ${item.stock} left` : "Available Now"}
                              </span>
                            </div>
                          </div>

                          {/* Details Content Body */}
                          <div style={{ padding: "1.35rem", flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                            {/* Rating and review stats */}
                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.625rem" }}>
                              <div style={{ display: "flex", color: "#f59e0b" }}>
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={11} fill={s <= Math.round(item.rating || 5) ? "#f59e0b" : "none"} strokeWidth={1.5} />
                                ))}
                              </div>
                              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.72rem", color: "var(--text-primary)" }}>
                                {item.rating || 5.0}
                              </span>
                              <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>
                                ({item.reviews || 0} reviews)
                              </span>
                            </div>

                            {/* Catalog Item Title */}
                            <h3 
                              style={{ 
                                fontFamily: "var(--font-heading)", 
                                fontWeight: 800, 
                                fontSize: "1rem", 
                                color: "var(--text-primary)", 
                                lineHeight: 1.35, 
                                marginBottom: "0.625rem", 
                                height: "2.7rem", 
                                overflow: "hidden", 
                                display: "-webkit-box", 
                                WebkitLineClamp: 2, 
                                WebkitBoxOrient: "vertical" 
                              }}
                              title={item.title}
                            >
                              {item.title}
                            </h3>

                            {/* Description preview */}
                            <p 
                              style={{ 
                                fontSize: "0.78rem", 
                                color: "var(--text-secondary)", 
                                lineHeight: 1.5, 
                                marginBottom: "1.25rem",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                height: "2.3rem"
                              }}
                            >
                              {item.description}
                            </p>

                            {/* Specifications display block */}
                            <div 
                              style={{ 
                                display: "grid", 
                                gridTemplateColumns: "1fr 1fr", 
                                gap: "0.75rem", 
                                padding: "0.75rem", 
                                background: "var(--bg-secondary)", 
                                borderRadius: "0.75rem", 
                                border: "1px solid var(--border-secondary)", 
                                marginBottom: "1.25rem",
                                marginTop: "auto"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0 }}>
                                <Maximize2 size={12} color="#D4AF37" style={{ flexShrink: 0 }} />
                                <span 
                                  style={{ 
                                    fontFamily: "var(--font-heading)", 
                                    fontWeight: 700, 
                                    fontSize: "0.62rem", 
                                    color: "var(--text-secondary)", 
                                    textTransform: "uppercase", 
                                    letterSpacing: "0.03em",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }}
                                  title={item.dimensions || "N/A"}
                                >
                                  {item.dimensions || "N/A"}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0 }}>
                                <Users size={12} color="#D4AF37" style={{ flexShrink: 0 }} />
                                <span 
                                  style={{ 
                                    fontFamily: "var(--font-heading)", 
                                    fontWeight: 700, 
                                    fontSize: "0.62rem", 
                                    color: "var(--text-secondary)", 
                                    textTransform: "uppercase", 
                                    letterSpacing: "0.03em",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }}
                                  title={item.capacity || "N/A"}
                                >
                                  {item.capacity || "N/A"}
                                </span>
                              </div>
                            </div>

                            {/* Action Pressable Buttons */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="btn-press"
                                style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  justifyContent: "center", 
                                  gap: "0.4rem", 
                                  padding: "0.75rem", 
                                  background: "var(--bg-secondary)", 
                                  border: "1px solid var(--border-secondary)", 
                                  borderRadius: "0.75rem", 
                                  fontFamily: "var(--font-heading)", 
                                  fontWeight: 800, 
                                  fontSize: "0.68rem", 
                                  letterSpacing: "0.06em", 
                                  textTransform: "uppercase", 
                                  color: "var(--text-primary)", 
                                  cursor: "pointer", 
                                  transition: "all 0.2s" 
                                }}
                              >
                                <Info size={12} color="#D4AF37" />
                                Details
                              </button>
                              <button
                                onClick={() => handleOpenQuoteWithItem(item)}
                                className="btn-press"
                                style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  justifyContent: "center", 
                                  gap: "0.4rem", 
                                  padding: "0.75rem", 
                                  background: "linear-gradient(135deg, #D4AF37, #f5e8a0)", 
                                  border: "none", 
                                  borderRadius: "0.75rem", 
                                  fontFamily: "var(--font-heading)", 
                                  fontWeight: 850, 
                                  fontSize: "0.68rem", 
                                  letterSpacing: "0.06em", 
                                  textTransform: "uppercase", 
                                  color: "#0f0f0f", 
                                  cursor: "pointer", 
                                  boxShadow: "0 4px 12px rgba(212,175,55,0.25)", 
                                  transition: "all 0.2s" 
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#bda030"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #D4AF37, #f5e8a0)"; }}
                              >
                                <Calendar size={12} />
                                Reserve
                              </button>
                            </div>
                          </div>
                        </RadialGlowCard>
                      </Reveal>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border-secondary)", borderRadius: "1.5rem", background: "var(--bg-secondary)" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>No items found matching your filter criteria in this category.</p>
                </div>
              )}
            </section>
          );
        })}

        {/* Global No items matches at all fallback */}
        {!loading && sectionsConfig.every(sec => sec.items.length === 0) && (
          <div style={{ padding: "5rem 2rem", textAlign: "center", background: "var(--bg-secondary)", borderRadius: "1.5rem", border: "2px dashed var(--border-secondary)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              No Rental Products Match
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              We couldn't find any products in our catalog matching "{searchQuery}".
            </p>
            <button 
              onClick={() => setSearchQuery("")}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                background: "#D4AF37",
                color: "#0f0f0f",
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "0.72rem",
                border: "none",
                cursor: "pointer"
              }}
            >
              Clear Search Query
            </button>
          </div>
        )}
      </div>

      <Footer
        onOpenQuote={handleOpenQuote}
        onOpenAbout={handleOpenAbout}
        onOpenContact={handleOpenContact}
      />

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
