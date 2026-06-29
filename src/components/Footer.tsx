"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";

interface FooterProps {
  onOpenQuote: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
}

const locs = [
  "Norfolk",
  "Virginia Beach",
  "Chesapeake",
  "Portsmouth",
  "Suffolk",
  "Newport News",
  "Hampton",
  "Yorktown",
  "Williamsburg"
];

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/pinstripesrentals?igsh=MWZ0MGoxMXZkMGphaw%3D%3D&utm_source=qr",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "#",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer({ onOpenQuote, onOpenAbout, onOpenContact }: FooterProps) {
  const [galleryEnabled, setGalleryEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.galleryEnabled === "boolean") {
          setGalleryEnabled(data.galleryEnabled);
        }
      })
      .catch(() => {});
  }, []);

  const getLinkHref = (label: string) => {
    if (label === "My Account") return "/portal";
    if (label === "Rentals") return "/inventory";
    if (mounted && typeof window !== "undefined" && window.location.pathname !== "/") {
      if (label === "Home") return "/";
      return `/#${label.toLowerCase()}`;
    }
    return `#${label.toLowerCase()}`;
  };

  return (
    <footer 
      id="contact" 
      style={{ 
        background: "#0A0A0B", 
        color: "rgba(255, 255, 255, 0.6)", 
        position: "relative", 
        overflow: "hidden",
        borderTop: "1px solid rgba(212, 175, 55, 0.15)",
        boxShadow: "0 -20px 40px rgba(0, 0, 0, 0.5)"
      }}
    >

      {/* ---- CTA BANNER ---- */}
      <div style={{ padding: "0 1.25rem", marginTop: "-3rem", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #f3df93 50%, #D4AF37 100%)",
              borderRadius: "1.5rem",
              padding: "2.5rem 3rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
              boxShadow: "0 16px 48px rgba(212, 175, 55, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div style={{ flex: "1 1 450px" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", color: "#0f0f0f", lineHeight: 1.2, marginBottom: "0.5rem" }}>
                Ready to Create an Unforgettable Event?
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "rgba(15, 15, 15, 0.75)", fontWeight: 550, lineHeight: 1.5 }}>
                Get your custom reservation quote in under 2 minutes. No upfront credit card required.
              </p>
            </div>
            <button
              onClick={onOpenQuote}
              style={{
                background: "#0f0f0f",
                color: "#ffffff",
                padding: "1rem 2.25rem",
                borderRadius: "0.75rem",
                border: "none",
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                whiteSpace: "nowrap",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.transform = "translateY(-3px)"; 
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.45), 0 0 10px rgba(212,175,55,0.4)";
                e.currentTarget.style.color = "#D4AF37";
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.transform = ""; 
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              Book & Reserve
            </button>
          </div>
        </div>
      </div>

      {/* ---- MAIN FOOTER ---- */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "5rem 1.25rem 2rem", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "3rem",
            marginBottom: "3.5rem",
          }}
        >
          {/* Column 1: Brand & Bio */}
          <div>
            <div style={{ marginBottom: "1rem", display: "inline-flex" }}>
              <img
                src="/images/pinstripes-logo-new.png?v=20260623"
                alt="Pinstripes Party & Event Rentals Logo"
                style={{
                  height: "56px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1rem" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 900, color: "#ffffff", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Pinstripes
              </span>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.6rem", fontWeight: 700, color: "#D4AF37", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Premium Event Concierge
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", lineHeight: 1.6, marginBottom: "1.5rem", color: "rgba(255,255,255,0.45)" }}>
              Premium event rentals for every milestone — bounce houses, water slides, wedding setups, tents, tables, and concession machines. Delivering memory-making equipment across Hampton Roads.
            </p>
            {/* Social Links */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  title={s.label}
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "0.5rem",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.45)",
                    transition: "all 0.25s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(212,175,55,0.1)";
                    el.style.borderColor = "rgba(212,175,55,0.35)";
                    el.style.color = "#D4AF37";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(255,255,255,0.03)";
                    el.style.borderColor = "rgba(255,255,255,0.06)";
                    el.style.color = "rgba(255,255,255,0.45)";
                    el.style.transform = "";
                  }}
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#ffffff", marginBottom: "1.25rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", padding: 0 }}>
              {["Home", "Rentals", "Gallery", "My Account", "About", "Contact"]
                .filter((link) => link !== "Gallery" || galleryEnabled)
                .map((link) => (
                  <li key={link}>
                    <a
                      href={getLinkHref(link)}
                      onClick={(e) => {
                        if (link === "About") {
                          e.preventDefault();
                          onOpenAbout();
                        } else if (link === "Contact") {
                          e.preventDefault();
                          onOpenContact();
                        }
                      }}
                      style={{ 
                        fontFamily: "var(--font-body)", 
                        fontWeight: 650, 
                        fontSize: "0.8rem", 
                        color: "rgba(255,255,255,0.45)", 
                        textDecoration: "none", 
                        transition: "all 0.2s ease",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.color = "#D4AF37"; 
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.color = "rgba(255,255,255,0.45)"; 
                        e.currentTarget.style.transform = "";
                      }}
                    >
                      {link === "My Account" ? "My Account / Portal" : link}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Column 3: Service Areas */}
          <div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#ffffff", marginBottom: "1.25rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
              Hampton Roads Area
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              {locs.map((loc) => {
                const slug = loc.toLowerCase().replace(/\s+/g, "-");
                return (
                  <a
                    key={loc}
                    href={`/locations/${slug}`}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.35rem", 
                      fontFamily: "var(--font-body)", 
                      fontWeight: 600, 
                      fontSize: "0.78rem", 
                      color: "rgba(255,255,255,0.45)", 
                      textDecoration: "none", 
                      transition: "all 0.2s ease" 
                    }}
                    onMouseEnter={(e) => { 
                      e.currentTarget.style.color = "#D4AF37"; 
                      e.currentTarget.style.transform = "translateX(3px)";
                    }}
                    onMouseLeave={(e) => { 
                      e.currentTarget.style.color = "rgba(255,255,255,0.45)"; 
                      e.currentTarget.style.transform = "";
                    }}
                  >
                    <MapPin size={10} color="#D4AF37" style={{ flexShrink: 0 }} />
                    {loc}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 4: Contact & Operations */}
          <div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#ffffff", marginBottom: "1.25rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
              Get In Touch
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                { Icon: Phone, label: "Direct Phone Line", value: "(757) 749-3407", href: "tel:17577493407" },
                { Icon: Mail, label: "Support Email", value: "pinstripesrentals@gmail.com", href: "mailto:pinstripesrentals@gmail.com" },
              ].map(({ Icon, label, value, href }) => (
                <div key={label} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div style={{ 
                    flexShrink: 0, 
                    width: "30px", 
                    height: "30px", 
                    borderRadius: "0.375rem", 
                    background: "rgba(212,175,55,0.06)", 
                    border: "1px solid rgba(212,175,55,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Icon size={14} color="#D4AF37" />
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", fontWeight: 650, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
                      {label}
                    </div>
                    <a
                      href={href}
                      style={{ 
                        fontFamily: "var(--font-body)", 
                        fontSize: "0.8rem", 
                        fontWeight: 650, 
                        color: "#ffffff", 
                        textDecoration: "none", 
                        transition: "color 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#D4AF37"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                    >
                      {value}
                      <ArrowUpRight size={10} style={{ opacity: 0.5 }} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: "1.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.25rem" }}>
              © 2026 Pinstripes Party &amp; Event Rentals. All rights reserved.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(255,255,255,0.22)" }}>
              Designed by{" "}
              <a
                href="https://www.instagram.com/socialkon10_cre8tive/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(255,255,255,0.3)",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#D4AF37"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
              >
                Socialkon10
              </a>
            </p>
            {/* Legal Links */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms-and-conditions" },
                { label: "Rental Agreement", href: "/rental-agreement" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.3)",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#D4AF37"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: "9999px", padding: "0.35rem 0.875rem" }}>
            <ShieldCheck size={13} color="#22c55e" />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.6rem", color: "#22c55e", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Licensed &amp; Insured
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
