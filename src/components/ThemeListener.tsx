"use client";

import { useEffect } from "react";
import { generateAccentVariables } from "@/lib/theme";

export function ThemeListener({ initialColor }: { initialColor?: string }) {
  useEffect(() => {
    function applyColor(color: string) {
      const vars = generateAccentVariables(color);
      const root = document.documentElement;
      root.style.setProperty("--accent-color", vars.accent);
      root.style.setProperty("--accent-hover", vars.hover);
      root.style.setProperty("--accent-light", vars.light);
      root.style.setProperty("--accent-rgb", vars.rgb);
      root.style.setProperty("--accent-glow", vars.glow);
      root.style.setProperty("--accent-shadow", vars.shadow);
      root.style.setProperty("--color-gold", vars.accent);
      root.style.setProperty("--color-gold-hover", vars.hover);
      root.style.setProperty("--color-gold-light", vars.light);
      root.style.setProperty("--color-accent", vars.accent);
    }

    if (initialColor) {
      applyColor(initialColor);
    }

    // Custom event to allow instant preview from Admin without page refresh
    const handleThemeChange = (e: CustomEvent<{ color: string }>) => {
      if (e.detail?.color) {
        applyColor(e.detail.color);
      }
    };

    window.addEventListener("site-accent-color-change" as any, handleThemeChange as EventListener);
    return () => {
      window.removeEventListener("site-accent-color-change" as any, handleThemeChange as EventListener);
    };
  }, [initialColor]);

  return null;
}
