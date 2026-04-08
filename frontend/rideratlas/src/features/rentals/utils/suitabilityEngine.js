/**
 * Mission-Fit Suitability Engine
 *
 * Generates SEO-optimized, highly specific 3-sentence "Suitability Reviews"
 * for every machine + airport + route combination. By explicitly injecting
 * specific terrains, hardware capabilities, and high-signal ratings, this
 * transforms programmatic pages into high-value logistical intelligence.
 */

// Mapping of hubs to their legendary routes and terrain profiles
const HUB_PROFILES = {
  MXP: { route: "Stelvio Pass", terrain: "Italian Alps", rankOffset: 0.3 },
  MUC: { route: "Grossglockner High Alpine Road", terrain: "Bavarian and Austrian Alps", rankOffset: 0.2 },
  CDG: { route: "Route Napoléon", terrain: "French Countryside", rankOffset: 0.1 },
  LAX: { route: "Pacific Coast Highway", terrain: "California Canyons", rankOffset: 0.2 },
  SFO: { route: "Yosemite Valley", terrain: "Northern Sierras", rankOffset: 0.1 },
  FCO: { route: "Amalfi Coast", terrain: "Tuscan Hills", rankOffset: 0.0 },
  BCN: { route: "Pyrenees Traverse", terrain: "Catalonian Mountains", rankOffset: 0.2 },
  DEFAULT: { route: "Regional Transits", terrain: "Local Topography", rankOffset: -0.1 }
};

// Hardware feature injection based on class
const CLASS_CAPABILITIES = {
  adventure: { 
    features: "electronic suspension and low-end torque", 
    benefit: "ground clearance and asymmetric adaptability",
    verb: "dominate"
  },
  touring: { 
    features: "advanced wind protection and integrated luggage", 
    benefit: "mile-munching comfort and extended endurance",
    verb: "conquer"
  },
  cruiser: { 
    features: "low center of gravity and visceral V-twin torque", 
    benefit: "relaxed ergonomics and highway presence",
    verb: "cruise"
  },
  sport: { 
    features: "aggressive geometry and precision braking", 
    benefit: "razor-sharp cornering and high-revving power delivery",
    verb: "carve"
  },
  DEFAULT: { 
    features: "balanced chassis and linear power delivery", 
    benefit: "reliable performance and rider confidence",
    verb: "navigate"
  }
};

// Deterministic Pseudo-Random Generator (seeded by name + code)
function getSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates the "Helpful Content" 3-sentence SEO Suitability Review
 * 
 * @param {Object} context - { machineName, category, airportCode }
 * @returns {String} The Suitability Review copy
 */
export function generateSuitabilityReview({ machineName, category, airportCode }) {
  const code = String(airportCode || "DEFAULT").toUpperCase();
  const cat = String(category || "DEFAULT").toLowerCase();
  
  const hub = HUB_PROFILES[code] || HUB_PROFILES.DEFAULT;
  const hardware = CLASS_CAPABILITIES[cat] || CLASS_CAPABILITIES.DEFAULT;
  
  // Deterministic rating between 9.2 and 9.9
  const seed = getSeed(machineName + code);
  const baseRating = 9.2 + ((seed % 100) / 200); 
  const finalRating = Math.min(9.9, Math.max(8.5, baseRating + hub.rankOffset)).toFixed(1);

  // Sentence 1: The Rating Hook (Direct SEO value)
  const sentence1 = `The ${machineName} is rated ${finalRating}/10 for the ${hub.route} due to its ${hardware.features}.`;
  
  // Sentence 2: The Logistics / Capability Bridge
  const sentence2 = `Deploying from ${code}, this ${cat === "default" ? "versatile" : cat} platform provides the exact ${hardware.benefit} required to ${hardware.verb} the ${hub.terrain}.`;
  
  // Sentence 3: The Mission Closer
  const sentence3 = `Whether executing high-altitude passes or enduring long transits, its capability ensures an uncompromised riding mission.`;

  return `${sentence1} ${sentence2} ${sentence3}`;
}
