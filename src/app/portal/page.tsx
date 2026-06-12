"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, CheckCircle2, Clock, Truck, PackageCheck, FileText, 
  CalendarDays, MapPin, Users, CreditCard, User, LogOut, 
  ShieldAlert, Sparkles, Lock, Check, Landmark, UserPlus
} from "lucide-react";

interface Booking {
  id: string;
  customer: { name: string; email: string; phone: string };
  event: { type: string; date: string; location: string; guestCount: number };
  delivery: { address: string; city: string; zipCode: string };
  items: Record<string, number>;
  itemCount: number;
  estimatedTotal: number;
  paymentMethod: string;
  status?: "pending" | "confirmed" | "cancelled";
  notes?: string;
  submittedAt: string;
  amountPaid?: number;
  paymentStatus?: "unpaid" | "deposit_paid" | "fully_paid";
  payments?: Array<{ id: string; amount: number; method: string; timestamp: string }>;
}

const STATUS_STAGES = [
  { key: "received",   label: "Request Received",  icon: Clock,        color: "#D4AF37" },
  { key: "confirmed",  label: "Booking Confirmed",  icon: CheckCircle2, color: "#10b981" },
  { key: "preparing",  label: "Equipment Prep",     icon: PackageCheck, color: "#3b82f6" },
  { key: "delivered",  label: "Delivered & Setup",  icon: Truck,        color: "#8b5cf6" },
];

export default function CustomerPortal() {
  // --- Portal User State ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"bookings" | "profile">("bookings");

  // --- Auth Form States ---
  const [authMode, setAuthMode] = useState<"login" | "signup" | "guest">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  
  // --- Guest Lookup States ---
  const [guestRefId, setGuestRefId] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestBooking, setGuestBooking] = useState<Booking | null>(null);

  // --- Checkout States ---
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [paymentAmountOption, setPaymentAmountOption] = useState<"deposit" | "full" | "custom">("deposit");
  const [customAmount, setCustomAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // --- UI Notification States ---
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Auto-restore session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("pinstripe_portal_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        loadUserBookings(u.email);
      } catch (e) {
        localStorage.removeItem("pinstripe_portal_user");
      }
    }
  }, []);

  const loadUserBookings = async (userEmail: string) => {
    try {
      const res = await fetch(`/api/portal/lookup?email=${encodeURIComponent(userEmail.toLowerCase())}&t=${Date.now()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        // Sort bookings by date descending
        const sorted = (data.bookings || []).sort(
          (a: Booking, b: Booking) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        setBookings(sorted);
      }
    } catch (err) {
      console.error("Failed to load user bookings:", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        action: authMode,
        email: email.trim(),
        password,
        name: authMode === "signup" ? name : undefined,
        phone: authMode === "signup" ? phone : undefined,
        address: authMode === "signup" ? address : undefined,
        city: authMode === "signup" ? city : undefined,
        zipCode: authMode === "signup" ? zipCode : undefined,
      };

      const res = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("pinstripe_portal_user", JSON.stringify(data.user));
        setCurrentUser(data.user);
        setSuccessMsg(authMode === "signup" ? "Account created successfully!" : "Logged in successfully!");
        loadUserBookings(data.user.email);
      } else {
        setErrorMsg(data.error || "Authentication failed.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pinstripe_portal_user");
    setCurrentUser(null);
    setBookings([]);
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setAddress("");
    setCity("");
    setZipCode("");
    setGuestBooking(null);
    setGuestRefId("");
    setGuestEmail("");
    setAuthMode("login");
  };

  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setGuestBooking(null);

    try {
      const res = await fetch(
        `/api/portal/lookup?ref=${encodeURIComponent(guestRefId.trim())}&email=${encodeURIComponent(guestEmail.trim().toLowerCase())}&t=${Date.now()}`
      );
      const data = await res.json();
      if (res.ok && data.success && data.booking) {
        setGuestBooking(data.booking);
      } else {
        setErrorMsg(data.error || "No booking found with that reference ID & email.");
      }
    } catch {
      setErrorMsg("Network error searching for booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          name,
          phone,
          address,
          city,
          zipCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("pinstripe_portal_user", JSON.stringify(data.user));
        setCurrentUser(data.user);
        setSuccessMsg("Profile updated successfully!");
      } else {
        setErrorMsg(data.error || "Failed to update profile.");
      }
    } catch {
      setErrorMsg("Network error saving profile settings.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBooking) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    let amount = 0;
    const total = payingBooking.estimatedTotal;
    const deposit = total * 0.3;
    const paid = payingBooking.amountPaid || 0;
    const remaining = total - paid;
    const remainingDeposit = Math.max(0, deposit - paid);

    if (paymentAmountOption === "deposit") {
      amount = remainingDeposit > 0 ? remainingDeposit : deposit;
    } else if (paymentAmountOption === "full") {
      amount = remaining;
    } else {
      amount = parseFloat(customAmount) || 0;
    }

    if (amount <= 0 || amount > remaining) {
      setErrorMsg(`Invalid payment amount. You can pay up to the remaining balance of $${remaining.toFixed(2)}.`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/portal/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: payingBooking.id,
          amount,
          paymentMethod: "Credit Card",
          cardDetails: {
            number: cardNumber,
            expiry: cardExpiry,
            cvc: cardCvc,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.booking) {
        setSuccessMsg(`Payment of $${amount.toFixed(2)} processed successfully!`);
        setPayingBooking(null);
        // Clear card details
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
        setCustomAmount("");

        // Refresh bookings
        if (currentUser) {
          loadUserBookings(currentUser.email);
        } else {
          setGuestBooking(data.booking);
        }
      } else {
        setErrorMsg(data.error || "Payment processing failed.");
      }
    } catch {
      setErrorMsg("Payment transaction network error.");
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill profile form fields when user switches to profile tab
  useEffect(() => {
    if (currentUser && activeTab === "profile") {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setAddress(currentUser.address || "");
      setCity(currentUser.city || "");
      setZipCode(currentUser.zipCode || "");
    }
  }, [currentUser, activeTab]);

  // Event status stages index calculator
  const getStatusIndex = (b: Booking) => {
    const status = b.status || "pending";
    if (status === "cancelled") return -1;
    if (status === "pending") return 0;     // Request Received
    if (status === "confirmed") return 1;   // Booking Confirmed
    if (status === "preparing") return 2;   // Equipment Prep
    if (status === "delivered") return 3;   // Delivered & Setup

    // Fallback to date calculations if status is unrecognized
    const eventDate = new Date(b.event.date + "T12:00:00");
    const now = new Date();
    const daysUntil = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntil > 7) return 0;
    if (daysUntil > 3) return 1;
    if (daysUntil > 0) return 2;
    return 3;
  };

  const getPaymentBadgeColor = (b: Booking) => {
    const status = b.paymentStatus || "unpaid";
    if (status === "fully_paid") return { bg: "rgba(16, 185, 129, 0.12)", text: "#10b981", border: "rgba(16, 185, 129, 0.2)" };
    if (status === "deposit_paid") return { bg: "rgba(245, 158, 11, 0.12)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.2)" };
    return { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444", border: "rgba(239, 68, 68, 0.2)" };
  };

  const getBookingBadgeColor = (b: Booking) => {
    if (b.status === "cancelled") return { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444", border: "rgba(239, 68, 68, 0.2)" };
    if (b.status === "confirmed") return { bg: "rgba(16, 185, 129, 0.12)", text: "#10b981", border: "rgba(16, 185, 129, 0.2)" };
    return { bg: "rgba(212, 175, 55, 0.12)", text: "#D4AF37", border: "rgba(212, 175, 55, 0.2)" };
  };

  // --- Inline CSS Styles ---
  const goldLabel: React.CSSProperties = {
    fontSize: "0.68rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#D4AF37",
    marginBottom: "0.35rem",
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "0.625rem",
    background: "#181818",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontSize: "0.88rem",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const btnPrimary: React.CSSProperties = {
    padding: "0.85rem",
    borderRadius: "0.625rem",
    background: "linear-gradient(135deg, #D4AF37, #F3E5AB)",
    border: "none",
    color: "#000000",
    fontWeight: 800,
    fontSize: "0.88rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "transform 0.15s, opacity 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "var(--font-body, -apple-system, sans-serif)", color: "#e5e5e5" }}>
      {/* Premium Header Banner */}
      <header style={{ background: "rgba(17,17,17,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(212,175,55,0.15)", padding: "1.25rem 2rem", sticky: "top", zIndex: 100 } as any}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#D4AF37" }}>Pinstripe Rentals</span>
            </Link>
            <h1 style={{ color: "#ffffff", fontSize: "1.35rem", fontWeight: 900, margin: "0.15rem 0 0", letterSpacing: "-0.02em" }}>Customer Workspace</h1>
          </div>
          <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
            {currentUser && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(255,255,255,0.04)", padding: "0.4rem 0.8rem", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <User size={13} color="#D4AF37" />
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ffffff" }}>{currentUser.name}</span>
                <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", padding: "0.1rem" }} title="Log out">
                  <LogOut size={13} />
                </button>
              </div>
            )}
            <Link href="/" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", textDecoration: "none", fontWeight: 600 }}>← Back to Website</Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1000px", margin: "3rem auto", padding: "0 1.5rem" }}>
        
        {/* Banner Alert messages */}
        {successMsg && (
          <div style={{ padding: "1rem 1.25rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "0.75rem", color: "#10b981", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.5rem" }}>
            <Check size={16} />
            <span style={{ fontWeight: 600 }}>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: "1rem 1.25rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "0.75rem", color: "#ef4444", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.5rem" }}>
            <ShieldAlert size={16} />
            <span style={{ fontWeight: 600 }}>{errorMsg}</span>
          </div>
        )}

        {/* ── NOT LOGGED IN VIEWS ────────────────────────────────────────── */}
        {!currentUser && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2.5rem", alignItems: "start" }} className="responsive-grid-auth">
            
            {/* Account Login / Signup Card */}
            <div style={{ background: "#111111", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}>
              {/* Tab Selector */}
              <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "2rem" }}>
                <button 
                  onClick={() => { setAuthMode("login"); setErrorMsg(""); }}
                  style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "none", borderBottom: authMode === "login" ? "2px solid #D4AF37" : "none", color: authMode === "login" ? "#ffffff" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthMode("signup"); setErrorMsg(""); }}
                  style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "none", borderBottom: authMode === "signup" ? "2px solid #D4AF37" : "none", color: authMode === "signup" ? "#ffffff" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
                >
                  Create Account
                </button>
              </div>

              <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                <h2 style={{ color: "#ffffff", fontSize: "1.25rem", fontWeight: 800, margin: "0 0 0.25rem" }}>
                  {authMode === "login" ? "Welcome Back" : "Portal Registration"}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}>
                  {authMode === "login" ? "Log in to manage quotes, orders, and payments." : "Register to track all event details and invoices."}
                </p>
              </div>

              <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {authMode === "signup" && (
                  <div>
                    <label style={goldLabel}>Your Name</label>
                    <input required type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                  </div>
                )}

                <div>
                  <label style={goldLabel}>Email Address</label>
                  <input required type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                </div>

                <div>
                  <label style={goldLabel}>Password</label>
                  <input required type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
                </div>

                {authMode === "signup" && (
                  <>
                    <div>
                      <label style={goldLabel}>Phone Number</label>
                      <input type="text" placeholder="(757) 555-0199" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={goldLabel}>Delivery Address</label>
                      <input type="text" placeholder="123 Ocean Front" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={goldLabel}>City</label>
                        <input type="text" placeholder="Virginia Beach" value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={goldLabel}>Zip Code</label>
                        <input type="text" placeholder="23451" value={zipCode} onChange={e => setZipCode(e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: "0.5rem" }}>
                  {loading ? "Verifying..." : (authMode === "login" ? <><Lock size={14} /> Sign In</> : <><UserPlus size={14} /> Register</>)}
                </button>
              </form>
            </div>

            {/* Guest Lookup Option */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "1.25rem", padding: "2.5rem" }}>
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ display: "inline-flex", padding: "0.75rem", borderRadius: "50%", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.18)", color: "#D4AF37", marginBottom: "1rem" }}>
                  <Search size={20} />
                </div>
                <h3 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 800, margin: "0 0 0.25rem" }}>Guest Lookup</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>Track a quote request or look up a specific invoice without creating an account.</p>
              </div>

              <form onSubmit={handleGuestLookup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={goldLabel}>Reference Number</label>
                  <input required type="text" placeholder="PSR-XXXXX" value={guestRefId} onChange={e => setGuestRefId(e.target.value.toUpperCase())} style={{ ...inputStyle, fontFamily: "monospace" }} />
                </div>
                <div>
                  <label style={goldLabel}>Email Address</label>
                  <input required type="email" placeholder="customer@example.com" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} style={inputStyle} />
                </div>
                <button type="submit" disabled={loading} style={{ ...btnPrimary, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", marginTop: "0.5rem" }}>
                  {loading ? "Searching..." : <><Search size={14} /> Find Booking</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── GUEST SINGLE BOOKING PREVIEW ────────────────────────────────── */}
        {!currentUser && guestBooking && (
          <div style={{ marginTop: "3rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "2.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>Guest Booking Result</h3>
              <button onClick={() => setGuestBooking(null)} style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer", fontWeight: 700 }}>Clear Result</button>
            </div>
            
            <BookingCard 
              booking={guestBooking} 
              onPayClick={(b) => setPayingBooking(b)} 
              statusIndex={getStatusIndex(guestBooking)} 
              badgeColors={getBookingBadgeColor(guestBooking)}
              payBadge={getPaymentBadgeColor(guestBooking)}
            />
          </div>
        )}

        {/* ── LOGGED IN WORKSPACE ────────────────────────────────────────── */}
        {currentUser && (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2.5rem", alignItems: "start" }} className="responsive-grid-dashboard">
            
            {/* Sidebar Navigation */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button 
                onClick={() => { setActiveTab("bookings"); setPayingBooking(null); }}
                style={{
                  width: "100%", padding: "0.8rem 1.25rem", borderRadius: "0.625rem",
                  background: activeTab === "bookings" ? "rgba(212,175,55,0.08)" : "transparent",
                  border: activeTab === "bookings" ? "1px solid rgba(212,175,55,0.2)" : "1px solid transparent",
                  color: activeTab === "bookings" ? "#ffffff" : "rgba(255,255,255,0.45)",
                  fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: "0.75rem"
                }}
              >
                <CalendarDays size={15} color={activeTab === "bookings" ? "#D4AF37" : "rgba(255,255,255,0.45)"} />
                My Bookings & Quotes
              </button>
              <button 
                onClick={() => { setActiveTab("profile"); setPayingBooking(null); }}
                style={{
                  width: "100%", padding: "0.8rem 1.25rem", borderRadius: "0.625rem",
                  background: activeTab === "profile" ? "rgba(212,175,55,0.08)" : "transparent",
                  border: activeTab === "profile" ? "1px solid rgba(212,175,55,0.2)" : "1px solid transparent",
                  color: activeTab === "profile" ? "#ffffff" : "rgba(255,255,255,0.45)",
                  fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: "0.75rem"
                }}
              >
                <User size={15} color={activeTab === "profile" ? "#D4AF37" : "rgba(255,255,255,0.45)"} />
                Profile & Settings
              </button>

              <div style={{ marginTop: "2rem", padding: "1.25rem", borderRadius: "0.75rem", background: "rgba(212,175,55,0.02)", border: "1px solid rgba(212,175,55,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#D4AF37", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                  <Sparkles size={12} />
                  Booking Notice
                </div>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                  Need to change your booking date? We offer free date shifts and weather protection! Contact us for details.
                </p>
              </div>
            </div>

            {/* Workspace Content Panels */}
            <div style={{ minWidth: 0 }}>
              
              {/* BOOKINGS TAB */}
              {activeTab === "bookings" && !payingBooking && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem" }}>
                    <h2 style={{ color: "#ffffff", fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>My Booking Dashboard</h2>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>Track status, process payments, and view invoices.</p>
                  </div>

                  {bookings.length === 0 ? (
                    <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "1rem", background: "rgba(255,255,255,0.01)" }}>
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9rem" }}>You don't have any bookings registered with this email yet.</p>
                      <Link href="/" style={{ display: "inline-block", padding: "0.5rem 1.25rem", background: "#D4AF37", color: "#000", border: "none", borderRadius: "0.5rem", textDecoration: "none", fontSize: "0.78rem", fontWeight: 700, marginTop: "1rem" }}>
                        Browse Rentals
                      </Link>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        onPayClick={(b) => setPayingBooking(b)} 
                        statusIndex={getStatusIndex(booking)}
                        badgeColors={getBookingBadgeColor(booking)}
                        payBadge={getPaymentBadgeColor(booking)}
                      />
                    ))
                  )}
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1.25rem", padding: "2.5rem" }}>
                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                    <h2 style={{ color: "#ffffff", fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>Profile & Delivery Settings</h2>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>Update your contact information and default event delivery address.</p>
                  </div>

                  <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={goldLabel}>Name</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={goldLabel}>Phone Number</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                      </div>
                    </div>

                    <div>
                      <label style={goldLabel}>Delivery Street Address</label>
                      <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={goldLabel}>City</label>
                        <input type="text" value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={goldLabel}>Zip Code</label>
                        <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} style={inputStyle} />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: "1rem" }}>
                      {loading ? "Saving..." : "Save Profile Details"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PAYMENT GATEWAY INTERFACE (MODAL STYLE OVERLAY) ────────────────── */}
        {payingBooking && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1.5rem" }}>
            <div style={{ background: "#121212", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "1.25rem", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
              {/* Header */}
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#D4AF37", letterSpacing: "0.1em", textTransform: "uppercase" }}>Booking Payment</span>
                  <h3 style={{ margin: "0.15rem 0 0", color: "#ffffff", fontSize: "1.1rem", fontWeight: 800 }}>Invoice {payingBooking.id}</h3>
                </div>
                <button onClick={() => setPayingBooking(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", cursor: "pointer", fontWeight: 700 }}>Cancel</button>
              </div>

              <div style={{ padding: "1.75rem" }}>
                {/* Cost breakdown */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>
                    <span>Estimated Total</span>
                    <span style={{ color: "#ffffff", fontWeight: 600 }}>${payingBooking.estimatedTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>
                    <span>Amount Paid</span>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>-${(payingBooking.amountPaid || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "0.75rem", fontSize: "1rem", fontWeight: 900, color: "#D4AF37" }}>
                    <span>Remaining Balance</span>
                    <span>${(payingBooking.estimatedTotal - (payingBooking.amountPaid || 0)).toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {/* Select amount */}
                  <div>
                    <label style={goldLabel}>Select Payment Amount</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                      <button 
                        type="button" 
                        onClick={() => setPaymentAmountOption("deposit")}
                        style={{
                          padding: "0.6rem 0.35rem", borderRadius: "0.5rem", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                          background: paymentAmountOption === "deposit" ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
                          border: paymentAmountOption === "deposit" ? "1px solid #D4AF37" : "1px solid rgba(255,255,255,0.06)",
                          color: paymentAmountOption === "deposit" ? "#ffffff" : "rgba(255,255,255,0.5)"
                        }}
                      >
                        30% Deposit Due<br />
                        ${(payingBooking.estimatedTotal * 0.3 - (payingBooking.amountPaid || 0) > 0 
                          ? payingBooking.estimatedTotal * 0.3 - (payingBooking.amountPaid || 0) 
                          : payingBooking.estimatedTotal * 0.3
                        ).toFixed(2)}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setPaymentAmountOption("full")}
                        style={{
                          padding: "0.6rem 0.35rem", borderRadius: "0.5rem", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                          background: paymentAmountOption === "full" ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
                          border: paymentAmountOption === "full" ? "1px solid #D4AF37" : "1px solid rgba(255,255,255,0.06)",
                          color: paymentAmountOption === "full" ? "#ffffff" : "rgba(255,255,255,0.5)"
                        }}
                      >
                        Full Balance<br />
                        ${(payingBooking.estimatedTotal - (payingBooking.amountPaid || 0)).toFixed(2)}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setPaymentAmountOption("custom")}
                        style={{
                          padding: "0.6rem 0.35rem", borderRadius: "0.5rem", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                          background: paymentAmountOption === "custom" ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
                          border: paymentAmountOption === "custom" ? "1px solid #D4AF37" : "1px solid rgba(255,255,255,0.06)",
                          color: paymentAmountOption === "custom" ? "#ffffff" : "rgba(255,255,255,0.5)"
                        }}
                      >
                        Custom Amount<br />
                        &nbsp;
                      </button>
                    </div>
                  </div>

                  {paymentAmountOption === "custom" && (
                    <div>
                      <label style={goldLabel}>Custom Payment Amount ($)</label>
                      <input 
                        required 
                        type="number" 
                        step="0.01"
                        min="1"
                        placeholder="50.00" 
                        value={customAmount} 
                        onChange={e => setCustomAmount(e.target.value)} 
                        style={inputStyle} 
                      />
                    </div>
                  )}

                  {/* Card Info */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem", color: "#ffffff" }}>
                      <CreditCard size={15} color="#D4AF37" />
                      <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment Details</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div>
                        <label style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.25rem", display: "block" }}>Card Number</label>
                        <input 
                          required 
                          type="text" 
                          placeholder="4111 2222 3333 4444" 
                          value={cardNumber} 
                          onChange={e => setCardNumber(e.target.value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim())}
                          maxLength={19}
                          style={inputStyle} 
                        />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.25rem", display: "block" }}>Expiration Date</label>
                          <input 
                            required 
                            type="text" 
                            placeholder="MM/YY" 
                            value={cardExpiry} 
                            onChange={e => setCardExpiry(e.target.value)} 
                            maxLength={5}
                            style={inputStyle} 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.25rem", display: "block" }}>Security Code (CVC)</label>
                          <input 
                            required 
                            type="password" 
                            placeholder="123" 
                            value={cardCvc} 
                            onChange={e => setCardCvc(e.target.value)} 
                            maxLength={4}
                            style={inputStyle} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: "1rem" }}>
                    {loading ? "Authorizing Card..." : <><CheckCircle2 size={15} /> Authorize Transaction</>}
                  </button>
                  <p style={{ margin: 0, fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
                    <Landmark size={11} /> 
                    Payments are securely simulated using commercial Sandbox encryption.
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── CUSTOMER DASHBOARD CARD COMPONENT ───────────────────────────────────────
interface BookingCardProps {
  booking: Booking;
  statusIndex: number;
  badgeColors: { bg: string; text: string; border: string };
  payBadge: { bg: string; text: string; border: string };
  onPayClick: (b: Booking) => void;
}

function BookingCard({ booking, statusIndex, badgeColors, payBadge, onPayClick }: BookingCardProps) {
  const deposit = booking.estimatedTotal * 0.3;
  const paid = booking.amountPaid || 0;
  const remaining = booking.estimatedTotal - paid;
  
  // Custom format date string
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const badgeStyle = (colors: any): React.CSSProperties => ({
    padding: "0.2rem 0.6rem",
    borderRadius: "9999px",
    fontSize: "0.65rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    background: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    display: "inline-flex",
    alignItems: "center"
  });

  return (
    <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1.25rem", padding: "2rem", marginBottom: "1.5rem" }}>
      
      {/* Top Details Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Booking Reference</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.15rem" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 900, fontFamily: "monospace", color: "#ffffff" }}>{booking.id}</span>
            <span style={badgeStyle(badgeColors)}>{booking.status || "pending"}</span>
            <span style={badgeStyle(payBadge)}>{booking.paymentStatus === "fully_paid" ? "Paid" : booking.paymentStatus === "deposit_paid" ? "Deposit Paid" : "Unpaid"}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.625rem" }}>
          <Link 
            href={`/portal/invoice?id=${booking.id}&email=${encodeURIComponent(booking.customer.email)}`} 
            target="_blank"
            style={{ 
              padding: "0.45rem 1rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", 
              background: "transparent", color: "#ffffff", fontSize: "0.78rem", textDecoration: "none", 
              fontWeight: 700, display: "flex", alignItems: "center", gap: "0.35rem" 
            }}
          >
            <FileText size={13} /> View Invoice
          </Link>
          {remaining > 0 && booking.status !== "cancelled" && (
            <button 
              onClick={() => onPayClick(booking)}
              style={{ 
                padding: "0.45rem 1rem", border: "none", borderRadius: "0.5rem", 
                background: "#D4AF37", color: "#000000", fontSize: "0.78rem", 
                fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" 
              }}
            >
              <CreditCard size={13} /> Make Payment
            </button>
          )}
        </div>
      </div>

      {/* Progress Tracker (Only show if not cancelled) */}
      {booking.status !== "cancelled" && (
        <div style={{ padding: "0.5rem 1rem 1.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "1.5rem" }}>
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(${STATUS_STAGES.length}, 1fr)`, gap: 0 }}>
            {/* Background line */}
            <div style={{ position: "absolute", top: "16px", left: "12%", right: "12%", height: "2px", background: "rgba(255,255,255,0.06)", zIndex: 0 }} />
            {/* Active colored line */}
            <div style={{ position: "absolute", top: "16px", left: "12%", width: `${(statusIndex / (STATUS_STAGES.length - 1)) * 76}%`, height: "2px", background: "#D4AF37", zIndex: 1, transition: "width 0.4s ease" }} />

            {STATUS_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = idx <= statusIndex;
              return (
                <div key={stage.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", position: "relative", zIndex: 2 }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isActive ? stage.color : "#1a1a1a", border: `2px solid ${isActive ? stage.color : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                    <Icon size={14} color={isActive ? "#000000" : "rgba(255,255,255,0.25)"} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: "0.62rem", fontWeight: isActive ? 700 : 400, color: isActive ? "#ffffff" : "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.2 }}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid details */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
        
        {/* Event Details */}
        <div>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>Event Details</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.82rem", alignItems: "center" }}>
              <CalendarDays size={13} color="rgba(255,255,255,0.35)" />
              <strong style={{ color: "#ffffff" }}>{formatDate(booking.event.date)}</strong>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.82rem", alignItems: "center" }}>
              <Users size={13} color="rgba(255,255,255,0.35)" />
              <span>{booking.event.type} ({booking.event.guestCount} guests)</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.82rem", alignItems: "flex-start" }}>
              <MapPin size={13} color="rgba(255,255,255,0.35)" style={{ marginTop: "3px" }} />
              <span style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.3 }}>
                {booking.delivery.address}, {booking.delivery.city}, VA
              </span>
            </div>
          </div>
        </div>

        {/* Items Summary */}
        <div>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>Rental Items ({booking.itemCount})</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", maxHeight: "100px", overflowY: "auto", paddingRight: "0.5rem" }}>
            {Object.entries(booking.items).map(([itemId, qty]) => (
              <div key={itemId} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "rgba(255,255,255,0.65)" }}>
                <span>Item ID #{itemId}</span>
                <span style={{ color: "#ffffff", fontWeight: 700 }}>× {qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Totals */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: "1.5rem" }} className="card-totals">
          <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>Estimated Total</span>
          <span style={{ fontSize: "1.5rem", color: "#D4AF37", fontWeight: 900, margin: "0.15rem 0" }}>${booking.estimatedTotal.toFixed(2)}</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.15rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
            <span>Deposit (30%): ${deposit.toFixed(2)}</span>
            <span>Paid: <strong style={{ color: paid > 0 ? "#10b981" : "inherit" }}>${paid.toFixed(2)}</strong></span>
            {remaining > 0 && <span>Remaining Balance: ${remaining.toFixed(2)}</span>}
          </div>
        </div>

      </div>

      {booking.notes && (
        <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", borderLeft: "2px solid #D4AF37", background: "rgba(212,175,55,0.03)", borderRadius: "0 0.5rem 0.5rem 0", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
          <strong>Special Requests:</strong> {booking.notes}
        </div>
      )}
    </div>
  );
}
