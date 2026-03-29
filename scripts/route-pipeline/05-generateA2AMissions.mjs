// ─── 05-generateA2AMissions.mjs ──────────────────────────────────────────────
// Auto-generates A2A (Airport-to-Airport) mission candidates from the existing
// route graph. For each destination theater, finds all airport pairs that both
// serve routes to that theater, filters by geographic corridor logic, and
// enriches via LLM for cinematic copy.
//
// Usage:
//   node scripts/route-pipeline/05-generateA2AMissions.mjs [--dry-run] [--enrich]
//
// Flags:
//   --dry-run   Print candidate pairs without writing output
//   --enrich    Call OpenAI to generate cinematic_pitch + SEO for each mission
//
// Output:
//   frontend/rideratlas/src/features/routes/data/a2aMissions.generated.js
// ─────────────────────────────────────────────────────────────────────────────

import "dotenv/config";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DRY_RUN = process.argv.includes("--dry-run");
const ENRICH = process.argv.includes("--enrich");

// ── Haversine distance (km) between two {lat,lng} points ────────────────────
function haversineKm(a, b) {
  if (!a?.lat || !a?.lng || !b?.lat || !b?.lng) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinHalf = Math.sin(dLat / 2);
  const sinHalfLng = Math.sin(dLng / 2);
  const aCalc =
    sinHalf * sinHalf +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinHalfLng *
      sinHalfLng;
  return R * 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
}

// ── Load route data ─────────────────────────────────────────────────────────
const routesPath = resolve(
  __dirname,
  "../../frontend/rideratlas/src/features/routes/data/generatedRideRoutes.js"
);
const routesSrc = readFileSync(routesPath, "utf-8");

// Extract the array from the ESM export
const match = routesSrc.match(
  /export\s+const\s+GENERATED_RIDE_ROUTES\s*=\s*(\[[\s\S]*\]);?\s*$/m
);
if (!match) {
  console.error("Could not parse GENERATED_RIDE_ROUTES from source");
  process.exit(1);
}

const routes = JSON.parse(
  match[1]
    .replace(/\/\/.*$/gm, "")
    .replace(/,\s*([\]}])/g, "$1")
);

// ── Load destination data ───────────────────────────────────────────────────
const destPath = resolve(
  __dirname,
  "../../frontend/rideratlas/src/features/routes/data/rideDestinations.js"
);
const destSrc = readFileSync(destPath, "utf-8");
const destMatch = destSrc.match(
  /export\s+const\s+RIDE_DESTINATIONS\s*=\s*(\{[\s\S]*\});?\s*$/m
);
const destinations = destMatch
  ? JSON.parse(
      destMatch[1]
        .replace(/\/\/.*$/gm, "")
        .replace(/,\s*([\]}])/g, "$1")
    )
  : {};

// ── Airport coordinates (lightweight inline since AIRPORT_INDEX has no coords) ──
const AIRPORT_COORDS = {
  MXP: { lat: 45.63, lng: 8.72 },
  MUC: { lat: 48.35, lng: 11.79 },
  ZRH: { lat: 47.46, lng: 8.55 },
  CDG: { lat: 49.01, lng: 2.55 },
  BCN: { lat: 41.30, lng: 2.08 },
  LHR: { lat: 51.47, lng: -0.46 },
  EDI: { lat: 55.95, lng: -3.37 },
  OSL: { lat: 60.19, lng: 11.10 },
  BGO: { lat: 60.29, lng: 5.22 },
  ATH: { lat: 37.94, lng: 23.94 },
  VIE: { lat: 48.11, lng: 16.57 },
  FCO: { lat: 41.80, lng: 12.24 },
  LAX: { lat: 33.94, lng: -118.41 },
  SFO: { lat: 37.62, lng: -122.38 },
  YVR: { lat: 49.19, lng: -123.18 },
  YUL: { lat: 45.47, lng: -73.74 },
  YQB: { lat: 46.79, lng: -71.39 },
  SLC: { lat: 40.79, lng: -111.98 },
  BNA: { lat: 36.12, lng: -86.68 },
  TPA: { lat: 27.97, lng: -82.53 },
  HNL: { lat: 21.32, lng: -157.92 },
  AUS: { lat: 30.19, lng: -97.67 },
  SAN: { lat: 32.73, lng: -117.19 },
  MDW: { lat: 41.79, lng: -87.75 },
  BWI: { lat: 39.18, lng: -76.67 },
  DCA: { lat: 38.85, lng: -77.04 },
  IAD: { lat: 38.94, lng: -77.46 },
  BER: { lat: 52.37, lng: 13.52 },
  STR: { lat: 48.69, lng: 9.22 },
  MAD: { lat: 40.47, lng: -3.57 },
  LYS: { lat: 45.73, lng: 5.09 },
};

// ── Group airports by destination ───────────────────────────────────────────
const airportsByDest = {};
for (const r of routes) {
  const dest =
    r.destination?.slug || r.destination || r.destinationDetails?.slug || "";
  const code = r.airport?.code || r.origin || "";
  if (!dest || !code) continue;
  if (!(dest in airportsByDest)) airportsByDest[dest] = new Set();
  airportsByDest[dest].add(code);
}

// ── Generate candidates ─────────────────────────────────────────────────────
const MIN_DISTANCE_KM = 150;
const MAX_DISTANCE_KM = 2500;
const candidates = [];

for (const [destSlug, airportSet] of Object.entries(airportsByDest)) {
  const airports = [...airportSet];

  for (let i = 0; i < airports.length; i++) {
    for (let j = 0; j < airports.length; j++) {
      if (i === j) continue;

      const origin = airports[i];
      const extraction = airports[j];

      const originCoords = AIRPORT_COORDS[origin];
      const extractionCoords = AIRPORT_COORDS[extraction];

      // Skip if we don't have coords for either
      if (!originCoords || !extractionCoords) continue;

      const dist = haversineKm(originCoords, extractionCoords);
      if (dist === null || dist < MIN_DISTANCE_KM || dist > MAX_DISTANCE_KM) continue;

      const slug = `${origin.toLowerCase()}-to-${extraction.toLowerCase()}-${destSlug}`;
      const destData = destinations[destSlug] || {};

      candidates.push({
        slug,
        title: `${destData.name || destSlug} Corridor`,
        insertion_airport: origin,
        extraction_airport: extraction,
        theater: destSlug,
        distance_km: Math.round(dist * 1.3), // Road distance ≈ 1.3x haversine
        duration_days: dist < 400 ? "2–3" : dist < 800 ? "3–5" : "5–7",
        cinematic_pitch: "",
        highlights: [],
        seo: {
          title: "",
          description: "",
        },
      });
    }
  }
}

console.log(`Generated ${candidates.length} A2A mission candidates across ${Object.keys(airportsByDest).length} theaters`);

if (DRY_RUN) {
  // Group by theater for readable output
  const byTheater = {};
  for (const c of candidates) {
    if (!(c.theater in byTheater)) byTheater[c.theater] = [];
    byTheater[c.theater].push(c);
  }
  for (const [theater, missions] of Object.entries(byTheater)) {
    console.log(`\n  ${theater}: ${missions.length} pairs`);
    for (const m of missions.slice(0, 5)) {
      console.log(`    ${m.insertion_airport} → ${m.extraction_airport}  (~${m.distance_km}km, ${m.duration_days} days)`);
    }
    if (missions.length > 5) console.log(`    ... and ${missions.length - 5} more`);
  }
  process.exit(0);
}

// ── Optional LLM enrichment ─────────────────────────────────────────────────
async function enrichMission(mission) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY not set, skipping enrichment");
    return mission;
  }

  const prompt = `You are a premium motorcycle travel copywriter for Rider Atlas Airport Missions™.

Generate content for this A2A (Airport-to-Airport) one-way motorcycle mission:
- Insertion Hub: ${mission.insertion_airport}
- Theater: ${mission.theater}
- Extraction Hub: ${mission.extraction_airport}
- Approximate distance: ${mission.distance_km}km
- Duration: ${mission.duration_days} days

Return JSON with these fields:
{
  "cinematic_pitch": "2-3 sentences. Military-tactical tone. No backtracking pitch. Max 280 chars.",
  "highlights": ["4 key route highlights with em-dash descriptions"],
  "seo_title": "Motorcycle Trip [City A] to [City B] | [Route Name] A2A Mission",
  "seo_description": "Max 155 chars. Mention both airports, the theater, and 'one-way motorcycle'."
}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      console.warn(`  LLM enrichment failed (${res.status}), skipping`);
      return mission;
    }

    const data = await res.json();
    const content = JSON.parse(data.choices?.[0]?.message?.content || "{}");

    return {
      ...mission,
      cinematic_pitch: content.cinematic_pitch || mission.cinematic_pitch,
      highlights: content.highlights || mission.highlights,
      seo: {
        title: content.seo_title || mission.seo.title,
        description: content.seo_description || mission.seo.description,
      },
    };
  } catch (err) {
    console.warn(`  LLM error: ${err.message}`);
    return mission;
  }
}

// ── Enrich if requested ─────────────────────────────────────────────────────
let finalMissions = candidates;

if (ENRICH) {
  console.log("\nEnriching missions via OpenAI...");
  const enriched = [];
  for (const mission of candidates) {
    console.log(`  Enriching: ${mission.slug}`);
    const result = await enrichMission(mission);
    enriched.push(result);
    // Rate limit courtesy
    await new Promise((r) => setTimeout(r, 1000));
  }
  finalMissions = enriched;
}

// ── Write output ────────────────────────────────────────────────────────────
const outputPath = resolve(
  __dirname,
  "../../frontend/rideratlas/src/features/routes/data/a2aMissions.generated.js"
);

const output = `// Auto-generated by 05-generateA2AMissions.mjs on ${new Date().toISOString()}
// ${finalMissions.length} A2A mission candidates
// Re-run with --enrich to populate cinematic_pitch and SEO fields via LLM

export const A2A_MISSIONS_GENERATED = ${JSON.stringify(finalMissions, null, 2)};
`;

writeFileSync(outputPath, output, "utf-8");
console.log(`\nWrote ${finalMissions.length} missions to ${outputPath}`);
