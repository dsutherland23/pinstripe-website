"use client";

import React, { useState, useEffect } from "react";
import { Calendar, ArrowRight, Star, ShieldCheck, Truck } from "lucide-react";

interface HeroProps {
  onOpenQuote: () => void;
  customTitle?: string;
  customSubtitle?: string;
}

const slides = [
  {
    src: "/images/luxury-event-hero.png",
    alt: "Premium outdoor event setup featuring luxury marquee tent, elegant dining tables, cross-back chairs, and a white bounce house in America",
  },
  {
    src: "/images/party-celebration.png",
    alt: "Upscale outdoor evening birthday deck party setup with pastel balloon garland arch and high-top rental tables in America",
  },
  {
    src: "/images/kids-concessions.png",
    alt: "Smiling kids holding paper snow cones and popcorn boxes next to rental concession machines in America",
  },
  {
    src: "/images/brunch-gathering.png",
    alt: "Elegant outdoor sunny garden brunch rental tables and wooden folding chairs under pergola in America",
  },
  {
    src: "/images/inflatable-fun.png",
    alt: "Massive commercial water slide inflatable backyard splash party with rental pop-up tents and tables in America",
  },
];

export default function Hero({ onOpenQuote, customTitle, customSubtitle }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="home"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "#0f0f0f",
      }}
    >
      {/* ---- BACKGROUND IMAGES (ROTATING SLIDESHOW) ---- */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        {slides.map((slide, idx) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={idx === activeIndex ? "animate-kenburns" : ""}
            fetchPriority={idx === 0 ? "high" : "low"}
            loading={idx === 0 ? "eager" : "lazy"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              opacity: idx === activeIndex ? 1 : 0,
              transition: "opacity 1.5s cubic-bezier(0.25, 1, 0.5, 1)",
              zIndex: idx === activeIndex ? 2 : 1,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ))}
        {/* Multi-layer gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.60) 55%, rgba(0,0,0,0.30) 100%)",
            zIndex: 3,
          }}
        />
        {/* Bottom fade to white for seamless transition */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "30%",
            background: "linear-gradient(to top, #ffffff, transparent)",
            zIndex: 3,
          }}
        />
      </div>

      {/* ---- CONTENT ---- */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "7rem 1.25rem 5rem",
          width: "100%",
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          {/* Rating pill */}
          <div
            className="animate-fade-up"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(212,175,55,0.15)",
              border: "1px solid rgba(212,175,55,0.4)",
              borderRadius: "9999px",
              padding: "0.4rem 1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", color: "#D4AF37" }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="#D4AF37" strokeWidth={0} />)}
            </div>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#D4AF37" }}>
              America&apos;s #1 Rated Event Rentals
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up delay-100"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 900,
              fontSize: "clamp(2.25rem, 6vw, 4rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: "1.25rem",
            }}
          >
            {customTitle ? (
              customTitle
            ) : (
              <>
                Creating{" "}
                <span className="text-gradient" style={{ display: "inline-block" }}>
                  Unforgettable
                </span>
                <br />
                Events, One Rental
                <br />
                At A Time
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p
            className="animate-fade-up delay-200"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.125rem)",
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
              maxWidth: "520px",
              fontFamily: "var(--font-body)",
            }}
          >
            {customSubtitle || "From premium bounce houses & massive water slides to elegant wedding tents, tables, chairs, and concession machines — Pinstripes delivers everything your event needs."}
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-up delay-300"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.875rem",
              marginBottom: "3rem",
            }}
          >
            <button className="btn-primary btn-press" onClick={onOpenQuote}>
              <Calendar size={15} />
              Book & Reserve
            </button>
            <a
              href="#rentals"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.875rem 2rem",
                borderRadius: "9999px",
                border: "2px solid rgba(255,255,255,0.35)",
                color: "#ffffff",
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                transition: "all 0.25s ease",
                whiteSpace: "nowrap",
              }}
            >
              Browse Rentals
              <ArrowRight size={15} />
            </a>
          </div>

          {/* Slideshow Progress Indicators */}
          <div
            className="animate-fade-up delay-350"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "2.5rem",
            }}
          >
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                style={{
                  height: "5px",
                  width: activeIndex === index ? "32px" : "12px",
                  background: activeIndex === index ? "#D4AF37" : "rgba(255,255,255,0.3)",
                  border: "none",
                  borderRadius: "9999px",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Trust Pillars */}
          <div
            className="animate-fade-up delay-400"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              paddingTop: "2rem",
              borderTop: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {[
              { icon: <ShieldCheck size={18} color="#D4AF37" />, value: "100%", label: "Sanitised Equipment" },
              { icon: <Truck size={18} color="#D4AF37" />, value: "Ontime", label: "Delivery & Setup" },
              { icon: <Star size={18} color="#D4AF37" />, value: "5.0 ★", label: "Customer Rated" },
            ].map((p) => (
              <div key={p.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                {p.icon}
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", color: "#D4AF37", lineHeight: 1 }}>
                    {p.value}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.3 }}>
                    {p.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4rem",
          opacity: 0.6,
        }}
      >
        <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#fff", textTransform: "uppercase" }}>
          Scroll
        </span>
        <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, rgba(255,255,255,0.7), transparent)" }} />
      </div>
    </section>
  );
}
