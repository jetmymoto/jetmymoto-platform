const FirecrawlApp = require("@mendable/firecrawl-js").default;
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { INTENT_SCHEMA } = require("./intentSchema");

dotenv.config();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const apiKey = process.env.FIRECRAWL_API_KEY;
if (!apiKey) {
  console.error("[IntentHarvest] FIRECRAWL_API_KEY is not set in .env");
  process.exit(1);
}

const app = new FirecrawlApp({ apiKey });

const INTENT_DIR = path.join(__dirname, "..", "data", "intent_harvests");
const LOG_FILE = path.join(INTENT_DIR, "intent_harvest.log");
const TARGETS_FILE = path.join(__dirname, "..", "data", "europe_targets.json");
const CONCURRENCY = Number(process.env.BATCH_CONCURRENCY || 5);
const WAIT_FOR_MS = Number(process.env.FIRECRAWL_WAIT_FOR || 10000);
const TIMEOUT_MS = Number(process.env.FIRECRAWL_TIMEOUT || 120000);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function appendLog(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

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
// Single-target intent harvest
// ---------------------------------------------------------------------------
async function harvestIntent(target) {
  const { operator_id, airport_code, url } = target;
  const filename = `intent-${airport_code.toLowerCase()}-${operator_id}.json`;
  const outputPath = path.join(INTENT_DIR, filename);

  console.log(`[IntentHarvest] Scraping: ${url}`);
  console.log(`[IntentHarvest] Operator: ${operator_id} | Airport: ${airport_code}`);

  appendLog(`START intent operator=${operator_id} airport=${airport_code} url=${url}`);

  try {
    const response = await app.scrape(url, {
      waitFor: WAIT_FOR_MS,
      timeout: TIMEOUT_MS,
      formats: [{
        type: "json",
        prompt: `Analyze this motorcycle rental page and extract ALL search intent signals. For each distinct keyword/phrase this page appears to target (from title tags, H1/H2 headings, meta descriptions, body copy, and URL structure), create an intent record. Set airport_code="${airport_code}" and operator_id="${operator_id}". Focus on motorcycle-specific rental keywords that include location, brand, model, category, or pricing terms. Extract at least 3-5 keyword phrases per page.`,
        schema: INTENT_SCHEMA
      }]
    });

    const intents = response.json?.intents || response.extract?.intents || [];

    const enriched = intents.map((intent) => ({
      ...intent,
      airport_code: airport_code.toUpperCase(),
      operator_id,
      source_url: intent.source_url || url,
      harvestedAt: new Date().toISOString(),
    }));

    const output = {
      operator_id,
      airport_code: airport_code.toUpperCase(),
      source_url: url,
      harvestedAt: new Date().toISOString(),
      intentCount: enriched.length,
      intents: enriched,
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    appendLog(`OK intent operator=${operator_id} airport=${airport_code} count=${enriched.length}`);
    console.log(`[IntentHarvest] ✅ ${enriched.length} intents → ${filename}`);

    return { ok: true, operator_id, airport_code, count: enriched.length };
  } catch (err) {
    const msg = err?.message || String(err);
    appendLog(`FAIL intent operator=${operator_id} airport=${airport_code} error=${msg}`);
    console.error(`[IntentHarvest] ❌ ${operator_id}@${airport_code}: ${msg}`);
    return { ok: false, operator_id, airport_code, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  fs.mkdirSync(INTENT_DIR, { recursive: true });

  if (!fs.existsSync(TARGETS_FILE)) {
    console.error(`[IntentHarvest] Targets file not found: ${TARGETS_FILE}`);
    process.exit(1);
  }

  const targets = JSON.parse(fs.readFileSync(TARGETS_FILE, "utf8"));
  console.log(`[IntentHarvest] ${targets.length} targets loaded, concurrency=${CONCURRENCY}`);

  const tasks = targets.map((target) => () => harvestIntent(target));
  const results = await runWithConcurrency(tasks, CONCURRENCY);

  const ok = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).length;
  const totalIntents = results.reduce((sum, r) => sum + (r.count || 0), 0);

  console.log(`\n[IntentHarvest] Done: ${ok} succeeded, ${fail} failed, ${totalIntents} total intents`);
  appendLog(`BATCH COMPLETE ok=${ok} fail=${fail} totalIntents=${totalIntents}`);
}

main().catch((err) => {
  console.error("[IntentHarvest] Fatal:", err);
  process.exit(1);
});
