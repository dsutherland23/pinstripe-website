"use client";

import React, { useState, useEffect } from "react";
import { Star, Maximize2, Users, ShoppingCart, Calendar } from "lucide-react";
import { RadialGlowCard } from "./CursorReactive";

// Re-export RentalItem type so other files can still import it from here
export type { RentalItem } from "@/data/mockInventory";
import type { RentalItem } from "@/data/mockInventory";

/* ---- Fallback image ---- */
const FALLBACK =
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=60";

// Booked dates calendar schedule map for popular equipment
const bookedDatesMap: Record<string, string[]> = {
  "1": ["2026-06-20", "2026-07-04"],
  "5": ["2026-06-20", "2026-06-21"],
  "8": ["2026-06-20", "2026-06-27"],
};

interface FeaturedRentalsProps {
  activeCategory: string;
  searchQuery: string;
  searchDate?: string;
  onSelectItem: (item: RentalItem) => void;
  onOpenQuote: (item?: RentalItem) => void;
}

export default function FeaturedRentals({
  activeCategory,
  searchQuery,
  searchDate = "",
  onSelectItem,
  onOpenQuote,
}: FeaturedRentalsProps) {
  const [inventory, setInventory] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/inventory?t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setInventory(data.items);
      })
      .catch(() => {/* silently fail, show empty state */})
      .finally(() => setLoading(false));
  }, []);

  const filtered = inventory.filter((item) => {
    const matchCat =
      activeCategory === "All" || item.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchQ =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <section id="rentals" style={{ padding: "5rem 0", background: "#ffffff" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.25rem" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "3rem",
          }}
        >
          <div>
            <span className="section-label">Premium Inventory</span>
            <h2 className="section-title">Top Rental Equipment</h2>
          </div>
          <p
            style={{
              maxWidth: "380px",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              color: "#666",
              lineHeight: 1.6,
            }}
          >
            Fully sanitised, commercial-grade event supplies — delivered, installed &amp; collected by our professional crew.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "1.5rem",
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                style={{
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                  background: "#f5f5f5",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              >
                <div style={{ aspectRatio: "4/3", background: "#e8e8e8" }} />
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ height: "12px", background: "#e0e0e0", borderRadius: "6px", width: "40%" }} />
                  <div style={{ height: "16px", background: "#e0e0e0", borderRadius: "6px", width: "80%" }} />
                  <div style={{ height: "12px", background: "#e0e0e0", borderRadius: "6px", width: "60%" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem", marginTop: "0.5rem" }}>
                    <div style={{ height: "38px", background: "#e0e0e0", borderRadius: "0.75rem" }} />
                    <div style={{ height: "38px", background: "#e0e0e0", borderRadius: "0.75rem" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "1.5rem",
            }}
          >
            {filtered.map((item) => {
              const isBooked = !!(searchDate && bookedDatesMap[item.id]?.includes(searchDate));
              return (
                <RadialGlowCard key={item.id} className="product-card" style={isBooked ? { opacity: 0.65 } : {}}>
                  {/* Image */}
                  <div
                    className="img-zoom"
                    style={{
                      position: "relative",
                      aspectRatio: "4/3",
                      background: "#f5f5f5",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
                    />

                    {/* Category chip */}
                    <div
                      style={{
                        position: "absolute",
                        top: "0.875rem",
                        left: "0.875rem",
                        background: "rgba(15,15,15,0.88)",
                        backdropFilter: "blur(8px)",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "9999px",
                        fontFamily: "var(--font-heading)",
                        fontSize: "0.58rem",
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#D4AF37",
                      }}
                    >
                      {item.category}
                    </div>

                    {/* Price badge */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0.875rem",
                        right: "0.875rem",
                        background: "#ffffff",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                        borderRadius: "0.75rem",
                        padding: "0.4rem 0.75rem",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "1.1rem", color: "#0f0f0f", lineHeight: 1 }}>
                        ${item.price}
                      </div>
                      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", marginTop: "2px" }}>
                        per day
                      </div>
                    </div>

                    {/* Availability dot */}
                    {item.availability && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0.875rem",
                          right: "0.875rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          background: isBooked ? "rgba(254,226,226,0.95)" : "rgba(255,255,255,0.92)",
                          borderRadius: "9999px",
                          padding: "0.2rem 0.6rem",
                          border: isBooked ? "1px solid rgba(239,68,68,0.2)" : "none",
                        }}
                      >
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: isBooked ? "#ef4444" : "#22c55e" }} />
                         <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.55rem", color: isBooked ? "#ef4444" : "#22c55e", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {isBooked
                            ? `Booked on ${searchDate && searchDate.includes("-") ? `${searchDate.split("-")[1]}/${searchDate.split("-")[2]}` : ""}`
                            : `Available ${searchDate && searchDate.includes("-") ? `on ${searchDate.split("-")[1]}/${searchDate.split("-")[2]}` : "Now"}`
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Stars */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", color: "#f59e0b" }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={11} fill={s <= Math.round(item.rating) ? "#f59e0b" : "none"} strokeWidth={1.5} />
                        ))}
                      </div>
                      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.72rem", color: "#0f0f0f" }}>
                        {item.rating}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#999" }}>
                        ({item.reviews})
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: "#0f0f0f",
                        lineHeight: 1.3,
                        marginBottom: "0.5rem",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.title}
                    </h3>

                    {/* Specs row */}
                    <div style={{ display: "flex", gap: "1rem", padding: "0.75rem 0", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", marginBottom: "1rem", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Maximize2 size={13} color="#D4AF37" />
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.65rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {item.dimensions}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Users size={13} color="#D4AF37" />
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.65rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {item.capacity}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem", marginTop: "auto" }}>
                      <button
                        onClick={() => onSelectItem(item)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.4rem",
                          padding: "0.7rem",
                          background: "#f5f5f5",
                          border: "1.5px solid #ebebeb",
                          borderRadius: "0.75rem",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#0f0f0f",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget;
                          el.style.background = "#ebebeb";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget;
                          el.style.background = "#f5f5f5";
                        }}
                      >
                        <ShoppingCart size={13} color="#D4AF37" />
                        Details
                      </button>
                      {isBooked ? (
                        <button
                          disabled
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            padding: "0.7rem",
                            background: "#e5e5e5",
                            border: "none",
                            borderRadius: "0.75rem",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#999999",
                            cursor: "not-allowed",
                          }}
                        >
                          Booked
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenQuote(item)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            padding: "0.7rem",
                            background: "#D4AF37",
                            border: "none",
                            borderRadius: "0.75rem",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#0f0f0f",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            boxShadow: "0 4px 12px rgba(212,175,55,0.3)",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#bda030"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#D4AF37"; }}
                        >
                          <Calendar size={13} />
                          Quote
                        </button>
                      )}
                    </div>
                  </div>
                </RadialGlowCard>
              );
            })}
          </div>
        ) : !loading && (
          <div
            style={{
              padding: "5rem 2rem",
              textAlign: "center",
              background: "#fafafa",
              borderRadius: "1.5rem",
              border: "2px dashed #e5e5e5",
            }}
          >
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.125rem", color: "#0f0f0f", marginBottom: "0.5rem" }}>
              No Rentals Found
            </h3>
            <p style={{ color: "#888", fontSize: "0.875rem" }}>
              Try adjusting your search or selecting a different category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
