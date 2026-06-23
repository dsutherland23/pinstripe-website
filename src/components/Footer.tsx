"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.galleryEnabled === "boolean") {
          setGalleryEnabled(data.galleryEnabled);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer id="contact" style={{ background: "#0f0f0f", color: "rgba(255,255,255,0.55)", position: "relative", overflow: "hidden" }}>
      {/* ---- CTA BANNER ---- */}
      <div style={{ padding: "0 1.25rem", marginTop: "-3rem", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              background: "linear-gradient(120deg, #D4AF37 0%, #f0cc60 50%, #D4AF37 100%)",
              borderRadius: "1.75rem",
              padding: "3rem 2.5rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
              boxShadow: "0 20px 60px rgba(212,175,55,0.35)",
            }}
          >
            <div style={{ flex: "1 1 300px" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(1.25rem, 3vw, 1.75rem)", color: "#0f0f0f", lineHeight: 1.25, marginBottom: "0.5rem" }}>
                Ready to Create an Unforgettable Event?
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "rgba(0,0,0,0.6)", lineHeight: 1.6 }}>
                Get your personalised quote in under 2 minutes. No credit card required.
              </p>
            </div>
            <button
              onClick={onOpenQuote}
              style={{
                background: "#0f0f0f",
                color: "#D4AF37",
                padding: "1rem 2.25rem",
                borderRadius: "9999px",
                border: "none",
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
            >
              Book & Reserve
            </button>
          </div>
        </div>
      </div>

      {/* ---- MAIN FOOTER ---- */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "5rem 1.25rem 2.5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "3rem",
            marginBottom: "4rem",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ marginBottom: "1.25rem", display: "inline-flex" }}>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/images/pinstripes-logo-new.png?v=20260623"
                  alt="Pinstripes Party & Event Rentals"
                  style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
            <p style={{ fontSize: "0.82rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Premium event rentals for every occasion — from bounce houses and water slides to elegant wedding setups across America.
            </p>
            {/* Socials */}
            <div style={{ display: "flex", gap: "0.625rem" }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  title={s.label}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "0.625rem",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.55)",
                    transition: "all 0.2s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(212,175,55,0.15)";
                    el.style.borderColor = "rgba(212,175,55,0.3)";
                    el.style.color = "#D4AF37";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(255,255,255,0.06)";
                    el.style.borderColor = "rgba(255,255,255,0.08)";
                    el.style.color = "rgba(255,255,255,0.55)";
                  }}
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#ffffff", marginBottom: "1.25rem", paddingBottom: "0.875rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {["Home", "Rentals", "Gallery", "My Account", "About", "Contact"]
                .filter((link) => link !== "Gallery" || galleryEnabled)
                .map((link) => (
                  <li key={link}>
                    <a
                      href={link === "My Account" ? "/portal" : `#${link.toLowerCase()}`}
                      onClick={(e) => {
                        if (link === "About") {
                          e.preventDefault();
                          onOpenAbout();
                        } else if (link === "Contact") {
                          e.preventDefault();
                          onOpenContact();
                        }
                      }}
                      style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#D4AF37"; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
                    >
                      {link === "My Account" ? "My Account / Sign In" : link}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#ffffff", marginBottom: "1.25rem", paddingBottom: "0.875rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              Service Areas
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
              {locs.map((loc) => (
                <a
                  key={loc}
                  href="#rentals"
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => { (e.currentTarget).style.color = "#D4AF37"; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.color = "rgba(255,255,255,0.55)"; }}
                >
                  <MapPin size={11} color="#D4AF37" />
                  {loc}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#ffffff", marginBottom: "1.25rem", paddingBottom: "0.875rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              Contact Us
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                { Icon: Phone, label: "Call / WhatsApp", value: "(757) 749-3407", href: "tel:17577493407" },
                { Icon: Mail, label: "Email Support", value: "pinstripesrentals@gmail.com", href: "mailto:pinstripesrentals@gmail.com" },
              ].map(({ Icon, label, value, href }) => (
                <div key={label} style={{ display: "flex", gap: "0.75rem" }}>
                  <div style={{ flexShrink: 0, marginTop: "2px" }}>
                    <Icon size={15} color="#D4AF37" />
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
                      {label}
                    </div>
                    <a
                      href={href}
                      style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 600, color: "#ffffff", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#D4AF37"; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#ffffff"; }}
                    >
                      {value}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.25rem" }}>
              © 2026 Pinstripes Party &amp; Event Rentals. All rights reserved.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
              Created by{" "}
              <a
                href="https://www.instagram.com/socialkon10_cre8tive/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#D4AF37"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}
              >
                Socialkon10
              </a>
            </p>
            {/* Legal links */}
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
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.3)",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#D4AF37"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"; }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "9999px", padding: "0.35rem 0.875rem" }}>
            <ShieldCheck size={14} color="#22c55e" />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.62rem", color: "#22c55e", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Licensed &amp; Insured
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
