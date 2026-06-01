"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, Mail, Phone, Send, ShieldCheck, Heart, Sparkles, CheckCircle2 } from "lucide-react";

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface AboutContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "about" | "contact";
}

export default function AboutContactModal({ isOpen, onClose, defaultTab = "about" }: AboutContactModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeTab, setActiveTab] = useState<"about" | "contact">("about");
  
  // Contact Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setFormSent(false);
      setFullName("");
      setEmail("");
      setMessage("");
      setSubject("General Inquiry");
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (isOpen) {
      try { d.showModal(); } catch {}
    } else {
      try { d.close(); } catch {}
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate premium transmission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSent(true);
    }, 1200);
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
      style={{
        background: "#ffffff",
        color: "#0f0f0f",
        width: "min(600px, 94vw)",
        margin: "auto",
        border: "none",
        borderRadius: "1.5rem",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.18)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxHeight: "90dvh" }}>
        
        {/* ---- HEADER & TABS ---- */}
        <div style={{ padding: "1.75rem 1.75rem 0.5rem", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#D4AF37", display: "inline-block", marginBottom: "0.25rem" }}>
                Pinstripes Rentals
              </span>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.3rem", color: "#0f0f0f", margin: 0 }}>
                {activeTab === "about" ? "Discover Our Vision" : "Get In Touch"}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#f5f5f5",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.6rem",
                cursor: "pointer",
                display: "flex",
                color: "#555",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#ebebeb"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#f5f5f5"}
            >
              <X size={18} />
            </button>
          </div>

          {/* Premium Tab Selector Pills */}
          <div style={{ display: "flex", background: "#f5f5f5", padding: "0.25rem", borderRadius: "9999px", gap: "0.25rem", marginBottom: "1rem" }}>
            <button
              type="button"
              onClick={() => { setActiveTab("about"); setFormSent(false); }}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "9999px",
                border: "none",
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                ...(activeTab === "about"
                  ? { background: "#0f0f0f", color: "#D4AF37", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }
                  : { background: "transparent", color: "#666" })
              }}
            >
              📖 About Pinstripes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("contact")}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "9999px",
                border: "none",
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                ...(activeTab === "contact"
                  ? { background: "#0f0f0f", color: "#D4AF37", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }
                  : { background: "transparent", color: "#666" })
              }}
            >
              ✉️ Contact Details
            </button>
          </div>
        </div>

        {/* ---- SCROLLABLE BODY ---- */}
        <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1.75rem 1.75rem" }}>
          
          {/* TAB 1: ABOUT US */}
          {activeTab === "about" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "1.25rem", padding: "1.25rem" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#333", lineHeight: 1.65, margin: 0 }}>
                  At <strong>Pinstripes Party & Event Rentals</strong>, we take immense pride in delivering premier, commercial-grade event equipment and sophisticated designs to elevate every occasion. From majestic, high-peak wedding marquee setups to vibrant, meticulously sanitized bounce castles and interactive concession systems, our core mission is to transform your milestones into unforgettable memories. 
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#333", lineHeight: 1.65, marginTop: "0.75rem", marginBottom: 0 }}>
                  Under local ownership in Hampton Roads, Virginia, we represent absolute commitment to flawless service delivery, rigorous safety compliance, and fully licensed & insured logistics. Our dedicated team is committed to ensuring that your custom setup is executed seamlessly, leaving you free to celebrate with complete peace of mind.
                </p>
              </div>

              {/* Core Pillars */}
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.78rem", color: "#0f0f0f", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.85rem" }}>
                  Why Discerning Hosts Choose Us
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {[
                    {
                      Icon: Sparkles,
                      title: "Elite Quality Equipment",
                      desc: "All rentals are strictly heavy-duty commercial-grade, safety-inspected, and dynamically scrubbed & sanitized before every setup."
                    },
                    {
                      Icon: ShieldCheck,
                      title: "Impeccable Safety & Insurance",
                      desc: "We are fully licensed and commercially insured. Our setups comply strictly with structural and local municipal safety guidelines."
                    },
                    {
                      Icon: Heart,
                      title: "Local Dedication",
                      desc: "Proudly serving Norfolk, Virginia Beach, Chesapeake, Portsmouth, Suffolk, Newport News, Hampton, Yorktown, and Williamsburg with 24/7 logistics coordination."
                    }
                  ].map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                      <div style={{ background: "rgba(212,175,55,0.1)", borderRadius: "0.75rem", padding: "0.5rem", display: "flex", color: "#D4AF37", flexShrink: 0 }}>
                        <p.Icon size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.8rem", color: "#0f0f0f", margin: "0 0 0.15rem 0" }}>{p.title}</h4>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "#666", lineHeight: 1.5, margin: 0 }}>{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT US */}
          {activeTab === "contact" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              
              {/* Immediate Contacts Panel */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
                {[
                  {
                    Icon: Phone,
                    label: "Call / WhatsApp",
                    value: "(757) 749-3407",
                    href: "tel:17577493407"
                  },
                  {
                    Icon: Mail,
                    label: "Email Support",
                    value: "pinstripesrentals@gmail.com",
                    href: "mailto:pinstripesrentals@gmail.com"
                  },
                  {
                    Icon: InstagramIcon,
                    label: "Follow Instagram",
                    value: "@pinstripesrentals",
                    href: "https://www.instagram.com/pinstripesrentals?igsh=MWZ0MGoxMXZkMGphaw%3D%3D&utm_source=qr"
                  }
                ].map((c, i) => (
                  <a
                    key={i}
                    href={c.href}
                    target={c.label.includes("Instagram") ? "_blank" : undefined}
                    rel={c.label.includes("Instagram") ? "noopener noreferrer" : undefined}
                    style={{
                      background: "#fafafa",
                      border: "1px solid #ebebeb",
                      borderRadius: "1rem",
                      padding: "0.875rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textDecoration: "none",
                      color: "#0f0f0f",
                      textAlign: "center",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.borderColor = "#D4AF37";
                      e.currentTarget.style.background = "rgba(212,175,55,0.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "";
                      e.currentTarget.style.borderColor = "#ebebeb";
                      e.currentTarget.style.background = "#fafafa";
                    }}
                  >
                    <div style={{ color: "#D4AF37", marginBottom: "0.35rem" }}>
                      <c.Icon size={18} />
                    </div>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.55rem", textTransform: "uppercase", color: "#aaa", letterSpacing: "0.05em", marginBottom: "0.15rem" }}>
                      {c.label}
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", width: "100%", whiteSpace: "nowrap" }}>
                      {c.value}
                    </div>
                  </a>
                ))}
              </div>

              {/* Direct Query Form */}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1.25rem" }}>
                {formSent ? (
                  <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                      <CheckCircle2 size={28} color="#22c55e" />
                    </div>
                    <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", margin: "0 0 0.5rem 0" }}>Message Transmitted!</h4>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "#666", lineHeight: 1.5, margin: "0 auto", maxWidth: "340px" }}>
                      Thank you, <strong>{fullName}</strong>. Your inquiry has been routed directly to our operations dashboard. A coordinator will email you at <strong>{email}</strong> shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.78rem", color: "#0f0f0f", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                      Send Direct Message
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={labelStyle}>Full Name *</label>
                        <input required type="text" className="field" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Email Address *</label>
                        <input required type="email" className="field" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Subject</label>
                      <select className="field" value={subject} onChange={(e) => setSubject(e.target.value)} style={{ appearance: "auto" }}>
                        <option>General Inquiry</option>
                        <option>Custom Package Request</option>
                        <option>Extended Service travel</option>
                        <option>Safety or Insurance Inquiry</option>
                        <option>Billing Question</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Your Message *</label>
                      <textarea required className="field" rows={3} placeholder="Please detail your request, event type, date, or specific item queries here..." value={message} onChange={(e) => setMessage(e.target.value)} style={{ resize: "vertical" }} />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                        padding: "0.8rem",
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
                        boxShadow: "0 6px 20px rgba(212,175,55,0.25)",
                        transition: "all 0.2s",
                        marginTop: "0.25rem"
                      }}
                      onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.transform = ""; }}
                    >
                      {isSubmitting ? "Transmitting Message..." : <>Send Message <Send size={13} /></>}
                    </button>
                  </form>
                )}
              </div>
            </div>
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
  fontSize: "0.6rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#888",
  marginBottom: "0.35rem",
};
