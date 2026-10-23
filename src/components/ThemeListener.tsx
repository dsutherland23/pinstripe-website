"use client";

import { useEffect } from "react";
import { applyAccentTheme } from "@/lib/theme";

export function ThemeListener({ initialColor }: { initialColor?: string }) {
  useEffect(() => {
    // 1. Try immediate restoration from localStorage
    try {
      const cached = localStorage.getItem("pinstripes_accent_color");
      if (cached) {
        applyAccentTheme(cached);
      } else if (initialColor) {
        applyAccentTheme(initialColor);
      }
    } catch {
      if (initialColor) applyAccentTheme(initialColor);
    }

    // 2. Fetch live settings from server to sync any updates made in admin
    fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.accentColor) {
          applyAccentTheme(data.accentColor);
        }
      })
      .catch(() => {});

    // 3. Listen for in-app color change events (from Admin preview/saves)
    const handleThemeChange = (e: CustomEvent<{ color: string }>) => {
      if (e.detail?.color) {
        applyAccentTheme(e.detail.color);
      }
    };

    // 4. Listen for storage changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pinstripes_accent_color" && e.newValue) {
        applyAccentTheme(e.newValue);
      }
    };

    window.addEventListener("site-accent-color-change" as any, handleThemeChange as EventListener);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("site-accent-color-change" as any, handleThemeChange as EventListener);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [initialColor]);

  return null;
}
