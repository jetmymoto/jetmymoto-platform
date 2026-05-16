/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg-primary)',
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
        },
        border: 'var(--border-primary)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          highlight: 'var(--accent-highlight)',
        },
        // Legacy colors - to be phased out
        jet: {
          dark: "#050505",
          obsidian: "#050505",
          card: "#121212",
          gold: "#CDA755",
          copper: "#A76330",
          matte: "#101010",
        },
        amber: {
          primary: "#CDA755",
          accent: "#CDA755",
          glow: "rgba(205,167,85,0.12)",
          rule: "rgba(205,167,85,0.25)",
        },
        chalk: "#F5F1E8",
      },
      boxShadow: {
        "inset-hardware": "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.6)",
        "card-bevel": "0 1px 0 rgba(255,255,255,0.03), 0 4px 16px rgba(0,0,0,0.5)",
        "panel": "0 2px 8px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4)",
        "amber-glow": "0 0 20px rgba(205,167,85,0.25), 0 0 60px rgba(205,167,85,0.08)",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
        "radial-gradient": "radial-gradient(circle at center, transparent 0%, transparent 60%, black 100%)",
      },
    },
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui"],
      serif: ["'Playfair Display'", "Fraunces", "Georgia", "ui-serif", "serif"],
      headline: ["'Playfair Display'", "Fraunces", "serif"],
      mono: ["'Space Mono'", "'JetBrains Mono'", "ui-monospace", "monospace"],
      display: ["'Playfair Display'", "serif"],
    },
  },
  plugins: [],
};