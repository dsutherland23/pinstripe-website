"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ArrowLeft, ArrowRight, Send, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { mockInventory } from "@/data/mockInventory";
import { useFormValidation, formatPhone } from "@/hooks/useFormValidation";

interface PackageAddon {
  id: string;
  label: string;
  price: number;
}

interface PhotoBoothPackage {
  name: string;
  price: number;
  description: string;
  addons: PackageAddon[];
}

const PHOTO_BOOTH_PACKAGES: PhotoBoothPackage[] = [
  {
    name: "Snap It",
    price: 250,
    description: "Perfect for DIY hosts who want great digital photos without the full-service price. A backdrop can be added as an optional add-on.",
    addons: [
      { id: "backdrop", label: "Backdrop", price: 100 }
    ]
  },
  {
    name: "Party",
    price: 500,
    description: "Full-service, staffed booth. We handle everything before, during, and after — you just enjoy.",
    addons: [
      { id: "prints", label: "Unlimited Prints (2×6 or 4×6)", price: 250 },
      { id: "glam", label: "Glam Filter", price: 100 },
      { id: "guestbook", label: "Photo Guest Book", price: 100 }
    ]
  },
  {
    name: "VVIP",
    price: 750,
    description: "Guests look like they're on a red carpet. Glam filter, unlimited prints, and video messaging included.",
    addons: [
      { id: "guestbook", label: "Photo Guest Book", price: 100 }
    ]
  }
];

interface QuoteBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItemFromInventory?: { id: string; title: string; price: number } | null;
  selectedPackageFromUI?: string | null;
  defaultDate?: string;
  defaultCity?: string;
}

export default function QuoteBuilder({ isOpen, onClose, selectedItemFromInventory, selectedPackageFromUI, defaultDate, defaultCity }: QuoteBuilderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [quoteRef, setQuoteRef] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
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
  const [bookingMode, setBookingMode] = useState<"package" | "items">("package");
  const [selectedPackageName, setSelectedPackageName] = useState<string>("Party");
  const [packageHours, setPackageHours] = useState<number>(4);
  const [selectedPackageAddons, setSelectedPackageAddons] = useState<Record<string, boolean>>({});
  const [itemAddons, setItemAddons] = useState<Record<string, { kits: number; stand: boolean; extraHours: number }>>({});

  const getAddonState = (id: string) => {
    return itemAddons[id] || { kits: 0, stand: false, extraHours: 0 };
  };

  const updateAddonState = (id: string, updates: Partial<{ kits: number; stand: boolean; extraHours: number }>) => {
    setItemAddons((prev) => {
      const current = prev[id] || { kits: 0, stand: false, extraHours: 0 };
      return {
        ...prev,
        [id]: { ...current, ...updates },
      };
    });
  };

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
  const [payInPersonEnabled, setPayInPersonEnabled] = useState(true);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (res.ok && data.success) {
          setPayInPersonEnabled(data.payInPersonEnabled ?? true);
          if (data.payInPersonEnabled === false) {
            setPaymentMethod("Pay Online Now");
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    setItemAddons({});
    if (selectedPackageFromUI) {
      setBookingMode("package");
      setSelectedPackageName(selectedPackageFromUI);
      setPackageHours(4);
      setSelectedPackageAddons({});
      setSelected({});
      setStep(1);
    } else if (selectedItemFromInventory) {
      setBookingMode("items");
      setSelected({ [selectedItemFromInventory.id]: 1 });
      setSelectedPackageName("Party");
      setPackageHours(4);
      setSelectedPackageAddons({});
      setStep(1);
    } else {
      setBookingMode("package");
      setSelectedPackageName("Party");
      setPackageHours(4);
      setSelectedPackageAddons({});
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
  }, [selectedItemFromInventory, selectedPackageFromUI, isOpen, defaultDate, defaultCity, clearAllErrors]);

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

  const isPhotoBoothApplicable = () => {
    if (bookingMode === "package") return true;
    if (selectedItemFromInventory) {
      const item = mockInventory.find((i) => i.id === selectedItemFromInventory.id);
      if (item && item.category === "Photo Booths") return true;
      return false;
    }
    const totalSelectedCount = Object.values(selected).reduce((sum, val) => sum + val, 0);
    if (totalSelectedCount === 0) return true;

    const hasSelectedPhotoBooth = Object.keys(selected).some((id) => {
      if (selected[id] <= 0) return false;
      const item = mockInventory.find((i) => i.id === id);
      return item?.category === "Photo Booths";
    });
    return hasSelectedPhotoBooth;
  };

  // Force bookingMode to "items" if photobooth is not applicable
  useEffect(() => {
    if (!isPhotoBoothApplicable()) {
      setBookingMode("items");
    }
  }, [selected, selectedItemFromInventory]);

  const selectedPkg = PHOTO_BOOTH_PACKAGES.find((p) => p.name === selectedPackageName);
  const packageBaseTotal = selectedPkg ? selectedPkg.price : 0;
  const extraHoursPrice = Math.max(0, packageHours - 4) * 65;
  const addonsTotal = selectedPkg
    ? selectedPkg.addons
        .filter((addon) => selectedPackageAddons[addon.id])
        .reduce((sum, addon) => sum + addon.price, 0)
    : 0;

  const packageTotal = packageBaseTotal + extraHoursPrice + addonsTotal;

  const total = bookingMode === "package"
    ? packageTotal
    : Object.entries(selected).reduce((sum, [id, qty]) => {
        const item = mockInventory.find((i) => i.id === id);
        let itemTotal = item ? item.price * qty : 0;

        const addons = itemAddons[id];
        if (addons) {
          if (id === "7") { // Popcorn Machine
            itemTotal += (addons.kits * 18) + (addons.stand ? 25 : 0) + (addons.extraHours * 15);
          } else if (id === "3") { // Cotton Candy Machine
            itemTotal += (addons.kits * 20) + (addons.stand ? 25 : 0) + (addons.extraHours * 15);
          } else if (id === "9") { // Snow-cone Machine
            itemTotal += (addons.kits * 20) + (addons.extraHours * 15);
          }
        }

        return sum + itemTotal;
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
                Instant Booking & Reservation
              </div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.4rem", color: "var(--text-primary)", lineHeight: 1.2 }}>
                {done ? "Booking Reserved! 🎉" : steps[step - 1]}
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
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                {checkoutUrl ? (
                  <>
                    Thank you <strong>{firstName} {lastName}</strong>! Your event booking is reserved. You are being redirected to our secure Stripe checkout page to complete your payment...
                  </>
                ) : city === "Other" ? (
                  <>
                    Thank you <strong>{firstName} {lastName}</strong>! Since your venue is located in <strong>{customCity}</strong> (outside our standard service area, which is <em>Coming Soon</em>), our travel logistics team will review our schedule and contact you at <strong>{phone}</strong> or <strong>{email}</strong> within 2 hours with custom adjusted travel reservation details if we can accommodate your event.
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
                  Booking Reference #: {quoteRef}
                </div>
              )}

              {checkoutUrl && (
                <div style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
                  <a
                    href={checkoutUrl}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "#D4AF37",
                      color: "#0f0f0f",
                      border: "none",
                      borderRadius: "0.875rem",
                      padding: "0.875rem 2rem",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      textDecoration: "none",
                      boxShadow: "0 6px 20px rgba(212,175,55,0.3)",
                      transition: "all 0.2s ease",
                    }}
                    className="btn-press"
                  >
                    💳 Pay Securely with Card
                  </a>
                  <p style={{ margin: "0.5rem 0 0", fontSize: "0.68rem", color: "var(--text-secondary)", opacity: 0.8 }}>
                    If you are not redirected automatically in 2 seconds, click the button above.
                  </p>
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
                const itemsCount = bookingMode === "package" ? 1 : Object.keys(selected).length;
                const isValid = validateStepFields(3, vals, itemsCount);
                if (!isValid) return;

                setIsSubmitting(true);
                setSubmitError(null);

                const finalSelectedItems = bookingMode === "package"
                  ? {
                      [`pkg_${selectedPackageName.toLowerCase().replace(/\s+/g, "_")}`]: 1,
                      ...(packageHours > 4 ? { ["extra_hours"]: packageHours - 4 } : {}),
                      ...Object.keys(selectedPackageAddons).reduce((acc, addonId) => {
                        if (selectedPackageAddons[addonId]) {
                          acc[`addon_${addonId}`] = 1;
                        }
                        return acc;
                      }, {} as Record<string, number>)
                    }
                  : selected;

                let finalNotes = notes;
                if (bookingMode === "package" && selectedPkg) {
                  finalNotes = `[Selected Package]: ${selectedPackageName} (${packageHours} hours)\n[Selected Add-ons]: ${
                    selectedPkg.addons
                      .filter((a) => selectedPackageAddons[a.id])
                      .map((a) => a.label)
                      .join(", ") || "None"
                  }${notes ? `\n\n[User Notes]: ${notes}` : ""}`;
                } else if (bookingMode === "items") {
                  const addonSummaries: string[] = [];
                  Object.entries(itemAddons).forEach(([itemId, addon]) => {
                    const item = mockInventory.find((i) => i.id === itemId);
                    if (!item) return;

                    const summaries: string[] = [];
                    if (addon.kits > 0) {
                      const kitName = itemId === "7" ? "Popcorn Kit" : (itemId === "3" ? "Cotton Candy Kit" : "Snow-cone Kit");
                      const pricePerKit = itemId === "7" ? 18 : 20;
                      summaries.push(`${addon.kits} × ${kitName} ($${pricePerKit} each)`);
                    }
                    if (addon.stand) {
                      summaries.push(`Vintage Stand ($25)`);
                    }
                    if (addon.extraHours > 0) {
                      summaries.push(`${addon.extraHours} × Additional Hour ($15/hr)`);
                    }

                    if (summaries.length > 0) {
                      addonSummaries.push(`[${item.title} Add-ons]: ${summaries.join(", ")}`);
                    }
                  });

                  if (addonSummaries.length > 0) {
                    finalNotes = `${addonSummaries.join("\n")}${notes ? `\n\n[User Notes]: ${notes}` : ""}`;
                  }
                }

                try {
                  const res = await fetch("/api/quote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      eventType,
                      eventDate,
                      eventLocation: eventLoc,
                      guestCount,
                      selectedItems: finalSelectedItems,
                      firstName,
                      lastName,
                      email,
                      phone,
                      address,
                      city,
                      customCity,
                      zipCode,
                      notes: finalNotes,
                      paymentMethod,
                      estimatedTotal: total,
                    }),
                  });
                  const json = await res.json();
                  if (res.ok && json.success) {
                    setQuoteRef(json.id ?? json.quoteRef ?? null);
                    setCheckoutUrl(json.checkoutUrl ?? null);
                    setDone(true);
                    
                    if (json.checkoutUrl) {
                      setTimeout(() => {
                        window.location.href = json.checkoutUrl;
                      }, 2500);
                    }
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
                        onBlur={() => validateOnBlur("guestCount", guestCount)}
                        style={errors.guestCount ? { borderColor: "#ef4444" } : {}}
                      />
                      {errors.guestCount && (
                        <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: "0.25rem", fontFamily: "var(--font-body)" }}>{errors.guestCount}</p>
                      )}
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
                          onBlur={() => validateOnBlur("eventDate", eventDate)}
                          style={{ paddingLeft: "2.3rem", ...(errors.eventDate ? { borderColor: "#ef4444" } : {}) }}
                        />
                      </div>
                      {errors.eventDate && (
                        <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: "0.25rem", fontFamily: "var(--font-body)" }}>{errors.eventDate}</p>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>Event Location *</label>
                      <div style={{ position: "relative" }}>
                        <span style={iconStyle}>📍</span>
                        <input
                          required
                          type="text"
                          className="field"
                          placeholder="e.g. Town Point Park, Norfolk"
                          value={eventLoc}
                          onChange={(e) => setEventLoc(e.target.value)}
                          onBlur={() => validateOnBlur("eventLoc", eventLoc)}
                          style={{ paddingLeft: "2.3rem", ...(errors.eventLoc ? { borderColor: "#ef4444" } : {}) }}
                        />
                      </div>
                      {errors.eventLoc && (
                        <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: "0.25rem", fontFamily: "var(--font-body)" }}>{errors.eventLoc}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  {/* Segmented Mode Selector */}
                  {isPhotoBoothApplicable() && (
                    <div style={{ display: "flex", gap: "0.5rem", padding: "0.25rem", background: "var(--bg-secondary)", borderRadius: "0.75rem", border: "1px solid var(--border-primary)", marginBottom: "1.25rem" }}>
                      <button
                        type="button"
                        onClick={() => setBookingMode("package")}
                        style={{
                          flex: 1,
                          padding: "0.5rem 1rem",
                          borderRadius: "0.5rem",
                          border: "none",
                          background: bookingMode === "package" ? "var(--card-bg)" : "transparent",
                          color: bookingMode === "package" ? "var(--text-primary)" : "var(--text-secondary)",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          cursor: "pointer",
                          boxShadow: bookingMode === "package" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                          transition: "all 0.2s ease"
                        }}
                      >
                        Curated Packages
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingMode("items")}
                        style={{
                          flex: 1,
                          padding: "0.5rem 1rem",
                          borderRadius: "0.5rem",
                          border: "none",
                          background: bookingMode === "items" ? "var(--card-bg)" : "transparent",
                          color: bookingMode === "items" ? "var(--text-primary)" : "var(--text-secondary)",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          cursor: "pointer",
                          boxShadow: bookingMode === "items" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                          transition: "all 0.2s ease"
                        }}
                      >
                        Individual Rentals
                      </button>
                    </div>
                  )}

                  {bookingMode === "package" ? (
                    /* PACKAGES MODE */
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div>
                        <label style={labelStyle}>Select Curated Package</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                          {PHOTO_BOOTH_PACKAGES.map((pkg) => {
                            const isSelected = selectedPackageName === pkg.name;
                            return (
                              <div
                                key={pkg.name}
                                onClick={() => {
                                  setSelectedPackageName(pkg.name);
                                  setSelectedPackageAddons({});
                                }}
                                style={{
                                  padding: "0.875rem 1.1rem",
                                  borderRadius: "1rem",
                                  border: isSelected ? "2.5px solid #D4AF37" : "1.5px solid var(--border-primary)",
                                  background: isSelected ? "rgba(212,175,55,0.04)" : "var(--card-bg)",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.875rem"
                                }}
                              >
                                <input
                                  type="radio"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  style={{ accentColor: "#D4AF37", width: "16px", height: "16px", pointerEvents: "none", flexShrink: 0 }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                                    <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.8rem", color: "var(--text-primary)" }}>
                                      {pkg.name} Package
                                    </h4>
                                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "0.85rem", color: isSelected ? "#D4AF37" : "var(--text-primary)" }}>
                                      ${pkg.price}
                                    </span>
                                  </div>
                                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.15rem", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {pkg.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Package Customize Section */}
                      {selectedPkg && (
                        <div
                          style={{
                            background: "var(--bg-secondary)",
                            border: "1.5px solid var(--border-primary)",
                            borderRadius: "1rem",
                            padding: "1.25rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.25rem",
                            animation: "fadeIn 0.3s ease"
                          }}
                        >
                          {/* Duration Selector */}
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                              <label style={{ ...labelStyle, marginBottom: 0 }}>Rental Duration</label>
                              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.78rem", color: "#D4AF37" }}>
                                {packageHours} Hours {packageHours > 4 && `(+$${(packageHours - 4) * 65})`}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                              <button
                                type="button"
                                disabled={packageHours <= 4}
                                onClick={() => setPackageHours((h) => Math.max(4, h - 1))}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  border: "1px solid var(--border-primary)",
                                  background: "var(--card-bg)",
                                  color: "var(--text-primary)",
                                  fontWeight: 800,
                                  cursor: packageHours <= 4 ? "not-allowed" : "pointer",
                                  opacity: packageHours <= 4 ? 0.4 : 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontFamily: "monospace"
                                }}
                              >
                                -
                              </button>
                              <input
                                type="range"
                                min="4"
                                max="12"
                                value={packageHours}
                                onChange={(e) => setPackageHours(parseInt(e.target.value, 10))}
                                style={{ flex: 1, accentColor: "#D4AF37" }}
                              />
                              <button
                                type="button"
                                disabled={packageHours >= 12}
                                onClick={() => setPackageHours((h) => Math.min(12, h + 1))}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  border: "1px solid var(--border-primary)",
                                  background: "var(--card-bg)",
                                  color: "var(--text-primary)",
                                  fontWeight: 800,
                                  cursor: packageHours >= 12 ? "not-allowed" : "pointer",
                                  opacity: packageHours >= 12 ? 0.4 : 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontFamily: "monospace"
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Add-ons Checklist */}
                          {selectedPkg.addons.length > 0 && (
                            <div>
                              <label style={labelStyle}>Customize Package Add-Ons</label>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {selectedPkg.addons.map((addon) => {
                                  const isChecked = !!selectedPackageAddons[addon.id];
                                  return (
                                    <div
                                      key={addon.id}
                                      onClick={() => setSelectedPackageAddons((prev) => ({ ...prev, [addon.id]: !prev[addon.id] }))}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "0.6rem 0.875rem",
                                        background: isChecked ? "rgba(212,175,55,0.04)" : "var(--card-bg)",
                                        border: `1.5px solid ${isChecked ? "#D4AF37" : "var(--border-primary)"}`,
                                        borderRadius: "0.75rem",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease"
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => {}}
                                          style={{ accentColor: "#D4AF37", width: "16px", height: "16px", pointerEvents: "none" }}
                                        />
                                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.75rem", color: "var(--text-primary)" }}>
                                          {addon.label}
                                        </span>
                                      </div>
                                      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.75rem", color: isChecked ? "#D4AF37" : "var(--text-secondary)" }}>
                                        +${addon.price}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* INDIVIDUAL ITEMS RENTAL MODE */
                    <>
                      <label style={labelStyle}>Select Rental Equipment Items</label>
                      {errors.selectedItems && (
                        <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: "-0.25rem", marginBottom: "0.5rem", fontFamily: "var(--font-body)" }}>{errors.selectedItems}</p>
                      )}
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
                                flexDirection: "column",
                                gap: "0.5rem",
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
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", width: "100%" }}>
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

                              {/* Concession options panel */}
                              {qty > 0 && !isSoldOut && ["3", "7", "9"].includes(item.id) && (
                                <div style={{ 
                                  marginTop: "0.25rem", 
                                  padding: "0.75rem", 
                                  background: "rgba(0,0,0,0.15)",
                                  border: "1px solid var(--border-secondary)",
                                  borderRadius: "0.5rem",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.625rem",
                                  width: "100%"
                                }}>
                                  <div style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#D4AF37" }}>
                                    Add-on Options
                                  </div>
                                  
                                  {/* Kits Counter */}
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 650 }}>
                                      {item.id === "7" ? "Popcorn Kit" : (item.id === "3" ? "Cotton Candy Kit" : "Snow-cone Kit")} (appx 50 servings) — <strong style={{ color: "#D4AF37" }}>${item.id === "7" ? 18 : 20}</strong>
                                    </span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "var(--card-bg)", border: "1px solid var(--border-primary)", borderRadius: "0.375rem", padding: "0.1rem 0.35rem" }}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const state = getAddonState(item.id);
                                          updateAddonState(item.id, { kits: Math.max(0, state.kits - 1) });
                                        }}
                                        style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 850, fontSize: "0.85rem", color: "var(--text-primary)", padding: "0 0.1rem" }}
                                      >
                                        -
                                      </button>
                                      <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.7rem", fontWeight: 700, minWidth: "12px", textAlign: "center", color: "var(--text-primary)" }}>
                                        {getAddonState(item.id).kits}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const state = getAddonState(item.id);
                                          updateAddonState(item.id, { kits: state.kits + 1 });
                                        }}
                                        style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 850, fontSize: "0.85rem", color: "var(--text-primary)", padding: "0 0.1rem" }}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Stand Checkbox (only Popcorn & Cotton Candy) */}
                                  {item.id !== "9" && (
                                    <div 
                                      onClick={() => {
                                        const state = getAddonState(item.id);
                                        updateAddonState(item.id, { stand: !state.stand });
                                      }}
                                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", cursor: "pointer" }}
                                    >
                                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 650 }}>
                                        Vintage Equipment Stand — <strong style={{ color: "#D4AF37" }}>$25</strong>
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={getAddonState(item.id).stand}
                                        onChange={() => {}}
                                        style={{ accentColor: "#D4AF37", width: "14px", height: "14px", cursor: "pointer" }}
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Extra Hours Counter */}
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 650 }}>
                                      Additional Rental Hours — <strong style={{ color: "#D4AF37" }}>$15/hr</strong>
                                    </span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "var(--card-bg)", border: "1px solid var(--border-primary)", borderRadius: "0.375rem", padding: "0.1rem 0.35rem" }}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const state = getAddonState(item.id);
                                          updateAddonState(item.id, { extraHours: Math.max(0, state.extraHours - 1) });
                                        }}
                                        style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 850, fontSize: "0.85rem", color: "var(--text-primary)", padding: "0 0.1rem" }}
                                      >
                                        -
                                      </button>
                                      <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.7rem", fontWeight: 700, minWidth: "12px", textAlign: "center", color: "var(--text-primary)" }}>
                                        {getAddonState(item.id).extraHours}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const state = getAddonState(item.id);
                                          updateAddonState(item.id, { extraHours: state.extraHours + 1 });
                                        }}
                                        style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 850, fontSize: "0.85rem", color: "var(--text-primary)", padding: "0 0.1rem" }}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
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
                        ...(payInPersonEnabled
                          ? [
                              {
                                id: "Pay in Person",
                                title: "Pay in Person (Cash / Check / Zelle)",
                                desc: "Pay the full total at delivery or setup.",
                                priceText: `$${total.toFixed(2)}`,
                              },
                            ]
                          : []),
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
                        const vals = { eventDate, guestCount, eventLoc, city, customCity, firstName, lastName, email, phone, address, zipCode };
                        const itemsCount = bookingMode === "package" ? 1 : Object.keys(selected).length;
                        const isValid = validateStepFields(step, vals, itemsCount);
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
                      {isSubmitting ? "Submitting…" : <>Reserve <Send size={14} /></>}
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
