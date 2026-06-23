"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Phone,
  ChevronDown,
  Sun,
  Moon,
  Home,
  Compass,
  Image as ImageIcon,
  Award,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Table2,
  Armchair,
  Wind,
  Camera,
  Coffee,
  User,
  Tent,
} from "lucide-react";

const rentalSubItems = [
  { label: "Tents",                href: "/inventory/tents",                categorySlug: "tents",                icon: <Tent size={15} />,     desc: "High-peak wedding & party tents" },
  { label: "Tables",               href: "/inventory/tables",               categorySlug: "tables",               icon: <Table2 size={15} />,   desc: "Banquet, round & specialty tables" },
  { label: "Chairs",               href: "/inventory/chairs",               categorySlug: "chairs",               icon: <Armchair size={15} />, desc: "Folding, cross-back & chiavari" },
  { label: "Inflatables",          href: "/inventory/inflatables",          categorySlug: "inflatables",          icon: <Wind size={15} />,     desc: "Bounce houses & water slides" },
  { label: "Photo Booth",          href: "/inventory/photobooth",          categorySlug: "photobooth",          icon: <Camera size={15} />,   desc: "360° & open-air photo experiences" },
  { label: "Concession Equipment", href: "/inventory/concession-equipment", categorySlug: "concession-equipment", icon: <Coffee size={15} />,   desc: "Popcorn, cotton candy & more" },
];


interface NavbarProps {
  onOpenQuote: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
}

export default function Navbar({ onOpenQuote, onOpenAbout, onOpenContact }: NavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEvening, setIsEvening] = useState(false);
  const [rentalsDropdownOpen, setRentalsDropdownOpen] = useState(false);
  const [mobileRentalsOpen, setMobileRentalsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [galleryEnabled, setGalleryEnabled] = useState(true);
  const rentalsRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hasClass = document.body.classList.contains("evening");
    setIsEvening(hasClass);
    setMounted(true);

    // Fetch settings to check if gallery is enabled
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.galleryEnabled === "boolean") {
          setGalleryEnabled(data.galleryEnabled);
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const newVal = !isEvening;
    setIsEvening(newVal);
    if (newVal) {
      document.body.classList.add("evening");
    } else {
      document.body.classList.remove("evening");
    }
  };


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (rentalsRef.current && !rentalsRef.current.contains(e.target as Node)) {
        setRentalsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const getLinkHref = (label: string, defaultHash: string) => {
    if (!mounted || typeof window === "undefined") return defaultHash;
    const isHome = window.location.pathname === "/";
    if (isHome) {
      if (label === "Rentals") return "/inventory";
      return defaultHash;
    }
    if (label === "Home") return "/";
    if (label === "Rentals") return "/inventory";
    
    const isLocationPage = window.location.pathname.startsWith("/locations/");
    if (isLocationPage) {
      return defaultHash;
    }
    
    return `/${defaultHash}`;
  };

  const handleRentalSubClick = (categorySlug: string) => {
    // Close menus first
    setRentalsDropdownOpen(false);
    setOpen(false);
    setMobileRentalsOpen(false);

    if (typeof window !== "undefined") {
      if (categorySlug === "all") {
        window.location.href = "/inventory";
      } else {
        window.location.href = `/inventory/${categorySlug}`;
      }
    }
  };

  const links = [
    { label: "Home",       href: getLinkHref("Home", "#home"),           desc: "Return to grand showcase" },
    { label: "Rentals",    href: getLinkHref("Rentals", "/inventory"),   desc: "Browse tents, tables & slides" },
    ...(galleryEnabled ? [{ label: "Gallery",    href: getLinkHref("Gallery", "#gallery"),     desc: "Real celebration inspiration" }] : []),
    { label: "My Account", href: "/portal",                              desc: "Sign in, register or track orders" },
    { label: "About",      href: "#about",                               desc: "Our story & premium quality" },
    { label: "Contact",    href: "#contact",                             desc: "Get direct quotes & pricing" },
  ].map((item, index) => ({
    ...item,
    num: String(index + 1).padStart(2, "0")
  }));

  const renderIcon = (label: string, size = 16) => {
    switch (label) {
      case "Home":       return <Home size={size} />;
      case "Rentals":    return <Compass size={size} />;
      case "Gallery":    return <ImageIcon size={size} />;
      case "My Account": return <User size={size} />;
      case "About":      return <Award size={size} />;
      case "Contact":    return <MessageSquare size={size} />;
      default:           return null;
    }
  };

  return (
    <>
      {/* ---- HEADER ---- */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: "all 0.35s ease",
            ...((scrolled || !isHome)
              ? {
                  background: isEvening ? "rgba(15,15,15,0.95)" : "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: isEvening ? "0 4px 30px rgba(0, 0, 0, 0.5)" : "0 2px 24px rgba(0,0,0,0.08)",
                  borderBottom: isEvening ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0,0,0,0.05)",
                  padding: "0.625rem 0",
                }
              : {
                  background: "transparent",
                  borderBottom: "1px solid transparent",
                  padding: "1.25rem 0",
                }),
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "0 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
            }}
          >
            {/* LOGO */}
            <a href={getLinkHref("Home", "#home")} style={{ textDecoration: "none", flexShrink: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: (scrolled || !isHome) ? "transparent" : "rgba(255, 255, 255, 0.96)",
                  width: (scrolled || !isHome) ? "64px" : "88px",
                  height: (scrolled || !isHome) ? "64px" : "88px",
                  borderRadius: "50%",
                  boxShadow: (scrolled || !isHome) ? "none" : "0 4px 20px rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  border: (scrolled || !isHome) ? "1px solid transparent" : "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <img
                  src="/images/pinstripes-logo.png?v=20260623"
                  alt="Pinstripes Party & Event Rentals"
                  style={{
                    height: (scrolled || !isHome) ? "52px" : "72px",
                    width: (scrolled || !isHome) ? "52px" : "72px",
                    objectFit: "contain",
                    borderRadius: "50%",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </div>
            </a>

          {/* DESKTOP NAV */}
          <nav
            style={{
              alignItems: "center",
              gap: "2.5rem",
            }}
            className="hidden lg:flex"
          >
            {links.map((l) => {
              if (l.label === "Rentals") {
                return (
                  <div
                    key={l.label}
                    ref={rentalsRef}
                    style={{ position: "relative" }}
                    onMouseEnter={() => {
                      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                      setRentalsDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      dropdownTimeoutRef.current = setTimeout(() => setRentalsDropdownOpen(false), 150);
                    }}
                  >
                    <button
                      onClick={() => setRentalsDropdownOpen((v) => !v)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: rentalsDropdownOpen ? "#D4AF37" : ((scrolled || !isHome) ? (isEvening ? "rgba(255,255,255,0.9)" : "#0f0f0f") : "rgba(255,255,255,0.9)"),
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "0.25rem 0",
                        transition: "color 0.2s",
                      }}
                    >
                      {l.label}
                      <ChevronDown
                        size={13}
                        style={{
                          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          transform: rentalsDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </button>

                    {/* Dropdown Panel */}
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 14px)",
                        left: "50%",
                        width: "260px",
                        background: "rgba(255, 255, 255, 0.97)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        borderRadius: "1.25rem",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(212,175,55,0.12), 0 0 0 1px rgba(212,175,55,0.15)",
                        padding: "0.5rem",
                        opacity: rentalsDropdownOpen ? 1 : 0,
                        pointerEvents: rentalsDropdownOpen ? "auto" : "none",
                        transform: rentalsDropdownOpen
                          ? "translateX(-50%) translateY(0) scale(1)"
                          : "translateX(-50%) translateY(-8px) scale(0.97)",
                        transition: "opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                        zIndex: 200,
                      }}
                    >
                      {/* Arrow pointer */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-6px",
                          left: "50%",
                          transform: "translateX(-50%) rotate(45deg)",
                          width: "12px",
                          height: "12px",
                          background: "rgba(255,255,255,0.97)",
                          border: "1px solid rgba(212,175,55,0.2)",
                          borderBottom: "none",
                          borderRight: "none",
                        }}
                      />
                      <div
                        style={{
                          padding: "0.4rem 0.75rem 0.5rem",
                          borderBottom: "1px solid rgba(212,175,55,0.12)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <span style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "0.55rem",
                          fontWeight: 800,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "#D4AF37",
                        }}>Browse by Category</span>
                      </div>
                      {rentalSubItems.map((sub, i) => (
                        <button
                          key={sub.label}
                          onClick={() => handleRentalSubClick(sub.categorySlug)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            width: "100%",
                            padding: "0.65rem 0.75rem",
                            borderRadius: "0.875rem",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.18s ease",
                            opacity: rentalsDropdownOpen ? 1 : 0,
                            transform: rentalsDropdownOpen ? "translateX(0)" : "translateX(-6px)",
                            transitionDelay: rentalsDropdownOpen ? `${i * 35}ms` : "0ms",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(212,175,55,0.07)";
                            const icon = e.currentTarget.querySelector(".sub-icon") as HTMLElement;
                            if (icon) { icon.style.background = "#D4AF37"; icon.style.color = "#0f0f0f"; }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            const icon = e.currentTarget.querySelector(".sub-icon") as HTMLElement;
                            if (icon) { icon.style.background = "rgba(212,175,55,0.1)"; icon.style.color = "#D4AF37"; }
                          }}
                        >
                          <div
                            className="sub-icon"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "0.625rem",
                              background: "rgba(212,175,55,0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#D4AF37",
                              flexShrink: 0,
                              transition: "all 0.18s ease",
                            }}
                          >
                            {sub.icon}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                            <span style={{
                              fontFamily: "var(--font-heading)",
                              fontWeight: 800,
                              fontSize: "0.72rem",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              color: "#0f0f0f",
                            }}>{sub.label}</span>
                            <span style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "0.6rem",
                              color: "#888",
                              lineHeight: 1.3,
                            }}>{sub.desc}</span>
                          </div>
                        </button>
                      ))}
                      <div style={{ padding: "0.4rem 0.75rem", borderTop: "1px solid rgba(212,175,55,0.12)", marginTop: "0.25rem" }}>
                        <button
                          onClick={() => handleRentalSubClick("all")}
                          style={{
                            width: "100%",
                            padding: "0.55rem",
                            background: "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.06))",
                            border: "1px solid rgba(212,175,55,0.25)",
                            borderRadius: "0.75rem",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 800,
                            fontSize: "0.6rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "#D4AF37",
                            cursor: "pointer",
                            transition: "all 0.18s ease",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,175,55,0.2)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.06))"; }}
                        >
                          View All Rentals →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={(e) => {
                    if (l.label === "About") {
                      e.preventDefault();
                      onOpenAbout();
                    } else if (l.label === "Contact") {
                      e.preventDefault();
                      onOpenContact();
                    }
                  }}
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: (scrolled || !isHome) ? (isEvening ? "rgba(255,255,255,0.9)" : "#0f0f0f") : "rgba(255,255,255,0.9)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                    padding: "0.25rem 0",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#D4AF37")}
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color = scrolled
                      ? "#0f0f0f"
                      : "rgba(255,255,255,0.9)")
                  }
                >
                  {l.label}
                </a>
              );
            })}
          </nav>

          {/* DESKTOP CTAs */}
          <div
            className="hidden sm:flex"
            style={{ alignItems: "center", gap: "1rem", flexShrink: 0 }}
          >
            <a
              href="tel:17577493407"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.75rem",
                color: scrolled ? "#0f0f0f" : "rgba(255,255,255,0.9)",
                textDecoration: "none",
                transition: "color 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              <Phone size={14} color="#D4AF37" />
              (757) 749-3407
            </a>
            {/* Ambient Theme Toggler */}
            <button
              onClick={toggleTheme}
              style={{
                background: isEvening ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
                border: "1px solid",
                borderColor: (scrolled || !isHome) ? (isEvening ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)") : "rgba(255, 255, 255, 0.2)",
                borderRadius: "9999px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                color: isEvening ? "#D4AF37" : ((scrolled || !isHome) ? "#0f0f0f" : "#ffffff"),
              }}
              title={isEvening ? "Switch to Daytime Warmth" : "Switch to Evening Elegance"}
            >
              {isEvening ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="btn-primary btn-press" onClick={onOpenQuote} style={{ fontSize: "0.65rem", padding: "0.65rem 1.4rem" }}>
              Book & Reserve
            </button>
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            className="lg:hidden flex items-center justify-center"
            onClick={() => setOpen((v) => !v)}
            style={{
              background: "transparent",
              border: "none",
              color: (scrolled || !isHome) ? (isEvening ? "rgba(255,255,255,0.9)" : "#0f0f0f") : "#ffffff",
              cursor: "pointer",
              padding: "0.5rem",
              zIndex: 1100,
            }}
            aria-label="Toggle menu"
          >
            <span style={{ display: open ? "inline-flex" : "none" }}><X size={24} /></span>
            <span style={{ display: open ? "none" : "inline-flex" }}><Menu size={24} /></span>
          </button>
        </div>
      </header>

      {/* ---- MOBILE DRAWER ---- */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1100,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: isEvening 
              ? "radial-gradient(circle at top right, rgba(212, 175, 55, 0.15), rgba(10, 10, 10, 0.9))" 
              : "radial-gradient(circle at top right, rgba(212, 175, 55, 0.08), rgba(0, 0, 0, 0.75))",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            opacity: open ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Drawer panel */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            bottom: "12px",
            width: "min(310px, 85vw)",
            background: isEvening
              ? "repeating-linear-gradient(45deg, rgba(212, 175, 55, 0.015) 0px, rgba(212, 175, 55, 0.015) 2px, transparent 2px, transparent 10px), linear-gradient(135deg, rgba(22, 22, 22, 0.96), rgba(15, 15, 15, 0.99))"
              : "repeating-linear-gradient(45deg, rgba(212, 175, 55, 0.02) 0px, rgba(212, 175, 55, 0.02) 2px, transparent 2px, transparent 10px), linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 248, 248, 0.99))",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(212, 175, 55, 0.25)",
            borderRadius: "1.5rem",
            boxShadow: isEvening
              ? "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.15)"
              : "0 24px 60px rgba(0, 0, 0, 0.12), 0 0 20px rgba(212, 175, 55, 0.06)",
            transform: open ? "translateX(0)" : "translateX(-115%)",
            transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.5s, border-color 0.5s",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              padding: "1.25rem 1rem",
              borderBottom: "1px solid var(--border-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "transparent",
            }}
          >
            {/* Elegant Circle Brand Logo Wrapper */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  background: isEvening ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                  border: "1px solid #D4AF37",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(212, 175, 55, 0.15)",
                }}
              >
                <img
                  src="/images/pinstripes-logo.png?v=20260623"
                  alt="Pinstripes Logo"
                  style={{
                    height: "44px",
                    width: "44px",
                    objectFit: "contain",
                    borderRadius: "50%",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.95rem",
                    fontWeight: 900,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    background: "linear-gradient(135deg, #D4AF37 0%, #f5e8a0 50%, #D4AF37 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Pinstripes
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                  }}
                >
                  Event Concierge
                </span>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(212, 175, 55, 0.08)",
                border: "1px solid rgba(212, 175, 55, 0.2)",
                borderRadius: "50%",
                padding: "0.5rem",
                cursor: "pointer",
                color: "#D4AF37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212, 175, 55, 0.18)";
                e.currentTarget.style.transform = "rotate(90deg) scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(212, 175, 55, 0.08)";
                e.currentTarget.style.transform = "";
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Nav Links */}
          <nav style={{ flex: 1, padding: "1.25rem 0", overflowY: "auto" }}>
            {links.map((l, i) => {
              if (l.label === "Rentals") {
                return (
                  <div key={l.label} style={{ margin: "0.35rem 0.85rem" }}>
                    {/* Rentals toggle row */}
                    <button
                      onClick={() => setMobileRentalsOpen((v) => !v)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.85rem",
                        width: "100%",
                        padding: "0.85rem 1.25rem",
                        borderRadius: "1rem",
                        border: "1px solid transparent",
                        background: mobileRentalsOpen
                          ? (isEvening ? "rgba(212,175,55,0.06)" : "rgba(212,175,55,0.05)")
                          : "transparent",
                        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transform: open ? "translateX(0) scale(1)" : "translateX(-24px) scale(0.92)",
                        opacity: open ? 1 : 0,
                        transitionDelay: open ? `${i * 50}ms` : "0ms",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.65rem", color: "#D4AF37", opacity: 0.8, width: "16px" }}>
                        {l.num}
                      </span>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: isEvening ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)", flexShrink: 0 }}>
                        <Compass size={16} />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.1rem", textAlign: "left" }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-primary)" }}>
                          {l.label}
                        </span>
                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "0.58rem", color: "var(--text-secondary)" }}>
                          {l.desc}
                        </span>
                      </div>
                      <ChevronDown
                        size={14}
                        color="#D4AF37"
                        style={{ transition: "transform 0.25s ease", transform: mobileRentalsOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
                      />
                    </button>

                    {/* Mobile Sub-items */}
                    <div
                      style={{
                        overflow: "hidden",
                        maxHeight: mobileRentalsOpen ? "500px" : "0px",
                        transition: "max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      <div style={{ padding: "0.25rem 0 0.5rem 2.5rem", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                        {rentalSubItems.map((sub) => (
                          <button
                            key={sub.label}
                            onClick={() => handleRentalSubClick(sub.categorySlug)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.65rem",
                              padding: "0.6rem 0.75rem",
                              borderRadius: "0.75rem",
                              background: "transparent",
                              border: "1px solid transparent",
                              cursor: "pointer",
                              textAlign: "left",
                              width: "100%",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = isEvening ? "rgba(212,175,55,0.06)" : "rgba(212,175,55,0.05)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                          >
                            <div style={{ width: "28px", height: "28px", borderRadius: "0.5rem", background: "rgba(212,175,55,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37", flexShrink: 0 }}>
                              {sub.icon}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.05rem" }}>
                              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.68rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-primary)" }}>{sub.label}</span>
                              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.55rem", color: "var(--text-secondary)" }}>{sub.desc}</span>
                            </div>
                          </button>
                        ))}
                        <button
                          onClick={() => handleRentalSubClick("all")}
                          style={{ padding: "0.5rem 0.75rem", marginTop: "0.15rem", borderRadius: "0.625rem", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#D4AF37", cursor: "pointer", width: "100%", transition: "all 0.2s ease" }}
                        >
                          View All Rentals →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={(e) => {
                    setOpen(false);
                    if (l.label === "About") {
                      e.preventDefault();
                      onOpenAbout();
                    } else if (l.label === "Contact") {
                      e.preventDefault();
                      onOpenContact();
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    padding: "0.85rem 1.25rem",
                    margin: "0.35rem 0.85rem",
                    borderRadius: "1rem",
                    textDecoration: "none",
                    border: "1px solid transparent",
                    background: "transparent",
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: open ? "translateX(0) scale(1)" : "translateX(-24px) scale(0.92)",
                    opacity: open ? 1 : 0,
                    transitionDelay: open ? `${i * 50}ms` : "0ms",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = isEvening ? "rgba(212, 175, 55, 0.06)" : "rgba(212, 175, 55, 0.05)";
                    el.style.borderColor = "rgba(212, 175, 55, 0.2)";
                    el.style.paddingLeft = "1.5rem";
                    
                    const numSpan = el.querySelector(".nav-num") as HTMLElement;
                    if (numSpan) numSpan.style.color = "#ffffff";
                    
                    const iconBox = el.querySelector(".nav-icon-box") as HTMLElement;
                    if (iconBox) {
                      iconBox.style.background = "#D4AF37";
                      iconBox.style.color = "#0f0f0f";
                      iconBox.style.transform = "scale(1.1) rotate(5deg)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "transparent";
                    el.style.borderColor = "transparent";
                    el.style.paddingLeft = "1.25rem";
                    
                    const numSpan = el.querySelector(".nav-num") as HTMLElement;
                    if (numSpan) numSpan.style.color = "#D4AF37";
                    
                    const iconBox = el.querySelector(".nav-icon-box") as HTMLElement;
                    if (iconBox) {
                      iconBox.style.background = isEvening ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)";
                      iconBox.style.color = "var(--text-primary)";
                      iconBox.style.transform = "";
                    }
                  }}
                >
                  {/* Glowing index number */}
                  <span
                    className="nav-num"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: "0.65rem",
                      color: "#D4AF37",
                      opacity: 0.8,
                      width: "16px",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {l.num}
                  </span>

                  {/* Icon Wrapper */}
                  <div
                    className="nav-icon-box"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: isEvening ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-primary)",
                      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {renderIcon(l.label, 16)}
                  </div>

                  {/* Label & Description */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--text-primary)",
                      }}
                    >
                      {l.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        fontSize: "0.58rem",
                        color: "var(--text-secondary)",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {l.desc}
                    </span>
                  </div>
                </a>
              );
            })}
          </nav>

          {/* Hampton Roads Rain-Check Weather Guarantee Shield */}
          <div
            style={{
              margin: "0.5rem 0.85rem",
              padding: "0.95rem",
              background: isEvening
                ? "linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(20, 20, 20, 0.5) 100%)"
                : "linear-gradient(135deg, rgba(212, 175, 55, 0.04) 0%, rgba(255, 255, 255, 0.7) 100%)",
              border: "1px solid rgba(212, 175, 55, 0.22)",
              borderRadius: "1.25rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              transform: open ? "translateY(0)" : "translateY(16px)",
              opacity: open ? 1 : 0,
              transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "320ms",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(212, 175, 55, 0.12)",
                border: "1px solid rgba(212, 175, 55, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D4AF37",
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#D4AF37",
                }}
              >
                Rain-Check Guarantee
              </span>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.58rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.3,
                  fontWeight: 500,
                }}
              >
                100% Free date shifts & weather protection for all Hampton Roads rentals.
              </p>
            </div>
          </div>

          {/* Overhauled Dispatcher Status Widget */}
          <div
            style={{
              margin: "0.5rem 0.85rem",
              padding: "0.95rem",
              background: isEvening ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
              border: "1px solid var(--border-primary)",
              borderRadius: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              transform: open ? "translateY(0)" : "translateY(16px)",
              opacity: open ? 1 : 0,
              transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "360ms",
            }}
          >
            {/* Status pulsing */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#22c55e",
                }}
              >
                Dispatcher Online
              </span>
            </div>
            
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.62rem",
                color: "var(--text-secondary)",
                lineHeight: 1.35,
                fontWeight: 500,
              }}
            >
              Live event coordination active from <strong style={{ color: "var(--text-primary)" }}>7:00 AM – 7:00 PM</strong> daily.
            </p>

            {/* Quick region pin */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <MapPin size={11} color="#D4AF37" style={{ flexShrink: 0 }} />
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.25,
                  fontWeight: 500,
                }}
              >
                Serving Norfolk, VA Beach, Chesapeake, Suffolk & surrounding.
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div
            style={{
              padding: "1rem",
              borderTop: "1px solid var(--border-primary)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              background: "transparent",
              transform: open ? "translateY(0)" : "translateY(16px)",
              opacity: open ? 1 : 0,
              transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "400ms",
            }}
          >
            {/* Social Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <a
                href="https://www.instagram.com/socialkon10_cre8tive/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  padding: "0.65rem 0.5rem",
                  borderRadius: "0.875rem",
                  border: "1px solid var(--border-secondary)",
                  background: isEvening ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "0.62rem",
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#D4AF37";
                  e.currentTarget.style.color = "#D4AF37";
                  e.currentTarget.style.background = "rgba(212, 175, 55, 0.05)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-secondary)";
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = isEvening ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)";
                  e.currentTarget.style.transform = "";
                }}
              >
                <span style={{ fontSize: "0.8rem" }}>📸</span>
                Instagram
              </a>
              <a
                href="tel:17577493407"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  padding: "0.65rem 0.5rem",
                  borderRadius: "0.875rem",
                  border: "1px solid var(--border-secondary)",
                  background: isEvening ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "0.62rem",
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#D4AF37";
                  e.currentTarget.style.color = "#D4AF37";
                  e.currentTarget.style.background = "rgba(212, 175, 55, 0.05)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-secondary)";
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = isEvening ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)";
                  e.currentTarget.style.transform = "";
                }}
              >
                <Phone size={11} color="#D4AF37" />
                Call Direct
              </a>
            </div>

            {/* Mobile Theme Toggler */}
            <button
              onClick={toggleTheme}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.5rem 0.85rem",
                background: "rgba(212, 175, 55, 0.08)",
                border: "1px solid rgba(212, 175, 55, 0.2)",
                borderRadius: "9999px",
                color: "#D4AF37",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ display: isEvening ? "inline-flex" : "none", alignItems: "center", gap: "0.5rem" }}>
                <Sun size={13} />
                Daytime Warmth
              </span>
              <span style={{ display: isEvening ? "none" : "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <Moon size={13} />
                Evening Ambient Mode
              </span>
            </button>
            
            <button
              className="btn-primary btn-press"
              onClick={() => {
                setOpen(false);
                onOpenQuote();
              }}
              style={{
                width: "100%",
                padding: "0.85rem",
                fontSize: "0.68rem",
                borderRadius: "9999px",
                letterSpacing: "0.12em",
                boxShadow: "0 8px 24px rgba(212,175,55,0.25)",
              }}
            >
              Book & Reserve
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

