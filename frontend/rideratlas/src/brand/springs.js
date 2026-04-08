/**
 * Framer Motion Spring Presets — JetMyMoto / RiderAtlas
 *
 * All interactive physics constants live here.
 * Components MUST import from here instead of defining inline springs.
 *
 * Paradigm: Interactions feel like operating machined hardware —
 * heavy, precise, deliberate. NOT floaty SaaS card animations.
 */

/** Heavy press — machined toggle switch, CTA button depress */
export const hardwarePress = {
  type: "spring",
  stiffness: 600,
  damping: 25,
};

/** Mechanical hover — card lift, panel reveal, surface response */
export const mechanicalHover = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

/** Panel slide — section transitions, drawer reveal, accordion open */
export const panelSlide = {
  type: "spring",
  stiffness: 300,
  damping: 28,
};

/** Cinematic fade — page-level transitions, hero reveals */
export const cinematicFade = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

/** Stagger container — sequential children reveal in grids/lists */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/** Stagger child — individual item within a staggered container */
export const staggerChild = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: mechanicalHover,
  },
};
