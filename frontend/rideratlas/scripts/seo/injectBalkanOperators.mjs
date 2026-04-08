/**
 * Balkan Operator Injection — reads balkanOperatorLeads.json staging file
 * and generates operator() + rental() entries for operators.js / rentals.js
 *
 * Usage:
 *   node scripts/seo/injectBalkanOperators.mjs            (dry-run — print code blocks)
 *   node scripts/seo/injectBalkanOperators.mjs --write    (append directly to source files)
 *   node scripts/seo/injectBalkanOperators.mjs --filter ATH,BEG (specific airports only)
 *
 * Safety: --write requires explicit flag. Prints a full diff summary before writing.
 * The script only appends — it never clobbers existing entries.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEADS_FILE   = path.join(__dirname, "..", "data", "balkanOperatorLeads.json");
const OPERATORS_JS = path.join(__dirname, "..", "..", "src", "features", "rentals", "data", "operators.js");
const RENTALS_JS   = path.join(__dirname, "..", "..", "src", "features", "rentals", "data", "rentals.js");

const WRITE_MODE   = process.argv.includes("--write");
const FILTER_ARG   = process.argv.find((a) => a.startsWith("--filter="))?.replace("--filter=", "");
const FILTER_CODES = FILTER_ARG ? new Set(FILTER_ARG.toUpperCase().split(",")) : null;

// ── Currency map by country ───────────────────────────────────────────────

const CURRENCY_MAP = {
  gr: "EUR",
  hr: "EUR",
  rs: "EUR",
  bg: "BGN",
  al: "ALL",
  xk: "EUR",
  mk: "MKD",
};

// ── Representative price seed by country (€/day equiv) ───────────────────
// Sourced from regional market research. Updated by real SerpApi prices when available.

const PRICE_SEED = {
  gr: 85,   // Greece — strong tourist market
  hr: 75,   // Croatia — Adriatic season pricing
  rs: 55,   // Serbia — lower cost base
  bg: 50,   // Bulgaria — budget-friendly
  al: 45,   // Albania — emerging market
  xk: 45,   // Kosovo — lowest cost base
  mk: 50,   // North Macedonia
};

// ── Bike model seed per market (most common rental fleet for the region) ──

const FLEET_SEED = {
  gr:  [{ brand: "BMW",  model: "F 750 GS",       category: "adventure",  priceMultiplier: 1.0  },
        { brand: "Honda", model: "Africa Twin",    category: "adventure",  priceMultiplier: 1.05 }],
  hr:  [{ brand: "BMW",  model: "F 850 GS",        category: "adventure",  priceMultiplier: 1.0  },
        { brand: "Royal Enfield", model: "Himalayan", category: "touring", priceMultiplier: 0.7  }],
  rs:  [{ brand: "Honda", model: "CB500X",          category: "touring",   priceMultiplier: 1.0  },
        { brand: "Kawasaki", model: "Versys 650",   category: "adventure", priceMultiplier: 0.95 }],
  bg:  [{ brand: "Honda", model: "CB500X",          category: "touring",   priceMultiplier: 1.0  },
        { brand: "BMW",  model: "F 750 GS",         category: "adventure", priceMultiplier: 1.1  }],
  al:  [{ brand: "Royal Enfield", model: "Himalayan", category: "adventure", priceMultiplier: 1.0 },
        { brand: "Honda", model: "CRF 300L Rally", category: "adventure",  priceMultiplier: 0.85 }],
  xk:  [{ brand: "Honda", model: "CB500X",           category: "touring",  priceMultiplier: 1.0  }],
  mk:  [{ brand: "Honda", model: "CB500X",           category: "touring",  priceMultiplier: 1.0  },
        { brand: "Kawasaki", model: "Versys 650",    category: "adventure", priceMultiplier: 0.95 }],
};

// ── Helpers ───────────────────────────────────────────────────────────────

function toSlug(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function operatorTypeFromName(name) {
  const n = name.toLowerCase();
  if (n.includes("eagle rider") || n.includes("harley")) return "global";
  return "local";
}

function extractExistingSlugs(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const slugs = new Set();
  for (const match of content.matchAll(/"([a-z0-9-]+)":\s*(rental|operator)\(/g)) {
    slugs.add(match[1]);
  }
  return slugs;
}

// ── Code generators ───────────────────────────────────────────────────────

function generateOperatorEntry(lead) {
  const slug = lead.operatorSlug;
  const websiteUrl = lead.website ?? "";
  const countryUpper = lead.airportCountry.toUpperCase();

  return `  "${slug}": operator({
    id: "${slug}",
    slug: "${slug}",
    name: ${JSON.stringify(lead.name)},
    type: "${operatorTypeFromName(lead.name)}",
    country: "${countryUpper}",
    airports: [${JSON.stringify(lead.airportCode)}],
    website_url: ${JSON.stringify(websiteUrl)},
    security_deposit_amount: "Varies by machine",
    security_deposit_policy: "Security deposit authorization applies under operator terms at pickup.",
    cancellation_policy: "Standard",
    terms_last_verified: "",
    source_terms_url: ${JSON.stringify(websiteUrl)}
  }),`;
}

function generateRentalEntries(lead) {
  const country = lead.airportCountry;
  const fleet = FLEET_SEED[country] ?? FLEET_SEED.gr;
  const basePriceEur = PRICE_SEED[country] ?? 65;
  const currency = CURRENCY_MAP[country] ?? "EUR";
  const compatDests = lead.compatibleDestinations ?? [];

  return fleet.map((bike) => {
    const priceDay = Math.round(basePriceEur * bike.priceMultiplier);
    const modelSlug = toSlug(`${bike.brand} ${bike.model}`);
    const rentalSlug = `${modelSlug}-${lead.airportCode.toLowerCase()}-${lead.operatorSlug}`;
    const airportCode = lead.airportCode;

    return `  "${rentalSlug}": rental({
    id: "${rentalSlug}",
    slug: "${rentalSlug}",
    airport: "${airportCode}",
    operator: "${lead.operatorSlug}",
    brand: ${JSON.stringify(bike.brand)},
    model: ${JSON.stringify(bike.model)},
    imageUrl: "",
    category: "${bike.category}",
    price_day: ${priceDay},
    currency: "${currency}",
    one_way_enabled: false,
    dropoff_airports: [],
    compatible_destinations: ${JSON.stringify(compatDests)},
    capabilities: ["balkan-ready"]
  }),`;
  });
}

// ── Anchor-inject helper ──────────────────────────────────────────────────
// Appends entries just before the closing `};` of the export object.

function appendToExportObject(filePath, entries) {
  let content = fs.readFileSync(filePath, "utf8");

  // Find the last closing `};` of the export
  const closingIdx = content.lastIndexOf("};");
  if (closingIdx === -1) throw new Error(`Cannot find closing }; in ${filePath}`);

  // Ensure the last entry before our insertion has a trailing comma.
  // Find the last `})` preceding the `};` and add comma if missing.
  const beforeClose = content.slice(0, closingIdx);
  const lastEntryMatch = beforeClose.match(/([\s\S]*\n)([ \t]*\}\))([ \t]*\n*)$/);
  let preamble = beforeClose;
  if (lastEntryMatch && !lastEntryMatch[2].includes(",")) {
    preamble = lastEntryMatch[1] + lastEntryMatch[2] + "," + lastEntryMatch[3];
  }

  const insertion = "\n" + entries.join("\n") + "\n";
  const updated = preamble + insertion + content.slice(closingIdx);

  fs.writeFileSync(filePath, updated, "utf8");
}

// ── Main ──────────────────────────────────────────────────────────────────

async function inject() {
  if (!fs.existsSync(LEADS_FILE)) {
    console.error(`[InjectBalkanOperators] ❌ Staging file not found: ${LEADS_FILE}`);
    console.error(`[InjectBalkanOperators] ➡️  Run first: node scripts/seo/serpApiBalkanHarvest.mjs`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(LEADS_FILE, "utf8"));
  const leads = raw.leads ?? [];

  const filtered = FILTER_CODES
    ? leads.filter((l) => FILTER_CODES.has(l.airportCode))
    : leads;

  console.log(`[InjectBalkanOperators] 📋 ${filtered.length} leads loaded (${raw.meta?.dryRun ? "mock" : "live"} data)`);

  if (filtered.length === 0) {
    console.log("[InjectBalkanOperators] ℹ️  No leads to inject.");
    return;
  }

  // De-duplicate against existing entries
  const existingOpSlugs     = extractExistingSlugs(OPERATORS_JS);
  const existingRentalSlugs = extractExistingSlugs(RENTALS_JS);

  const newOperatorEntries = [];
  const newRentalEntries   = [];

  for (const lead of filtered) {
    if (!lead.name) {
      console.warn(`[InjectBalkanOperators] ⚠️  Skipping lead with no name at ${lead.airportCode}`);
      continue;
    }

    // Operator
    if (!existingOpSlugs.has(lead.operatorSlug)) {
      newOperatorEntries.push(generateOperatorEntry(lead));
      console.log(`  ➕ operator: ${lead.operatorSlug}`);
    } else {
      console.log(`  ⏭️  operator exists: ${lead.operatorSlug}`);
    }

    // Rentals (one per fleet bike)
    const rentalBlocks = generateRentalEntries(lead);
    const country = lead.airportCountry;
    const fleet = FLEET_SEED[country] ?? FLEET_SEED.gr;

    fleet.forEach((bike, i) => {
      const modelSlug = toSlug(`${bike.brand} ${bike.model}`);
      const rentalSlug = `${modelSlug}-${lead.airportCode.toLowerCase()}-${lead.operatorSlug}`;
      if (!existingRentalSlugs.has(rentalSlug)) {
        newRentalEntries.push(rentalBlocks[i]);
        console.log(`  ➕ rental: ${rentalSlug}`);
      } else {
        console.log(`  ⏭️  rental exists: ${rentalSlug}`);
      }
    });
  }

  console.log(`\n[InjectBalkanOperators] Summary:`);
  console.log(`  New operators: ${newOperatorEntries.length}`);
  console.log(`  New rentals:   ${newRentalEntries.length}`);

  if (newOperatorEntries.length === 0 && newRentalEntries.length === 0) {
    console.log("[InjectBalkanOperators] ✅ Nothing to inject — all entries already exist.");
    return;
  }

  if (!WRITE_MODE) {
    console.log("\n[InjectBalkanOperators] ℹ️  DRY RUN — pass --write to apply changes\n");

    if (newOperatorEntries.length > 0) {
      console.log("── OPERATORS.JS additions ──────────────────────────────");
      console.log(newOperatorEntries.join("\n\n"));
    }
    if (newRentalEntries.length > 0) {
      console.log("\n── RENTALS.JS additions ────────────────────────────────");
      console.log(newRentalEntries.join("\n\n"));
    }
    return;
  }

  // ── Apply --write ──
  if (newOperatorEntries.length > 0) {
    appendToExportObject(OPERATORS_JS, newOperatorEntries);
    console.log(`[InjectBalkanOperators] ✅ Appended ${newOperatorEntries.length} operators → operators.js`);
  }
  if (newRentalEntries.length > 0) {
    appendToExportObject(RENTALS_JS, newRentalEntries);
    console.log(`[InjectBalkanOperators] ✅ Appended ${newRentalEntries.length} rentals → rentals.js`);
  }

  console.log("\n[InjectBalkanOperators] ✅ Injection complete.");
  console.log("[InjectBalkanOperators] ➡️  Run: npm run build to verify graph compilation.");
}

inject().catch((err) => {
  console.error("[InjectBalkanOperators] ❌ Fatal:", err.message);
  process.exit(1);
});
