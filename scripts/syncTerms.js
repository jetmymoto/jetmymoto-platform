const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const TERMS_DIR = path.join(__dirname, "..", "data", "firecrawl_terms");
const MASTER_FILE = path.join(TERMS_DIR, "master_terms.json");
const REPORT_FILE = path.join(TERMS_DIR, "legal_diff_report.json");
const LOG_FILE = path.join(TERMS_DIR, "harvest_terms.log");
const OPERATORS_FILE = path.join(
  __dirname,
  "..",
  "frontend",
  "rideratlas",
  "src",
  "features",
  "rentals",
  "data",
  "operators.js",
);

const FIELD_DEFAULTS = Object.freeze({
  security_deposit_amount: "Varies by machine",
  security_deposit_policy: "Security deposit authorization applies under operator terms at pickup.",
  cancellation_policy: "Standard",
  terms_last_verified: "",
  source_terms_url: "",
});

const SYNC_FIELDS = Object.keys(FIELD_DEFAULTS);

function appendLog(message) {
  const timestamp = new Date().toISOString();
  fs.mkdirSync(TERMS_DIR, { recursive: true });
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

function escapeJsString(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function normalizeValue(value, fallback = "") {
  const next = String(value || "").trim();
  return next || fallback;
}

function parseOperatorEntries(content) {
  const entryRegex = /^(\s*"([^"]+)":\s*operator\(\{[\s\S]*?^\s*\}\),?)/gm;
  const entries = new Map();
  let match;

  while ((match = entryRegex.exec(content)) !== null) {
    const entryText = match[1];
    const operatorId = match[2];
    const fields = {};

    SYNC_FIELDS.forEach((field) => {
      const fieldMatch = entryText.match(new RegExp(`\\b${field}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
      fields[field] = fieldMatch ? fieldMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\") : "";
    });

    entries.set(operatorId, {
      operatorId,
      entryText,
      fields,
    });
  }

  return entries;
}

function buildNormalizedTerms(source) {
  return {
    security_deposit_amount: normalizeValue(
      source?.security_deposit_amount,
      FIELD_DEFAULTS.security_deposit_amount,
    ),
    security_deposit_policy: normalizeValue(
      source?.security_deposit_policy,
      FIELD_DEFAULTS.security_deposit_policy,
    ),
    cancellation_policy: normalizeValue(
      source?.cancellation_policy,
      FIELD_DEFAULTS.cancellation_policy,
    ),
    terms_last_verified: normalizeValue(source?.terms_last_verified, FIELD_DEFAULTS.terms_last_verified),
    source_terms_url: normalizeValue(source?.source_terms_url, FIELD_DEFAULTS.source_terms_url),
  };
}

function buildDiff(currentFields, nextFields) {
  const changes = [];

  SYNC_FIELDS.forEach((field) => {
    const currentValue = normalizeValue(currentFields?.[field], FIELD_DEFAULTS[field]);
    const nextValue = normalizeValue(nextFields?.[field], FIELD_DEFAULTS[field]);

    if (currentValue !== nextValue) {
      changes.push({
        field,
        current: currentValue,
        harvested: nextValue,
      });
    }
  });

  return changes;
}

function upsertField(entryText, field, value) {
  const escapedValue = escapeJsString(value);
  const fieldRegex = new RegExp(`(\\n\\s*${field}:\\s*)"(?:[^"\\\\]|\\\\.)*"(,?)`);

  if (fieldRegex.test(entryText)) {
    return entryText.replace(fieldRegex, `$1"${escapedValue}"$2`);
  }

  return entryText.replace(/\n(\s*)\}\)/, `,\n$1  ${field}: "${escapedValue}"\n$1})`);
}

function syntaxCheck(filePath, label) {
  execFileSync("node", ["--check", filePath], { stdio: "pipe" });
  console.log(`[SyncTerms] Syntax check PASSED for ${label}`);
}

function run() {
  const applyChanges = process.argv.includes("--apply");

  if (!fs.existsSync(MASTER_FILE)) {
    console.error("[SyncTerms] master_terms.json not found. Run `npm run harvest:terms:merge` first.");
    process.exit(1);
  }

  const masterTerms = JSON.parse(fs.readFileSync(MASTER_FILE, "utf-8"));
  const operatorsContent = fs.readFileSync(OPERATORS_FILE, "utf-8");
  const operatorEntries = parseOperatorEntries(operatorsContent);
  const harvestedOperators = masterTerms.operators || {};
  const report = [];
  let nextOperatorsContent = operatorsContent;

  for (const [operatorId, harvestedPayload] of Object.entries(harvestedOperators)) {
    const existing = operatorEntries.get(operatorId);
    const normalizedTerms = buildNormalizedTerms(harvestedPayload?.terms);

    if (!existing) {
      report.push({
        operatorId,
        status: "missing_operator",
        changes: SYNC_FIELDS.map((field) => ({
          field,
          current: "[operator missing from operators.js]",
          harvested: normalizedTerms[field],
        })),
      });
      continue;
    }

    const changes = buildDiff(existing.fields, normalizedTerms);
    if (changes.length === 0) {
      continue;
    }

    report.push({
      operatorId,
      status: "changed",
      changes,
    });

    if (applyChanges) {
      let updatedEntry = existing.entryText;
      SYNC_FIELDS.forEach((field) => {
        updatedEntry = upsertField(updatedEntry, field, normalizedTerms[field]);
      });

      nextOperatorsContent = nextOperatorsContent.replace(existing.entryText, updatedEntry);
    }
  }

  const reportPayload = {
    generated_at: new Date().toISOString(),
    operator_count: Object.keys(harvestedOperators).length,
    diff_count: report.length,
    diffs: report,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(reportPayload, null, 2));
  console.log(`[SyncTerms] legal_diff_report.json written with ${report.length} diff record(s)`);

  if (applyChanges && nextOperatorsContent !== operatorsContent) {
    fs.writeFileSync(OPERATORS_FILE, nextOperatorsContent);
    syntaxCheck(OPERATORS_FILE, "operators.js");
    appendLog(`APPLY diff_count=${report.length}`);
    console.log("[SyncTerms] Applied harvested legal terms to operators.js");
    return;
  }

  appendLog(`DIFF diff_count=${report.length}`);
}

run();
