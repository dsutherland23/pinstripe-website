"use client";

import React from "react";

export default function InvoiceControls() {
  return (
    <div
      className="no-print"
      style={{
        background: "#0f0f0f",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(212,175,55,0.2)",
      }}
    >
      <span
        style={{
          color: "#D4AF37",
          fontWeight: 800,
          letterSpacing: "0.1em",
          fontSize: "0.85rem",
          textTransform: "uppercase",
        }}
      >
        Pinstripes Rentals — Invoice
      </span>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <a
          href="/portal"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)",
            textDecoration: "none",
            fontSize: "0.82rem",
          }}
        >
          ← Portal
        </a>
        <button
          onClick={() => typeof window !== "undefined" && window.print()}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "0.5rem",
            background: "#D4AF37",
            border: "none",
            color: "#000000",
            fontWeight: 700,
            fontSize: "0.82rem",
            cursor: "pointer",
          }}
        >
          🖨 Print Invoice
        </button>
      </div>
    </div>
  );
}
