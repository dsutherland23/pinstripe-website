"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, Calendar, Clock, Sparkles, Tag, ArrowRight, ShieldCheck, Mail, CheckCircle, Search, Info
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteBuilder from "@/components/QuoteBuilder";
import AboutContactModal from "@/components/AboutContactModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import Reveal from "@/components/Reveal";
import { RadialGlowCard } from "@/components/CursorReactive";

interface SpecialItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  originalPrice: number;
  specialPrice: number;
  promoCode?: string;
  itemId?: string;
  endDate?: string;
  badge?: string;
  enabled: boolean;
  featured: boolean;
  order: number;
}

const FALLBACK_IMAGE = "/images/placeholder.png";

export default function SpecialsPage() {
  const [specials, setSpecials] = useState<SpecialItem[]>([]);
  const [specialsEnabled, setSpecialsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);

  // Quote Builder states
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string; title: string; price: number } | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);

  // Modal states
  const [aboutContactOpen, setAboutContactOpen] = useState(false);
  const [aboutContactTab, setAboutContactTab] = useState<"about" | "contact">("about");

  // Email notification sign up state
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    const loadSpecials = async () => {
      try {
        const res = await fetch(`/api/specials?t=${Date.now()}`);
        const data = await res.json();
        if (data.success) {
          setSpecialsEnabled(data.enabled !== false);
          setSpecials(data.items || []);
        }
      } catch (err) {
        console.error("Failed to load specials:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSpecials();
    return () => clearInterval(interval);
  }, []);

  const handleOpenAbout = () => {
    setAboutContactTab("about");
    setAboutContactOpen(true);
  };

  const handleOpenContact = () => {
    setAboutContactTab("contact");
    setAboutContactOpen(true);
  };

  const handleClaimOffer = (special: SpecialItem) => {
    if (special.itemId) {
      setSelectedItem({
        id: special.itemId,
        title: special.title,
        price: special.specialPrice,
      });
    } else {
      setSelectedItem(null);
    }
    setPromoCode(special.promoCode || null);
    setQuoteOpen(true);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput("");
    }
  };

  // Helper to format remaining time
  const getRemainingTime = (endDateStr?: string) => {
    if (!endDateStr || !now) return null;
    const total = Date.parse(endDateStr) - now.getTime();
    if (total <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    return { expired: false, days, hours, minutes, seconds };
  };

  return (
    <main className="pb-18 lg:pb-0" style={{ fontFamily: "var(--font-body)", background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      
      {/* Ambient background glows */}
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)", top: "5%", left: "-100px", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)", top: "45%", right: "-150px", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      <Navbar
        onOpenQuote={() => setQuoteOpen(true)}
        onOpenAbout={handleOpenAbout}
        onOpenContact={handleOpenContact}
      />

      {loading ? (
        // Loading State
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: "1rem" }}>
          <div className="animate-spin" style={{ width: "40px", height: "40px", border: "3px solid rgba(212,175,55,0.2)", borderTopColor: "#D4AF37", borderRadius: "50%" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>Loading exclusive offers...</p>
        </div>
      ) : !specialsEnabled ? (
        // Specials Disabled Fallback View
        <section style={{ padding: "10rem 1.5rem 6rem", textAlign: "center", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", background: "var(--card-bg)", border: "1px solid var(--border-primary)", padding: "3rem 2rem", borderRadius: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", background: "rgba(212,175,55,0.08)", border: "2px solid rgba(212,175,55,0.2)", color: "#D4AF37", marginBottom: "1.5rem" }}>
              <Sparkles size={32} />
            </div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 900, marginBottom: "1rem", color: "var(--text-primary)" }}>
              Upcoming Special Deals
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              Our team is handcrafting next season's exclusive party and event packages. Check back soon for seasonal discounts, custom combos, and limited-time rental specials!
            </p>
            
            {subscribed ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#22c55e", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", padding: "0.85rem", borderRadius: "0.75rem", fontSize: "0.88rem", fontWeight: 700 }}>
                <CheckCircle size={16} />
                You've been added to our VIP Early Access list!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 sm:gap-0" style={{ width: "100%" }}>
                <input 
                  type="email" 
                  required 
                  placeholder="Enter email for VIP access..." 
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full sm:w-auto flex-1"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-secondary)", outline: "none", padding: "0.75rem 1rem", color: "var(--text-primary)", fontSize: "0.88rem", borderRadius: "0.75rem" }}
                />
                <button type="submit" className="btn-primary w-full sm:w-auto" style={{ padding: "0.75rem 1.5rem", borderRadius: "0.75rem", fontSize: "0.8rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                  Notify Me
                </button>
              </form>
            )}
          </div>
        </section>
      ) : (
        // Specials Enabled View
        <>
          {/* Header Hero Section */}
          <section
            style={{
              background: "linear-gradient(180deg, var(--bg-secondary) 0%, rgba(212,175,55,0.02) 60%, var(--bg-primary) 100%)",
              backgroundImage: "radial-gradient(var(--border-secondary) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              padding: "9rem 1.5rem 4rem",
              textAlign: "center",
              borderBottom: "1px solid var(--border-primary)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div className="section-label" style={{ justifyContent: "center", display: "inline-flex", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", padding: "0.4rem 1rem", borderRadius: "9999px", color: "#D4AF37", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                ★ Limited-Time Offers ★
              </div>
              <h1 className="section-title text-gradient" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "1.25rem", marginTop: "1rem" }}>
                Exclusive Specials & Packages
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: "620px", margin: "0 auto" }}>
                Grab our hand-curated event combos and discounted pricing structures. Reserve early to lock in your seasonal savings!
              </p>
            </div>
          </section>

          {/* Specials Listing Grid */}
          <section style={{ padding: "4rem 1.5rem 8rem", position: "relative", zIndex: 1 }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
              {specials.length === 0 ? (
                <div style={{ padding: "6rem 2rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "1.5rem", border: "2px dashed var(--border-primary)" }}>
                  <Zap size={32} color="#D4AF37" style={{ marginBottom: "1rem" }} />
                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                    No Active Specials Available
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", maxWidth: "420px", margin: "0 auto" }}>
                    We don't have any active specials published right now. Sign up to get notified as soon as new deals are launched!
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))", gap: "2rem" }}>
                  {specials.map((special) => {
                    const timer = getRemainingTime(special.endDate);
                    const isExpired = timer?.expired;

                    return (
                      <Reveal key={special.id}>
                        <RadialGlowCard 
                          className="product-card" 
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            opacity: isExpired ? 0.75 : 1,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Image */}
                          <div style={{ position: "relative", aspectRatio: "16/10", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
                            <img
                              src={special.image || FALLBACK_IMAGE}
                              alt={special.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              loading="lazy"
                              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                            />

                            {/* Badge */}
                            {special.badge && (
                              <div style={{ position: "absolute", top: "1rem", left: "1rem", background: "linear-gradient(135deg, #D4AF37 0%, #f5e8a0 100%)", padding: "0.35rem 0.85rem", borderRadius: "9999px", color: "#000000", fontFamily: "var(--font-heading)", fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: "0 4px 12px rgba(212,175,55,0.3)" }}>
                                {special.badge}
                              </div>
                            )}

                            {/* Live Countdown widget */}
                            {timer && (
                              <div 
                                className="flex flex-wrap items-center justify-between gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2"
                                style={{ 
                                  position: "absolute", 
                                  bottom: "0.75rem", 
                                  left: "0.75rem", 
                                  right: "0.75rem", 
                                  background: "rgba(10, 10, 12, 0.9)", 
                                  backdropFilter: "blur(10px)", 
                                  border: isExpired ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(212,175,55,0.3)", 
                                  borderRadius: "0.625rem" 
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: isExpired ? "#ef4444" : "#D4AF37" }}>
                                  <Clock size={12} className={isExpired ? "" : "animate-pulse"} />
                                  <span style={{ fontSize: "0.55rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    {isExpired ? "Expired" : "Ends In:"}
                                  </span>
                                </div>
                                {!isExpired && (
                                  <div style={{ display: "flex", gap: "0.35rem", fontFamily: "monospace", fontSize: "0.68rem", fontWeight: 700, color: "#ffffff" }}>
                                    <div>{String(timer.days).padStart(2, "0")}<span style={{ color: "#D4AF37", fontSize: "0.55rem" }}>d</span></div>
                                    <div>{String(timer.hours).padStart(2, "0")}<span style={{ color: "#D4AF37", fontSize: "0.55rem" }}>h</span></div>
                                    <div>{String(timer.minutes).padStart(2, "0")}<span style={{ color: "#D4AF37", fontSize: "0.55rem" }}>m</span></div>
                                    <div style={{ color: "#D4AF37" }}>{String(timer.seconds).padStart(2, "0")}<span style={{ color: "#ffffff", fontSize: "0.55rem" }}>s</span></div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Details Body */}
                          <div className="p-4 sm:p-6" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "1.15rem", color: "var(--text-primary)", margin: 0 }}>
                              {special.title}
                            </h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5, margin: 0 }}>
                              {special.description}
                            </p>

                            {/* Promo Code Info Badge */}
                            {special.promoCode && !isExpired && (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", alignSelf: "flex-start", padding: "0.25rem 0.6rem", borderRadius: "0.5rem", color: "#D4AF37", fontSize: "0.65rem", fontWeight: 700 }}>
                                <Tag size={12} />
                                Code: {special.promoCode}
                              </div>
                            )}

                            {/* Price details and Claim button */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2" style={{ borderTop: "1px solid var(--border-primary)", paddingTop: "1rem", marginTop: "auto" }}>
                              <div className="flex sm:flex-col items-baseline sm:items-start gap-2 sm:gap-0">
                                <span style={{ textDecoration: "line-through", color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", fontWeight: 600 }}>
                                  ${special.originalPrice}
                                </span>
                                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "1.4rem", color: "#D4AF37", textShadow: "0 0 10px rgba(212,175,55,0.15)" }}>
                                  ${special.specialPrice}
                                </span>
                              </div>

                              <button
                                onClick={() => handleClaimOffer(special)}
                                disabled={isExpired}
                                className="btn-primary btn-press w-full sm:w-auto justify-center"
                                style={{
                                  padding: "0.65rem 1.25rem",
                                  borderRadius: "0.625rem",
                                  fontSize: "0.68rem",
                                  letterSpacing: "0.08em",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.4rem",
                                  opacity: isExpired ? 0.4 : 1,
                                  cursor: isExpired ? "not-allowed" : "pointer"
                                }}
                              >
                                {isExpired ? "Offer Expired" : "Claim Offer"}
                                {!isExpired && <ArrowRight size={13} />}
                              </button>
                            </div>
                          </div>
                        </RadialGlowCard>
                      </Reveal>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <Footer
        onOpenQuote={() => setQuoteOpen(true)}
        onOpenAbout={handleOpenAbout}
        onOpenContact={handleOpenContact}
      />

      <MobileBottomNav
        onOpenQuote={() => setQuoteOpen(true)}
        onOpenAbout={handleOpenAbout}
        onOpenContact={handleOpenContact}
      />

      <QuoteBuilder
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        selectedItemFromInventory={selectedItem}
        initialPromoCode={promoCode}
      />

      <AboutContactModal
        isOpen={aboutContactOpen}
        onClose={() => setAboutContactOpen(false)}
        defaultTab={aboutContactTab}
      />
    </main>
  );
}
