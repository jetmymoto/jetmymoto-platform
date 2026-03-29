const fs = require("fs");
const path = require("path");

const HARVEST_DIR = path.join(__dirname, "..", "data", "firecrawl_harvests");
const MASTER_FILE = path.join(HARVEST_DIR, "master_fleet.json");
const LOG_FILE = path.join(HARVEST_DIR, "harvest.log");
const TARGETS_FILE = process.env.HARVEST_TARGETS_FILE
  ? path.resolve(process.cwd(), process.env.HARVEST_TARGETS_FILE)
  : null;

function appendLog(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

function mergeHarvests() {
  let files = fs.readdirSync(HARVEST_DIR)
    .filter(f => f.endsWith(".json") && f !== "master_fleet.json");

  if (TARGETS_FILE) {
    if (!fs.existsSync(TARGETS_FILE)) {
      console.error(`[Merge] HARVEST_TARGETS_FILE not found: ${TARGETS_FILE}`);
      process.exit(1);
    }

    let targets;
    try {
      targets = JSON.parse(fs.readFileSync(TARGETS_FILE, "utf-8"));
    } catch (err) {
      console.error(`[Merge] Invalid JSON in targets file ${TARGETS_FILE}: ${err.message}`);
      process.exit(1);
    }

    const allowedFiles = new Set(
      (Array.isArray(targets) ? targets : []).map((target) => {
        const airport = String(target.airport_code || "").toLowerCase();
        const operator = String(target.operator_id || "");
        return `${airport}-${operator}.json`;
      })
    );

    files = files.filter((file) => allowedFiles.has(file));
    console.log(`[Merge] Target filter active: ${allowedFiles.size} configured file(s)`);
  }

  if (files.length === 0) {
    console.error("[Merge] No per-operator harvest files found in data/firecrawl_harvests/");
    process.exit(1);
  }

  console.log(`[Merge] Found ${files.length} harvest file(s):`);

  const sources = [];
  const allRentals = [];
  const seenKeys = new Set();

  for (const file of files) {
    const filePath = path.join(HARVEST_DIR, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.warn(`[Merge] SKIP ${file} — invalid JSON: ${err.message}`);
      continue;
    }

    const rentals = data.rentals || [];
    console.log(`  ${file}: ${rentals.length} rentals (${data.operator} @ ${data.airport})`);

    sources.push({
      operator: data.operator,
      airport: data.airport,
      url: data.url,
      harvested_at: data.harvested_at,
      rental_count: rentals.length
    });

    for (const rental of rentals) {
      const brand = (rental.brand || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const model = (rental.model || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const airport = (rental.airport || "").toLowerCase();
      const operatorSlug = (rental.operator || "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      // Derive a short operator suffix from the operator id (last segment after last hyphen, or first word)
      const opParts = operatorSlug.split("-");
      const opSuffix = opParts[0] || operatorSlug;
      const key = `${brand}-${model}-${airport}-${opSuffix}`;

      if (seenKeys.has(key)) {
        console.log(`  [dedup] Skipping duplicate: ${key}`);
        continue;
      }
      seenKeys.add(key);
      allRentals.push(rental);
    }
  }

  const master = {
    version: "1.0",
    last_updated: new Date().toISOString(),
    sources,
    rental_count: allRentals.length,
    rentals: allRentals
  };

  fs.writeFileSync(MASTER_FILE, JSON.stringify(master, null, 2));

  console.log(`\n[Merge] master_fleet.json written: ${allRentals.length} rentals from ${sources.length} source(s)`);
  appendLog(`MERGE ${allRentals.length} rentals from ${files.length} files → master_fleet.json`);
}

mergeHarvests();
