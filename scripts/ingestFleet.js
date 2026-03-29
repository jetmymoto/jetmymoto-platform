const FirecrawlApp = require("@mendable/firecrawl-js").default;
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.FIRECRAWL_API_KEY;
if (!apiKey) {
  console.error("[Firecrawl] FIRECRAWL_API_KEY is not set in .env");
  process.exit(1);
}

const app = new FirecrawlApp({ apiKey });

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

async function extractRentalFleet(targetUrl, operatorId, airportCode) {
  console.log(`[Firecrawl] Scraping + extracting fleet from: ${targetUrl}...`);

  try {
    const response = await app.scrape(targetUrl, {
      formats: [{
        type: "json",
        prompt: `Extract ALL available motorcycle rentals from this page. For each motorcycle, set airport="${airportCode}" and operator="${operatorId}". The category MUST be one of: adventure, touring, sport-touring, cruiser, classic, or scrambler. The price_day should be the daily rental price. currency should be EUR. Extract every single motorcycle listed on this page.`,
        schema: RENTAL_SCHEMA
      }]
    });

    const rentals = response.json?.rentals || response.extract?.rentals || [];
    if (rentals.length > 0) {
      console.log(`[Firecrawl] Extraction Successful! ${rentals.length} rentals found.`);
      console.log("[Firecrawl] Ready for Sandbox Validation:");
      console.log(JSON.stringify(rentals, null, 2));
    } else {
      console.warn("[Firecrawl] Extraction returned 0 rentals.");
      console.log("[Firecrawl] Raw response keys:", Object.keys(response));
      console.log("[Firecrawl] Response preview:", JSON.stringify(response, null, 2).substring(0, 2000));
    }
  } catch (error) {
    console.error("[Firecrawl] Error:", error.message);
  }
}

extractRentalFleet(
  "https://www.motorradvermietung.de/muenchen/",
  "allround-rent-muc",
  "MUC"
);
