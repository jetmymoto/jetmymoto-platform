const FirecrawlApp = require("@mendable/firecrawl-js").default;
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const apiKey = process.env.FIRECRAWL_API_KEY;
if (!apiKey) {
  console.error("[HarvestTerms] FIRECRAWL_API_KEY is not set in .env");
  process.exit(1);
}

const app = new FirecrawlApp({ apiKey });

const TERMS_DIR = path.join(__dirname, "..", "data", "firecrawl_terms");
const LOG_FILE = path.join(TERMS_DIR, "harvest_terms.log");
const DEFAULT_TARGETS_FILE = path.join(__dirname, "..", "data", "europe_targets.json");
const WAIT_FOR_MS = Number(process.env.FIRECRAWL_WAIT_FOR || 10000);
const TIMEOUT_MS = Number(process.env.FIRECRAWL_TIMEOUT || 120000);

const TERMS_SCHEMA = {
  type: "object",
  properties: {
    security_deposit_amount: {
      type: "string",
      description: "Security deposit amount or range exactly as stated on the site. Return empty string if not stated.",
    },
    security_deposit_policy: {
      type: "string",
      description: "Summary of how the deposit is held or charged. Return empty string if not stated.",
    },
    cancellation_policy: {
      type: "string",
      description: "Cancellation or refund rule summary. Return empty string if not stated.",
    },
    terms_last_verified: {
      type: "string",
      description: "Date/version from the source page if explicitly stated, else empty string.",
    },
    source_terms_url: {
      type: "string",
      description: "The exact URL where the terms were found, else use the page URL.",
    },
  },
  required: [
    "security_deposit_amount",
    "security_deposit_policy",
    "cancellation_policy",
    "terms_last_verified",
    "source_terms_url",
  ],
};

function appendLog(message) {
  const timestamp = new Date().toISOString();
  fs.mkdirSync(TERMS_DIR, { recursive: true });
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

function normalizeTerms(rawTerms, targetUrl) {
  const terms = rawTerms || {};
  return {
    security_deposit_amount: String(terms.security_deposit_amount || "").trim(),
    security_deposit_policy: String(terms.security_deposit_policy || "").trim(),
    cancellation_policy: String(terms.cancellation_policy || "").trim(),
    terms_last_verified: String(terms.terms_last_verified || "").trim(),
    source_terms_url: String(terms.source_terms_url || targetUrl || "").trim(),
  };
}

async function harvestTarget(targetUrl, operatorId, airportCode) {
  const filename = `${String(airportCode).toLowerCase()}-${operatorId}.json`;
  const outputPath = path.join(TERMS_DIR, filename);

  fs.mkdirSync(TERMS_DIR, { recursive: true });

  console.log(`[HarvestTerms] Scraping: ${targetUrl}`);
  console.log(`[HarvestTerms] Operator: ${operatorId} | Airport: ${airportCode}`);
  appendLog(`START operator=${operatorId} airport=${airportCode} url=${targetUrl}`);

  try {
    const response = await app.scrape(targetUrl, {
      waitFor: WAIT_FOR_MS,
      timeout: TIMEOUT_MS,
      formats: [{
        type: "json",
        prompt: [
          "Extract rental legal terms from this operator page.",
          `The operator_id is "${operatorId}" and the airport_code is "${airportCode}".`,
          "Return only factual values present on the page or pages the scraper can access.",
          "If a field is not explicitly stated, return an empty string.",
          "Do not invent numbers, currencies, or policies.",
        ].join(" "),
        schema: TERMS_SCHEMA,
      }],
    });

    const terms = normalizeTerms(response.json || response.extract, targetUrl);
    const payload = {
      operator: operatorId,
      airport: airportCode,
      url: targetUrl,
      harvested_at: new Date().toISOString(),
      terms,
    };

    fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
    appendLog(`OK operator=${operatorId} airport=${airportCode} file=${filename}`);
    console.log(`[HarvestTerms] Wrote ${filename}`);
    return true;
  } catch (error) {
    console.error("[HarvestTerms] Error:", error.message);
    appendLog(`ERROR operator=${operatorId} airport=${airportCode} message=${error.message}`);
    return false;
  }
}

function readTargetsFile(targetsFile) {
  const resolvedPath = path.resolve(process.cwd(), targetsFile || DEFAULT_TARGETS_FILE);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Targets file not found: ${resolvedPath}`);
  }

  const payload = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
  return Array.isArray(payload) ? payload : [];
}

async function run() {
  const isBatch = process.argv.includes("--batch");
  const targetsFileArgIndex = process.argv.indexOf("--targets");
  const targetsFile =
    targetsFileArgIndex >= 0 ? process.argv[targetsFileArgIndex + 1] : process.env.HARVEST_TARGETS_FILE;

  if (isBatch) {
    const targets = readTargetsFile(targetsFile);
    let failures = 0;

    for (const target of targets) {
      const ok = await harvestTarget(target.url, target.operator_id, target.airport_code);
      if (!ok) {
        failures += 1;
      }
    }

    if (failures > 0) {
      process.exitCode = 1;
    }
    return;
  }

  const url = process.argv[2] || process.env.URL;
  const operator = process.argv[3] || process.env.OPERATOR;
  const airport = process.argv[4] || process.env.AIRPORT;

  if (!url || !operator || !airport) {
    console.error("Usage: node scripts/harvestTerms.js <url> <operator> <airport>");
    console.error("   or: node scripts/harvestTerms.js --batch [--targets data/europe_targets.json]");
    process.exit(1);
  }

  const success = await harvestTarget(url, operator, airport);
  process.exitCode = success ? 0 : 1;
}

run().catch((error) => {
  console.error("[HarvestTerms] Unhandled error:", error.message);
  appendLog(`ERROR unhandled message=${error.message}`);
  process.exit(1);
});
