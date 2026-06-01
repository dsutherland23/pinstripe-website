"use client";

import React from "react";
import { PartyPopper, Truck, Users, Award } from "lucide-react";

const stats = [
  { icon: <PartyPopper size={24} />, value: "2,400+", label: "Events Served" },
  { icon: <Truck size={24} />,       value: "Same Day", label: "Delivery Available" },
  { icon: <Users size={24} />,       value: "500+",    label: "Active Clients" },
  { icon: <Award size={24} />,       value: "8 Years", label: "In Business" },
];

export default function StatsBar() {
  return (
    <div
      style={{
        background: "#0f0f0f",
        padding: "0 1.25rem 5.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
          gap: "0",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: "1.5rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              justifyContent: "center",
            }}
          >
            <div style={{ color: "#D4AF37", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "1.25rem", color: "#ffffff", lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginTop: "0.25rem" }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
