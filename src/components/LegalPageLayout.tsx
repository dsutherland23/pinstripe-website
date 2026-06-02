"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  children: React.ReactNode;
  tocItems: TocItem[];
}

export default function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  children,
  tocItems,
}: LegalPageLayoutProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [tocOpen, setTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const ids = tocItems.map((item) => item.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [tocItems]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
    setTocOpen(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5", fontFamily: "var(--font-body, sans-serif)" }}>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #111111 0%, #1a1a0f 50%, #111111 100%)",
          borderBottom: "1px solid rgba(212,175,55,0.15)",
          padding: "5rem 1.5rem 3rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gold accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            height: "3px",
            background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
          }}
        />
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontFamily: "var(--font-body, sans-serif)",
            fontSize: "0.75rem",
            color: "#D4AF37",
            textDecoration: "none",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: "1.5rem",
            opacity: 0.8,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
        >
          ← Back to Home
        </Link>
        <p
          style={{
            fontFamily: "var(--font-body, sans-serif)",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#D4AF37",
            marginBottom: "0.75rem",
          }}
        >
          Pinstripes Party &amp; Event Rentals
        </p>
        <h1
          style={{
            fontFamily: "var(--font-heading, serif)",
            fontWeight: 900,
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            lineHeight: 1.1,
            color: "#ffffff",
            marginBottom: "1rem",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.55)",
              maxWidth: "540px",
              margin: "0 auto 1.5rem",
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </p>
        )}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(212,175,55,0.08)",
            border: "1px solid rgba(212,175,55,0.25)",
            borderRadius: "9999px",
            padding: "0.375rem 1rem",
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Last updated: <span style={{ color: "#D4AF37", fontWeight: 600 }}>{lastUpdated}</span>
        </div>
      </div>

      {/* Mobile ToC toggle */}
      <div
        style={{
          display: "block",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#111",
        }}
        className="legal-toc-mobile"
      >
        <button
          onClick={() => setTocOpen(!tocOpen)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(212,175,55,0.06)",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: "0.5rem",
            padding: "0.625rem 1rem",
            color: "#D4AF37",
            fontFamily: "var(--font-body, sans-serif)",
            fontWeight: 700,
            fontSize: "0.82rem",
            letterSpacing: "0.05em",
            cursor: "pointer",
          }}
        >
          <span>📋 Table of Contents</span>
          <span style={{ transform: tocOpen ? "rotate(180deg)" : "none", transition: "0.2s" }}>▾</span>
        </button>
        {tocOpen && (
          <nav
            style={{
              background: "#161616",
              border: "1px solid rgba(212,175,55,0.15)",
              borderRadius: "0.5rem",
              marginTop: "0.5rem",
              overflow: "hidden",
            }}
          >
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: `0.6rem ${item.level > 1 ? "2rem" : "1rem"}`,
                  background: activeId === item.id ? "rgba(212,175,55,0.08)" : "transparent",
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  borderLeft: "none",
                  color: activeId === item.id ? "#D4AF37" : "rgba(255,255,255,0.65)",
                  fontFamily: "var(--font-body, sans-serif)",
                  fontSize: item.level > 1 ? "0.78rem" : "0.82rem",
                  fontWeight: activeId === item.id ? 700 : 500,
                  cursor: "pointer",
                }}
              >
                {item.level > 1 && <span style={{ marginRight: "0.5rem", opacity: 0.4 }}>└</span>}
                {item.title}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Main layout */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "2rem",
        }}
      >
        <div style={{ display: "flex", gap: "3rem", alignItems: "flex-start" }}>
          {/* Sidebar ToC — desktop only */}
          <aside
            style={{
              width: "240px",
              flexShrink: 0,
              position: "sticky",
              top: "90px",
              maxHeight: "calc(100vh - 110px)",
              overflowY: "auto",
            }}
            className="legal-sidebar"
          >
            <div
              style={{
                background: "#141414",
                border: "1px solid rgba(212,175,55,0.12)",
                borderRadius: "1rem",
                padding: "1.25rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#D4AF37",
                  marginBottom: "1rem",
                  borderBottom: "1px solid rgba(212,175,55,0.15)",
                  paddingBottom: "0.75rem",
                }}
              >
                On This Page
              </p>
              <nav>
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: `0.45rem ${item.level > 1 ? "1.25rem" : "0.5rem"}`,
                      background: activeId === item.id ? "rgba(212,175,55,0.08)" : "transparent",
                      borderTop: "none",
                      borderRight: "none",
                      borderBottom: "none",
                      borderLeft: activeId === item.id ? "2px solid #D4AF37" : "2px solid transparent",
                      borderRadius: "0.25rem",
                      color: activeId === item.id ? "#D4AF37" : "rgba(255,255,255,0.5)",
                      fontFamily: "var(--font-body, sans-serif)",
                      fontSize: item.level > 1 ? "0.75rem" : "0.8rem",
                      fontWeight: activeId === item.id ? 700 : 400,
                      cursor: "pointer",
                      marginBottom: "0.15rem",
                      transition: "all 0.15s",
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={(e) => {
                      if (activeId !== item.id)
                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
                    }}
                    onMouseLeave={(e) => {
                      if (activeId !== item.id)
                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
                    }}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article
            style={{ flex: 1, minWidth: 0 }}
            className="legal-content"
          >
            {children}
          </article>
        </div>
      </div>

      {/* Footer strip */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          background: "#0a0a0a",
        }}
      >
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem" }}>
          Questions about this policy? Contact us at{" "}
          <a
            href="mailto:pinstripesrentals@gmail.com"
            style={{ color: "#D4AF37", textDecoration: "none", fontWeight: 600 }}
          >
            pinstripesrentals@gmail.com
          </a>
        </p>
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms & Conditions", href: "/terms-and-conditions" },
            { label: "Rental Agreement", href: "/rental-agreement" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                transition: "color 0.2s",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#D4AF37")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .legal-toc-mobile { display: block; }
        .legal-sidebar { display: none; }

        @media (min-width: 900px) {
          .legal-toc-mobile { display: none !important; }
          .legal-sidebar { display: block; }
        }

        .legal-content h2 {
          font-family: var(--font-heading, serif);
          font-size: clamp(1.2rem, 2.5vw, 1.5rem);
          font-weight: 800;
          color: #ffffff;
          margin: 2.5rem 0 1rem;
          padding-top: 1rem;
          border-bottom: 1px solid rgba(212,175,55,0.15);
          padding-bottom: 0.625rem;
          scroll-margin-top: 90px;
        }

        .legal-content h3 {
          font-family: var(--font-heading, serif);
          font-size: 1.05rem;
          font-weight: 700;
          color: #D4AF37;
          margin: 1.75rem 0 0.75rem;
          scroll-margin-top: 90px;
        }

        .legal-content p {
          font-size: 0.92rem;
          line-height: 1.8;
          color: rgba(255,255,255,0.72);
          margin-bottom: 1rem;
        }

        .legal-content ul, .legal-content ol {
          margin: 0.75rem 0 1.25rem 1.5rem;
          color: rgba(255,255,255,0.72);
          font-size: 0.9rem;
          line-height: 1.8;
        }

        .legal-content li { margin-bottom: 0.4rem; }

        .legal-content a {
          color: #D4AF37;
          text-decoration: none;
          font-weight: 600;
        }

        .legal-content a:hover { text-decoration: underline; }

        .legal-content strong {
          color: rgba(255,255,255,0.9);
          font-weight: 700;
        }

        .legal-content .highlight-box {
          background: rgba(212,175,55,0.06);
          border: 1px solid rgba(212,175,55,0.2);
          border-left: 3px solid #D4AF37;
          border-radius: 0.5rem;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
        }

        .legal-content .highlight-box p { margin: 0; font-size: 0.88rem; }
      `}</style>
    </div>
  );
}
