const fs = require("fs");
const path = require("path");

const INTENT_DIR = path.join(__dirname, "..", "data", "intent_harvests");
const MASTER_FILE = path.join(INTENT_DIR, "master_intents.json");
const LOG_FILE = path.join(INTENT_DIR, "intent_harvest.log");

// ---------------------------------------------------------------------------
// Quality filter constants (🔴6)
// ---------------------------------------------------------------------------
const MIN_KEYWORD_WORDS = 3;

const STOPWORDS = new Set([
  "best", "cheap", "cheapest", "top", "most", "popular",
  "good", "great", "amazing", "awesome", "excellent",
  "near", "nearby", "around", "close",
  "rental", "rentals", "rent", "hire",
  "motorcycle", "motorbike", "bike", "scooter",
  "for", "in", "at", "the", "a", "an", "to", "of", "and", "or",
  "with", "from", "on", "by", "is", "are", "was", "were",
]);

function normalizeKeywordRoot(keyword) {
  return String(keyword || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .join("-");
}

function appendLog(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

// ---------------------------------------------------------------------------
// Quality gate — reject low-quality signals (🔴6)
// ---------------------------------------------------------------------------
function passesQuality(intent, validAirportCodes, seenRoots) {
  const kw = String(intent.keyword || "").trim();

  // Reject: fewer than MIN_KEYWORD_WORDS words
  if (kw.split(/\s+/).length < MIN_KEYWORD_WORDS) return { pass: false, reason: "too-short" };

  // Reject: no valid airport code match
  const code = String(intent.airport_code || "").toUpperCase();
  if (validAirportCodes.size > 0 && !validAirportCodes.has(code)) {
    return { pass: false, reason: "no-airport-match" };
  }

  // Reject: duplicate semantic root (first-seen wins)
  const root = normalizeKeywordRoot(kw);
  const rootKey = `${code}::${root}`;
  if (seenRoots.has(rootKey)) return { pass: false, reason: "duplicate-root" };
  seenRoots.add(rootKey);

  return { pass: true, reason: null };
}

// ---------------------------------------------------------------------------
// Merger
// ---------------------------------------------------------------------------
function mergeIntents() {
  // Load valid airport codes for quality filter
  let validAirportCodes = new Set();
  try {
    const airportIndexPath = path.join(
      __dirname, "..", "frontend", "rideratlas", "src",
      "features", "airport", "network", "airportIndex.js"
    );
    const content = fs.readFileSync(airportIndexPath, "utf-8");
    const codeMatches = content.match(/"([A-Z]{3})":/g) || [];
    validAirportCodes = new Set(codeMatches.map((m) => m.replace(/"/g, "").replace(":", "")));
    console.log(`[MergeIntents] Loaded ${validAirportCodes.size} valid airport codes`);
  } catch {
    console.warn("[MergeIntents] Could not load airportIndex — skipping airport validation");
  }

  const files = fs.readdirSync(INTENT_DIR)
    .filter((f) => f.startsWith("intent-") && f.endsWith(".json") && f !== "master_intents.json");

  if (files.length === 0) {
    console.error("[MergeIntents] No intent harvest files found in data/intent_harvests/");
    process.exit(1);
  }

  console.log(`[MergeIntents] Found ${files.length} intent harvest file(s)`);

  const sources = [];
  const allIntents = [];
  const seenRoots = new Set();
  let rejected = { "too-short": 0, "no-airport-match": 0, "duplicate-root": 0 };

  for (const file of files) {
    const filePath = path.join(INTENT_DIR, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.warn(`[MergeIntents] SKIP ${file} — invalid JSON: ${err.message}`);
      continue;
    }

    const intents = data.intents || [];
    console.log(`  ${file}: ${intents.length} intents (${data.operator_id} @ ${data.airport_code})`);

    sources.push({
      operator_id: data.operator_id,
      airport_code: data.airport_code,
      source_url: data.source_url,
      harvestedAt: data.harvestedAt,
      intentCount: intents.length,
    });

    for (const intent of intents) {
      const { pass, reason } = passesQuality(intent, validAirportCodes, seenRoots);
      if (!pass) {
        rejected[reason] = (rejected[reason] || 0) + 1;
        continue;
      }

      allIntents.push({
        keyword: intent.keyword,
        airportCode: String(intent.airport_code || "").toUpperCase(),
        operatorId: intent.operator_id,
        sourceUrl: intent.source_url || data.source_url,
        pageTitle: intent.page_title || null,
        metaDescription: intent.meta_description || null,
        brandsMentioned: intent.brands_mentioned || [],
        modelsMentioned: intent.models_mentioned || [],
        categoriesMentioned: intent.categories_mentioned || [],
        priceSignals: intent.price_signals || [],
        lastSeenAt: intent.harvestedAt || data.harvestedAt,
        frequency: 1, // incremented on re-harvest merge
      });
    }
  }

  const master = {
    version: "1.0",
    lastUpdated: new Date().toISOString(),
    sources,
    stats: {
      totalIntents: allIntents.length,
      rejected,
      sourceFiles: files.length,
    },
    intents: allIntents,
  };

  fs.mkdirSync(INTENT_DIR, { recursive: true });
  fs.writeFileSync(MASTER_FILE, JSON.stringify(master, null, 2));

  console.log(`\n[MergeIntents] master_intents.json written:`);
  console.log(`  ${allIntents.length} intents from ${sources.length} source(s)`);
  console.log(`  Rejected: ${JSON.stringify(rejected)}`);
  appendLog(`MERGE ${allIntents.length} intents from ${files.length} files → master_intents.json`);
}

mergeIntents();
