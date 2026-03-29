// scripts/route-pipeline/02-ingestPois.mjs
// Stage 2: Extract factual POI data from Wikidata SPARQL and OSM.
//
// For each destination, queries Wikidata for:
//   - Mountain passes (Q133056)
//   - Natural landmarks (Q9430, Q35666, Q23397)
//   - Historical sites and viewpoints
//
// All data is CC0 (Wikidata) or ODbL (OSM).
// Usage:  node scripts/route-pipeline/02-ingestPois.mjs

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { destinationsWithCoords } from "./destinations.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TELEMETRY_DIR = path.resolve(__dirname, "../../data/route-pipeline/01-telemetry");
const OUTPUT_DIR = path.resolve(__dirname, "../../data/route-pipeline/02-pois");
const WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";
const USER_AGENT = "JetMyMotoPipeline/1.0 (https://jetmymoto.com; open-data-pipeline)";

const DELAY_MS = 5000;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// SPARQL: mountain passes, waterfalls, peaks, lakes, castles near destination
// Uses SERVICE wikibase:around (geo-indexed, fast) instead of FILTER bbox
function buildWikidataSparql(coords, radiusKm = 80) {
  return `
SELECT DISTINCT ?item ?itemLabel ?itemDescription ?lat ?lng ?elevation ?typeLabel WHERE {
  VALUES ?type {
    wd:Q133056
    wd:Q8502
    wd:Q35666
    wd:Q9430
    wd:Q23397
    wd:Q33506
    wd:Q16970
  }
  ?item wdt:P31 ?type .
  SERVICE wikibase:around {
    ?item wdt:P625 ?coord .
    bd:serviceParam wikibase:center "Point(${coords.lng} ${coords.lat})"^^geo:wktLiteral .
    bd:serviceParam wikibase:radius "${radiusKm}" .
  }
  BIND(geof:latitude(?coord) AS ?lat)
  BIND(geof:longitude(?coord) AS ?lng)
  OPTIONAL { ?item wdt:P2044 ?elevation . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
ORDER BY DESC(?elevation)
LIMIT 50
`.trim();
}

async function queryWikidata(sparql) {
  const url = `${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(sparql)}&format=json`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": USER_AGENT,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wikidata ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

function classifyPoiType(typeLabel) {
  const label = (typeLabel || "").toLowerCase();
  if (label.includes("pass") || label.includes("col ")) return "Alpine Pass";
  if (label.includes("mountain") || label.includes("peak")) return "Mountain Peak";
  if (label.includes("waterfall")) return "Waterfall";
  if (label.includes("lake")) return "Lake";
  if (label.includes("castle") || label.includes("château")) return "Castle";
  if (label.includes("church") || label.includes("cathedral")) return "Historic Church";
  if (label.includes("museum")) return "Museum";
  if (label.includes("archaeological")) return "Archaeological Site";
  if (label.includes("tourist")) return "Tourist Attraction";
  if (label.includes("cape") || label.includes("headland")) return "Coastal Feature";
  return "Landmark";
}

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractWikidataId(uri) {
  if (!uri) return null;
  const match = uri.match(/Q\d+$/);
  return match ? match[0] : null;
}

function processWikidataResults(data) {
  const bindings = data?.results?.bindings || [];
  const seen = new Set();
  const pois = [];

  for (const row of bindings) {
    const name = row.itemLabel?.value;
    if (!name || seen.has(name)) continue;
    seen.add(name);

    const wikidataId = extractWikidataId(row.item?.value);

    pois.push({
      name,
      slug: slugify(name),
      description: row.itemDescription?.value || null,
      type: classifyPoiType(row.typeLabel?.value),
      lat: parseFloat(row.lat?.value),
      lng: parseFloat(row.lng?.value),
      elevation_m: row.elevation?.value ? parseFloat(row.elevation.value) : null,
      wikidata_id: wikidataId,
      source: "wikidata",
      license: "CC0 1.0",
    });
  }

  return pois;
}

// Merge Wikidata POIs with OSM passes from Stage 1 telemetry
function mergeWithOsmPasses(wikidataPois, telemetryFile) {
  if (!fs.existsSync(telemetryFile)) return wikidataPois;

  const telemetry = JSON.parse(fs.readFileSync(telemetryFile, "utf8"));
  const osmPasses = telemetry.osm_passes || [];

  const existingSlugs = new Set(wikidataPois.map((p) => p.slug));

  for (const pass of osmPasses) {
    const slug = slugify(pass.name);
    if (existingSlugs.has(slug)) continue;

    wikidataPois.push({
      name: pass.name,
      slug,
      description: null,
      type: "Alpine Pass",
      lat: pass.lat,
      lng: pass.lng,
      elevation_m: pass.elevation_m,
      wikidata_id: null,
      osm_id: pass.osm_id,
      source: "openstreetmap",
      license: "ODbL 1.0",
    });
  }

  return wikidataPois.sort(
    (a, b) => (b.elevation_m || 0) - (a.elevation_m || 0) || a.name.localeCompare(b.name)
  );
}

async function main() {
  ensureDir(OUTPUT_DIR);
  const destinations = destinationsWithCoords();

  console.log(`[Stage 2] Ingesting POIs for ${destinations.length} destinations`);
  console.log(`[Stage 2] Sources: Wikidata SPARQL (CC0) + OSM passes (ODbL)`);
  console.log(`[Stage 2] Output: ${OUTPUT_DIR}\n`);

  let processed = 0;
  let failed = 0;

  for (const dest of destinations) {
    const outFile = path.join(OUTPUT_DIR, `${dest.slug}.json`);
    console.log(`[${processed + 1}/${destinations.length}] ${dest.name} (${dest.slug})`);

    // Skip if already ingested
    if (fs.existsSync(outFile)) {
      console.log("  → Already ingested, skipping (delete file to re-run)");
      processed++;
      continue;
    }

    try {
      const sparql = buildWikidataSparql(dest.coords);
      const data = await queryWikidata(sparql);
      let pois = processWikidataResults(data);

      // Merge with OSM passes from Stage 1
      const telemetryFile = path.join(TELEMETRY_DIR, `${dest.slug}.json`);
      pois = mergeWithOsmPasses(pois, telemetryFile);

      const result = {
        destination_slug: dest.slug,
        destination_name: dest.name,
        sources: ["wikidata", "openstreetmap"],
        licenses: { wikidata: "CC0 1.0", openstreetmap: "ODbL 1.0" },
        queried_at: new Date().toISOString(),
        poi_count: pois.length,
        pois,
      };

      fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
      console.log(`  ✓ ${pois.length} POIs found`);
      processed++;
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
      failed++;
    }

    if (processed + failed < destinations.length) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n[Stage 2] Complete: ${processed} ok, ${failed} failed`);
}

main().catch((err) => {
  console.error("[Stage 2] Fatal:", err);
  process.exit(1);
});
