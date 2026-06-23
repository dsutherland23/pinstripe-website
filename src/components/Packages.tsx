"use client";

import React from "react";
import { Check, Camera, Star, Crown, Calendar, Sparkles, Plus } from "lucide-react";
import { RadialGlowCard } from "./CursorReactive";


interface PackagesProps {
  onOpenQuote: (pkgName?: string) => void;
  isEmbedded?: boolean;
}

const pkgs = [
  {
    name: "Snap It",
    icon: <Camera size={24} />,
    tagline: "DIY hosts who want great digital photos",
    description: "Perfect for DIY hosts who want great digital photos without the full-service price. A backdrop can be added as an optional add-on.",
    price: 250,
    duration: "4 hrs",
    extraHour: 65,
    color: "#f59e0b",
    popular: false,
    items: [
      "Open-air booth (drop-off)",
      "Studio lighting for high-quality photos",
      "Theme-matched photo template",
      "Instant text sharing + live gallery",
      "GIFs, Boomerangs & Slow Motion",
    ],
    addons: [
      { label: "Backdrop", price: "+$100" },
    ],
  },
  {
    name: "Party",
    icon: <Star size={24} />,
    tagline: "Full-service, staffed booth experience",
    description: "Full-service, staffed booth. We handle everything before, during, and after — you just enjoy.",
    price: 500,
    duration: "4 hrs",
    extraHour: 65,
    color: "#D4AF37",
    popular: true,
    items: [
      "Everything in Snap It, plus:",
      "On-site professional attendant",
      "Props included",
      "Choice of backdrop",
      "Custom photo overlay",
      "Custom tap-to-start screen",
      "GIFs, Boomerangs & Slow Motion",
    ],
    addons: [
      { label: "Unlimited Prints (2×6 or 4×6)", price: "+$250" },
      { label: "Glam Filter", price: "+$100" },
      { label: "Photo Guest Book", price: "+$100" },
    ],
  },
  {
    name: "VVIP",
    icon: <Crown size={24} />,
    tagline: "Guests look like they're on a red carpet",
    description: "Guests look like they're on a red carpet. Glam filter, unlimited prints, and video messaging included.",
    price: 750,
    duration: "4 hrs",
    extraHour: 65,
    color: "#a855f7",
    popular: false,
    items: [
      "Everything in Party, plus:",
      "Unlimited prints (2×6 or 4×6)",
      "Glam filter (magazine-style finish)",
      "Black & White Filter",
      "Video messages",
      "GIFs, Boomerangs & Slow Motion",
    ],
    addons: [
      { label: "Photo Guest Book", price: "+$100" },
    ],
  },
];

export default function Packages({ onOpenQuote, isEmbedded }: PackagesProps) {
  return (
    <section id={isEmbedded ? undefined : "packages"} style={{ padding: isEmbedded ? "0" : "5rem 0", background: isEmbedded ? "transparent" : "var(--bg-secondary)", transition: "all 0.5s ease" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isEmbedded ? "0" : "0 1.25rem" }}>
        {/* Header */}
        {!isEmbedded && (
          <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto 3.5rem" }}>
            <span className="section-label">Photo Booth</span>
            <h2 className="section-title text-gradient">Photo Booth Packages</h2>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7, marginTop: "0.875rem" }}>
              Choose the perfect booth experience for your event. All packages include GIFs, Boomerangs & Slow Motion. Additional hours available at $65/hr.
            </p>
          </div>
        )}

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

              {/* Icon + duration pill */}
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
                    background: `${pkg.color}15`,
                    border: `1px solid ${pkg.color}40`,
                    color: pkg.color,
                    padding: "0.3rem 0.75rem",
                    borderRadius: "9999px",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    fontSize: "0.6rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {pkg.duration}
                </div>
              </div>

              {/* Name + tagline */}
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                {pkg.name} Package
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#888", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                {pkg.tagline}
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                {pkg.description}
              </p>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem", marginBottom: "0.375rem" }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: "1.2rem", color: "var(--text-secondary)" }}>$</span>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "2.5rem", color: "var(--text-primary)", lineHeight: 1 }}>{pkg.price}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-secondary)", opacity: 0.7, marginLeft: "0.25rem" }}>/ {pkg.duration}</span>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-secondary)", opacity: 0.6, marginBottom: "1.5rem" }}>
                Additional hours: +${pkg.extraHour}/hr
              </p>

              {/* Divider */}
              <div style={{ height: "1px", background: "var(--border-primary)", marginBottom: "1.25rem" }} />

              {/* Item list */}
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.25rem" }}>
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
                    <span style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.83rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      fontWeight: item.endsWith(":") || item.startsWith("Everything") ? 700 : 400,
                    }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Add-ons */}
              {pkg.addons.length > 0 && (
                <div style={{ marginBottom: "1.75rem" }}>
                  <p style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "0.6rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    opacity: 0.6,
                    marginBottom: "0.5rem",
                  }}>
                    Available Add-Ons
                  </p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {pkg.addons.map((addon, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Plus size={11} color={pkg.color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-secondary)", flex: 1 }}>
                          {addon.label}
                        </span>
                        <span style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          color: pkg.color,
                        }}>
                          {addon.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => onOpenQuote(pkg.name)}
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "0.875rem",
                  border: "none",
                  background: pkg.popular ? pkg.color : "var(--text-primary)",
                  color: pkg.popular ? "#0f0f0f" : "var(--bg-primary)",
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
                  boxShadow: pkg.popular ? `0 8px 24px ${pkg.color}40` : "0 4px 12px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
              >
                <Calendar size={15} />
                Book This Package
              </button>
            </RadialGlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}
