"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, Clock, Truck, PackageCheck, FileText, CalendarDays, MapPin, Users } from "lucide-react";

interface Booking {
  id: string;
  customer: { name: string; email: string; phone: string };
  event: { type: string; date: string; location: string; guestCount: number };
  delivery: { address: string; city: string; zipCode: string };
  items: Record<string, number>;
  itemCount: number;
  estimatedTotal: number;
  paymentMethod: string;
  notes?: string;
  submittedAt: string;
}

const STATUS_STAGES = [
  { key: "received",   label: "Request Received",  icon: Clock,        color: "#D4AF37" },
  { key: "confirmed",  label: "Booking Confirmed",  icon: CheckCircle2, color: "#10b981" },
  { key: "preparing",  label: "Equipment Prep",     icon: PackageCheck, color: "#3b82f6" },
  { key: "delivered",  label: "Delivered & Setup",  icon: Truck,        color: "#8b5cf6" },
];

export default function CustomerPortal() {
  const [email, setEmail] = useState("");
  const [refId, setRefId] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBooking(null);
    setSearched(false);

    try {
      const res = await fetch(`/api/portal/lookup?ref=${encodeURIComponent(refId.trim())}&email=${encodeURIComponent(email.trim().toLowerCase())}&t=${Date.now()}`);
      const data = await res.json();

      if (res.ok && data.success && data.booking) {
        setBooking(data.booking);
        setSearched(true);
      } else {
        setError(data.error || "No booking found with that reference and email combination.");
        setSearched(true);
      }
    } catch {
      setError("Network error. Please try again.");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Derive current status from event date
  const getStatus = (b: Booking) => {
    const eventDate = new Date(b.event.date + "T12:00:00");
    const now = new Date();
    const daysUntil = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntil > 7) return 0;    // received
    if (daysUntil > 3) return 1;    // confirmed
    if (daysUntil > 0) return 2;    // preparing
    return 3;                        // delivered
  };

  const goldLabel: React.CSSProperties = {
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#D4AF37",
    marginBottom: "0.3rem",
    display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "var(--font-body, sans-serif)", color: "#e5e5e5" }}>
      {/* Header */}
      <header style={{ background: "#111111", borderBottom: "1px solid rgba(212,175,55,0.15)", padding: "1.25rem 2rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4AF37" }}>Pinstripes Rentals</span>
            </Link>
            <h1 style={{ color: "#ffffff", fontSize: "1.25rem", fontWeight: 800, margin: "0.25rem 0 0" }}>Customer Portal</h1>
          </div>
          <Link href="/" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back to Website</Link>
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "3rem auto", padding: "0 1.5rem" }}>
        {/* Lookup Card */}
        <div style={{ background: "#111111", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "1.25rem", padding: "2.5rem", marginBottom: "2.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "inline-flex", padding: "0.875rem", borderRadius: "50%", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", color: "#D4AF37", marginBottom: "1rem" }}>
              <Search size={24} />
            </div>
            <h2 style={{ fontFamily: "var(--font-heading, serif)", color: "#ffffff", fontSize: "1.4rem", fontWeight: 800, margin: "0 0 0.5rem" }}>Track Your Booking</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Enter your email address and the quote reference number from your confirmation.</p>
          </div>

          <form onSubmit={handleLookup} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={goldLabel}>Email Address</label>
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.625rem", background: "#181818", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "0.9rem", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={goldLabel}>Quote Reference #</label>
              <input
                required
                type="text"
                placeholder="PSR-ABC123"
                value={refId}
                onChange={(e) => setRefId(e.target.value.toUpperCase())}
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.625rem", background: "#181818", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "0.9rem", fontFamily: "monospace", boxSizing: "border-box" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ gridColumn: "1 / -1", padding: "0.875rem", borderRadius: "0.625rem", background: "linear-gradient(90deg, #D4AF37, #F3E5AB)", border: "none", color: "#000000", fontWeight: 750, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Searching..." : <><Search size={15} /> Look Up My Booking</>}
            </button>
          </form>

          {searched && error && (
            <div style={{ marginTop: "1.25rem", padding: "1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.75rem", color: "#ef4444", fontSize: "0.85rem", textAlign: "center" }}>
              {error}
            </div>
          )}
        </div>

        {/* Booking Details */}
        {booking && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Status Timeline */}
            <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <p style={{ fontSize: "0.7rem", color: "#D4AF37", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.25rem" }}>Booking Reference</p>
                  <p style={{ fontSize: "1.25rem", color: "#ffffff", fontWeight: 900, fontFamily: "monospace", margin: 0 }}>{booking.id}</p>
                </div>
                <Link
                  href={`/portal/invoice/${booking.id}`}
                  target="_blank"
                  style={{ padding: "0.5rem 1.25rem", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "0.5rem", background: "rgba(212,175,55,0.06)", color: "#D4AF37", fontSize: "0.82rem", textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <FileText size={14} /> View Invoice
                </Link>
              </div>

              {/* Progress Bar */}
              <div style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(${STATUS_STAGES.length}, 1fr)`, gap: 0 }}>
                {/* Connector line */}
                <div style={{ position: "absolute", top: "20px", left: "10%", right: "10%", height: "2px", background: "rgba(255,255,255,0.08)", zIndex: 0 }} />
                <div style={{ position: "absolute", top: "20px", left: "10%", width: `${(getStatus(booking) / (STATUS_STAGES.length - 1)) * 80}%`, height: "2px", background: "#D4AF37", zIndex: 1, transition: "width 0.5s ease" }} />

                {STATUS_STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isActive = idx <= getStatus(booking);
                  return (
                    <div key={stage.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", position: "relative", zIndex: 2 }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: isActive ? stage.color : "#1a1a1a", border: `2px solid ${isActive ? stage.color : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                        <Icon size={18} color={isActive ? "#000000" : "rgba(255,255,255,0.25)"} strokeWidth={2.5} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: isActive ? 700 : 400, color: isActive ? "#ffffff" : "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.3 }}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Event + Customer Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
              {/* Event */}
              <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#D4AF37", fontWeight: 800, letterSpacing: "0.08em", marginBottom: "1rem" }}>Event Details</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                    <CalendarDays size={15} color="#D4AF37" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)" }}>Event Date</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff" }}>{booking.event.date}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                    <Users size={15} color="#D4AF37" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)" }}>Guest Count</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff" }}>{booking.event.guestCount} guests</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                    <MapPin size={15} color="#D4AF37" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)" }}>Delivery Address</div>
                      <div style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
                        {booking.delivery.address}<br />
                        {booking.delivery.city}, VA {booking.delivery.zipCode}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#D4AF37", fontWeight: 800, letterSpacing: "0.08em", marginBottom: "1rem" }}>Rental Summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                  {Object.entries(booking.items).map(([itemId, qty]) => (
                    <div key={itemId} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                      <span>Item #{itemId}</span>
                      <span style={{ color: "#ffffff" }}>× {qty}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>Estimated Total</span>
                  <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "#D4AF37" }}>${booking.estimatedTotal.toFixed(2)}</span>
                </div>
                <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>Payment Method</span>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.75)" }}>{booking.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#D4AF37", fontWeight: 800, letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Your Notes / Special Requests</h3>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", lineHeight: 1.6, margin: 0 }}>{booking.notes}</p>
              </div>
            )}

            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.78rem" }}>
              Questions? Call us at <a href="tel:7572002600" style={{ color: "#D4AF37" }}>(757) 200-2600</a> or email <a href="mailto:pinstripesrentals@gmail.com" style={{ color: "#D4AF37" }}>pinstripesrentals@gmail.com</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
