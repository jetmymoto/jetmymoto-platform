/**
 * Brand Token Foundation — JetMyMoto / RiderAtlas
 *
 * Single source of truth for all visual primitives.
 * Components MUST import from here instead of hardcoding hex values.
 *
 * Paradigm: "Hyper-Tactile & Mechanical Brutalist"
 */

// ── Color Palette ────────────────────────────────────────
export const COLORS = {
  // Primary accent — the amber ignition thread
  AMBER: "#CDA755",
  AMBER_GLOW: "rgba(205,167,85,0.12)",
  AMBER_RULE: "rgba(205,167,85,0.25)",

  // Copper — secondary warmth accent
  COPPER: "#A76330",

  // Surface hierarchy — darkest to lightest
  OBSIDIAN: "#050505",
  MATTE: "#101010",
  SURFACE_BASE: "#050505",
  SURFACE_RAISED: "#0A0A0A",
  SURFACE_CARD: "#121212",
  SURFACE_ELEVATED: "#1E1E1E",
  SURFACE_MATTE: "#181818",

  // Light text / editorial contrast
  CHALK: "#F5F1E8",
  WHITE: "#FFFFFF",
};

// ── Shadow Presets ───────────────────────────────────────
export const SHADOWS = {
  panel: "0 2px 8px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4)",
  insetHardware:
    "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.6)",
  cardBevel:
    "0 1px 0 rgba(255,255,255,0.03), 0 4px 16px rgba(0,0,0,0.5)",
  amberGlow:
    "0 0 20px rgba(205,167,85,0.25), 0 0 60px rgba(205,167,85,0.08)",
};

// ── Aspect Ratios ────────────────────────────────────────
export const ASPECT_RATIOS = {
  HERO: "16 / 10",
  CARD: "4 / 4.7",
  DEPLOYMENT: "16 / 10",
  BANNER: "21 / 9",
  SQUARE: "1 / 1",
};

// ── Surface Layer Tailwind Classes ───────────────────────
export const SURFACE_LAYERS = {
  base: "bg-surface-base",
  raised: "bg-surface-raised",
  card: "bg-surface-card",
  elevated: "bg-surface-elevated",
  matte: "bg-surface-matte",
};

// ── Typography Scale (Tailwind class references) ─────────
export const TYPE = {
  SANS: "font-sans",
  SERIF: "font-serif",
  MONO: "font-mono",
  DISPLAY: "font-display",
  TABULAR: "tabular-nums",
};
