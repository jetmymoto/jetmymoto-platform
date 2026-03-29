const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const MASTER_FILE = path.join(__dirname, "..", "data", "firecrawl_harvests", "master_fleet.json");
const RENTALS_FILE = path.join(__dirname, "..", "frontend", "rideratlas", "src", "features", "rentals", "data", "rentals.js");
const OPERATORS_FILE = path.join(__dirname, "..", "frontend", "rideratlas", "src", "features", "rentals", "data", "operators.js");
const TARGETS_FILE = path.join(__dirname, "..", "data", "europe_targets.json");
const LOG_FILE = path.join(__dirname, "..", "data", "firecrawl_harvests", "harvest.log");

const LEGACY_OPERATOR_ALIASES = {
  "eaglerider-mxp": "eagle-rider-mxp",
  "hertz-ride-cdg": "hertz-ride-paris",
};

const AIRPORT_COUNTRY_MAP = {
  CDG: "FR",
  LHR: "GB",
  MXP: "IT",
};

function appendLog(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeOperatorId(operatorId) {
  const normalized = slugify(operatorId);
  return LEGACY_OPERATOR_ALIASES[normalized] || normalized;
}

function normalizeRental(rental) {
  return {
    ...rental,
    airport: String(rental.airport || "").toUpperCase(),
    operator: normalizeOperatorId(rental.operator),
    currency: String(rental.currency || "EUR").toUpperCase(),
  };
}

function buildKey(rental) {
  const brand = slugify(rental.brand);
  const model = slugify(rental.model);
  const airport = (rental.airport || "").toLowerCase();
  const operator = normalizeOperatorId(rental.operator);
  return `${brand}-${model}-${airport}-${operator}`;
}

function formatRentalEntry(key, rental) {
  const destinations = (rental.compatible_destinations || [])
    .map(d => `"${d}"`)
    .join(",");

  return `  "${key}": rental({
    id: "${key}",
    slug: "${key}",
    airport: "${rental.airport}",
    operator: "${rental.operator}",
    brand: "${rental.brand}",
    model: "${rental.model}",
    imageUrl: "",
    category: "${rental.category}",
    price_day: ${rental.price_day},
    currency: "${rental.currency}",
    compatible_destinations: [${destinations}]
  })`;
}

function humanizeOperatorId(operatorId) {
  return String(operatorId || "")
    .split("-")
    .filter(Boolean)
    .map((segment) => {
      if (segment.length <= 3) {
        return segment.toUpperCase();
      }

      return `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`;
    })
    .join(" ");
}

function readTargetsIndex() {
  if (!fs.existsSync(TARGETS_FILE)) {
    return new Map();
  }

  let targets = [];
  try {
    targets = JSON.parse(fs.readFileSync(TARGETS_FILE, "utf-8"));
  } catch (error) {
    console.warn(`[Transform] Could not parse europe_targets.json: ${error.message}`);
    return new Map();
  }

  const index = new Map();
  for (const target of Array.isArray(targets) ? targets : []) {
    const operatorId = normalizeOperatorId(target.operator_id);
    if (!operatorId) {
      continue;
    }

    const current = index.get(operatorId) || {
      operatorId,
      airports: new Set(),
      websiteUrl: "",
    };

    if (target.airport_code) {
      current.airports.add(String(target.airport_code).toUpperCase());
    }

    if (!current.websiteUrl && target.url) {
      current.websiteUrl = target.url;
    }

    index.set(operatorId, current);
  }

  return index;
}

function formatOperatorEntry(operatorId, data) {
  const airports = [...data.airports].map((airport) => `"${airport}"`).join(", ");
  const primaryAirport = [...data.airports][0] || "";
  const country = AIRPORT_COUNTRY_MAP[primaryAirport] || "";

  return `  "${operatorId}": operator({
    id: "${operatorId}",
    slug: "${operatorId}",
    name: "${data.name}",
    type: "local",
    country: "${country}",
    airports: [${airports}],
    website_url: "${data.websiteUrl}",
    status: "unverified",
    pricing_model: "leadgen"
  })`;
}

function injectEntries(existingContent, entries, fileLabel) {
  if (entries.length === 0) {
    return existingContent;
  }

  const closingIndex = existingContent.lastIndexOf("};");
  if (closingIndex === -1) {
    console.error(`[Transform] Could not find closing \`};\` in ${fileLabel}`);
    process.exit(1);
  }

  const beforeClose = existingContent.substring(0, closingIndex).trimEnd();
  const afterClose = existingContent.substring(closingIndex);
  const needsComma = !beforeClose.endsWith(",");
  const comma = needsComma ? "," : "";

  return `${beforeClose}${comma}\n${entries.join(",\n")}\n${afterClose}`;
}

function syntaxCheck(filePath, label) {
  try {
    execFileSync("node", ["--check", filePath], { stdio: "pipe" });
    console.log(`[Transform] Syntax check PASSED for ${label}`);
  } catch (err) {
    console.error(`[Transform] SYNTAX ERROR in ${label}!`);
    console.error(err.stderr?.toString() || err.message);
    appendLog(`TRANSFORM SYNTAX_ERROR ${label} — manual fix required`);
    process.exit(1);
  }
}

function transform() {
  // --- Read master fleet ---
  if (!fs.existsSync(MASTER_FILE)) {
    console.error("[Transform] master_fleet.json not found. Run `npm run harvest:merge` first.");
    process.exit(1);
  }

  const master = JSON.parse(fs.readFileSync(MASTER_FILE, "utf-8"));
  const rentals = master.rentals || [];

  if (rentals.length === 0) {
    console.error("[Transform] master_fleet.json has 0 rentals. Nothing to inject.");
    process.exit(1);
  }

  console.log(`[Transform] Read ${rentals.length} rentals from master_fleet.json`);

  // --- Read existing rentals.js ---
  if (!fs.existsSync(RENTALS_FILE)) {
    console.error("[Transform] rentals.js not found at expected path.");
    process.exit(1);
  }
  if (!fs.existsSync(OPERATORS_FILE)) {
    console.error("[Transform] operators.js not found at expected path.");
    process.exit(1);
  }

  const existingContent = fs.readFileSync(RENTALS_FILE, "utf-8");
  const existingOperatorsContent = fs.readFileSync(OPERATORS_FILE, "utf-8");
  const targetsIndex = readTargetsIndex();

  // --- Build a set of existing rental fingerprints for content-level dedup ---
  // Match airport+operator+brand+model combos already in the file (field order in rentals.js)
  // Normalize model by stripping spaces to handle variants like "K1600 GTL" vs "K 1600 GTL"
  const existingFingerprints = new Set();
  const rentalBlockRegex = /airport:\s*"([^"]+)"[\s\S]*?operator:\s*"([^"]+)"[\s\S]*?brand:\s*"([^"]+)"[\s\S]*?model:\s*"([^"]+)"/g;
  let match;
  while ((match = rentalBlockRegex.exec(existingContent)) !== null) {
    const normModel = match[4].toLowerCase().replace(/\s+/g, "");
    const fp = `${match[3].toLowerCase()}|${normModel}|${match[1].toLowerCase()}|${normalizeOperatorId(match[2])}`;
    existingFingerprints.add(fp);
  }
  console.log(`[Transform] Found ${existingFingerprints.size} existing rental fingerprints`);

  const existingOperatorIds = new Set();
  const operatorBlockRegex = /^\s*"([^"]+)":\s*operator\(\{/gm;
  while ((match = operatorBlockRegex.exec(existingOperatorsContent)) !== null) {
    existingOperatorIds.add(normalizeOperatorId(match[1]));
  }
  console.log(`[Transform] Found ${existingOperatorIds.size} existing operators`);

  // --- Build new entries, skip existing ---
  const newEntries = [];
  const operatorDrafts = new Map();
  let skipped = 0;

  for (const sourceRental of rentals) {
    const rental = normalizeRental(sourceRental);
    const key = buildKey(rental);
    const normModel = (rental.model || "").toLowerCase().replace(/\s+/g, "");
    const fp = `${(rental.brand || "").toLowerCase()}|${normModel}|${(rental.airport || "").toLowerCase()}|${rental.operator}`;

    if (existingFingerprints.has(fp) || existingContent.includes(`"${key}"`)) {
      skipped++;
    } else {
      newEntries.push(formatRentalEntry(key, rental));
      existingFingerprints.add(fp);
    }

    if (!existingOperatorIds.has(rental.operator)) {
      const targetMeta = targetsIndex.get(rental.operator);
      const current = operatorDrafts.get(rental.operator) || {
        name: humanizeOperatorId(rental.operator),
        websiteUrl: targetMeta?.websiteUrl || "",
        airports: new Set(),
      };

      current.airports.add(rental.airport);
      if (!current.websiteUrl && targetMeta?.websiteUrl) {
        current.websiteUrl = targetMeta.websiteUrl;
      }

      if (targetMeta) {
        for (const airport of targetMeta.airports) {
          current.airports.add(airport);
        }
      }

      operatorDrafts.set(rental.operator, current);
    }
  }

  const operatorEntries = [...operatorDrafts.entries()].map(([operatorId, data]) =>
    formatOperatorEntry(operatorId, data)
  );

  if (newEntries.length === 0 && operatorEntries.length === 0) {
    console.log(`[Transform] No new rentals or operators detected (${skipped} rental duplicates skipped).`);
    appendLog(`TRANSFORM no-op: skipped=${skipped} rentals, 0 operator injections`);
    return;
  }

  if (newEntries.length > 0) {
    const nextRentalsContent = injectEntries(existingContent, newEntries, "rentals.js");
    fs.writeFileSync(RENTALS_FILE, nextRentalsContent);
    console.log(`[Transform] Injected ${newEntries.length} new rentals into rentals.js (${skipped} duplicates skipped)`);
  } else {
    console.log(`[Transform] No new rental entries injected (${skipped} duplicates skipped)`);
  }

  if (operatorEntries.length > 0) {
    const nextOperatorsContent = injectEntries(existingOperatorsContent, operatorEntries, "operators.js");
    fs.writeFileSync(OPERATORS_FILE, nextOperatorsContent);
    console.log(`[Transform] Injected ${operatorEntries.length} ghost operators into operators.js`);
  } else {
    console.log("[Transform] No new operator entries injected");
  }

  appendLog(`TRANSFORM injected_rentals=${newEntries.length} skipped_rentals=${skipped} injected_operators=${operatorEntries.length}`);

  syntaxCheck(RENTALS_FILE, "rentals.js");
  syntaxCheck(OPERATORS_FILE, "operators.js");
}

transform();
