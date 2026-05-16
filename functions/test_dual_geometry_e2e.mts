/**
 * E2E test: dual-geometry route pipeline
 *
 * Tests the new split camera/overlay geometry system introduced in
 * renderMissionVideo.ts. Verifies:
 *  1. fetchRouteGeometry returns high-fidelity coordinates (≥50 pts)
 *  2. resolveMissionForRender resolves a real mission from the v5 catalog
 *  3. renderMissionVideo produces a valid MP4 (≥2 MB) without throwing
 *
 * Runs without Firebase — local output only.
 * Usage: npx tsx test_dual_geometry_e2e.mts
 */
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".env") });

// Ensure token is visible to child modules
const token = process.env.REMOTION_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN || "";
if (!token) {
  console.error("FAIL: No Mapbox token found. Set REMOTION_MAPBOX_TOKEN in .env");
  process.exit(1);
}
process.env.REMOTION_MAPBOX_TOKEN = token;
process.env.MAPBOX_TOKEN = token;

const { fetchRouteGeometry } = await import("./video-engine/utils/fetchRouteGeometry.js");
const { resolveMissionForRender } = await import("./mcp-tools/missionResolver.js");
const { renderMissionVideo } = await import("./video-engine/renderMissionVideo.js");

const SLUG = process.env.MISSION_SLUG || "mxp-to-muc-alpine-traverse";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "video-engine/output");
fs.mkdirSync(outDir, { recursive: true });

let exitCode = 0;
const pass = (label: string) => console.log(`  ✓ ${label}`);
const fail = (label: string, detail?: unknown) => {
  console.error(`  ✗ ${label}`, detail ?? "");
  exitCode = 1;
};

// ─── STEP 1: fetchRouteGeometry ───────────────────────────────────────────
console.log("\n[1] fetchRouteGeometry — high-fidelity geometry check");
let fullCoords: Array<[number, number]> = [];
try {
  fullCoords = await fetchRouteGeometry({
    from: { lng: 8.7282, lat: 45.6306 },  // MXP
    to:   { lng: 11.7861, lat: 48.3537 }, // MUC
  });

  if (fullCoords.length < 50) {
    fail(`Too few coords returned: ${fullCoords.length} (expected ≥50)`,
         "Check if overview=full is used and simplification is not too aggressive");
  } else {
    pass(`fetchRouteGeometry returned ${fullCoords.length} pts (≥50 ✓)`);
  }

  const firstPt = fullCoords[0];
  const lastPt = fullCoords[fullCoords.length - 1];
  // MXP is ~lng 8.7, MUC is ~lng 11.8 — first pt should be near MXP
  if (Math.abs(firstPt[0] - 8.7282) > 0.5 || Math.abs(firstPt[1] - 45.6306) > 0.5) {
    fail(`Start coord far from MXP: ${JSON.stringify(firstPt)}`);
  } else {
    pass(`Start coord near MXP: [${firstPt[0].toFixed(4)}, ${firstPt[1].toFixed(4)}]`);
  }
  if (Math.abs(lastPt[0] - 11.7861) > 0.5 || Math.abs(lastPt[1] - 48.3537) > 0.5) {
    fail(`End coord far from MUC: ${JSON.stringify(lastPt)}`);
  } else {
    pass(`End coord near MUC: [${lastPt[0].toFixed(4)}, ${lastPt[1].toFixed(4)}]`);
  }
} catch (err) {
  fail("fetchRouteGeometry threw", err);
  process.exit(1);
}

// ─── STEP 2: resolveMissionForRender ──────────────────────────────────────
console.log(`\n[2] resolveMissionForRender — slug: ${SLUG}`);
let mission: Awaited<ReturnType<typeof resolveMissionForRender>>;
try {
  mission = await resolveMissionForRender(SLUG);
  if (!mission) {
    fail(`Mission not found for slug: ${SLUG}`);
    process.exit(1);
  }
  pass(`Mission resolved: "${mission.title}"`);
  pass(`  ${mission.insertion_airport} → ${mission.extraction_airport}`);

  const coordCount = mission.coordinates.length;
  if (coordCount < 50) {
    fail(`Mission coords too few: ${coordCount} (expected ≥50, real road geometry)`);
  } else {
    pass(`Mission coordinates: ${coordCount} pts (real road geometry ✓)`);
  }

  // Quick URL-length smoke-test: 60-pt overlay should fit in 8 KB URL
  const OVERLAY_POINTS = 60;
  const step = (mission.coordinates.length - 1) / (OVERLAY_POINTS - 1);
  const sampleCoords = Array.from({ length: OVERLAY_POINTS }, (_, i) =>
    mission.coordinates[Math.round(i * step)]
  );
  const sampleGeoJSON = JSON.stringify({
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: { "stroke": "#CDA755", "stroke-width": 24, "stroke-opacity": 0.25 },
        geometry: { type: "LineString", coordinates: sampleCoords } },
      { type: "Feature", properties: { "stroke": "#ffffff", "stroke-width": 5, "stroke-opacity": 1.0 },
        geometry: { type: "LineString", coordinates: sampleCoords } },
    ],
  });
  const encodedLen = encodeURIComponent(sampleGeoJSON).length;
  const approxUrlLen = encodedLen + 200; // base URL overhead
  if (approxUrlLen > 8000) {
    fail(`60-pt overlay URL too long: ~${approxUrlLen} chars (limit ~8000)`);
  } else {
    pass(`60-pt overlay URL safe: ~${approxUrlLen} chars`);
  }
} catch (err) {
  fail("resolveMissionForRender threw", err);
  process.exit(1);
}

if (exitCode !== 0) {
  console.error("\n[!] Geometry checks failed. Aborting render to save time.");
  process.exit(exitCode);
}

// ─── STEP 3: Full render (limited to 30 frames for speed) ─────────────────
console.log(`\n[3] renderMissionVideo — FULL pipeline (720 frames)`);
console.log("    Note: this will take several minutes (720 Mapbox API calls).");
console.log("    Output:", path.join(outDir, `${SLUG}.mp4`));

const outputPath = path.join(outDir, `${SLUG}.mp4`);
if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

const t0 = Date.now();
try {
  await renderMissionVideo(
    { ...mission!, outputLocation: outputPath },
    { keepFrames: false }
  );
} catch (err) {
  fail("renderMissionVideo threw", err);
  process.exit(1);
}

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
const stat = fs.statSync(outputPath);
const sizeMB = (stat.size / 1024 / 1024).toFixed(2);

if (stat.size < 2 * 1024 * 1024) {
  fail(`Output too small: ${sizeMB} MB (expected ≥2 MB)`);
} else {
  pass(`Output: ${sizeMB} MB — rendered in ${elapsed}s`);
}

// ─── SUMMARY ──────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(60)}`);
if (exitCode === 0) {
  console.log("RESULT: ALL CHECKS PASSED ✓");
  console.log(`  Slug  : ${SLUG}`);
  console.log(`  Coords: ${mission!.coordinates.length} pts (real road geometry)`);
  console.log(`  Size  : ${sizeMB} MB`);
  console.log(`  Time  : ${elapsed}s`);
  console.log(`  File  : ${outputPath}`);
} else {
  console.error("RESULT: SOME CHECKS FAILED ✗");
}
console.log("═".repeat(60));
process.exit(exitCode);
