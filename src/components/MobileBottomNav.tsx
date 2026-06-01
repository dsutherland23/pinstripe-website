"use client";

import React from "react";
import { Home, ShoppingBag, Calendar, LayoutGrid, User } from "lucide-react";

interface MobileBottomNavProps {
  onOpenQuote: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
}

export default function MobileBottomNav({
  onOpenQuote,
  onOpenAbout,
  onOpenContact,
}: MobileBottomNavProps) {
  const handleScrollTo = (id: string) => {
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
        background: "var(--navbar-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1.5px solid var(--border-primary)",
        boxShadow: "0 -4px 24px var(--shadow-color)",
        height: "4.5rem",
        transition: "all 0.5s ease",
      }}
    >
      <div className="relative flex h-full items-center justify-around px-4">
        {/* HOME TAB */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex flex-col items-center justify-center gap-1 bg-none border-none cursor-pointer text-[var(--text-secondary)] opacity-85 active:scale-95 transition-all"
          style={{ width: "60px", background: "none", border: "none" }}
        >
          <Home size={18} />
          <span className="font-heading text-[0.6rem] font-bold uppercase tracking-wider">Home</span>
        </button>

        {/* RENTALS CATALOG TAB */}
        <button
          onClick={() => handleScrollTo("rentals")}
          className="flex flex-col items-center justify-center gap-1 bg-none border-none cursor-pointer text-[var(--text-secondary)] opacity-85 active:scale-95 transition-all"
          style={{ width: "60px", background: "none", border: "none" }}
        >
          <ShoppingBag size={18} />
          <span className="font-heading text-[0.6rem] font-bold uppercase tracking-wider">Rentals</span>
        </button>

        {/* FLOATING CENTER QUOTE CTA BUTTON */}
        <div className="relative" style={{ width: "60px", height: "60px" }}>
          <button
            onClick={onOpenQuote}
            className="absolute -top-7 left-1/2 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37] text-[#0f0f0f] shadow-[0_6px_20px_rgba(212,175,55,0.4)] transition-all hover:bg-[#bda030] active:scale-95"
            style={{
              border: "4px solid var(--card-bg)",
              transition: "border-color 0.5s ease, background-color 0.2s, transform 0.1s",
            }}
            aria-label="Get Quote"
          >
            <Calendar size={22} strokeWidth={2.5} />
          </button>
          <span className="absolute bottom-0 left-0 right-0 text-center font-heading text-[0.6rem] font-bold uppercase tracking-wider text-[#D4AF37] pointer-events-none">
            Quote
          </span>
        </div>

        {/* PLANNER TAB */}
        <button
          onClick={() => handleScrollTo("layout-simulator")}
          className="flex flex-col items-center justify-center gap-1 bg-none border-none cursor-pointer text-[var(--text-secondary)] opacity-85 active:scale-95 transition-all"
          style={{ width: "60px", background: "none", border: "none" }}
        >
          <LayoutGrid size={18} />
          <span className="font-heading text-[0.6rem] font-bold uppercase tracking-wider">Planner</span>
        </button>

        {/* ABOUT / CONTACT TAB */}
        <button
          onClick={onOpenAbout}
          className="flex flex-col items-center justify-center gap-1 bg-none border-none cursor-pointer text-[var(--text-secondary)] opacity-85 active:scale-95 transition-all"
          style={{ width: "60px", background: "none", border: "none" }}
        >
          <User size={18} />
          <span className="font-heading text-[0.6rem] font-bold uppercase tracking-wider">About</span>
        </button>
      </div>
    </div>
  );
}
