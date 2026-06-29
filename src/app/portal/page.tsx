"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StripePaymentForm from "@/components/StripePaymentForm";
import { 
  Search, CheckCircle2, Clock, Truck, PackageCheck, FileText, 
  CalendarDays, MapPin, Users, CreditCard, User, LogOut, 
  ShieldAlert, Sparkles, Lock, Check, Landmark, UserPlus,
  Mail, Image as ImageIcon, X, Download
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
  const [inventory, setInventory] = useState<any[]>([]);

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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amountToPay, setAmountToPay] = useState<number>(0);

  // --- UI Notification States ---
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // --- Chat States ---
  const [activeChatBookingId, setActiveChatBookingId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatMediaUrl, setChatMediaUrl] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // --- Stripe Success Redirect States ---
  const [stripeBooking, setStripeBooking] = useState<Booking | null>(null);
  const [stripeSuccess, setStripeSuccess] = useState(false);
  const [stripeSessionId, setStripeSessionId] = useState("");
  const [stripePassword, setStripePassword] = useState("");
  const [stripeSignupLoading, setStripeSignupLoading] = useState(false);

  // Parse Stripe Success params on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const bookingId = params.get("bookingId");
      const sessionId = params.get("session_id");
      const success = params.get("success");

      if (bookingId && sessionId && success === "true") {
        setStripeSuccess(true);
        setStripeSessionId(sessionId);
        setLoading(true);
        setErrorMsg("");

        fetch(`/api/portal/lookup?id=${encodeURIComponent(bookingId)}&session_id=${encodeURIComponent(sessionId)}&t=${Date.now()}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.booking) {
              setStripeBooking(data.booking);
            } else {
              setErrorMsg(data.error || "Failed to load booking details.");
            }
          })
          .catch((err) => {
            console.error("Error loading stripe booking:", err);
            setErrorMsg("Network error loading booking details.");
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, []);

  // Parse Payment Element Success redirect params on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const bookingId = params.get("bookingId");
      const paymentSuccess = params.get("payment_success");
      const paymentAmount = params.get("payment_amount");

      if (bookingId && paymentSuccess === "true") {
        setSuccessMsg(`Payment of $${parseFloat(paymentAmount || "0").toFixed(2)} processed successfully!`);
        // Clean up URL query parameters so refreshing doesn't show the success message again
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleStripeRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeBooking || !stripePassword) return;
    setStripeSignupLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        action: "signup",
        email: stripeBooking.customer?.email,
        password: stripePassword,
        name: stripeBooking.customer?.name,
        phone: stripeBooking.customer?.phone,
        address: stripeBooking.delivery?.address || "",
        city: stripeBooking.delivery?.city || "",
        zipCode: stripeBooking.delivery?.zipCode || "",
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
        setSuccessMsg("Account created and saved successfully!");
        setStripeSuccess(false); // transition to dashboard
        loadUserBookings(data.user.email);
      } else {
        setErrorMsg(data.error || "Failed to create account.");
      }
    } catch (err) {
      setErrorMsg("Network error creating account.");
    } finally {
      setStripeSignupLoading(false);
    }
  };

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

  // Fetch inventory on mount to resolve rental item names
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(`/api/inventory?t=${Date.now()}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setInventory(data.items || []);
        }
      } catch (err) {
        console.error("Failed to load inventory:", err);
      }
    };
    fetchInventory();
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
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.simulated) {
          // Simulation fallback mode
          setSuccessMsg(`Simulated payment of $${amount.toFixed(2)} processed successfully!`);
          setPayingBooking(null);
          setCustomAmount("");
          if (currentUser) {
            loadUserBookings(currentUser.email);
          } else {
            setGuestBooking(data.booking);
          }
        } else if (data.clientSecret) {
          // Store Stripe elements payment intent secret
          setClientSecret(data.clientSecret);
          setAmountToPay(amount);
        } else {
          setErrorMsg("Could not initiate secure checkout session.");
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

  const getChatEmail = () => {
    if (currentUser && currentUser.email) {
      return currentUser.email;
    }
    if (guestBooking && guestBooking.customer && guestBooking.customer.email) {
      return guestBooking.customer.email;
    }
    return guestEmail;
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain1.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.15);

      setTimeout(() => {
        try {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // C6
          gain2.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.25);
        } catch (e) {
          console.error("Web Audio osc2 error:", e);
        }
      }, 80);
    } catch (e) {
      console.error("Web Audio chime error:", e);
    }
  };

  useEffect(() => {
    if (!activeChatBookingId) {
      setChatMessages([]);
      return;
    }

    const email = getChatEmail();
    if (!email) return;

    let isFirstLoad = true;

    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/chat?bookingId=${activeChatBookingId}&email=${encodeURIComponent(email)}&t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            const newMsgs = data.messages || [];
            
            setChatMessages(prev => {
              if (prev.length > 0 && newMsgs.length > prev.length) {
                const lastNewMsg = newMsgs[newMsgs.length - 1];
                const hasNewAdminMsg = lastNewMsg.senderRole === "admin" && 
                  !prev.some((m: any) => m.id === lastNewMsg.id);
                if (hasNewAdminMsg) {
                  playChime();
                }
              }
              return newMsgs;
            });

            if (isFirstLoad) {
              isFirstLoad = false;
              setTimeout(() => {
                const feed = document.getElementById("customer-chat-feed");
                if (feed) feed.scrollTop = feed.scrollHeight;
              }, 150);
            } else {
              setTimeout(() => {
                const feed = document.getElementById("customer-chat-feed");
                if (feed) feed.scrollTop = feed.scrollHeight;
              }, 100);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching customer chat:", err);
      }
    };

    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [activeChatBookingId, currentUser, guestBooking, guestEmail]);

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
        {!currentUser && stripeSuccess && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.1fr", gap: "2.5rem", alignItems: "start", background: "#111111", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", marginBottom: "3rem" }} className="responsive-grid-auth">
            
            {/* Left Column: Success Message & Booking details */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", padding: "0.5rem", borderRadius: "50%", background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h2 style={{ color: "#ffffff", fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>Payment Successful!</h2>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", margin: "0.15rem 0 0" }}>Your transaction has been processed securely.</p>
                </div>
              </div>

              {stripeBooking ? (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "0.875rem", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>Booking Ref:</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ffffff", fontFamily: "monospace" }}>{stripeBooking.id}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>Customer Name:</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#ffffff" }}>{stripeBooking.customer?.name}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>Event Date:</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#ffffff" }}>{stripeBooking.event?.date}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>Amount Paid:</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#10b981" }}>${(stripeBooking.amountPaid || 0).toFixed(2)}</span>
                  </div>
                  {stripeBooking.paymentStatus && (
                    <div style={{ marginTop: "0.75rem", display: "inline-flex", padding: "0.25rem 0.625rem", borderRadius: "0.25rem", background: stripeBooking.paymentStatus === "fully_paid" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: stripeBooking.paymentStatus === "fully_paid" ? "#10b981" : "#f59e0b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {stripeBooking.paymentStatus.replace("_", " ")}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Loading details for booking reference...</p>
              )}
              
              <button 
                onClick={() => setStripeSuccess(false)}
                style={{ background: "transparent", border: "none", color: "#D4AF37", fontSize: "0.75rem", cursor: "pointer", fontWeight: 700, marginTop: "1.25rem", padding: 0 }}
              >
                ← Back to Login / Search
              </button>
            </div>

            {/* Right Column: Save Account Registration Form */}
            <div style={{ background: "rgba(212,175,55,0.02)", border: "1px dashed rgba(212,175,55,0.2)", borderRadius: "1rem", padding: "2rem" }}>
              <h3 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 800, margin: "0 0 0.5rem" }}>Save Your Account</h3>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem", margin: "0 0 1.25rem" }}>
                Enter a password to securely claim this booking and track your order updates in real-time.
              </p>

              <form onSubmit={handleStripeRegister} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={goldLabel}>Email Address</label>
                  <input disabled type="email" value={stripeBooking?.customer?.email || ""} style={{ ...inputStyle, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.05)", cursor: "not-allowed" }} />
                </div>
                <div>
                  <label style={goldLabel}>Set Password</label>
                  <input required type="password" placeholder="••••••••" value={stripePassword} onChange={e => setStripePassword(e.target.value)} style={inputStyle} />
                </div>
                <button type="submit" disabled={stripeSignupLoading || !stripeBooking} style={{ ...btnPrimary, marginTop: "0.5rem" }}>
                  {stripeSignupLoading ? "Creating..." : <><UserPlus size={14} /> Save & Create Account</>}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ── NOT LOGGED IN VIEWS ────────────────────────────────────────── */}
        {!currentUser && !stripeSuccess && (
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
              onChatClick={(b) => setActiveChatBookingId(b.id)}
              statusIndex={getStatusIndex(guestBooking)} 
              badgeColors={getBookingBadgeColor(guestBooking)}
              payBadge={getPaymentBadgeColor(guestBooking)}
              inventory={inventory}
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
                        onChatClick={(b) => setActiveChatBookingId(b.id)}
                        statusIndex={getStatusIndex(booking)}
                        badgeColors={getBookingBadgeColor(booking)}
                        payBadge={getPaymentBadgeColor(booking)}
                        inventory={inventory}
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

        {/* ── CHAT DRAWER ─────────────────────────────────────────────────── */}
        {activeChatBookingId && (() => {
          const currentBooking = bookings.find(b => b.id === activeChatBookingId) || 
            (guestBooking?.id === activeChatBookingId ? guestBooking : null);
          if (!currentBooking) return null;

          const handleSendMessage = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!chatInput.trim() && !chatMediaUrl) return;

            const textToSend = chatInput;
            const mediaToSend = chatMediaUrl;
            setChatInput("");
            setChatMediaUrl("");

            try {
              const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bookingId: activeChatBookingId,
                  text: textToSend,
                  mediaUrl: mediaToSend,
                  email: getChatEmail(),
                }),
              });
              const data = await res.json();
              if (res.ok && data.success && data.message) {
                setChatMessages(prev => [...prev, data.message]);
                setTimeout(() => {
                  const feed = document.getElementById("customer-chat-feed");
                  if (feed) feed.scrollTop = feed.scrollHeight;
                }, 100);
              }
            } catch (err) {
              console.error("Error sending message:", err);
            }
          };

          const handleAttachImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.currentTarget.files?.[0];
            if (!file) return;
            setUploadingMedia(true);
            const fd = new FormData();
            fd.append("file", file);
            fd.append("bookingId", activeChatBookingId);
            fd.append("email", getChatEmail());

            try {
              const res = await fetch("/api/chat/upload", {
                method: "POST",
                body: fd,
              });
              const data = await res.json();
              if (res.ok && data.success && data.mediaUrl) {
                setChatMediaUrl(data.mediaUrl);
              }
            } catch (err) {
              console.error("Error uploading chat file:", err);
            } finally {
              setUploadingMedia(false);
            }
          };

          return (
            <div style={{
              position: "fixed",
              top: 0, right: 0, bottom: 0,
              width: "100%", maxWidth: "420px",
              background: "rgba(17, 17, 17, 0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderLeft: "1px solid rgba(212,175,55,0.25)",
              boxShadow: "-10px 0 40px rgba(0,0,0,0.6)",
              zIndex: 150,
              display: "flex",
              flexDirection: "column",
              animation: "slideInCustomerChat 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}>
              <style>{`
                @keyframes slideInCustomerChat {
                  from { transform: translateX(100%); }
                  to { transform: translateX(0); }
                }
              `}</style>
              
              {/* Header */}
              <div style={{
                background: "linear-gradient(135deg, #161616 0%, #111111 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "1.25rem 1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                      Pinstripe Representative
                    </h3>
                  </div>
                  <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", margin: "0.15rem 0 0" }}>
                    Booking Ref: <strong style={{ color: "#D4AF37" }}>{activeChatBookingId}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setActiveChatBookingId(null)}
                  style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", padding: "0.25rem" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick Context Bar */}
              <div style={{
                background: "rgba(212,175,55,0.05)",
                borderBottom: "1px solid rgba(212,175,55,0.1)",
                padding: "0.625rem 1.25rem",
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.6)",
                display: "flex",
                justifyContent: "space-between",
              }}>
                <span>📅 {currentBooking.event.date}</span>
                <span style={{ color: "#D4AF37", fontWeight: 700 }}>💵 ${currentBooking.estimatedTotal.toFixed(2)}</span>
              </div>

              {/* Messages Feed */}
              <div
                id="customer-chat-feed"
                style={{
                  flex: 1,
                  padding: "1.5rem",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  background: "#0a0a0a",
                }}
              >
                {chatMessages.length === 0 ? (
                  <div style={{ margin: "auto", textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.3)" }}>
                    <p style={{ fontSize: "0.85rem", margin: 0 }}>No messages yet.</p>
                    <p style={{ fontSize: "0.72rem", margin: "0.25rem 0 0" }}>Send a message or upload a yard photo to start communicating with our reps!</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isIncoming = msg.senderRole === "admin";
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isIncoming ? "flex-start" : "flex-end",
                          maxWidth: "80%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isIncoming ? "flex-start" : "flex-end",
                        }}
                      >
                        <div style={{
                          background: isIncoming ? "#161616" : "rgba(212,175,55,0.15)",
                          border: `1px solid ${isIncoming ? "rgba(255,255,255,0.05)" : "rgba(212,175,55,0.25)"}`,
                          borderRadius: isIncoming ? "1rem 1rem 1rem 0" : "1rem 1rem 0 1rem",
                          padding: "0.75rem 1rem",
                          color: "#ffffff",
                          fontSize: "0.85rem",
                          lineHeight: 1.4,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}>
                          {msg.mediaUrl && (
                            <div style={{ marginBottom: "0.5rem", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", position: "relative" }}>
                              <img src={msg.mediaUrl} alt="Chat attachment" style={{ maxWidth: "100%", maxHeight: "180px", display: "block" }} />
                              <a 
                                href={msg.mediaUrl} 
                                download={msg.mediaUrl.split('/').pop() || "download"} 
                                style={{ 
                                  position: "absolute", bottom: "6px", right: "6px", 
                                  background: "rgba(10,10,10,0.75)", backdropFilter: "blur(4px)", 
                                  WebkitBackdropFilter: "blur(4px)", color: "#ffffff", 
                                  padding: "4px 8px", borderRadius: "4px", fontSize: "0.68rem", 
                                  textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", 
                                  fontWeight: 700, border: "1px solid rgba(255,255,255,0.15)",
                                  transition: "background 0.2s"
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(10,10,10,0.95)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(10,10,10,0.75)"; }}
                              >
                                <Download size={11} strokeWidth={2.5} />
                                <span>Download</span>
                              </a>
                            </div>
                          )}
                          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.25rem" }}>
                          <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.3)" }}>
                            {new Date(msg.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {!isIncoming && (
                            <span style={{ fontSize: "0.62rem", color: msg.status === "read" ? "#10b981" : "rgba(255,255,255,0.3)" }} title={msg.status}>
                              {msg.status === "read" ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Footer */}
              <div style={{
                background: "#111111",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "1rem 1.25rem",
              }}>
                {chatMediaUrl && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.5rem", padding: "0.5rem", marginBottom: "0.75rem" }}>
                    <img src={chatMediaUrl} alt="Preview" style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "0.25rem" }} />
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Image Attached</span>
                    <button onClick={() => setChatMediaUrl("")} style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer" }}><X size={14} /></button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <label style={{ display: "flex", padding: "0.5rem", borderRadius: "0.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
                    <ImageIcon size={16} />
                    <input type="file" accept="image/*" onChange={handleAttachImage} style={{ display: "none" }} />
                  </label>

                  <input
                    type="text"
                    placeholder={uploadingMedia ? "Uploading image..." : "Type a message..."}
                    disabled={uploadingMedia}
                    value={chatInput}
                    onChange={e => setChatInput(e.currentTarget.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#D4AF37"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  />

                  <button
                    type="submit"
                    disabled={(!chatInput.trim() && !chatMediaUrl) || uploadingMedia}
                    style={{
                      padding: "0.55rem 1rem",
                      borderRadius: "0.5rem",
                      background: (!chatInput.trim() && !chatMediaUrl) ? "rgba(255,255,255,0.06)" : "#D4AF37",
                      color: (!chatInput.trim() && !chatMediaUrl) ? "rgba(255,255,255,0.2)" : "#000000",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          );
        })()}

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

                {clientSecret ? (
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    amount={amountToPay}
                    bookingId={payingBooking.id}
                    onSuccess={() => {
                      setSuccessMsg(`Payment of $${amountToPay.toFixed(2)} processed successfully!`);
                      setPayingBooking(null);
                      setClientSecret(null);
                      setCustomAmount("");
                      if (currentUser) {
                        loadUserBookings(currentUser.email);
                      } else {
                        // Refresh guest booking
                        fetch(`/api/portal/lookup?id=${encodeURIComponent(payingBooking.id)}&t=${Date.now()}`)
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.success && data.booking) {
                              setGuestBooking(data.booking);
                            }
                          });
                      }
                    }}
                    onCancel={() => {
                      setClientSecret(null);
                    }}
                  />
                ) : (
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

                    <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: "1rem" }}>
                      {loading ? "Preparing Secure Payment..." : <><CreditCard size={15} /> Continue to Secure Payment</>}
                    </button>
                    <p style={{ margin: 0, fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
                      <Landmark size={11} /> 
                      Payments are securely processed via Stripe encrypted gateway.
                    </p>
                  </form>
                )}
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
  onChatClick: (b: Booking) => void;
  inventory: any[];
}

function BookingCard({ booking, statusIndex, badgeColors, payBadge, onPayClick, onChatClick, inventory }: BookingCardProps) {
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
          <button 
            onClick={() => onChatClick(booking)}
            style={{ 
              padding: "0.45rem 1rem", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "0.5rem", 
              background: "rgba(212,175,55,0.06)", color: "#D4AF37", fontSize: "0.78rem", 
              fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem",
              transition: "all 0.2s"
            }}
          >
            <Mail size={13} /> Chat
          </button>
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
            {Object.entries(booking.items).map(([itemId, qty]) => {
              const item = inventory.find((i) => i.id === itemId);
              const title = item ? item.title : `Item ID #${itemId}`;
              return (
                <div key={itemId} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "rgba(255,255,255,0.65)" }}>
                  <span>{title}</span>
                  <span style={{ color: "#ffffff", fontWeight: 700 }}>× {qty}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Totals */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: "1.5rem" }} className="card-totals">
          <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>Estimated Total</span>
          <span style={{ fontSize: "1.5rem", color: "#D4AF37", fontWeight: 900, margin: "0.15rem 0" }}>${booking.estimatedTotal.toFixed(2)}</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.15rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
            <span>Deposit (30%): ${deposit.toFixed(2)}</span>
            <span>Paid: <strong style={{ color: paid > 0 ? "#10b981" : "inherit" }}>${paid.toFixed(2)}</strong></span>
            {remaining > 0 ? (
              <span>Remaining Balance: ${remaining.toFixed(2)}</span>
            ) : (
              <span style={{ color: "#10b981", fontWeight: 800, fontSize: "0.8rem", marginTop: "0.15rem" }}>✓ Paid in Full</span>
            )}
          </div>
        </div>

      </div>

      {/* Transaction Ledger / Receipts */}
      {booking.payments && booking.payments.length > 0 && (
        <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
            💳 Payment History & Receipts
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {booking.payments.map((p, idx) => (
              <div key={p.id || idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", background: "rgba(255,255,255,0.02)", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>{p.method} Payment</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", marginLeft: "0.5rem" }}>
                    ({new Date(p.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })})
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontFamily: "monospace" }}>ID: {p.id.length > 12 ? p.id.substring(0, 10) + "..." : p.id}</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>+${p.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {booking.notes && (
        <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", borderLeft: "2px solid #D4AF37", background: "rgba(212,175,55,0.03)", borderRadius: "0 0.5rem 0.5rem 0", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
          <strong>Special Requests:</strong> {booking.notes}
        </div>
      )}
    </div>
  );
}
