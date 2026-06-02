"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ArrowLeft, ArrowRight, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { mockInventory } from "@/data/mockInventory";
import { useFormValidation, formatPhone } from "@/hooks/useFormValidation";

interface QuoteBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItemFromInventory?: { id: string; title: string; price: number } | null;
  defaultDate?: string;
  defaultCity?: string;
}

export default function QuoteBuilder({ isOpen, onClose, selectedItemFromInventory, defaultDate, defaultCity }: QuoteBuilderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [quoteRef, setQuoteRef] = useState<string | null>(null);
  const { errors, validateOnBlur, validateStepFields, clearAllErrors } = useFormValidation();

  // Availability state
  const [availability, setAvailability] = useState<Record<string, { totalStock: number; rented: number; available: number }>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Step 1 — must be declared before the availability useEffect that depends on eventDate
  const [eventType, setEventType] = useState("Birthday Party");
  const [eventDate, setEventDate] = useState("");
  const [eventLoc, setEventLoc] = useState("");
  const [guestCount, setGuestCount] = useState("50");

  // Fetch availability when date is changed
  useEffect(() => {
    if (!eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return;

    const fetchAvailability = async () => {
      setLoadingAvailability(true);
      try {
        const res = await fetch(`/api/availability?date=${eventDate}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setAvailability(data.availability);
        }
      } catch (err) {
        console.error("Failed to load availability:", err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [eventDate]);


  // Step 2
  const [selected, setSelected] = useState<Record<string, number>>({});

  // Step 3
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Norfolk");
  const [customCity, setCustomCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pay in Person");

  useEffect(() => {
    if (selectedItemFromInventory) {
      setSelected({ [selectedItemFromInventory.id]: 1 });
      setStep(1);
    } else {
      setSelected({});
      setStep(1);
    }
    if (isOpen && defaultDate) {
      setEventDate(defaultDate);
    }
    if (isOpen && defaultCity) {
      setCity(defaultCity);
    }
    setDone(false);
    setSubmitError(null);
    setQuoteRef(null);
    clearAllErrors();
  }, [selectedItemFromInventory, isOpen, defaultDate, defaultCity, clearAllErrors]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (isOpen) {
      try {
        d.showModal();
      } catch {}
    } else {
      try {
        d.close();
      } catch {}
    }
  }, [isOpen]);

  const isAvailLimited = (id: string, qty: number) => {
    const limit = availability[id]?.available;
    return limit !== undefined && qty >= limit;
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const c = { ...prev };
      if (c[id]) delete c[id];
      else {
        const limit = availability[id]?.available;
        if (limit !== undefined && limit <= 0) {
          return prev; // Block selecting sold-out items
        }
        c[id] = 1;
      }
      return c;
    });

  const updateQty = (id: string, delta: number) =>
    setSelected((prev) => {
      const current = prev[id] || 1;
      const nextVal = current + delta;
      
      const limit = availability[id]?.available;
      if (delta > 0 && limit !== undefined && nextVal > limit) {
        return prev; // Block increment beyond stock level
      }
      
      return { ...prev, [id]: Math.max(1, nextVal) };
    });

  const total = Object.entries(selected).reduce((sum, [id, qty]) => {
    const item = mockInventory.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const steps = ["Event Info", "Select Rentals", "Your Details"];

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
      <div style={{ display: "flex", flexDirection: "column", maxHeight: "90dvh" }}>
        {/* ---- HEADER ---- */}
        <div style={{ padding: "1.75rem 1.75rem 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.25rem" }}>
                Instant Quote Builder
              </div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.4rem", color: "var(--text-primary)", lineHeight: 1.2 }}>
                {done ? "Quote Submitted! 🎉" : steps[step - 1]}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "0.75rem",
                padding: "0.6rem",
                cursor: "pointer",
                display: "flex",
                color: "var(--text-secondary)",
                flexShrink: 0,
                transition: "all 0.3s ease",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress bar */}
          {!done && (
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {steps.map((s, i) => (
                <div key={s} style={{ flex: 1 }}>
                  <div
                    style={{
                      height: "4px",
                      borderRadius: "9999px",
                      background: step > i ? "#D4AF37" : step === i + 1 ? "#f0cc60" : "var(--border-secondary)",
                      transition: "background 0.3s",
                    }}
                  />
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.55rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: step >= i + 1 ? "#D4AF37" : "var(--text-secondary)",
                      opacity: step >= i + 1 ? 1 : 0.6,
                      marginTop: "0.3rem",
                    }}
                  >
                    {s}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- BODY (scrollable) ---- */}
        <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1.75rem 1.75rem" }}>
          {done ? (
            /* SUCCESS */
            <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "rgba(34, 197, 94, 0.08)",
                  border: "2px solid rgba(34, 197, 94, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                }}
              >
                <CheckCircle2 size={36} color="#22c55e" />
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "0.75rem" }}>
                {city === "Other" ? "Extended Service Area Review 🚚" : "Booking Request Received!"}
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "2rem", maxWidth: "440px", margin: "0 auto 2rem" }}>
                {city === "Other" ? (
                  <>
                    Thank you <strong>{firstName} {lastName}</strong>! Since your venue is located in <strong>{customCity}</strong> (outside our standard service area, which is <em>Coming Soon</em>), our travel logistics team will review our schedule and contact you at <strong>{phone}</strong> or <strong>{email}</strong> within 2 hours with a custom adjusted travel quote if we can accommodate your event.
                  </>
                ) : (
                  <>
                    Thank you <strong>{firstName} {lastName}</strong>! A detailed confirmation receipt has been sent to <strong>{email}</strong>.
                  </>
                )}
              </p>
              {quoteRef && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "rgba(212,175,55,0.08)",
                    border: "1px solid rgba(212,175,55,0.25)",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 1rem",
                    fontSize: "0.78rem",
                    color: "#D4AF37",
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    marginBottom: "1.5rem",
                  }}
                >
                  Reference #: {quoteRef}
                </div>
              )}

              {/* Summary */}
              <div
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  textAlign: "left",
                  marginBottom: "1.5rem",
                  transition: "all 0.4s ease",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1rem" }}>
                  {[
                    ["Event Type", eventType],
                    ["Event Date", eventDate || "—"],
                    ["Guests", guestCount],
                    ["Delivery Address", city === "Other" ? `${address}, ${customCity} ${zipCode} (Extended Area)` : `${address}, ${city} ${zipCode}`],
                    ["Payment Choice", paymentMethod],
                    ["Estimated Total", `$${total.toFixed(2)}`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ gridColumn: label === "Delivery Address" ? "span 2" : "auto" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--text-secondary)",
                          opacity: 0.7,
                          marginBottom: "0.2rem",
                        }}
                      >
                        {label}
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.82rem", color: "var(--text-primary)", lineHeight: 1.3 }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={onClose} className="btn-dark btn-press" style={{ padding: "0.875rem 2.5rem" }}>
                Close
              </button>
            </div>
          ) : (
            <>
            {submitError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                  fontSize: "0.82rem",
                  color: "#ef4444",
                  fontFamily: "var(--font-body)",
                  marginBottom: "0.5rem",
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {submitError}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                // Final step validation
                const vals = { firstName, lastName, email, phone, address, zipCode, city, customCity };
                const isValid = validateStepFields(3, vals, Object.keys(selected).length);
                if (!isValid) return;

                setIsSubmitting(true);
                setSubmitError(null);
                try {
                  const res = await fetch("/api/quote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      eventType,
                      eventDate,
                      eventLocation: eventLoc,
                      guestCount,
                      selectedItems: selected,
                      firstName,
                      lastName,
                      email,
                      phone,
                      address,
                      city,
                      customCity,
                      zipCode,
                      notes,
                      paymentMethod,
                      estimatedTotal: total,
                    }),
                  });
                  const json = await res.json();
                  if (res.ok && json.success) {
                    setQuoteRef(json.quoteRef ?? null);
                    setDone(true);
                  } else {
                    setSubmitError(json.error || "Something went wrong. Please try again.");
                  }
                } catch {
                  setSubmitError("Network error. Please check your connection and try again.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
            >
              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                    <div>
                      <label style={labelStyle}>Event Type</label>
                      <select className="field" value={eventType} onChange={(e) => setEventType(e.target.value)} style={{ appearance: "auto" }}>
                        {["Birthday Party", "Wedding reception", "Corporate Event", "Backyard BBQ", "Graduation Party", "Other Event"].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Expected Guests</label>
                      <input
                        required
                        type="number"
                        className="field"
                        placeholder="e.g. 50"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                    <div>
                      <label style={labelStyle}>Event Date *</label>
                      <div style={{ position: "relative" }}>
                        <span style={iconStyle}>📅</span>
                        <input
                          required
                          type="date"
                          className="field"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          style={{ paddingLeft: "2.3rem" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Event Location Landmark</label>
                      <div style={{ position: "relative" }}>
                        <span style={iconStyle}>📍</span>
                        <input
                          type="text"
                          className="field"
                          placeholder="e.g. Town Point Park, Norfolk"
                          value={eventLoc}
                          onChange={(e) => setEventLoc(e.target.value)}
                          style={{ paddingLeft: "2.3rem" }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <label style={labelStyle}>Select Rental Equipment Items</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", maxHeight: "320px", overflowY: "auto" }}>
                    {mockInventory.map((item) => {
                      const qty = selected[item.id] || 0;
                      const avail = availability[item.id];
                      const isSoldOut = avail !== undefined && avail.available <= 0;
                      
                      return (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "1rem",
                            padding: "0.625rem 0.875rem",
                            background: isSoldOut
                              ? "rgba(239,68,68,0.02)"
                              : qty
                              ? "rgba(212,175,55,0.04)"
                              : "var(--bg-secondary)",
                            border: `1.5px solid ${
                              isSoldOut
                                ? "rgba(239,68,68,0.2)"
                                : qty
                                ? "#D4AF37"
                                : "var(--border-primary)"
                            }`,
                            borderRadius: "0.75rem",
                            transition: "all 0.2s ease",
                            opacity: isSoldOut ? 0.65 : 1,
                          }}
                        >
                          <div
                            onClick={() => !isSoldOut && toggle(item.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              cursor: isSoldOut ? "not-allowed" : "pointer",
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={qty > 0}
                              disabled={isSoldOut}
                              onChange={() => {}}
                              style={{ accentColor: "#D4AF37", width: "16px", height: "16px", pointerEvents: "none" }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <h4
                                style={{
                                  fontFamily: "var(--font-heading)",
                                  fontWeight: 800,
                                  fontSize: "0.78rem",
                                  color: isSoldOut ? "var(--text-secondary)" : "var(--text-primary)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.title}
                              </h4>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.15rem" }}>
                                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "var(--text-secondary)", opacity: 0.8 }}>
                                  ${item.price} / day
                                </span>
                                
                                {loadingAvailability ? (
                                  <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>checking stock...</span>
                                ) : avail !== undefined ? (
                                  isSoldOut ? (
                                    <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "0.25rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontWeight: 700 }}>Sold Out</span>
                                  ) : avail.available <= 3 ? (
                                    <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "0.25rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", fontWeight: 700 }}>Low Stock: {avail.available} Left</span>
                                  ) : (
                                    <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "0.25rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", fontWeight: 500 }}>{avail.available} Available</span>
                                  )
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {qty > 0 && !isSoldOut && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--card-bg)", border: "1px solid var(--border-primary)", borderRadius: "0.5rem", padding: "0.15rem 0.4rem" }}>
                              <button
                                type="button"
                                onClick={() => updateQty(item.id, -1)}
                                style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", padding: "0 0.15rem" }}
                              >
                                -
                              </button>
                              <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.75rem", fontWeight: 700, minWidth: "12px", textAlign: "center", color: "var(--text-primary)" }}>
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQty(item.id, 1)}
                                disabled={avail !== undefined && qty >= avail.available}
                                style={{ background: "none", border: "none", cursor: isAvailLimited(item.id, qty) ? "not-allowed" : "pointer", fontWeight: 800, fontSize: "1rem", color: isAvailLimited(item.id, qty) ? "rgba(255,255,255,0.2)" : "var(--text-primary)", padding: "0 0.15rem" }}
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                    <div>
                      <label style={labelStyle}>First Name *</label>
                      <input
                        required
                        type="text"
                        className="field"
                        placeholder="Jane"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        onBlur={(e) => validateOnBlur("firstName", e.target.value)}
                        style={errors.firstName ? { borderColor: "#ef4444" } : {}}
                      />
                      {errors.firstName && (
                        <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: "0.25rem", fontFamily: "var(--font-body)" }}>{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name *</label>
                      <input
                        required
                        type="text"
                        className="field"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        onBlur={(e) => validateOnBlur("lastName", e.target.value)}
                        style={errors.lastName ? { borderColor: "#ef4444" } : {}}
                      />
                      {errors.lastName && (
                        <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: "0.25rem", fontFamily: "var(--font-body)" }}>{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                    <div>
                      <label style={labelStyle}>Phone Number *</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem", pointerEvents: "none", zIndex: 2 }}>
                          🇺🇸
                        </span>
                        <input
                          required
                          type="tel"
                          className="field"
                          placeholder="(757) 749-3407"
                          value={phone}
                          onChange={(e) => setPhone(formatPhone(e.target.value))}
                          onBlur={(e) => validateOnBlur("phone", e.target.value)}
                          style={{ paddingLeft: "2.5rem", ...(errors.phone ? { borderColor: "#ef4444" } : {}) }}
                        />
                      </div>
                      {errors.phone && (
                        <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: "0.25rem", fontFamily: "var(--font-body)" }}>{errors.phone}</p>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address *</label>
                      <input
                        required
                        type="email"
                        className="field"
                        placeholder="jane@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={(e) => validateOnBlur("email", e.target.value)}
                        style={errors.email ? { borderColor: "#ef4444" } : {}}
                      />
                      {errors.email && (
                        <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: "0.25rem", fontFamily: "var(--font-body)" }}>{errors.email}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Delivery Street Address *</label>
                    <input
                      required
                      type="text"
                      className="field"
                      placeholder="e.g. 123 Atlantic Ave"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onBlur={(e) => validateOnBlur("address", e.target.value)}
                      style={errors.address ? { borderColor: "#ef4444" } : {}}
                    />
                    {errors.address && (
                      <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: "0.25rem", fontFamily: "var(--font-body)" }}>{errors.address}</p>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                    <div>
                      <label style={labelStyle}>City *</label>
                      <select className="field" value={city} onChange={(e) => setCity(e.target.value)} style={{ appearance: "auto" }}>
                        {["Norfolk", "Virginia Beach", "Chesapeake", "Portsmouth", "Suffolk", "Newport News", "Hampton", "Yorktown", "Williamsburg", "Other"].map((c) => (
                          <option key={c} value={c}>
                            {c === "Other" ? "Other (Coming Soon)" : c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Zip Code *</label>
                      <input
                        required
                        type="text"
                        className="field"
                        placeholder="e.g. 23451"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        onBlur={(e) => validateOnBlur("zipCode", e.target.value)}
                        style={errors.zipCode ? { borderColor: "#ef4444" } : {}}
                      />
                      {errors.zipCode && (
                        <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: "0.25rem", fontFamily: "var(--font-body)" }}>{errors.zipCode}</p>
                      )}
                    </div>
                  </div>
                  {city === "Other" && (
                    <>
                      <div>
                        <label style={labelStyle}>Specify Custom City *</label>
                        <input
                          required
                          type="text"
                          className="field"
                          placeholder="e.g. Richmond"
                          value={customCity}
                          onChange={(e) => setCustomCity(e.target.value)}
                        />
                      </div>
                      <div
                        style={{
                          background: "rgba(212,175,55,0.06)",
                          border: "1px solid rgba(212,175,55,0.25)",
                          borderRadius: "0.875rem",
                          padding: "1.1rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#bda030", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.35rem" }}>
                          📍 Service Area Notice: Coming Soon
                        </span>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          Although your area is outside our standard coverage zone, <strong>we can frequently accommodate extended events</strong>! Submit your request, and our scheduling team will be notified. If we can accommodate your date at an adjusted price, we will reach out to you within 2 hours.
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <label style={labelStyle}>Special Requests / Notes</label>
                    <textarea
                      className="field"
                      rows={2}
                      placeholder="Setup surface, delivery notes, special requirements…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  {/* Payment Method Option Cards */}
                  <div style={{ marginTop: "0.5rem" }}>
                    <label style={labelStyle}>Payment Method</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                      {[
                        {
                          id: "Pay in Person",
                          title: "Pay in Person (Cash / Check / Zelle)",
                          desc: "Pay the full total at delivery or setup.",
                          priceText: `$${total.toFixed(2)}`,
                        },
                        {
                          id: "Pay Online Now",
                          title: "Pay now (Online Secure Card Payment)",
                          desc: "Pay the full total online securely via card now.",
                          priceText: `$${total.toFixed(2)}`,
                        },
                      ].map((opt) => {
                        const isSel = paymentMethod === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setPaymentMethod(opt.id)}
                            style={{
                              padding: "0.75rem 1rem",
                              borderRadius: "0.75rem",
                              border: isSel ? "2.5px solid #D4AF37" : "1.5px solid var(--border-secondary)",
                              background: isSel ? "rgba(212,175,55,0.04)" : "var(--card-bg)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "1rem",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                              <input
                                type="radio"
                                checked={isSel}
                                onChange={() => {}}
                                style={{ accentColor: "#D4AF37", width: "16px", height: "16px", cursor: "pointer", pointerEvents: "none", flexShrink: 0 }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontFamily: "var(--font-heading)",
                                    fontWeight: 800,
                                    fontSize: "0.78rem",
                                    color: "var(--text-primary)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {opt.title}
                                </div>
                                <div
                                  style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.68rem",
                                    color: "var(--text-secondary)",
                                    opacity: 0.8,
                                    marginTop: "1px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {opt.desc}
                                </div>
                              </div>
                            </div>
                            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "0.9rem", color: isSel ? "#D4AF37" : "var(--text-primary)", flexShrink: 0 }}>
                              {opt.priceText}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weather Guarantee Banner in Checkout */}
                  <div
                    style={{
                      background: "rgba(212, 175, 55, 0.05)",
                      border: "1px solid rgba(212, 175, 55, 0.25)",
                      borderRadius: "0.875rem",
                      padding: "0.75rem 1rem",
                      marginTop: "0.5rem",
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "center",
                    }}
                  >
                    <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.35 }}>
                      <strong>100% Free Rain-Check Guarantee:</strong> Hampton Roads weather predicts rain or high winds? Reschedule your rental date completely free of charge up to 24 hours prior!
                    </span>
                  </div>
                </>
              )}

              {/* ---- FOOTER ---- */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--border-primary)",
                  marginTop: "0.5rem",
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-secondary)", opacity: 0.7 }}>
                    Estimated Total
                  </div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "1.5rem", color: "var(--text-primary)" }}>
                    ${total.toFixed(2)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.875rem 1.25rem",
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
                        transition: "all 0.2s ease",
                      }}
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const vals = { eventDate, guestCount, city, customCity, firstName, lastName, email, phone, address, zipCode };
                        const isValid = validateStepFields(step, vals, Object.keys(selected).length);
                        if (isValid) setStep((s) => s + 1);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.875rem 1.5rem",
                        background: "#0f0f0f",
                        border: "none",
                        borderRadius: "0.875rem",
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        color: "#D4AF37",
                        transition: "all 0.2s ease",
                      }}
                      className="btn-press"
                    >
                      Continue <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.875rem 1.5rem",
                        background: isSubmitting ? "#b8962e" : "#D4AF37",
                        border: "none",
                        borderRadius: "0.875rem",
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        color: "#0f0f0f",
                        boxShadow: "0 6px 20px rgba(212,175,55,0.3)",
                        transition: "all 0.2s ease",
                        opacity: isSubmitting ? 0.8 : 1,
                      }}
                      className="btn-press"
                    >
                      {isSubmitting ? "Submitting…" : <>Submit Quote <Send size={14} /></>}
                    </button>
                  )}
                </div>
              </div>
            </form>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-heading)",
  fontWeight: 700,
  fontSize: "0.65rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--text-secondary)",
  opacity: 0.85,
  marginBottom: "0.5rem",
};

const iconStyle: React.CSSProperties = {
  position: "absolute",
  left: "0.875rem",
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
};
