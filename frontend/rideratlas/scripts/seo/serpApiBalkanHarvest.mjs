/**
 * SerpApi Balkan Rental Discovery — Agent 2 (Discovery)
 *
 * Queries SerpApi google_maps engine for motorcycle rental operators near
 * each of the 10 Balkan hub airports. Writes a structured JSON staging file
 * at scripts/data/balkanOperatorLeads.json ready for human review and
 * injection via injectBalkanOperators.mjs
 *
 * Usage:
 *   SERPAPI_KEY=your_key node scripts/seo/serpApiBalkanHarvest.mjs
 *   DRY_RUN=1 node scripts/seo/serpApiBalkanHarvest.mjs   (mock data, no API calls)
 *
 * Environment variables:
 *   SERPAPI_KEY  — Required (unless DRY_RUN=1)
 *   DRY_RUN      — Set to "1" to skip API calls and write mock leads
 *   DELAY_MS     — Delay between requests, default 1500ms (rate limit safety)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, "..", "data", "balkanOperatorLeads.json");
const DRY_RUN = process.env.DRY_RUN === "1";
const SERPAPI_KEY = process.env.SERPAPI_KEY;
const DELAY_MS = parseInt(process.env.DELAY_MS ?? "1500", 10);

// ── Balkan hub airports ───────────────────────────────────────────────────

const BALKAN_AIRPORTS = [
  { code: "ATH", city: "Athens",       country: "gr", region: "Aegean Gateway & Peloponnese Entry" },
  { code: "ZAG", city: "Zagreb",       country: "hr", region: "North Adriatic & Pannonian Entry" },
  { code: "SPU", city: "Split",        country: "hr", region: "Dalmatian Coast Mission Anchor" },
  { code: "DBV", city: "Dubrovnik",    country: "hr", region: "Premium Adriatic Extraction Point" },
  { code: "BEG", city: "Belgrade",     country: "rs", region: "Central Balkan Logistical Heart" },
  { code: "SOF", city: "Sofia",        country: "bg", region: "Eastern Balkan & Black Sea Vector" },
  { code: "TIA", city: "Tirana",       country: "al", region: "Albanian Alps Adventure Hub" },
  { code: "SKG", city: "Thessaloniki", country: "gr", region: "Northern Greece Tactical Terminal" },
  { code: "PRN", city: "Pristina",     country: "xk", region: "Dinaric Spine Inland Hub" },
  { code: "SKP", city: "Skopje",       country: "mk", region: "Vardar Corridor Strategic Link" },
];

// ── Compatible destination map (editorial seed) ───────────────────────────
// These slugs cascade into rental.compatible_destinations once graph entries
// exist for those ride regions. Keyed by airport code.

const BALKAN_DEST_MAP = {
  ATH: ["peloponnese", "meteora", "greek-islands-tour"],
  ZAG: ["plitvice-lakes", "kvarner-bay", "slovenian-alps"],
  SPU: ["dalmatian-coast", "krka-canyon", "mostar-valley"],
  DBV: ["dubrovnik-hinterland", "dalmatian-coast", "kotor-bay"],
  BEG: ["iron-gates-gorge", "tara-mountain", "fruska-gora"],
  SOF: ["rila-mountains", "vitosha-ridge", "rhodope-highlands"],
  TIA: ["albanian-alps", "valbona-valley", "ohrid-lake"],
  SKG: ["mount-olympus", "chalkidiki-coast", "macedonian-highlands"],
  PRN: ["dinaric-spine", "rugova-valley", "sar-mountains"],
  SKP: ["matka-canyon", "ohrid-lake", "galicica-ridge"],
};

// ── Mock data for DRY_RUN ────────────────────────────────────────────────

function buildMockLeads(airport) {
  return [
    {
      name: `Moto Rentals ${airport.city}`,
      address: `Airport Rd, ${airport.city}`,
      phone: null,
      website: null,
      rating: 4.5,
      reviews: 23,
      gps_coordinates: { latitude: null, longitude: null },
      place_id: `mock-${airport.code.toLowerCase()}-001`,
      type: "Motorcycle rental agency",
      is_mock: true,
    },
    {
      name: `${airport.city} Adventure Bikes`,
      address: `Terminal Zone, ${airport.city}`,
      phone: null,
      website: null,
      rating: 4.2,
      reviews: 11,
      gps_coordinates: { latitude: null, longitude: null },
      place_id: `mock-${airport.code.toLowerCase()}-002`,
      type: "Vehicle rental agency",
      is_mock: true,
    },
  ];
}

// ── SerpApi google_maps query ─────────────────────────────────────────────

async function queryMapsApi(airport, apiKey) {
  const query = `motorcycle rental near ${airport.code} airport`;
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_maps");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "search");
  url.searchParams.set("hl", "en");
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SerpApi HTTP ${response.status} for ${airport.code}: ${body.slice(0, 200)}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`SerpApi error for ${airport.code}: ${data.error}`);
  }

  const results = data.local_results ?? [];

  return results.map((r) => ({
    name: r.title ?? null,
    address: r.address ?? null,
    phone: r.phone ?? null,
    website: r.website ?? null,
    rating: r.rating ?? null,
    reviews: r.reviews ?? null,
    gps_coordinates: r.gps_coordinates ?? { latitude: null, longitude: null },
    place_id: r.place_id ?? null,
    type: r.type ?? null,
    is_mock: false,
  }));
}

// ── Slug helpers ──────────────────────────────────────────────────────────

function toSlug(name, airportCode) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${base}-${airportCode.toLowerCase()}`;
}

// ── Main ──────────────────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function harvest() {
  if (!DRY_RUN && !SERPAPI_KEY) {
    console.error("[SerpApiBalkanHarvest] ❌ SERPAPI_KEY is required. Set it or use DRY_RUN=1");
    process.exit(1);
  }

  const timestamp = new Date().toISOString();
  const allLeads = [];
  let totalShops = 0;

  console.log(`[SerpApiBalkanHarvest] 🛰️  Starting Balkan discovery — ${BALKAN_AIRPORTS.length} airports`);
  if (DRY_RUN) console.log("[SerpApiBalkanHarvest] ⚠️  DRY_RUN mode — no API calls, mock data only");

  for (const airport of BALKAN_AIRPORTS) {
    console.log(`[SerpApiBalkanHarvest] 🔍 ${airport.code} — ${airport.city}`);

    let shops;
    try {
      shops = DRY_RUN ? buildMockLeads(airport) : await queryMapsApi(airport, SERPAPI_KEY);
    } catch (err) {
      console.warn(`[SerpApiBalkanHarvest] ⚠️  ${airport.code} query failed: ${err.message}`);
      shops = [];
    }

    const enriched = shops.map((shop, i) => ({
      // SerpApi raw fields
      ...shop,
      // Harvest metadata
      airportCode: airport.code,
      airportCity: airport.city,
      airportCountry: airport.country,
      airportRegion: airport.region,
      compatibleDestinations: BALKAN_DEST_MAP[airport.code] ?? [],
      // Pre-generated slugs for injection scripts
      operatorSlug: toSlug(shop.name ?? `operator-${i + 1}`, airport.code),
      rentalSlugPrefix: toSlug(shop.name ?? `rental-${i + 1}`, airport.code),
      // Harvest metadata
      discoveredAt: timestamp,
      queryEngine: "google_maps",
      query: `motorcycle rental near ${airport.code} airport`,
    }));

    enriched.forEach((lead) => {
      console.log(`   ✅ ${lead.name} (${lead.rating ?? "?"}★) → ${lead.website ?? "no website"}`);
    });

    if (enriched.length === 0) {
      console.log(`   ℹ️  No results for ${airport.code}`);
    }

    allLeads.push(...enriched);
    totalShops += enriched.length;

    // Rate limit safety — skip delay on last airport or dry run
    if (!DRY_RUN && airport !== BALKAN_AIRPORTS[BALKAN_AIRPORTS.length - 1]) {
      await sleep(DELAY_MS);
    }
  }

  // ── Write staging file ──
  const output = {
    meta: {
      harvestedAt: timestamp,
      airports: BALKAN_AIRPORTS.map((a) => a.code),
      totalLeads: allLeads.length,
      dryRun: DRY_RUN,
      engine: "google_maps",
    },
    leads: allLeads,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`\n[SerpApiBalkanHarvest] ✅ Done — ${totalShops} operators across ${BALKAN_AIRPORTS.length} airports`);
  console.log(`[SerpApiBalkanHarvest] 📄 Staging file → ${OUTPUT_FILE}`);
  console.log(`[SerpApiBalkanHarvest] ➡️  Review leads, then run: node scripts/seo/injectBalkanOperators.mjs`);
}

harvest().catch((err) => {
  console.error("[SerpApiBalkanHarvest] ❌ Fatal:", err.message);
  process.exit(1);
});
