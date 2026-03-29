const FirecrawlApp = require("@mendable/firecrawl-js").default;
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const apiKey = process.env.FIRECRAWL_API_KEY;
if (!apiKey) {
  console.error("[Harvest] FIRECRAWL_API_KEY is not set in .env");
  process.exit(1);
}

const app = new FirecrawlApp({ apiKey });

const HARVEST_DIR = path.join(__dirname, "..", "data", "firecrawl_harvests");
const LOG_FILE = path.join(HARVEST_DIR, "harvest.log");
const WAIT_FOR_MS = Number(process.env.FIRECRAWL_WAIT_FOR || 10000);
const TIMEOUT_MS = Number(process.env.FIRECRAWL_TIMEOUT || 120000);

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

function appendLog(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
}

async function harvest(targetUrl, operatorId, airportCode) {
  const filename = `${airportCode.toLowerCase()}-${operatorId}.json`;
  const outputPath = path.join(HARVEST_DIR, filename);

  fs.mkdirSync(HARVEST_DIR, { recursive: true });

  console.log(`[Harvest] Scraping: ${targetUrl}`);
  console.log(`[Harvest] Operator: ${operatorId} | Airport: ${airportCode}`);
  console.log(`[Harvest] Output: ${outputPath}`);
  console.log(`[Harvest] Firecrawl waitFor=${WAIT_FOR_MS}ms timeout=${TIMEOUT_MS}ms`);

  appendLog(`START harvest operator=${operatorId} airport=${airportCode} url=${targetUrl}`);

  try {
    const response = await app.scrape(targetUrl, {
      waitFor: WAIT_FOR_MS,
      timeout: TIMEOUT_MS,
      formats: [{
        type: "json",
        prompt: `Extract ALL available motorcycle rentals from this page. For each motorcycle, set airport="${airportCode}" and operator="${operatorId}". The category MUST be one of: adventure, touring, sport-touring, cruiser, classic, or scrambler. The price_day should be the daily rental price. currency should be EUR. Extract every single motorcycle listed on this page.`,
        schema: RENTAL_SCHEMA
      }]
    });

    const rentals = response.json?.rentals || response.extract?.rentals || [];

    if (rentals.length === 0) {
      console.warn("[Harvest] Extraction returned 0 rentals.");
      appendLog(`WARN 0 rentals extracted for ${operatorId}`);
      return false;
    }

    const output = {
      operator: operatorId,
      airport: airportCode,
      url: targetUrl,
      harvested_at: new Date().toISOString(),
      rental_count: rentals.length,
      rentals
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`[Harvest] ${rentals.length} rentals written to ${filename}`);
    appendLog(`OK ${rentals.length} rentals → ${filename}`);
    return true;
  } catch (error) {
    console.error("[Harvest] Error:", error.message);
    appendLog(`ERROR ${operatorId}: ${error.message}`);
    return false;
  }
}

// --- CLI Interface ---
// Usage: OPERATOR=allround-rent-muc AIRPORT=MUC URL=https://... node scripts/harvestSdk.js
// Or pass args: node scripts/harvestSdk.js <url> <operator> <airport>

const url = process.argv[2] || process.env.URL || "https://www.motorradvermietung.de/muenchen/";
const operator = process.argv[3] || process.env.OPERATOR || "allround-rent-muc";
const airport = process.argv[4] || process.env.AIRPORT || "MUC";

if (!url || !operator || !airport) {
  console.error("Usage: node scripts/harvestSdk.js <url> <operator> <airport>");
  console.error("  Or set URL, OPERATOR, AIRPORT env vars");
  process.exit(1);
}

harvest(url, operator, airport)
  .then(success => {
    process.exitCode = success ? 0 : 1;
  })
  .catch(error => {
    console.error("[Harvest] Unhandled error:", error.message);
    appendLog(`ERROR ${operator}: ${error.message}`);
    process.exit(1);
  });
