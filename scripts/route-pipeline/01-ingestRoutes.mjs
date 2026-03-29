// scripts/route-pipeline/01-ingestRoutes.mjs
// Stage 1: Ingest road telemetry from OpenStreetMap Overpass API.
//
// For each destination with coords, queries a bounding box for:
//   - Total road length (motorcycle-relevant highways)
//   - Surface breakdown (asphalt vs gravel vs unpaved)
//   - Mountain passes (tagged saddle/mountain_pass)
//   - Max elevation from tagged peaks/passes
//
// License: ODbL 1.0 — © OpenStreetMap contributors
// Usage:  node scripts/route-pipeline/01-ingestRoutes.mjs

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { destinationsWithCoords } from "./destinations.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../../data/route-pipeline/01-telemetry");
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Respect Overpass fair-use policy: 1 request per 5 seconds
const DELAY_MS = 5000;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Build a bounding box around destination coords (±0.8° ≈ ~80km radius)
function bbox(coords, radius = 0.8) {
  return {
    south: coords.lat - radius,
    west: coords.lng - radius,
    north: coords.lat + radius,
    east: coords.lng + radius,
  };
}

// Overpass QL: get motorcycle-relevant roads + surface tags + passes
function buildOverpassQuery(bb) {
  return `
[out:json][timeout:60];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified)$"]
    (${bb.south},${bb.west},${bb.north},${bb.east});
  node["natural"="saddle"](${bb.south},${bb.west},${bb.north},${bb.east});
  node["mountain_pass"="yes"](${bb.south},${bb.west},${bb.north},${bb.east});
  node["natural"="peak"]["ele"](${bb.south},${bb.west},${bb.north},${bb.east});
);
out body;
>;
out skel qt;
`.trim();
}

async function queryOverpass(query) {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Overpass ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

function classifySurface(tags) {
  const surface = (tags?.surface || "").toLowerCase();
  if (["asphalt", "paved", "concrete", "concrete:plates"].includes(surface)) return "asphalt";
  if (["gravel", "fine_gravel", "compacted"].includes(surface)) return "gravel";
  if (["unpaved", "dirt", "earth", "ground", "grass", "sand", "mud"].includes(surface)) return "unpaved";
  const hw = (tags?.highway || "").toLowerCase();
  if (["motorway", "trunk", "primary", "secondary"].includes(hw)) return "asphalt";
  return "unknown";
}

function classifyDifficulty(maxElevation, gravelPercent) {
  if (maxElevation > 2500 || gravelPercent > 20) return "Advanced";
  if (maxElevation > 1500 || gravelPercent > 5) return "Intermediate";
  return "Easy";
}

function classifyTerrain(maxElevation, coastalRoads, gravelPercent) {
  if (maxElevation > 2000) return "Mountain Asphalt";
  if (gravelPercent > 15) return "Mixed Surface";
  if (coastalRoads > 0) return "Coastal Highway";
  if (maxElevation > 800) return "Hill Country";
  return "Rolling Terrain";
}

function processOverpassData(data, destSlug) {
  const elements = data?.elements || [];

  const ways = elements.filter((e) => e.type === "way");
  const passes = elements.filter(
    (e) => e.type === "node" && (e.tags?.natural === "saddle" || e.tags?.mountain_pass === "yes")
  );
  const peaks = elements.filter(
    (e) => e.type === "node" && e.tags?.natural === "peak" && e.tags?.ele
  );

  // Surface breakdown
  const surfaceCounts = { asphalt: 0, gravel: 0, unpaved: 0, unknown: 0 };
  for (const way of ways) {
    const cat = classifySurface(way.tags);
    surfaceCounts[cat]++;
  }
  const totalWays = Math.max(ways.length, 1);
  const surfaceBreakdown = {
    asphalt: Math.round((surfaceCounts.asphalt / totalWays) * 100),
    gravel: Math.round((surfaceCounts.gravel / totalWays) * 100),
    unpaved: Math.round((surfaceCounts.unpaved / totalWays) * 100),
  };

  // Elevation data from peaks and passes
  const elevations = [
    ...peaks.map((p) => parseFloat(p.tags.ele)),
    ...passes.filter((p) => p.tags?.ele).map((p) => parseFloat(p.tags.ele)),
  ].filter((e) => !isNaN(e));

  const maxAltitude = elevations.length > 0 ? Math.max(...elevations) : null;

  // Coastal detection
  const coastalRoads = ways.filter(
    (w) => w.tags?.name && /coast|shore|sea|ocean|beach/i.test(w.tags.name)
  ).length;

  const gravelPercent = surfaceBreakdown.gravel + surfaceBreakdown.unpaved;
  const difficulty = classifyDifficulty(maxAltitude || 0, gravelPercent);
  const terrain = classifyTerrain(maxAltitude || 0, coastalRoads, gravelPercent);

  // Extract pass names for POI cross-reference
  const passNames = passes
    .filter((p) => p.tags?.name)
    .map((p) => ({
      name: p.tags.name,
      lat: p.lat,
      lng: p.lon,
      elevation_m: p.tags.ele ? parseFloat(p.tags.ele) : null,
      osm_id: p.id,
    }))
    .sort((a, b) => (b.elevation_m || 0) - (a.elevation_m || 0));

  return {
    destination_slug: destSlug,
    source: "openstreetmap",
    license: "ODbL 1.0",
    attribution: "© OpenStreetMap contributors",
    queried_at: new Date().toISOString(),
    telemetry: {
      road_segments: ways.length,
      passes_found: passes.length,
      peaks_found: peaks.length,
      max_altitude_m: maxAltitude,
      difficulty,
      terrain,
      surface_breakdown: surfaceBreakdown,
    },
    osm_passes: passNames.slice(0, 20),
    osm_peaks: peaks
      .filter((p) => p.tags?.name)
      .map((p) => ({
        name: p.tags.name,
        lat: p.lat,
        lng: p.lon,
        elevation_m: parseFloat(p.tags.ele),
      }))
      .sort((a, b) => b.elevation_m - a.elevation_m)
      .slice(0, 10),
  };
}

async function main() {
  ensureDir(OUTPUT_DIR);
  const destinations = destinationsWithCoords();

  console.log(`[Stage 1] Ingesting telemetry for ${destinations.length} destinations`);
  console.log(`[Stage 1] Source: OpenStreetMap Overpass API (ODbL 1.0)`);
  console.log(`[Stage 1] Output: ${OUTPUT_DIR}\n`);

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
      const bb = bbox(dest.coords);
      const query = buildOverpassQuery(bb);
      const data = await queryOverpass(query);
      const result = processOverpassData(data, dest.slug);

      fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
      console.log(
        `  ✓ ${result.telemetry.road_segments} roads, ` +
        `${result.telemetry.passes_found} passes, ` +
        `max ${result.telemetry.max_altitude_m ?? "N/A"}m`
      );
      processed++;
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
      failed++;
    }

    // Fair-use delay for Overpass public endpoint
    if (processed + failed < destinations.length) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n[Stage 1] Complete: ${processed} ok, ${failed} failed`);
}

main().catch((err) => {
  console.error("[Stage 1] Fatal:", err);
  process.exit(1);
});
