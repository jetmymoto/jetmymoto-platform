import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import sharp from "sharp";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { buildFlatModelTargets, matchModelTarget } from "./lib/modelTargetMatcher.mjs";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, "../functions/serviceAccountKey.json");
const MODEL_TARGETS_PATH = path.resolve(__dirname, "../data/model_targets.json");
const REPORTS_DIR = path.resolve(__dirname, "../data/harvest_reports");

const BUCKET_NAME = "movie-chat-factory.firebasestorage.app";
const INPUT_PREFIX = "assets/source/cycleworld";
const KEEP_PREFIX = "11clean";
const REJECT_PREFIX = "11reject";
const BORDERLINE_PREFIX = "11borderline";
const MAX_PARALLEL = 5;
const BORDERLINE_MIN = -1;
const KEEP_MIN = 4;
const REJECT_MAX = -2;

const HARD_REJECT_TERMS = [
  "click for review",
  "review",
  "preview",
  "patent",
  "drawing",
  "diagram",
  "cutaway",
  "render",
  "motogp",
  "race",
  "podium",
  "factory racing",
  "team",
  "interview",
  "presenter",
  "manual shifting",
  "e-clutch",
];

const STRONG_KEEP_TERMS = [
  "motorcycle",
  "bike",
  "studio",
  "side profile",
  "parked",
  "buyers guide",
];

const EVENT_TERMS = [
  "launch event",
  "expo",
  "show floor",
  "booth",
  "press conference",
  "event",
  "crowd",
];

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`Missing service account: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

if (!fs.existsSync(MODEL_TARGETS_PATH)) {
  console.error(`Missing model targets: ${MODEL_TARGETS_PATH}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf-8"));
const modelTargetsObj = JSON.parse(fs.readFileSync(MODEL_TARGETS_PATH, "utf-8"));
const flatModelTargets = buildFlatModelTargets(modelTargetsObj);
const knownBrands = new Set(Object.keys(modelTargetsObj).map((brand) => brand.toLowerCase()));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: BUCKET_NAME,
  });
}

const db = getFirestore();
const bucket = getStorage().bucket(BUCKET_NAME);

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function combinedSignal(meta) {
  return [
    meta.alt,
    meta.caption,
    meta.surroundingText,
    meta.pageTitle,
    meta.sourceUrl,
    meta.semanticCategory,
    meta.matchedBrand,
    meta.matchedModel,
  ]
    .filter(Boolean)
    .join(" ");
}

function timestampId() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return [
    d.getUTCFullYear(),
    pad(d.getUTCMonth() + 1),
    pad(d.getUTCDate()),
    "_",
    pad(d.getUTCHours()),
    pad(d.getUTCMinutes()),
    pad(d.getUTCSeconds()),
  ].join("");
}

async function runPool(items, worker, concurrency) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runner() {
    while (true) {
      const current = nextIndex++;
      if (current >= items.length) return;
      results[current] = await worker(items[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runner());
  await Promise.all(workers);
  return results;
}

function countReasons(entries, field) {
  const counts = new Map();
  for (const entry of entries) {
    for (const reason of entry[field] || []) {
      counts.set(reason, (counts.get(reason) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function buildAhashFromPixels(grayBuffer) {
  const total = grayBuffer.reduce((sum, value) => sum + value, 0);
  const avg = total / grayBuffer.length;
  let bits = "";
  for (const value of grayBuffer) {
    bits += value >= avg ? "1" : "0";
  }

  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

function hammingDistance(hashA, hashB) {
  const bitsA = BigInt(`0x${hashA}`);
  const bitsB = BigInt(`0x${hashB}`);
  let x = bitsA ^ bitsB;
  let distance = 0;
  while (x > 0n) {
    distance += Number(x & 1n);
    x >>= 1n;
  }
  return distance;
}

function basenameFromStoragePath(storagePath) {
  return path.basename(storagePath || "");
}

function destinationPath(prefix, filename) {
  return `${prefix}/${filename}`;
}

async function listSourceFiles() {
  const [files] = await bucket.getFiles({ prefix: `${INPUT_PREFIX}/` });
  return files.filter((file) => !file.name.endsWith("/"));
}

async function loadFirestoreMetadata() {
  const map = new Map();
  try {
    const snap = await db.collection("visualAssets").where("source", "==", "cycleworld").get();
    snap.forEach((doc) => {
      const data = doc.data() || {};
      if (data.storagePath) {
        map.set(data.storagePath, data);
      }
    });
  } catch (error) {
    console.error(`[Cleaner] Firestore metadata load failed: ${error.message}`);
  }
  return map;
}

async function loadHarvestReportMetadata() {
  const map = new Map();
  if (!fs.existsSync(REPORTS_DIR)) {
    return map;
  }

  const reportFiles = fs
    .readdirSync(REPORTS_DIR)
    .filter((file) => /^cycleworld_.*\.json$/.test(file))
    .sort();

  for (const reportFile of reportFiles) {
    try {
      const payload = JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, reportFile), "utf-8"));
      for (const item of payload.sampleImages || []) {
        if (item?.storagePath && !map.has(item.storagePath)) {
          map.set(item.storagePath, item);
        }
      }
    } catch (error) {
      console.error(`[Cleaner] Failed to parse report ${reportFile}: ${error.message}`);
    }
  }

  return map;
}

function mergeMetadata(storagePath, firestoreMap, reportMap) {
  const firestoreMeta = firestoreMap.get(storagePath) || {};
  const reportMeta = reportMap.get(storagePath) || {};
  return {
    ...reportMeta,
    ...firestoreMeta,
    storagePath,
  };
}

function addScore(state, delta, reason, bucketType) {
  state.keepScore += delta;
  if (bucketType === "keep") {
    state.keepReasons.push(reason);
  } else {
    state.rejectReasons.push(reason);
  }
}

function analyzeTextSignals(meta, state) {
  const signal = normalizeText(combinedSignal(meta));
  state.signal = signal;

  if (meta.showroomSafe === false) {
    addScore(state, -8, "showroomSafe false", "reject");
    state.autoReject = true;
  }

  if (meta.showroomSafe === true && Number(meta.semanticConfidence || 0) >= 0.8) {
    addScore(state, 7, "showroomSafe true + semanticConfidence >= 0.80", "keep");
    state.autoKeep = true;
  } else if (meta.showroomSafe === true) {
    addScore(state, 3, "showroomSafe true", "keep");
  }

  for (const term of HARD_REJECT_TERMS) {
    if (signal.includes(term)) {
      addScore(state, -6, `hard reject keyword: ${term}`, "reject");
      state.hardReject = true;
    }
  }

  for (const term of STRONG_KEEP_TERMS) {
    if (signal.includes(term)) {
      addScore(state, 1, `strong keep keyword: ${term}`, "keep");
    }
  }

  const modelMatch = matchModelTarget(signal, flatModelTargets);
  if (modelMatch?.model) {
    addScore(state, 4, `exact model match: ${modelMatch.brand} ${modelMatch.model}`, "keep");
    state.modelMatch = modelMatch;
  } else {
    for (const brand of knownBrands) {
      if (signal.includes(brand)) {
        addScore(state, 2, `brand match: ${brand.toUpperCase()}`, "keep");
        break;
      }
    }
  }

  if (meta.matchedBrand && meta.matchedModel) {
    addScore(state, 4, `harvest matched model: ${meta.matchedBrand} ${meta.matchedModel}`, "keep");
  } else if (meta.matchedBrand) {
    addScore(state, 2, `harvest matched brand: ${meta.matchedBrand}`, "keep");
  }

  if (meta.sourcePriority >= 0.8) {
    addScore(state, 1, "high source priority", "keep");
  }

  if (meta.semanticCategory && ["adventure", "touring", "scrambler", "naked", "sport", "dual-sport"].includes(meta.semanticCategory)) {
    addScore(state, 1, `semantic category: ${meta.semanticCategory}`, "keep");
  }

  for (const term of EVENT_TERMS) {
    if (signal.includes(term)) {
      addScore(state, -4, `event keyword: ${term}`, "reject");
      break;
    }
  }
}

function skinTone(rgb, i) {
  const r = rgb[i];
  const g = rgb[i + 1];
  const b = rgb[i + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return r > 95 && g > 40 && b > 20 && max - min > 15 && Math.abs(r - g) > 15 && r > g && r > b;
}

async function analyzeImageHeuristics(file, meta, state) {
  try {
    const [buffer] = await file.download();
    state.originalBytes = buffer.length;

    const image = sharp(buffer).rotate();
    const metadata = await image.metadata();
    const width = metadata.width || Number(meta.width) || 0;
    const height = metadata.height || Number(meta.height) || 0;
    const aspect = width && height ? width / height : 0;

    state.width = width;
    state.height = height;
    state.aspectRatio = aspect;

    if (width > 0 && height > 0 && width * height >= 500000) {
      addScore(state, 1, "usable resolution", "keep");
    }

    if (width < 520 || height < 300 || (width > 0 && height > 0 && width * height < 180000)) {
      addScore(state, -4, "thumbnail-like dimensions", "reject");
    }

    if (aspect > 2.6 || aspect < 0.5) {
      addScore(state, -4, "banner-like aspect ratio", "reject");
    }

    const gray64 = await image
      .resize(64, 64, { fit: "fill" })
      .grayscale()
      .raw()
      .toBuffer();

    state.ahash = buildAhashFromPixels(
      await image.resize(8, 8, { fit: "fill" }).grayscale().raw().toBuffer()
    );

    let edgeHits = 0;
    let comparisons = 0;
    let sum = 0;
    let sumSquares = 0;
    let whitePixels = 0;
    let darkPixels = 0;

    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const idx = y * 64 + x;
        const value = gray64[idx];
        sum += value;
        sumSquares += value * value;
        if (value >= 235) whitePixels++;
        if (value <= 25) darkPixels++;

        if (x < 63) {
          comparisons++;
          if (Math.abs(value - gray64[idx + 1]) > 40) edgeHits++;
        }
        if (y < 63) {
          comparisons++;
          if (Math.abs(value - gray64[idx + 64]) > 40) edgeHits++;
        }
      }
    }

    const avg = sum / gray64.length;
    const variance = sumSquares / gray64.length - avg * avg;
    const stdDev = Math.sqrt(Math.max(variance, 0));
    const edgeDensity = comparisons > 0 ? edgeHits / comparisons : 0;
    const whiteRatio = whitePixels / gray64.length;
    const darkRatio = darkPixels / gray64.length;

    state.edgeDensity = edgeDensity;
    state.stdDev = stdDev;
    state.whiteRatio = whiteRatio;
    state.darkRatio = darkRatio;

    const rgb64 = await image
      .resize(64, 64, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer();

    let skinPixels = 0;
    for (let i = 0; i < rgb64.length; i += 3) {
      if (skinTone(rgb64, i)) skinPixels++;
    }
    const skinRatio = skinPixels / (rgb64.length / 3);
    state.skinRatio = skinRatio;

    if (edgeDensity > 0.19 && (whiteRatio > 0.18 || darkRatio > 0.22)) {
      addScore(state, -5, "text-heavy thumbnail/banner", "reject");
    }

    if (stdDev < 28 && (whiteRatio > 0.3 || darkRatio > 0.35)) {
      addScore(state, -5, "flat graphic / infographic-like", "reject");
    }

    if (skinRatio > 0.18 && !state.modelMatch && !meta.matchedModel) {
      addScore(state, -4, "person-dominant image", "reject");
    }

    if (skinRatio > 0.1 && state.signal && EVENT_TERMS.some((term) => state.signal.includes(term))) {
      addScore(state, -4, "event floor / launch image", "reject");
    }

    if (aspect >= 0.7 && aspect <= 2.2 && edgeDensity < 0.18 && skinRatio < 0.15) {
      addScore(state, 2, "one dominant motorcycle / clean composition", "keep");
    }

    if (meta.framing && ["wide", "medium", "tight"].includes(meta.framing) && skinRatio < 0.15) {
      addScore(state, 1, `usable framing: ${meta.framing}`, "keep");
    }
  } catch (error) {
    state.analysisError = error.message;
    addScore(state, -1, "image analysis failed", "reject");
  }
}

async function scoreFile(file, firestoreMap, reportMap) {
  const storagePath = file.name;
  const meta = mergeMetadata(storagePath, firestoreMap, reportMap);
  const state = {
    storagePath,
    filename: basenameFromStoragePath(storagePath),
    keepScore: 0,
    keepReasons: [],
    rejectReasons: [],
    hardReject: false,
    autoKeep: false,
    autoReject: false,
    modelMatch: null,
    signal: "",
  };

  analyzeTextSignals(meta, state);
  await analyzeImageHeuristics(file, meta, state);

  let decision = "borderline";
  if (state.autoReject || state.hardReject || state.keepScore <= REJECT_MAX) {
    decision = "reject";
  } else if (state.autoKeep || state.keepScore >= KEEP_MIN) {
    decision = "keep";
  } else if (state.keepScore >= BORDERLINE_MIN) {
    decision = "borderline";
  } else {
    decision = "reject";
  }

  return {
    ...meta,
    ...state,
    decision,
  };
}

function applyDuplicateRejection(scoredEntries) {
  const duplicates = [];
  const sorted = [...scoredEntries].sort((a, b) => {
    const priorityA = (a.keepScore || 0) + (a.autoKeep ? 10 : 0) + (a.matchedModel ? 3 : 0);
    const priorityB = (b.keepScore || 0) + (b.autoKeep ? 10 : 0) + (b.matchedModel ? 3 : 0);
    return priorityB - priorityA;
  });

  const acceptedHashes = [];
  for (const entry of sorted) {
    if (!entry.ahash) continue;

    let duplicateOf = null;
    for (const prior of acceptedHashes) {
      const distance = hammingDistance(entry.ahash, prior.ahash);
      if (distance <= 4) {
        duplicateOf = prior;
        break;
      }
    }

    if (duplicateOf) {
      entry.decision = "reject";
      entry.rejectReasons.push(`near-duplicate of ${duplicateOf.filename}`);
      entry.keepScore = Math.min(entry.keepScore, -3);
      duplicates.push(entry.storagePath);
    } else {
      acceptedHashes.push(entry);
    }
  }

  return duplicates.length;
}

async function copyToBucket(sourcePath, targetPrefix) {
  const filename = basenameFromStoragePath(sourcePath);
  const destination = destinationPath(targetPrefix, filename);
  const sourceFile = bucket.file(sourcePath);
  const destFile = bucket.file(destination);

  const [exists] = await destFile.exists();
  if (exists) return destination;

  await sourceFile.copy(destFile);
  return destination;
}

async function routeEntry(entry) {
  const prefix =
    entry.decision === "keep"
      ? KEEP_PREFIX
      : entry.decision === "reject"
        ? REJECT_PREFIX
        : BORDERLINE_PREFIX;

  try {
    entry.routedPath = await copyToBucket(entry.storagePath, prefix);
    entry.routeError = null;
  } catch (error) {
    entry.routeError = error.message;
  }
  return entry;
}

function topSamples(entries, limit = 20) {
  return entries
    .slice()
    .sort((a, b) => (b.keepScore || 0) - (a.keepScore || 0))
    .slice(0, limit)
    .map((entry) => ({
      filename: entry.filename,
      storagePath: entry.storagePath,
      score: entry.keepScore,
      keepReasons: entry.keepReasons.slice(0, 5),
      rejectReasons: entry.rejectReasons.slice(0, 5),
      matchedBrand: entry.matchedBrand || entry.modelMatch?.brand || null,
      matchedModel: entry.matchedModel || entry.modelMatch?.model || null,
      width: entry.width || null,
      height: entry.height || null,
      sourceUrl: entry.sourceUrl || null,
    }));
}

async function main() {
  console.log(`[Cleaner] Loading source files from ${INPUT_PREFIX}/ ...`);
  const [firestoreMap, reportMap, files] = await Promise.all([
    loadFirestoreMetadata(),
    loadHarvestReportMetadata(),
    listSourceFiles(),
  ]);

  console.log(`[Cleaner] Files found: ${files.length}`);
  console.log(`[Cleaner] Firestore metadata entries: ${firestoreMap.size}`);
  console.log(`[Cleaner] Harvest report metadata entries: ${reportMap.size}`);

  const scoredEntries = await runPool(
    files,
    (file) => scoreFile(file, firestoreMap, reportMap),
    MAX_PARALLEL
  );

  const duplicateCount = applyDuplicateRejection(scoredEntries);

  const kept = scoredEntries.filter((entry) => entry.decision === "keep");
  const rejected = scoredEntries.filter((entry) => entry.decision === "reject");
  const borderline = scoredEntries.filter((entry) => entry.decision === "borderline");

  console.log(`[Cleaner] Routing keep=${kept.length}, reject=${rejected.length}, borderline=${borderline.length}`);

  await runPool(scoredEntries, routeEntry, MAX_PARALLEL);

  const rejectCounts = countReasons(rejected, "rejectReasons");
  const keepCounts = countReasons(kept, "keepReasons");

  const report = {
    timestamp: new Date().toISOString(),
    total: scoredEntries.length,
    kept: kept.length,
    rejected: rejected.length,
    borderline: borderline.length,
    duplicates: duplicateCount,
    topRejectReasons: rejectCounts.slice(0, 20).map(([reason, count]) => ({ reason, count })),
    topKeepReasons: keepCounts.slice(0, 20).map(([reason, count]) => ({ reason, count })),
    keepSamples: topSamples(kept),
    rejectSamples: topSamples(rejected),
    borderlineSamples: topSamples(borderline),
    entries: scoredEntries.map((entry) => ({
      filename: entry.filename,
      storagePath: entry.storagePath,
      decision: entry.decision,
      score: entry.keepScore,
      keepReasons: entry.keepReasons,
      rejectReasons: entry.rejectReasons,
      matchedBrand: entry.matchedBrand || entry.modelMatch?.brand || null,
      matchedModel: entry.matchedModel || entry.modelMatch?.model || null,
      showroomSafe: entry.showroomSafe ?? null,
      semanticConfidence: entry.semanticConfidence ?? null,
      sourceUrl: entry.sourceUrl || null,
      routedPath: entry.routedPath || null,
      routeError: entry.routeError || null,
      width: entry.width || null,
      height: entry.height || null,
      aspectRatio: entry.aspectRatio || null,
      edgeDensity: entry.edgeDensity || null,
      skinRatio: entry.skinRatio || null,
      ahash: entry.ahash || null,
    })),
  };

  const reportPath = path.join(REPORTS_DIR, `clean_gallery_${timestampId()}.json`);
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("");
  console.log("[Cleaner] Summary");
  console.log(`  Total scanned:      ${scoredEntries.length}`);
  console.log(`  Kept:               ${kept.length}`);
  console.log(`  Rejected:           ${rejected.length}`);
  console.log(`  Borderline:         ${borderline.length}`);
  console.log(`  Duplicates removed: ${duplicateCount}`);
  console.log(`  Top reject reasons:`);
  for (const [reason, count] of rejectCounts.slice(0, 10)) {
    console.log(`    ${count} × ${reason}`);
  }
  console.log(`  Top keep reasons:`);
  for (const [reason, count] of keepCounts.slice(0, 10)) {
    console.log(`    ${count} × ${reason}`);
  }
  console.log(`  Report:             ${reportPath}`);
}

main().catch((error) => {
  console.error(`[Cleaner] Fatal: ${error.message}`);
  process.exit(1);
});
