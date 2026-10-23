export interface AccentThemeVars {
  accent: string;
  hover: string;
  light: string;
  rgb: string;
  glow: string;
  shadow: string;
}

export interface ColorPreset {
  name: string;
  hex: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: "Classic Gold", hex: "#D4AF37" },
  { name: "Royal Blue", hex: "#2563EB" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Crimson Red", hex: "#DC2626" },
  { name: "Sunset Orange", hex: "#EA580C" },
  { name: "Royal Purple", hex: "#7C3AED" },
  { name: "Rose Pink", hex: "#E11D48" },
  { name: "Ocean Teal", hex: "#0D9488" },
  { name: "Amber Warm", hex: "#D97706" },
  { name: "Sky Blue", hex: "#0284C7" },
];

export function generateAccentVariables(hex?: string): AccentThemeVars {
  const defaultHex = "#D4AF37";
  let color = (hex || defaultHex).trim();
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)) {
    color = defaultHex;
  }
  if (color.length === 4) {
    color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  // Hover shade (~15% darker)
  const hr = Math.max(0, Math.min(255, Math.round(r * 0.85)));
  const hg = Math.max(0, Math.min(255, Math.round(g * 0.85)));
  const hb = Math.max(0, Math.min(255, Math.round(b * 0.85)));
  const hover = `#${((1 << 24) + (hr << 16) + (hg << 8) + hb).toString(16).slice(1)}`;

  // Light tint (mix 65% with white)
  const lr = Math.max(0, Math.min(255, Math.round(r + (255 - r) * 0.65)));
  const lg = Math.max(0, Math.min(255, Math.round(g + (255 - g) * 0.65)));
  const lb = Math.max(0, Math.min(255, Math.round(b + (255 - b) * 0.65)));
  const light = `#${((1 << 24) + (lr << 16) + (lg << 8) + lb).toString(16).slice(1)}`;

  const rgb = `${r}, ${g}, ${b}`;
  const glow = `rgba(${rgb}, 0.2)`;
  const shadow = `rgba(${rgb}, 0.35)`;

  return {
    accent: color,
    hover,
    light,
    rgb,
    glow,
    shadow,
  };
}

export function generateThemeCss(vars: AccentThemeVars): string {
  return `:root {
  --accent-color: ${vars.accent} !important;
  --accent-hover: ${vars.hover} !important;
  --accent-light: ${vars.light} !important;
  --accent-rgb: ${vars.rgb} !important;
  --accent-glow: ${vars.glow} !important;
  --accent-shadow: ${vars.shadow} !important;
  --color-gold: ${vars.accent} !important;
  --color-gold-hover: ${vars.hover} !important;
  --color-gold-light: ${vars.light} !important;
  --color-accent: ${vars.accent} !important;
}`;
}

export function applyAccentTheme(color: string) {
  if (typeof window === "undefined" || !color) return;
  const vars = generateAccentVariables(color);
  const root = document.documentElement;

  root.style.setProperty("--accent-color", vars.accent, "important");
  root.style.setProperty("--accent-hover", vars.hover, "important");
  root.style.setProperty("--accent-light", vars.light, "important");
  root.style.setProperty("--accent-rgb", vars.rgb, "important");
  root.style.setProperty("--accent-glow", vars.glow, "important");
  root.style.setProperty("--accent-shadow", vars.shadow, "important");
  root.style.setProperty("--color-gold", vars.accent, "important");
  root.style.setProperty("--color-gold-hover", vars.hover, "important");
  root.style.setProperty("--color-gold-light", vars.light, "important");
  root.style.setProperty("--color-accent", vars.accent, "important");

  let styleEl = document.getElementById("site-accent-theme");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "site-accent-theme";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = generateThemeCss(vars);

  try {
    localStorage.setItem("pinstripes_accent_color", vars.accent);
    document.cookie = `pinstripes_accent_color=${encodeURIComponent(vars.accent)}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {}
}
