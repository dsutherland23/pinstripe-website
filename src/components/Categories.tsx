"use client";

import React from "react";
import {
  Castle, Waves, Tent, Armchair, Snowflake, Camera,
  Zap, Speaker, Heart, Grid2X2, Popcorn, Candy, ChefHat,
} from "lucide-react";

interface Category {
  name: string;
  icon: string;
  featured: boolean;
}

interface CategoriesProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (name: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  castle:  <Castle size={22} />,
  water:   <Waves size={22} />,
  tent:    <Tent size={22} />,
  table:   <ChefHat size={22} />,
  chair:   <Armchair size={22} />,
  popcorn: <Popcorn size={22} />,
  candy:   <Candy size={22} />,
  ice:     <Snowflake size={22} />,
  camera:  <Camera size={22} />,
  bolt:    <Zap size={22} />,
  speaker: <Speaker size={22} />,
  heart:   <Heart size={22} />,
};

export default function Categories({ categories, activeCategory, onSelectCategory }: CategoriesProps) {
  return (
    <section
      style={{
        padding: "4rem 0 2.5rem",
        background: "var(--bg-primary)",
        borderBottom: "1px solid var(--border-primary)",
        transition: "all 0.5s ease",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.25rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span className="section-label">What We Offer</span>
          <h2 className="section-title text-gradient">Browse by Category</h2>
        </div>

        {/* Scroll strip */}
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: "0.75rem",
            overflowX: "auto",
            paddingBottom: "0.75rem",
            paddingLeft: "0.25rem",
            paddingRight: "0.25rem",
            scrollSnapType: "x mandatory",
          }}
        >
          {/* All pill */}
          {[{ name: "All", icon: "" }, ...categories].map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  if (typeof document !== "undefined" && (document as any).startViewTransition) {
                    (document as any).startViewTransition(() => {
                      onSelectCategory(cat.name);
                    });
                  } else {
                    onSelectCategory(cat.name);
                  }
                }}
                className={`cat-pill${isActive ? " active" : ""}`}
                style={{ scrollSnapAlign: "start" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cat.name === "All" ? <Grid2X2 size={22} /> : (iconMap[cat.icon] ?? <Tent size={22} />)}
                </div>
                <span className="cat-label">{cat.name === "All" ? "Show All" : cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
