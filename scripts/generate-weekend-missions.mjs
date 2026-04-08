#!/usr/bin/env node

/**
 * Weekend Mission Generator CLI
 *
 * Usage:
 *   node scripts/generate-weekend-missions.mjs --tier=1
 *   node scripts/generate-weekend-missions.mjs --hub=MXP
 *   node scripts/generate-weekend-missions.mjs --tier=1 --dry-run
 *   node scripts/generate-weekend-missions.mjs --assets-only
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Parse CLI args ───────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    tier: /** @type {number | null} */ (null),
    hub: /** @type {string | null} */ (null),
    dryRun: false,
    assetsOnly: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--tier=")) parsed.tier = parseInt(arg.split("=")[1], 10);
    else if (arg.startsWith("--hub=")) parsed.hub = arg.split("=")[1].toUpperCase();
    else if (arg === "--dry-run") parsed.dryRun = true;
    else if (arg === "--assets-only") parsed.assetsOnly = true;
    else {
      console.error(`Unknown argument: ${arg}`);
      console.error("Usage: node scripts/generate-weekend-missions.mjs --tier=1 [--hub=MXP] [--dry-run]");
      process.exit(1);
    }
  }

  if (!parsed.tier && !parsed.hub) {
    console.error("Must specify --tier=1 or --hub=MXP");
    process.exit(1);
  }

  return parsed;
}

// ── Dynamic import of TypeScript modules via tsx ─────────────────────────
// We compile on the fly — the project uses TS sources directly.

async function loadModules() {
  // Use dynamic import — these files are .ts, so we rely on tsx loader
  const hubRegistry = await import("../functions/src/missions/hubRegistry.ts");
  const generator = await import("../functions/src/missions/weekendMissionGenerator.ts");
  return { hubRegistry, generator };
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  const token = (
    process.env.MAPBOX_ACCESS_TOKEN ||
    process.env.REMOTION_MAPBOX_TOKEN ||
    process.env.MAPBOX_TOKEN ||
    ""
  ).trim();

  if (!token && !args.dryRun) {
    console.error("ERROR: No Mapbox token found.");
    console.error("Set MAPBOX_ACCESS_TOKEN, REMOTION_MAPBOX_TOKEN, or MAPBOX_TOKEN env var.");
    process.exit(1);
  }

  const { hubRegistry, generator } = await loadModules();

  // Select hubs
  let hubs;
  if (args.hub) {
    const hub = hubRegistry.getHubByCode(args.hub);
    if (!hub) {
      console.error(`Unknown hub: ${args.hub}`);
      process.exit(1);
    }
    hubs = [hub];
  } else {
    hubs = hubRegistry.getHubsByTier(/** @type {1|2} */ (args.tier));
  }

  console.log(`\n${"═".repeat(55)}`);
  console.log(`  WEEKEND MISSION GENERATOR`);
  console.log(`  Hubs: ${hubs.map(h => h.code).join(", ")}`);
  console.log(`  Dry run: ${args.dryRun}`);
  console.log(`${"═".repeat(55)}\n`);

  const outputDir = path.join(ROOT, "missions");
  fs.mkdirSync(outputDir, { recursive: true });

  const result = await generator.generateWeekendMissions({
    hubs,
    mapboxToken: token,
    outputDir,
    dryRun: args.dryRun,
    delayMs: 1200, // 1.2s between API calls to avoid rate limits
  });

  // Write generation report
  const reportPath = path.join(outputDir, "generation-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(result.report, null, 2), "utf-8");

  // Write weekend missions catalog
  if (!args.dryRun && result.missions.length > 0) {
    const catalogPath = path.join(ROOT, "functions/src/data/weekendMissions.json");
    fs.writeFileSync(catalogPath, JSON.stringify(result.missions, null, 2), "utf-8");
    console.log(`\nCatalog written: ${catalogPath}`);
  }

  // Summary
  const { total_attempted, total_succeeded, total_failed } = result.report;
  console.log(`\n${"═".repeat(55)}`);
  console.log(`  GENERATION COMPLETE`);
  console.log(`  Succeeded: ${total_succeeded}/${total_attempted}`);
  if (total_failed > 0) {
    console.log(`  Failed:    ${total_failed}/${total_attempted} (see missions/generation-report.json)`);
  }
  console.log(`${"═".repeat(55)}\n`);

  // List generated missions
  if (result.missions.length > 0) {
    console.log("Generated missions:");
    for (const m of result.missions) {
      const flag = m.route_assets.motorway_used ? " ⚠ motorway" : "";
      console.log(`  ${m.code.padEnd(10)} ${m.slug.padEnd(40)} ${m.distance_km}km${flag}`);
    }
  }

  // List failures explicitly
  const failures = result.report.missions.filter((e) => e.status === "failed");
  if (failures.length > 0) {
    console.log("\nFailed missions:");
    for (const f of failures) {
      console.log(`  [FAIL] ${f.code} (${f.slug}): ${f.error}`);
      if (f.retry_without_motorway) {
        console.log(`         ↳ Retry without motorway exclusion: ${f.retry_result?.toUpperCase()}`);
        if (f.retry_error) console.log(`         ↳ Error: ${f.retry_error}`);
      }
    }
  }

  process.exit(total_failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(2);
});
