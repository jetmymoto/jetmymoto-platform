const FirecrawlApp = require("@mendable/firecrawl-js").default;
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const apiKey = process.env.FIRECRAWL_API_KEY;
if (!apiKey) {
  console.error("[BatchHarvest] FIRECRAWL_API_KEY is not set in .env");
  process.exit(1);
}

const app = new FirecrawlApp({ apiKey });

const HARVEST_DIR = path.join(__dirname, "..", "data", "firecrawl_harvests");
const LOG_FILE = path.join(HARVEST_DIR, "harvest.log");
const TARGETS_FILE = path.join(__dirname, "..", "data", "europe_targets.json");
const CONCURRENCY = Number(process.env.BATCH_CONCURRENCY || 10);
const WAIT_FOR_MS = Number(process.env.FIRECRAWL_WAIT_FOR || 10000);
const TIMEOUT_MS = Number(process.env.FIRECRAWL_TIMEOUT || 120000);

// ---------------------------------------------------------------------------
// Schema — identical to harvestSdk.js
// ---------------------------------------------------------------------------
const RENTAL_SCHEMA = {
  type: "object",
  properties: {
    rentals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          airport: { type: "string", description: "The 3-letter airport code provided" },
          operator: { type: "string", description: "The operator ID provided" },
          brand: { type: "string", description: "e.g., BMW, Ducati, Honda" },
          model: { type: "string", description: "e.g., R 1300 GS, Multistrada V4" },
          category: { type: "string", description: "One of: adventure, touring, sport-touring, cruiser, classic, scrambler" },
          price_day: { type: "number", description: "The daily rental price in EUR" },
          currency: { type: "string", description: "e.g., EUR, USD, GBP" },
          compatible_destinations: {
            type: "array",
            items: { type: "string" },
            description: "2-3 nearby riding regions in kebab-case"
          }
        },
        required: ["airport", "operator", "brand", "model", "category", "price_day", "currency"]
      }
    }
  },
  required: ["rentals"]
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function appendLog(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

/**
 * Runs an array of async tasks with a concurrency cap.
 * Each task is a zero-arg async function returning a value.
 * Returns an array of results in the same order as the input tasks.
 */
async function runWithConcurrency(tasks, limit) {
  const results = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const idx = nextIndex++;
      results[idx] = await tasks[idx]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Per-target harvester
// ---------------------------------------------------------------------------
async function harvestTarget(target) {
  const { operator_id, airport_code, url } = target;
  const filename = `${airport_code.toLowerCase()}-${operator_id}.json`;
  const outputPath = path.join(HARVEST_DIR, filename);

  console.log(`[BatchHarvest] START  ${airport_code} / ${operator_id}`);
  console.log(`               URL:   ${url}`);
  appendLog(`BATCH-START operator=${operator_id} airport=${airport_code} url=${url}`);

  try {
    const response = await app.scrape(url, {
      waitFor: WAIT_FOR_MS,
      timeout: TIMEOUT_MS,
      formats: [{
        type: "json",
        prompt: `Extract ALL available motorcycle rentals from this page. For each motorcycle, set airport="${airport_code}" and operator="${operator_id}". The category MUST be one of: adventure, touring, sport-touring, cruiser, classic, or scrambler. The price_day should be the daily rental price. currency should be EUR. Extract every single motorcycle listed on this page.`,
        schema: RENTAL_SCHEMA
      }]
    });

    const rentals = response.json?.rentals || response.extract?.rentals || [];

    if (rentals.length === 0) {
      console.warn(`[BatchHarvest] WARN   ${airport_code} / ${operator_id} — 0 rentals extracted`);
      appendLog(`BATCH-WARN 0 rentals for ${operator_id}@${airport_code}`);
      return { target, rentalCount: 0, success: true };
    }

    const output = {
      operator: operator_id,
      airport: airport_code,
      url,
      harvested_at: new Date().toISOString(),
      rental_count: rentals.length,
      rentals
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`[BatchHarvest] OK     ${airport_code} / ${operator_id} — ${rentals.length} rentals → ${filename}`);
    appendLog(`BATCH-OK ${rentals.length} rentals for ${operator_id}@${airport_code} → ${filename}`);
    return { target, rentalCount: rentals.length, success: true };
  } catch (error) {
    console.error(`[BatchHarvest] ERROR  ${airport_code} / ${operator_id} — ${error.message}`);
    appendLog(`BATCH-ERROR ${operator_id}@${airport_code}: ${error.message}`);
    return { target, rentalCount: 0, success: false, error: error.message };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  fs.mkdirSync(HARVEST_DIR, { recursive: true });

  // Read targets
  if (!fs.existsSync(TARGETS_FILE)) {
    console.error(`[BatchHarvest] Target registry not found: ${TARGETS_FILE}`);
    process.exit(1);
  }

  let targets;
  try {
    targets = JSON.parse(fs.readFileSync(TARGETS_FILE, "utf-8"));
  } catch (err) {
    console.error(`[BatchHarvest] Invalid JSON in ${TARGETS_FILE}: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(targets) || targets.length === 0) {
    console.error("[BatchHarvest] europe_targets.json must be a non-empty array");
    process.exit(1);
  }

  // Validate each target has required fields
  for (const t of targets) {
    if (!t.operator_id || !t.airport_code || !t.url) {
      console.error(`[BatchHarvest] Invalid target — missing operator_id, airport_code, or url: ${JSON.stringify(t)}`);
      process.exit(1);
    }
  }

  console.log(`\n========================================`);
  console.log(`  JetMyMoto European Batch Harvest`);
  console.log(`  Targets: ${targets.length}`);
  console.log(`  Concurrency: ${CONCURRENCY}`);
  console.log(`  Firecrawl waitFor=${WAIT_FOR_MS}ms timeout=${TIMEOUT_MS}ms`);
  console.log(`========================================\n`);

  appendLog(`BATCH-RUN ${targets.length} targets, concurrency=${CONCURRENCY}`);

  const tasks = targets.map((target) => () => harvestTarget(target));
  const results = await runWithConcurrency(tasks, CONCURRENCY);

  // Summary
  const successes = results.filter(r => r.success && r.rentalCount > 0);
  const warnings = results.filter(r => r.success && r.rentalCount === 0);
  const failures = results.filter(r => !r.success);
  const totalRentals = results.reduce((sum, r) => sum + r.rentalCount, 0);

  console.log(`\n========================================`);
  console.log(`  BATCH HARVEST COMPLETE`);
  console.log(`  ✓ Success (with data): ${successes.length}`);
  console.log(`  ⚠ Success (0 rentals): ${warnings.length}`);
  console.log(`  ✗ Failed:              ${failures.length}`);
  console.log(`  Total rentals:         ${totalRentals}`);
  console.log(`========================================\n`);

  if (successes.length > 0) {
    console.log("Successful harvests:");
    for (const r of successes) {
      console.log(`  ${r.target.airport_code} / ${r.target.operator_id}: ${r.rentalCount} rentals`);
    }
  }

  if (failures.length > 0) {
    console.log("\nFailed harvests:");
    for (const r of failures) {
      console.log(`  ${r.target.airport_code} / ${r.target.operator_id}: ${r.error}`);
    }
  }

  appendLog(`BATCH-DONE successes=${successes.length} warnings=${warnings.length} failures=${failures.length} total_rentals=${totalRentals}`);

  // Exit 0 if at least one target produced data, so downstream merge/transform runs
  if (successes.length === 0 && totalRentals === 0) {
    console.error("\n[BatchHarvest] No rentals extracted from any target. Pipeline will not continue.");
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[BatchHarvest] Unhandled error:", err.message);
  appendLog(`BATCH-FATAL: ${err.message}`);
  process.exit(1);
});
