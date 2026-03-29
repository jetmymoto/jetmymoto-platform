const fs = require("fs");
const path = require("path");

const TERMS_DIR = path.join(__dirname, "..", "data", "firecrawl_terms");
const MASTER_FILE = path.join(TERMS_DIR, "master_terms.json");
const LOG_FILE = path.join(TERMS_DIR, "harvest_terms.log");

function appendLog(message) {
  const timestamp = new Date().toISOString();
  fs.mkdirSync(TERMS_DIR, { recursive: true });
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

function mergeText(currentValue, nextValue) {
  const next = String(nextValue || "").trim();
  if (next) {
    return next;
  }

  return String(currentValue || "").trim();
}

function mergeTerms() {
  if (!fs.existsSync(TERMS_DIR)) {
    console.error("[MergeTerms] data/firecrawl_terms does not exist.");
    process.exit(1);
  }

  const files = fs.readdirSync(TERMS_DIR)
    .filter((file) => file.endsWith(".json") && file !== "master_terms.json" && file !== "legal_diff_report.json");

  if (files.length === 0) {
    console.error("[MergeTerms] No per-operator term harvest files found.");
    process.exit(1);
  }

  const operators = {};

  for (const file of files) {
    const filePath = path.join(TERMS_DIR, file);
    let data;

    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (error) {
      console.warn(`[MergeTerms] SKIP ${file} — invalid JSON: ${error.message}`);
      continue;
    }

    const operatorId = String(data.operator || "").trim();
    if (!operatorId) {
      continue;
    }

    const current = operators[operatorId] || {
      operator: operatorId,
      airports: [],
      source_urls: [],
      harvested_at: data.harvested_at || "",
      terms: {
        security_deposit_amount: "",
        security_deposit_policy: "",
        cancellation_policy: "",
        terms_last_verified: "",
        source_terms_url: "",
      },
    };

    if (data.airport && !current.airports.includes(data.airport)) {
      current.airports.push(data.airport);
    }

    if (data.url && !current.source_urls.includes(data.url)) {
      current.source_urls.push(data.url);
    }

    current.harvested_at = String(data.harvested_at || current.harvested_at || "");
    current.terms = {
      security_deposit_amount: mergeText(
        current.terms.security_deposit_amount,
        data.terms?.security_deposit_amount,
      ),
      security_deposit_policy: mergeText(
        current.terms.security_deposit_policy,
        data.terms?.security_deposit_policy,
      ),
      cancellation_policy: mergeText(
        current.terms.cancellation_policy,
        data.terms?.cancellation_policy,
      ),
      terms_last_verified: mergeText(
        current.terms.terms_last_verified,
        data.terms?.terms_last_verified,
      ),
      source_terms_url: mergeText(
        current.terms.source_terms_url,
        data.terms?.source_terms_url || data.url,
      ),
    };

    operators[operatorId] = current;
  }

  const master = {
    version: "1.0",
    last_updated: new Date().toISOString(),
    operator_count: Object.keys(operators).length,
    operators,
  };

  fs.writeFileSync(MASTER_FILE, JSON.stringify(master, null, 2));
  appendLog(`MERGE operators=${master.operator_count} file=master_terms.json`);
  console.log(`[MergeTerms] master_terms.json written for ${master.operator_count} operator(s)`);
}

mergeTerms();
