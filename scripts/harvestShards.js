const fs = require("fs");
const path = require("path");

const SHARDS_FILE = path.join(__dirname, "..", "frontend", "rideratlas", "src", "core", "patriot", "data", "hubKeywordShards.js");
const OUTPUT_DIR = path.join(__dirname, "..", "data", "intent_harvests");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "intent-shards.json");

function parseShards() {
  const content = fs.readFileSync(SHARDS_FILE, "utf-8");
  // Simple regex to extract the object content. This is a bit brittle but okay for this context.
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  const jsonStr = content.substring(start, end + 1)
    .replace(/export const HUB_KEYWORD_SHARDS = /, "")
    // Remove trailing commas before closing braces/brackets for JSON compatibility
    .replace(/,(\s*[\]}])/g, "$1")
    // Quote keys
    .replace(/(\s+)([a-zA-Z0-9_]+):/g, '$1"$2":')
    // Handle single quotes to double quotes (though shards file uses double)
    .replace(/'/g, '"');
  
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("[HarvestShards] Error parsing shards file:", err.message);
    // Fallback: hardcode if parsing fails (for the 10 European hubs)
    return null;
  }
}

// Hardcoded shards as fallback if file parsing fails
const FALLBACK_SHARDS = {
  MUC: {
    name: "Munich International",
    city: "Munich",
    logistics: ["Terminal 2 Meet & Greet", "Unlimited Mileage Alps", "No-Deposit BMW Rentals"],
    capabilities: ["Alpine-ready setup", "lowered-seat GS", "factory-luggage-included"],
    routes: ["Grossglockner High Alpine Road", "Bavarian Alps Loop", "Munich to Stelvio Pass"]
  },
  IST: {
    name: "Istanbul Airport",
    city: "Istanbul",
    logistics: ["24/7 Airport Delivery", "Cross-continental Permit", "Bosphorus Pickup"],
    capabilities: ["heavy-duty-skidplates", "transcontinental-tanks", "off-road-tires"],
    routes: ["Trans-Anatolian Express", "Istanbul to Cappadocia", "Black Sea Coastal Run"]
  },
  LHR: {
    name: "London Heathrow",
    city: "London",
    logistics: ["Secure Luggage Storage", "Meet & Greet Terminal 5", "UK Roadside Assist"],
    capabilities: ["heated-grips-standard", "waterproof-panniers", "A2-compliant-rentals"],
    routes: ["Cotswolds Discovery", "London to North Coast 500", "South Downs Way"]
  },
  CDG: {
    name: "Paris Charles de Gaulle",
    city: "Paris",
    logistics: ["VIP Terminal Pickup", "One-Way to Nice/Cannes", "Helmet Lockers Included"],
    capabilities: ["Paris-city-legal", "luxury-touring-spec", "automatic-DCT-models"],
    routes: ["Champagne Region Tour", "Paris to Normandy Coast", "Loire Valley Chateaux"]
  },
  AMS: {
    name: "Amsterdam Schiphol",
    city: "Amsterdam",
    logistics: ["Direct Terminal Access", "Benelux Border-Free", "Low Security Deposit"],
    capabilities: ["commuter-friendly", "integrated-GPS-mapping", "urban-scooter-hybrid"],
    routes: ["Dutch Coast Route", "Amsterdam to Ardennes Forest", "Tulip Field Loop"]
  },
  FRA: {
    name: "Frankfurt International",
    city: "Frankfurt",
    logistics: ["Free Airport Shuttle", "Autobahn-Ready Fleet", "Late Night Returns"],
    capabilities: ["high-speed-stability", "unlimited-autobahn-mileage", "Euro-touring-packs"],
    routes: ["Black Forest B500", "Rhine Valley Run", "Frankfurt to Alps Express"]
  },
  MAD: {
    name: "Madrid Barajas",
    city: "Madrid",
    logistics: ["Spanish One-Way enabled", "Terminal T4 Pickup", "Siesta-Friendly Hours"],
    capabilities: ["ventilated-mesh-gear", "desert-spec-tires", "low-seat-height-specialists"],
    routes: ["Madrid to Sierra de Gredos", "Castile Plateau Loop", "The Don Quixote Trail"]
  },
  BCN: {
    name: "Barcelona El Prat",
    city: "Barcelona",
    logistics: ["Ferry-Ready Rentals", "Custom Coastal Delivery", "Multi-Day Discounts"],
    capabilities: ["Pyrenees-ready-suspension", "urban-agility-pro", "GoPro-mount-ready"],
    routes: ["Pyrenees High Roads", "Costa Brava Coastal Run", "Montserrat Mountain Climb"]
  },
  FCO: {
    name: "Rome Fiumicino",
    city: "Rome",
    logistics: ["Rome City Center Drop-off", "Fiumicino Terminal 3 Handover", "Instant Booking"],
    capabilities: ["Italian-style-classics", "Vespa-luxury-touring", "pillion-comfort-focus"],
    routes: ["Amalfi Coast Dream", "Tuscan Hills Circuit", "Rome to Gran Sasso"]
  },
  MXP: {
    name: "Milan Malpensa",
    city: "Milan",
    logistics: ["Dolomites Shuttle Link", "Italian Lake District Access", "Factory Performance Specs"],
    capabilities: ["Ducati-specialist-fleet", "performance-braking-packs", "premium-riding-gear"],
    routes: ["Lake Como Circuit", "Milan to Dolomites Traverse", "Stelvio Pass North Ascent"]
  }
};

function generateIntents() {
  const shards = parseShards() || FALLBACK_SHARDS;
  const intents = [];

  for (const [code, shard] of Object.entries(shards)) {
    const { city, logistics, capabilities, routes } = shard;

    // Generate combinations
    // Logistics + City
    logistics.forEach(log => {
      intents.push({
        keyword: `${log} motorcycle rental ${city}`,
        airport_code: code,
        operator_id: "shard-generator",
        source_url: "https://jetmymoto.com/shards",
        brands_mentioned: [],
        models_mentioned: [],
        categories_mentioned: []
      });
    });

    // Capability + City
    capabilities.forEach(cap => {
      intents.push({
        keyword: `${cap} motorcycle rental ${city}`,
        airport_code: code,
        operator_id: "shard-generator",
        source_url: "https://jetmymoto.com/shards",
        brands_mentioned: [],
        models_mentioned: [],
        categories_mentioned: []
      });
    });

    // Route + City
    routes.forEach(route => {
      intents.push({
        keyword: `${route} motorcycle rental`,
        airport_code: code,
        operator_id: "shard-generator",
        source_url: "https://jetmymoto.com/shards",
        brands_mentioned: [],
        models_mentioned: [],
        categories_mentioned: []
      });
    });

    // Tri-combinations (Cross-category)
    // "Terminal pickup with lowered-seat BMW in Munich"
    intents.push({
      keyword: `${logistics[0]} ${capabilities[1]} rental ${city}`,
      airport_code: code,
      operator_id: "shard-generator",
      source_url: "https://jetmymoto.com/shards"
    });

    // "Alpine-ready GS for Grossglockner loop from Munich"
    intents.push({
      keyword: `${capabilities[0]} for ${routes[0]} from ${city}`,
      airport_code: code,
      operator_id: "shard-generator",
      source_url: "https://jetmymoto.com/shards"
    });
  }

  const output = {
    operator_id: "shard-generator",
    airport_code: "MULTIPLE",
    source_url: "https://jetmymoto.com/shards",
    harvestedAt: new Date().toISOString(),
    intentCount: intents.length,
    intents
  };

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`[HarvestShards] ✅ Generated ${intents.length} intents from ${Object.keys(shards).length} shards → intent-shards.json`);
}

generateIntents();
