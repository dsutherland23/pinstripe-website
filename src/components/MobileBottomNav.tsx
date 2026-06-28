"use client";

import React, { useState, useEffect } from "react";
import { Home, ShoppingBag, Calendar, LayoutGrid, User } from "lucide-react";

interface MobileBottomNavProps {
  onOpenQuote: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  plannerEnabled?: boolean;
}

export default function MobileBottomNav({
  onOpenQuote,
  onOpenAbout,
  onOpenContact,
  plannerEnabled = false,
}: MobileBottomNavProps) {
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    // Sync active state based on scroll position or pathname
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        const rentalsEl = document.getElementById("rentals");
        const simulatorEl = document.getElementById("layout-simulator");
        const scrollPos = window.scrollY + 200;

        if (simulatorEl && scrollPos >= simulatorEl.offsetTop) {
          setActiveTab("planner");
        } else if (rentalsEl && scrollPos >= rentalsEl.offsetTop) {
          setActiveTab("rentals");
        } else {
          setActiveTab("home");
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleScrollTo = (id: string, tabName: string) => {
    setActiveTab(tabName);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[900] lg:hidden"
      style={{
        background: "rgba(10, 10, 12, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1.5px solid rgba(212, 175, 55, 0.3)",
        boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.6)",
        height: "calc(4.8rem + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        transition: "all 0.4s ease",
      }}
    >
      <div className="relative flex items-center justify-around px-4" style={{ height: "4.8rem" }}>
        {/* HOME TAB */}
        <button
          onClick={() => {
            setActiveTab("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex flex-col items-center justify-center gap-1 bg-none border-none cursor-pointer active:scale-90 transition-all duration-200"
          style={{ 
            width: "60px", 
            background: "none", 
            border: "none",
            color: activeTab === "home" ? "#D4AF37" : "rgba(255, 255, 255, 0.55)"
          }}
        >
          <Home size={18} style={{ stroke: activeTab === "home" ? "#D4AF37" : "rgba(255, 255, 255, 0.7)" }} />
          <span 
            className="font-heading text-[0.58rem] font-extrabold uppercase tracking-wider transition-colors duration-200"
            style={{ color: activeTab === "home" ? "#D4AF37" : "rgba(255, 255, 255, 0.55)" }}
          >
            Home
          </span>
        </button>

        {/* RENTALS CATALOG TAB */}
        <button
          onClick={() => handleScrollTo("rentals", "rentals")}
          className="flex flex-col items-center justify-center gap-1 bg-none border-none cursor-pointer active:scale-90 transition-all duration-200"
          style={{ 
            width: "60px", 
            background: "none", 
            border: "none",
            color: activeTab === "rentals" ? "#D4AF37" : "rgba(255, 255, 255, 0.55)"
          }}
        >
          <ShoppingBag size={18} style={{ stroke: activeTab === "rentals" ? "#D4AF37" : "rgba(255, 255, 255, 0.7)" }} />
          <span 
            className="font-heading text-[0.58rem] font-extrabold uppercase tracking-wider transition-colors duration-200"
            style={{ color: activeTab === "rentals" ? "#D4AF37" : "rgba(255, 255, 255, 0.55)" }}
          >
            Rentals
          </span>
        </button>

        {/* QUOTE TAB */}
        <button
          onClick={() => {
            setActiveTab("quote");
            onOpenQuote();
          }}
          className="flex flex-col items-center justify-center gap-1 bg-none border-none cursor-pointer active:scale-90 transition-all duration-200"
          style={{ 
            width: "60px", 
            background: "none", 
            border: "none",
            color: activeTab === "quote" ? "#D4AF37" : "rgba(255, 255, 255, 0.55)"
          }}
        >
          <Calendar size={18} style={{ stroke: activeTab === "quote" ? "#D4AF37" : "rgba(255, 255, 255, 0.7)" }} />
          <span 
            className="font-heading text-[0.58rem] font-extrabold uppercase tracking-wider transition-colors duration-200"
            style={{ color: activeTab === "quote" ? "#D4AF37" : "rgba(255, 255, 255, 0.55)" }}
          >
            Quote
          </span>
        </button>

        {/* PLANNER TAB */}
        {plannerEnabled && (
          <button
            onClick={() => handleScrollTo("layout-simulator", "planner")}
            className="flex flex-col items-center justify-center gap-1 bg-none border-none cursor-pointer active:scale-90 transition-all duration-200"
            style={{ 
              width: "60px", 
              background: "none", 
              border: "none",
              color: activeTab === "planner" ? "#D4AF37" : "rgba(255, 255, 255, 0.55)"
            }}
          >
            <LayoutGrid size={18} style={{ stroke: activeTab === "planner" ? "#D4AF37" : "rgba(255, 255, 255, 0.7)" }} />
            <span 
              className="font-heading text-[0.58rem] font-extrabold uppercase tracking-wider transition-colors duration-200"
              style={{ color: activeTab === "planner" ? "#D4AF37" : "rgba(255, 255, 255, 0.55)" }}
            >
              Planner
            </span>
          </button>
        )}

        {/* ABOUT / CONTACT TAB */}
        <button
          onClick={() => {
            setActiveTab("about");
            onOpenAbout();
          }}
          className="flex flex-col items-center justify-center gap-1 bg-none border-none cursor-pointer active:scale-90 transition-all duration-200"
          style={{ 
            width: "60px", 
            background: "none", 
            border: "none",
            color: activeTab === "about" ? "#D4AF37" : "rgba(255, 255, 255, 0.55)"
          }}
        >
          <User size={18} style={{ stroke: activeTab === "about" ? "#D4AF37" : "rgba(255, 255, 255, 0.7)" }} />
          <span 
            className="font-heading text-[0.58rem] font-extrabold uppercase tracking-wider transition-colors duration-200"
            style={{ color: activeTab === "about" ? "#D4AF37" : "rgba(255, 255, 255, 0.55)" }}
          >
            About
          </span>
        </button>
      </div>
    </div>
  );
}
