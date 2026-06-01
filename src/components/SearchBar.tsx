"use client";

import React, { useState } from "react";
import { Search, Calendar, SlidersHorizontal } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string, category: string, date: string) => void;
  categories: string[];
}

export default function SearchBar({ onSearch, categories }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [date, setDate] = useState("2026-06-20"); // Pre-filled default matching your screenshot

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, category, date);
    document.getElementById("rentals")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0 1.25rem",
        position: "relative",
        zIndex: 20,
        marginTop: "-3.5rem",
        marginBottom: "0",
      }}
    >
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 md:grid-cols-[1fr_220px]"
        style={{
          background: "var(--card-bg)",
          borderRadius: "2rem",
          boxShadow: "0 24px 64px var(--shadow-color), 0 0 0 1px var(--border-primary)",
          padding: "1.5rem",
          gap: "1rem",
          transition: "all 0.5s ease",
        }}
      >
        {/* Row 1, Col 1 — Search Input */}
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            color="#D4AF37"
            style={{
              position: "absolute",
              left: "1.25rem",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            className="field"
            placeholder="Search bounce houses, water slides, tents…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              paddingLeft: "3rem",
              borderRadius: "9999px",
              background: "var(--bg-secondary)",
              border: "1.5px solid var(--border-secondary)",
              height: "3.25rem",
              transition: "all 0.3s ease",
            }}
          />
        </div>

        {/* Row 1, Col 2 — Category Select */}
        <div style={{ position: "relative" }}>
          <SlidersHorizontal
            size={15}
            color="#D4AF37"
            style={{
              position: "absolute",
              left: "1.25rem",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <select
            className="field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              paddingLeft: "2.75rem",
              paddingRight: "2rem",
              borderRadius: "9999px",
              background: "var(--bg-secondary)",
              border: "1.5px solid var(--border-secondary)",
              height: "3.25rem",
              cursor: "pointer",
              appearance: "none",
              transition: "all 0.3s ease",
            }}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2, Col 1 — Event Date */}
        <div style={{ position: "relative" }}>
          <Calendar
            size={15}
            color="#D4AF37"
            style={{
              position: "absolute",
              left: "1.25rem",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <input
            type="date"
            className="field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              paddingLeft: "2.75rem",
              borderRadius: "9999px",
              background: "var(--bg-secondary)",
              border: "1.5px solid var(--border-secondary)",
              height: "3.25rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            aria-label="Event date"
          />
        </div>

        {/* Row 2, Col 2 — Search Button */}
        <button
          type="submit"
          className="btn-dark btn-press"
          style={{
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: 800,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            height: "3.25rem",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.625rem",
          }}
        >
          <Search size={15} color="#D4AF37" strokeWidth={3} />
          Search
        </button>
      </form>
    </div>
  );
}
