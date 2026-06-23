"use client";

import React, { useState } from "react";
import { Star, HelpCircle } from "lucide-react";

const galleryItems = [
  { id: 1, title: "Fairytale Backyard Wedding", cat: "Weddings",   img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=60" },
  { id: 2, title: "Epic 5th Birthday Splash Park", cat: "Birthdays", img: "/images/water-slide-1.png" },
  { id: 3, title: "Year-End Corporate Banquet",  cat: "Corporate",  img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60" },
  { id: 4, title: "Annual High School Carnival",  cat: "Schools",   img: "/images/water-slide-2.png" },
  { id: 5, title: "Sunday Fellowship Harvest",    cat: "Churches",  img: "/images/banquet-table.png" },
  { id: 6, title: "Sunset Garden Ceremony",       cat: "Weddings",  img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=60" },
  { id: 7, title: "Snowcone Summer Festival",     cat: "Schools",   img: "/images/kids-snowcones.png" },
  { id: 8, title: "Sweet 7th Birthday Party",     cat: "Birthdays", img: "/images/kids-cotton-candy.png" },
];

const reviews = [
  { name: "Sabrina Vasquez", role: "Wedding Planner", loc: "Virginia Beach", rating: 5, quote: "Pinstripes completely exceeded my expectations! The High-Peak Tent was flawless and the fairy lights transformed the garden into a dream. Extremely professional crew." },
  { name: "Ricardo Campbell", role: "Parent / Host", loc: "Norfolk", rating: 5, quote: "The 5-in-1 water slide was the star of the birthday party! Clean, sanitised, set up early, and the staff walked us through safety checks. Outstanding service!" },
  { name: "Michelle Chin", role: "Marketing Director", loc: "Chesapeake", rating: 5, quote: "We hired Pinstripes for our annual staff banquet. They handled tents, sound system, tables, and generators perfectly. Flawless corporate execution." },
  { name: "Damion Brown", role: "Church Administrator", loc: "Williamsburg", rating: 5, quote: "Every single item arrived on time, spotless, and in perfect condition. Our harvest festival looked world-class. We will definitely be renting again." },
];

const faqs = [
  { q: "Do you handle delivery, setup, and cleanup?", a: "Yes! Our professional crew delivers, completely installs and secures all equipment. After your event we return to safely disassemble and collect everything." },
  { q: "Are the bounce houses and slides clean & safe?", a: "Safety and cleanliness are our top priorities. Every inflatable undergoes strict commercial-grade sanitisation and inspection both at our warehouse and on-site at setup." },
  { q: "What is your bad weather / cancellation policy?", a: "For inclement weather (heavy rain or high winds) we allow free rescheduling or a full booking credit. Please notify us at least 48 hours in advance." },
  { q: "Can you accommodate large corporate events?", a: "Absolutely. We have serviced events for 20 to 500+ guests. Contact us for a custom corporate quote and we will build a package around your specific needs." },
];

const FALLBACK = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60";

interface TestimonialsProps {
  galleryEnabled?: boolean;
}

export default function Testimonials({ galleryEnabled = true }: TestimonialsProps) {
  const [filter, setFilter] = useState("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const filters = ["All", "Weddings", "Birthdays", "Corporate", "Schools", "Churches"];
  const shown = filter === "All" ? galleryItems : galleryItems.filter(g => g.cat === filter);

  const handleFilterChange = (f: string) => {
    setFilter(f);
    setActiveIndex(0);
  };

  return (
    <>
      {/* ===== GALLERY ===== */}
      {galleryEnabled && (
        <section id="gallery" style={{ padding: "5rem 0", background: "#ffffff" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.25rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <span className="section-label">Inspiration Gallery</span>
              <h2 className="section-title">Real Events, Real Smiles</h2>
            </div>

          {/* Filter pills */}
          <div
            className="no-scrollbar"
            style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}
          >
            {filters.map(f => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "9999px",
                  border: filter === f ? "none" : "1.5px solid #e5e5e5",
                  background: filter === f ? "#0f0f0f" : "#ffffff",
                  color: filter === f ? "#D4AF37" : "#555",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: "0.67rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Interactive Accordion Layout */}
          <div className="flex flex-row items-center justify-center gap-4 overflow-x-auto p-4 no-scrollbar min-h-[480px]">
            {shown.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`
                    relative h-[420px] rounded-2xl overflow-hidden cursor-pointer
                    transition-all duration-700 ease-in-out shadow-lg shrink-0
                    ${isActive ? 'w-[320px] md:w-[420px]' : 'w-[70px]'}
                  `}
                >
                  {/* Background Image */}
                  <img
                    src={item.img}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
                  />
                  {/* Dark overlay for readability */}
                  <div className="absolute inset-0 bg-black/40"></div>

                  {/* Caption info for expanded state */}
                  <div
                    className={`
                      absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end
                      transition-all duration-500 ease-in-out
                      ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
                    `}
                  >
                    <span className="text-[0.65rem] font-bold tracking-widest uppercase text-[#D4AF37] mb-1">
                      {item.cat}
                    </span>
                    <h4 className="font-heading font-extrabold text-sm md:text-base text-white leading-tight">
                      {item.title}
                    </h4>
                  </div>

                  {/* Vertical title for collapsed state */}
                  <div
                    className={`
                      absolute inset-0 flex items-center justify-center
                      transition-all duration-500 ease-in-out pointer-events-none
                      ${!isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
                    `}
                  >
                    <span className="text-white text-xs font-bold tracking-widest uppercase whitespace-nowrap -rotate-90">
                      {item.title.length > 22 ? item.title.slice(0, 20) + '...' : item.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* ===== TESTIMONIALS ===== */}
      <section id="about" style={{ padding: "5rem 0", background: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.25rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: "4rem",
              alignItems: "center",
              marginBottom: "4rem",
            }}
          >
            {/* Left */}
            <div>
              <span className="section-label">Customer Feedback</span>
              <h2 className="section-title" style={{ marginBottom: "1rem" }}>Loved By Hosts &amp; Planners</h2>
              <p style={{ fontFamily: "var(--font-body)", color: "#666", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                Don&apos;t just take our word for it. Read honest reviews from brides, school boards, corporate coordinators, and local families across America.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "3.5rem", color: "#0f0f0f", lineHeight: 1 }}>4.9</span>
                <div>
                  <div style={{ display: "flex", color: "#f59e0b", marginBottom: "0.3rem" }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={18} fill="#f59e0b" strokeWidth={0} />)}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "#999", fontWeight: 600 }}>Based on 350+ bookings</div>
                </div>
              </div>
            </div>

            {/* Reviews grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))", gap: "1rem" }}>
              {reviews.map((r) => (
                <div
                  key={r.name}
                  style={{
                    background: "#ffffff",
                    borderRadius: "1.25rem",
                    padding: "1.5rem",
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ display: "flex", color: "#f59e0b", marginBottom: "0.875rem" }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={13} fill="#f59e0b" strokeWidth={0} />)}
                  </div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#555", lineHeight: 1.65, fontStyle: "italic", marginBottom: "1rem" }}>
                    &quot;{r.quote}&quot;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #D4AF37, #f5e8a0)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        color: "#0f0f0f",
                        flexShrink: 0,
                      }}
                    >
                      {r.name[0]}
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.78rem", color: "#0f0f0f" }}>{r.name}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                        {r.role} · {r.loc}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div
            id="corporate"
            style={{
              background: "#0f0f0f",
              borderRadius: "2rem",
              padding: "3rem 2rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow orbs */}
            <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: "3rem",
                alignItems: "start",
              }}
            >
              {/* Left copy */}
              <div>
                <span className="section-label" style={{ color: "#D4AF37" }}>Got Questions?</span>
                <h2 className="section-title" style={{ color: "#ffffff", marginBottom: "1rem" }}>
                  Frequently Asked Questions
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                  Everything you need to know about booking our rentals. Still have questions? Contact us directly and we&apos;ll respond within 2 hours.
                </p>
              </div>

              {/* FAQ accordion */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "1rem",
                      overflow: "hidden",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        width: "100%",
                        padding: "1.125rem 1.25rem",
                        background: "none",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#ffffff", lineHeight: 1.4 }}>
                        {faq.q}
                      </span>
                      <HelpCircle
                        size={18}
                        color={openFaq === i ? "#D4AF37" : "rgba(255,255,255,0.4)"}
                        style={{ flexShrink: 0, transition: "color 0.2s" }}
                      />
                    </button>
                    {openFaq === i && (
                      <div
                        className="animate-slide-down"
                        style={{ padding: "0 1.25rem 1.125rem", fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
