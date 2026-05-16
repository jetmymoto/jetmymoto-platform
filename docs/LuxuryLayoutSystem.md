# Luxury Layout System

## Core Philosophy
This system governs the visual and experiential presentation of JetMyMoto. We are not a SaaS dashboard or a commodity booking engine. We are a luxury travel experience. Every pixel must communicate curation, heritage, and focus.

**Rule Zero:** When in doubt, remove it. 

---

## 1. Page Structure Rules
Every inspiration page (Routes, Destinations) must follow this cinematic progression:

1. **Hero (`<CinematicHero />`)**
   - Dominates the viewport (min-h: 700px / 100vh).
   - Ultra-wide 21:9 or full-bleed 16:9 composition.
   - Minimal text: Eyebrow (gold, tracked out), Title (Serif, massive), Subtitle (clean, minimal).
   - Dark gradient overlay to ensure text legibility without muddying the image.
   
2. **Experience (`<ExperienceBlock />`)**
   - High whitespace, centered text.
   - Evocative, atmospheric paragraph.
   - Pure metrics separated by gold diamonds (`♦`). No "Distance:" labels.

3. **Visual Strip (`<VisualStrip />`)**
   - A curated gallery of exactly 3 or maximum 5 items (POIs, Highlights).
   - Editorial aspect ratios (4:5 portrait).
   - Uses hover-reveal mechanics (grayscale to color) to encourage interaction without UI clutter.

4. **Itinerary / Context**
   - Minimal timeline or clean listing of connected entities (e.g., Routes on a Destination page).

5. **Curated Block (`<CuratedFleet />`)**
   - The "Trust" block.
   - Hard limit of 3 items. Never show an infinite grid.
   - Focus on "Why this works" narrative over technical specs.
   - **NO PRICING** on inspiration surfaces. Pricing belongs in the transaction funnel.

6. **CTA (`<CinematicCTA />`)**
   - Massive whitespace, centered.
   - Single, powerful action (e.g., "Start Your Journey").
   - Ghost button with gold hover states.

---

## 2. Hard Constraints

- **The Power of Three:** Max 3 items in fleet displays, feature highlights, and visual strips. 
- **Typography:** 
  - Headings: **Serif** (`font-serif`).
  - Body/Utility: **Sans-Serif** (clean, light tracking).
  - Eyebrows/Tags: Uppercase, `[10px]`, tracking `0.3em` (`tracking-[0.3em]`).
- **Color Palette:**
  - Background: Deep blacks (`#050505`, `#111111`).
  - Text: Whites and muted zincs (`text-white`, `text-zinc-400`).
  - Accents: Refined Gold (`#CDA755`). 
  - **Rule:** Gold is for *micro-accents only* (hover borders, thin lines, diamonds, tiny text). Never use as large background fills or thick borders.
- **Labels & Precision:** No unnecessary labels ("Distance", "Duration"). No decimals.

---

## 3. Motion Rules

- **Engine:** `framer-motion` (`<FadeIn />` wrapper).
- **Behavior:** Fade + Rise (`opacity: 0 -> 1`, `y: 25 -> 0`).
- **Timing:** Duration `0.8s` (800ms) with staggered delays (`0.15s` increments).
- **Easing:** Cinematic custom ease `[0.16, 1, 0.3, 1]`.
- **Constraint:** NO bounce, NO spring physics, NO chaos. Everything moves like slow, intentional breathing.
