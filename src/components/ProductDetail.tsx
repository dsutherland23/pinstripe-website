"use client";

import React, { useEffect, useRef } from "react";
import { X, Star, Maximize2, Users, Calendar, ShieldCheck, Sparkles, CloudSun } from "lucide-react";
import type { RentalItem } from "./FeaturedRentals";

const FALLBACK = "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=60";

interface ProductDetailProps {
  item: RentalItem | null;
  onClose: () => void;
  onOpenQuoteWithItem: (item: RentalItem) => void;
}

export default function ProductDetail({ item, onClose, onOpenQuoteWithItem }: ProductDetailProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (item) {
      try {
        d.showModal();
      } catch {}
    } else {
      try {
        d.close();
      } catch {}
    }
  }, [item]);

  if (!item) return <dialog ref={dialogRef} />;

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      style={{
        background: "var(--card-bg)",
        color: "var(--text-primary)",
        width: "min(560px, 92vw)",
        margin: "auto",
        border: "1px solid var(--border-primary)",
        borderRadius: "1.5rem",
        boxShadow: "0 32px 80px var(--shadow-color)",
        transition: "all 0.5s ease",
      }}
    >
      {/* Close btn */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          zIndex: 10,
          background: "var(--card-bg)",
          border: "1px solid var(--border-primary)",
          borderRadius: "0.75rem",
          padding: "0.5rem",
          cursor: "pointer",
          display: "flex",
          boxShadow: "0 2px 12px var(--shadow-color)",
          color: "var(--text-secondary)",
          transition: "all 0.3s ease",
        }}
      >
        <X size={18} />
      </button>

      {/* Hero image */}
      <div style={{ position: "relative", aspectRatio: "16/7", overflow: "hidden", background: "var(--bg-secondary)" }}>
        <img
          src={item.image}
          alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK;
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
        {/* Category */}
        <div
          style={{
            position: "absolute",
            bottom: "1rem",
            left: "1rem",
            background: "rgba(15,15,15,0.9)",
            backdropFilter: "blur(8px)",
            padding: "0.3rem 0.75rem",
            borderRadius: "9999px",
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#D4AF37",
          }}
        >
          {item.category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.75rem" }}>
        {/* Stars + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", color: "#f59e0b" }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={13} fill="#f59e0b" strokeWidth={0} />
            ))}
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.8rem", color: "var(--text-primary)" }}>
            {item.rating}
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", opacity: 0.8 }}>({item.reviews} reviews)</span>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 900,
            fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
            color: "var(--text-primary)",
            lineHeight: 1.2,
            marginBottom: "1.25rem",
          }}
        >
          {item.title}
        </h2>

        {/* Price card */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1rem",
            marginBottom: "1.25rem",
            background: "var(--bg-secondary)",
            borderRadius: "1rem",
            padding: "1rem",
            border: "1px solid var(--border-primary)",
            transition: "all 0.4s ease",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-secondary)", opacity: 0.8, marginBottom: "0.25rem" }}>
              Rental Price
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "1.75rem", color: "var(--text-primary)", lineHeight: 1 }}>
              ${item.price}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-secondary)", opacity: 0.8, marginTop: "0.2rem" }}>
              per day
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
          {item.description}
        </p>

        {/* Specs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {[
            { Icon: Maximize2, label: "Dimensions", value: item.dimensions },
            { Icon: Users, label: "Capacity", value: item.capacity },
          ].map(({ Icon, label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                background: "var(--bg-secondary)",
                borderRadius: "0.75rem",
                padding: "0.875rem",
                border: "1px solid var(--border-primary)",
                transition: "all 0.4s ease",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "0.625rem",
                  background: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} color="#D4AF37" />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-secondary)", opacity: 0.8, marginBottom: "0.15rem" }}>
                  {label}
                </div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.8rem", color: "var(--text-primary)" }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust & Policy Seals */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.75rem" }}>
          {/* Sanitization loop badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "rgba(34, 197, 94, 0.05)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              borderRadius: "0.875rem",
              padding: "0.875rem",
            }}
          >
            <div style={{ background: "rgba(34, 197, 94, 0.12)", borderRadius: "50%", padding: "0.4rem", display: "flex", flexShrink: 0 }}>
              <ShieldCheck size={18} color="#22c55e" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#22c55e" }}>
                3-Step Sanitisation Protocol
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.1rem", lineHeight: 1.35 }}>
                Meticulously power-washed, eco-sanitized, and safety-inspected before dispatch.
              </p>
            </div>
          </div>

          {/* Weather rain-check policy badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "rgba(212, 175, 55, 0.05)",
              border: "1px solid rgba(212, 175, 55, 0.2)",
              borderRadius: "0.875rem",
              padding: "0.875rem",
            }}
          >
            <div style={{ background: "rgba(212, 175, 55, 0.12)", borderRadius: "50%", padding: "0.4rem", display: "flex", flexShrink: 0 }}>
              <CloudSun size={18} color="#D4AF37" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#D4AF37" }}>
                Hampton Roads Weather Guarantee
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.1rem", lineHeight: 1.35 }}>
                Forecast call for rain or high winds? Reschedule your date for 100% free up to 24 hours prior.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <button
            onClick={onClose}
            style={{
              padding: "1rem",
              background: "var(--bg-secondary)",
              border: "1.5px solid var(--border-secondary)",
              borderRadius: "0.875rem",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "all 0.2s",
            }}
          >
            Go Back
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenQuoteWithItem(item);
            }}
            style={{
              padding: "1rem",
              background: "#D4AF37",
              border: "none",
              borderRadius: "0.875rem",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              color: "#0f0f0f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              boxShadow: "0 6px 20px rgba(212,175,55,0.3)",
              transition: "all 0.2s",
            }}
          >
            <Calendar size={14} />
            Add to Booking/Reserve
          </button>
        </div>
      </div>
    </dialog>
  );
}
