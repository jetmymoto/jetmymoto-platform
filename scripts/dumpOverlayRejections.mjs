// Dumps overlay rejections from the GRAPH build to data/debug/overlay_rejections.json.
// Run after any build to capture scoring/eligibility/cap rejection data for tuning.
//
// Usage: node scripts/dumpOverlayRejections.js

import { GRAPH } from "../frontend/rideratlas/src/core/network/networkGraph.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEBUG_DIR = path.join(__dirname, "..", "data", "debug");
const OUTPUT_FILE = path.join(DEBUG_DIR, "overlay_rejections.json");

fs.mkdirSync(DEBUG_DIR, { recursive: true });

const rejections = GRAPH.overlayRejections || [];

const report = {
  generatedAt: new Date().toISOString(),
  totalRejections: rejections.length,
  byPhase: {
    eligibility: rejections.filter((r) => r.phase === "eligibility").length,
    scoring: rejections.filter((r) => r.phase === "scoring").length,
    categoryCap: rejections.filter((r) => r.phase === "category-cap").length,
    airportCap: rejections.filter((r) => r.phase === "airport-cap").length,
    validation: rejections.filter((r) => r.phase === "validation").length,
  },
  rejections,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));

console.log(`[Debug] ${rejections.length} overlay rejections → ${OUTPUT_FILE}`);
console.log(`  eligibility: ${report.byPhase.eligibility}`);
console.log(`  scoring:     ${report.byPhase.scoring}`);
console.log(`  category-cap: ${report.byPhase.categoryCap}`);
console.log(`  airport-cap:  ${report.byPhase.airportCap}`);
console.log(`  validation:   ${report.byPhase.validation}`);
