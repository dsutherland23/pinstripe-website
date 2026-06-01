"use client";

import React from "react";
import { Check, Gift, Heart, Briefcase, Calendar, Sparkles } from "lucide-react";
import { RadialGlowCard } from "./CursorReactive";


interface PackagesProps {
  onOpenQuote: () => void;
}

const pkgs = [
  {
    name: "Birthday Bash",
    icon: <Gift size={24} />,
    tagline: "Kids' birthdays & backyard parties",
    price: 495,
    savings: "Save $90",
    color: "#f59e0b",
    popular: false,
    items: [
      "Summer Waves Inflatable Kingdom",
      "3 Premium Banquet Tables",
      "24 Fan-Back Folding Chairs",
      "Popcorn Machine w/ starter ingredients",
      "Free sanitisation & professional setup",
    ],
  },
  {
    name: "Grand Wedding",
    icon: <Heart size={24} />,
    tagline: "Everything for a stunning reception",
    price: 1295,
    savings: "Save $250",
    color: "#D4AF37",
    popular: true,
    items: [
      "High-Peak Elegance Canopy Tent (20×30ft)",
      "8 Solid Round Banqueting Tables",
      "64 Premium White Folding Chairs",
      "Custom Backdrop & Decor Elements",
      "Chandelier & String Lighting",
      "White Satin Table Linens",
    ],
  },
  {
    name: "Corporate Elite",
    icon: <Briefcase size={24} />,
    tagline: "Impress clients, staff & partners",
    price: 1850,
    savings: "Save $380",
    color: "#6366f1",
    popular: false,
    items: [
      "2× High-Peak Canopy Tents w/ sidewalls",
      "12 Banquet & Dining Tables",
      "100 Premium Folding Chairs",
      "Professional Sound System (+ Mic)",
      "Warm String & Stage Spotlights",
      "Heavy-Duty Generator Setup",
    ],
  },
];

export default function Packages({ onOpenQuote }: PackagesProps) {
  return (
    <section id="packages" style={{ padding: "5rem 0", background: "var(--bg-secondary)", transition: "all 0.5s ease" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.25rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto 3.5rem" }}>
          <span className="section-label">All-In-One Bundles</span>
          <h2 className="section-title text-gradient">Curated Event Packages</h2>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7, marginTop: "0.875rem" }}>
            Simplify your planning with cost-effective equipment bundles. Includes delivery, professional setup, and post-event teardown.
          </p>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {pkgs.map((pkg) => (
            <RadialGlowCard
              key={pkg.name}
              glowColor={pkg.popular ? `${pkg.color}25` : "rgba(212, 175, 55, 0.18)"}
              style={{
                position: "relative",
                background: "var(--card-bg)",
                borderRadius: "1.5rem",
                border: pkg.popular ? `2.5px solid ${pkg.color}` : "1.5px solid var(--border-primary)",
                boxShadow: pkg.popular
                  ? `0 20px 48px rgba(212,175,55,0.14), 0 0 0 1px rgba(212,175,55,0.1)`
                  : "0 8px 24px var(--shadow-color)",
                padding: "2rem",
                transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, background-color 0.4s ease, border-color 0.4s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(-6px)";
                el.style.boxShadow = `0 28px 56px var(--shadow-color)`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "";
                el.style.boxShadow = pkg.popular
                  ? `0 20px 48px rgba(212,175,55,0.14)`
                  : "0 8px 24px var(--shadow-color)";
              }}
            >
              {/* Popular badge */}
              {pkg.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: "-16px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: pkg.color,
                    color: "#0f0f0f",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    fontSize: "0.6rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "0.35rem 1rem",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(212,175,55,0.4)",
                  }}
                >
                  <Sparkles size={11} />
                  Most Popular
                </div>
              )}

              {/* Icon + savings */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "1rem",
                    background: `${pkg.color}18`,
                    border: `1.5px solid ${pkg.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: pkg.color,
                  }}
                >
                  {pkg.icon}
                </div>
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#16a34a",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "9999px",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    fontSize: "0.6rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {pkg.savings}
                </div>
              </div>

              {/* Name + tagline */}
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                {pkg.name} Package
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#888", marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                {pkg.tagline}
              </p>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem", marginBottom: "1.5rem" }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: "1.2rem", color: "var(--text-secondary)" }}>$</span>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "2.5rem", color: "var(--text-primary)", lineHeight: 1 }}>{pkg.price}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-secondary)", opacity: 0.7, marginLeft: "0.25rem" }}>/ package</span>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: "#f0f0f0", marginBottom: "1.5rem" }} />

              {/* Item list */}
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                {pkg.items.map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                    <div
                      style={{
                        flexShrink: 0,
                        marginTop: "1px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: `${pkg.color}18`,
                        border: `1px solid ${pkg.color}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={10} color={pkg.color} strokeWidth={3} />
                    </div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={onOpenQuote}
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "0.875rem",
                  border: "none",
                  background: pkg.popular ? pkg.color : "#0f0f0f",
                  color: pkg.popular ? "#0f0f0f" : "#ffffff",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "0.7rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: pkg.popular ? `0 8px 24px rgba(212,175,55,0.3)` : "0 4px 12px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
              >
                <Calendar size={15} />
                Book This Bundle
              </button>
            </RadialGlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}
