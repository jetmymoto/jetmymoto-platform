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

const OUTPUT_PATH = path.join(__dirname, "..", "data", "firecrawl_harvests", "luxury_brand_dna.json");

const BENCHMARK_URLS = [
  "https://www.blacktomato.com",
  "https://www.aman.com",
  "https://www.belmond.com",
  "https://www.abercrombiekent.com",
  "https://www.rosewoodhotels.com"
];

const BRAND_SCHEMA = {
  type: "object",
  properties: {
    branding: {
      type: "object",
      properties: {
        primary_colors: {
          type: "array",
          items: { type: "string", description: "The hex code of a primary brand color" },
          maxItems: 3
        },
        font_families: {
          type: "array",
          items: { type: "string", description: "The name of a primary font family used for headings or body" },
          maxItems: 3
        }
      },
      required: ["primary_colors", "font_families"]
    }
  },
  required: ["branding"]
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function harvest() {
  const results = [];

  for (const url of BENCHMARK_URLS) {
    console.log(`\nHarvesting DNA from: ${url}`);
    try {
      const response = await app.scrape(url, {
        formats: [{
          type: "json",
          prompt: "Extract the primary brand colors (hex codes) and font families (up to 3 each) from this luxury travel site. Normalize the response to a JSON object with 'branding' containing 'primary_colors' and 'font_families'.",
          schema: BRAND_SCHEMA
        }]
      });

      const branding = response.json?.branding || response.extract?.branding;

      if (!branding || !branding.primary_colors || !branding.font_families) {
        console.warn(`[Warning] Branding data missing or undefined for ${url}`);
        continue;
      }

      const normalized = {
        url,
        primary_colors: branding.primary_colors.slice(0, 3),
        font_families: branding.font_families.slice(0, 3)
      };

      results.push(normalized);

      console.log(`- Primary Colors: ${normalized.primary_colors.join(', ')}`);
      console.log(`- Font Families: ${normalized.font_families.join(', ')}`);

    } catch (error) {
      console.error(`[Error] Harvesting ${url} failed: ${error.message}`);
    }

    await delay(2000);
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
  console.log(`\nResults written to: ${OUTPUT_PATH}`);
}

harvest();
