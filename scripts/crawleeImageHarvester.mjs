/**
 * crawleeImageHarvester.mjs
 *
 * Self-hosted image harvesting pipeline using Crawlee + Playwright.
 * Replaces Firecrawl-based extraction for zero-cost, scalable,
 * JavaScript-rendered image extraction from editorial sites.
 *
 * Features:
 *   - PlaywrightCrawler with auto-scroll for lazy-loaded images
 *   - srcset mastering (always picks highest resolution)
 *   - Rich metadata extraction (alt, caption, position, context)
 *   - SHA256 content hashing + dedup
 *   - Firebase Storage upload + Firestore visualAssets registration
 *   - DRY_RUN mode + detailed harvest report
 *
 * Usage:
 *   node scripts/crawleeImageHarvester.mjs
 *   DRY_RUN=1 node scripts/crawleeImageHarvester.mjs
 *   SOURCE_URL=https://www.cycleworld.com/motorcycles/ node scripts/crawleeImageHarvester.mjs
 *
 * Integration:
 *   After ingestion, run `node scripts/tagVisualAssets.mjs` to enrich
 *   with Gemini Vision tagging (imageType, composition, lighting, etc.)
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import sharp from "sharp";
import { PlaywrightCrawler, Configuration } from "crawlee";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { resolveModelSemantic, buildKnownTargets } from "./lib/semanticModelResolver.mjs";
import { resolveBatch, getCacheStats, buildKnownTargets as buildKnownTargetsBatch } from "./lib/semanticBatchResolver.mjs";
import { resolveBatchWithSerp, getSerpCacheStats } from "./lib/serpImageResolver.mjs";
import { buildFlatModelTargets, matchModelTarget as matchModelTargetFromSignal } from "./lib/modelTargetMatcher.mjs";
import { transformImage } from "./lib/imageTransformer.mjs";

dotenv.config();

// ── Config ───────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ACCOUNT_PATH = path.resolve(
  __dirname,
  "../functions/serviceAccountKey.json"
);
const BUCKET_NAME = "movie-chat-factory.firebasestorage.app";

const DRY_RUN =
  process.env.DRY_RUN === "1" || !fs.existsSync(SERVICE_ACCOUNT_PATH);

const SOURCE_URL =
  process.env.SOURCE_URL || "https://www.cycleworld.com/";
const SOURCE_NAME = process.env.SOURCE_NAME || "cycleworld";
const MAX_DEPTH = parseInt(process.env.MAX_DEPTH || "3", 10);
const MAX_REQUESTS = parseInt(process.env.MAX_REQUESTS || "500", 10);
const MAX_CONCURRENCY = parseInt(process.env.MAX_CONCURRENCY || "3", 10);
const SEMANTIC_BATCH_SIZE = parseInt(process.env.SEMANTIC_BATCH_SIZE || "20", 10);
const MIN_IMAGE_WIDTH = 600;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20MB safety cap
const FETCH_TIMEOUT_MS = 30_000;

// ── Harvest Mode ─────────────────────────────────────────────────────
// MODE 1: BROAD (default) — explore + discover, no model filtering
// MODE 2: TARGETED — MODEL_FILTER=1, only keeps images matching model_targets.json
const MODEL_FILTER = process.env.MODEL_FILTER === "1";
const SHOWROOM = process.env.SHOWROOM === "1";
const SEMANTIC_MODE = process.env.SEMANTIC_MODE === "1";
const SERP_ENABLED = process.env.SERP_ENABLED === "1";
const IMAGE_TRANSFORM_ENABLED = process.env.IMAGE_TRANSFORM_ENABLED !== "0";
const MODEL_TARGETS_PATH = path.resolve(
  __dirname,
  "../data/model_targets.json"
);

// Load model targets when MODEL_FILTER is enabled
let modelTargets = {};
let flatModelNames = [];
if (MODEL_FILTER) {
  if (!fs.existsSync(MODEL_TARGETS_PATH)) {
    console.error(`[Harvester] MODEL_FILTER=1 but ${MODEL_TARGETS_PATH} not found`);
    process.exit(1);
  }
  modelTargets = JSON.parse(fs.readFileSync(MODEL_TARGETS_PATH, "utf-8"));
  flatModelNames = buildFlatModelTargets(modelTargets);
  console.log(`[Harvester] MODEL_FILTER active — ${flatModelNames.length} models loaded from ${Object.keys(modelTargets).length} brands`);
  if (SHOWROOM) {
    console.log(`[Harvester] SHOWROOM mode — rejecting action/racing/crowded images`);
  }
}

// Build knownTargets array for semantic resolver (always loaded if targets exist)
let knownTargets = [];
if (fs.existsSync(MODEL_TARGETS_PATH)) {
  const targetsObj = JSON.parse(fs.readFileSync(MODEL_TARGETS_PATH, "utf-8"));
  knownTargets = buildKnownTargets(targetsObj);
}
if (SEMANTIC_MODE) {
  if (knownTargets.length === 0) {
    console.error("[Harvester] SEMANTIC_MODE=1 but no model targets loaded");
    process.exit(1);
  }
  console.log(`[Harvester] SEMANTIC_MODE active — LLM-powered model resolution via Gemini 2.5 Flash`);
}

// URL pattern blocklist for non-content images
const URL_BLOCKLIST_PATTERNS = [
  /icon/i,
  /logo/i,
  /avatar/i,
  /sprite/i,
  /favicon/i,
  /badge/i,
  /button/i,
  /arrow/i,
  /pixel/i,
  /tracking/i,
  /ad[_-]?banner/i,
  /\.svg$/i,
  /\.gif$/i,
  /data:image/i,
];

// ── Statistics ────────────────────────────────────────────────────────
const stats = {
  pagesCrawled: 0,
  imagesFound: 0,
  imagesKept: 0,
  transformed: 0,
  transformFallbacks: 0,
  rejectedSmall: 0,
  rejectedUi: 0,
  rejectedDuplicate: 0,
  rejectedNoSrc: 0,
  rejectedFetchFail: 0,
  rejectedBadContentType: 0,
  rejectedTooLarge: 0,
  uploaded: 0,
  firestoreWrites: 0,
  errors: [],
};

const seenHashes = new Set();
const seenUrls = new Set();
const harvestedImages = [];

// Targeted mode stats
const targetedStats = {
  modelMatches: 0,
  modelSkipped: 0,
  showroomRejected: 0,
  matchedModels: {},  // { "BMW R1250GS": count }
};

// Semantic mode stats
const semanticStats = {
  calls: 0,
  apiCalls: 0,     // actual Gemini API requests (batch)
  kept: 0,
  rejected: 0,
  errors: 0,
  avgConfidence: 0,
  confidenceSum: 0,
  matchedModels: {},
  categories: {},
};

// SerpAPI pre-resolution stats
const serpStats = {
  calls: 0,
  resolved: 0,    // images resolved by SERP (skipped LLM)
  fallthrough: 0, // images that fell through to LLM
  errors: 0,
  avgConfidence: 0,
  confidenceSum: 0,
};

// ── Firebase Init ────────────────────────────────────────────────────
let db, bucket;

if (!DRY_RUN) {
  const serviceAccount = JSON.parse(
    fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf-8")
  );
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: BUCKET_NAME,
    });
  }
  db = getFirestore();
  bucket = getStorage().bucket();
} else {
  console.log("[Harvester] DRY_RUN mode — no Firebase writes");
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Detect content context from the page URL path.
 */
function detectContext(pageUrl) {
  const urlLower = pageUrl.toLowerCase();
  if (urlLower.includes("/gallery")) return "gallery";
  if (urlLower.includes("/review")) return "review";
  if (urlLower.includes("/news")) return "editorial";
  if (urlLower.includes("/buyers-guide")) return "buyers-guide";
  if (urlLower.includes("/first-look")) return "first-look";
  if (urlLower.includes("/comparison")) return "comparison";
  if (urlLower.includes("/motorcycle")) return "model-page";
  if (urlLower.includes("/video")) return "video";
  return "editorial";
}

/**
 * Parse srcset and return the highest-resolution URL.
 * Prefers width descriptors (w), falls back to pixel density (x),
 * then falls back to the last entry.
 */
function bestFromSrcset(srcset) {
  if (!srcset || typeof srcset !== "string") return null;

  const entries = srcset
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const parts = entry.split(/\s+/);
      const url = parts[0];
      const descriptor = parts[1] || "";
      const wMatch = descriptor.match(/^(\d+)w$/);
      const xMatch = descriptor.match(/^([\d.]+)x$/);
      return {
        url,
        width: wMatch ? parseInt(wMatch[1], 10) : 0,
        density: xMatch ? parseFloat(xMatch[1]) : 0,
      };
    });

  if (entries.length === 0) return null;

  // Prefer highest width descriptor
  const byWidth = entries.filter((e) => e.width > 0);
  if (byWidth.length > 0) {
    byWidth.sort((a, b) => b.width - a.width);
    return byWidth[0].url;
  }

  // Fall back to highest density descriptor
  const byDensity = entries.filter((e) => e.density > 0);
  if (byDensity.length > 0) {
    byDensity.sort((a, b) => b.density - a.density);
    return byDensity[0].url;
  }

  // Last resort: last entry
  return entries[entries.length - 1].url;
}

/**
 * Resolve absolute URL from a potentially relative src.
 */
function resolveUrl(src, baseUrl) {
  if (!src) return null;
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return null;
  }
}

/**
 * Check if a URL matches any blocklist pattern.
 */
function isBlockedUrl(url) {
  return URL_BLOCKLIST_PATTERNS.some((pattern) => pattern.test(url));
}

/**
 * Rewrite resizer/CDN URLs to extract original high-resolution source.
 * CycleWorld uses: /resizer/v2/{encoded-cloudfront-url}?width=96&height=64&auth=...
 * We extract the original cloudfront URL for full-resolution access.
 */
function rewriteToHighRes(url) {
  if (!url) return url;

  // CycleWorld Arc Publishing resizer pattern
  const resizerMatch = url.match(
    /\/resizer\/v2\/(https?%3A%2F%2F[^?]+)/i
  );
  if (resizerMatch) {
    try {
      const decoded = decodeURIComponent(resizerMatch[1]);
      if (decoded.startsWith("http")) {
        return decoded;
      }
    } catch {
      // Fall through to original
    }
  }

  return url;
}

/**
 * Compute aspect ratio label from dimensions.
 */
function computeAspectRatio(width, height) {
  if (!width || !height) return "unknown";
  const ratio = width / height;
  if (ratio >= 2.2) return "21:9";
  if (ratio >= 1.7) return "16:9";
  if (ratio >= 1.4) return "3:2";
  if (ratio >= 1.2) return "4:3";
  if (ratio >= 0.9) return "1:1";
  if (ratio >= 0.7) return "3:4";
  if (ratio >= 0.5) return "2:3";
  return "9:16";
}

/**
 * Compute orientation from dimensions.
 */
function computeOrientation(width, height) {
  if (!width || !height) return "unknown";
  if (width > height) return "landscape";
  if (height > width) return "portrait";
  return "square";
}

/**
 * Match image text signals against model targets.
 * Returns { brand, model } if matched, null otherwise.
 * Checks: alt text, surrounding text, caption, page title.
 */
function matchModelTarget(textSignals) {
  if (!MODEL_FILTER || flatModelNames.length === 0) return null;

  const signal = [
    textSignals.alt || "",
    textSignals.surroundingText || "",
    textSignals.caption || "",
    textSignals.pageTitle || "",
    textSignals.pageUrl || "",
  ]
    .join(" ");

  return matchModelTargetFromSignal(signal, flatModelNames);
}

/**
 * Showroom quality filter — rejects images unsuitable for rental showroom.
 * Checks alt text, caption, URL path for action/racing/crowded signals.
 * Returns { pass: boolean, reason: string }
 */
function showroomFilter(textSignals) {
  if (!SHOWROOM) return { pass: true, reason: "" };

  const haystack = [
    textSignals.alt || "",
    textSignals.caption || "",
    textSignals.surroundingText || "",
    textSignals.pageUrl || "",
  ]
    .join(" ")
    .toLowerCase();

  // Reject action/racing/extreme content
  const REJECT_PATTERNS = [
    /\bracing\b/,
    /\brace\b/,
    /\bmotogp\b/,
    /\bwsbk\b/,
    /\bsuperbike\b/,
    /\btrack\s?day\b/,
    /\bwheeli/,
    /\bstunt/,
    /\bcrash/,
    /\bwreck/,
    /\baccident/,
    /\bpodium\b/,
    /\btrophy\b/,
    /\bcelebrat/,
    /\bcrowd/,
    /\bpit\s?lane/,
    /\bgrid\b/,
    /\bcheckered\s?flag/,
    /\bextreme\s?angle/,
    /\baerial\s?view/,
    /\bdrone\s?shot/,
  ];

  for (const pattern of REJECT_PATTERNS) {
    if (pattern.test(haystack)) {
      return { pass: false, reason: pattern.source };
    }
  }

  return { pass: true, reason: "" };
}

/**
 * Compute framing estimate from dimensions relative to typical editorial sizes.
 */
function computeFraming(width) {
  if (!width) return "unknown";
  if (width >= 1600) return "wide";
  if (width >= 900) return "medium";
  return "tight";
}

/**
 * Auto-scroll the page to trigger lazy-loaded images.
 * Scrolls in increments, waiting 500ms between steps.
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let previousHeight = 0;
      const scrollStep = () => {
        const currentHeight = document.body.scrollHeight;
        if (currentHeight === previousHeight) {
          resolve();
          return;
        }
        previousHeight = currentHeight;
        window.scrollTo(0, currentHeight);
        setTimeout(scrollStep, 500);
      };
      scrollStep();
    });
  });

  // Final wait for any remaining lazy images to render
  await page.waitForTimeout(1000);
}

/**
 * Extract all candidate images from the page DOM.
 * Returns raw image data including alt, caption, position, and srcset info.
 */
async function extractImages(page, pageUrl) {
  return page.evaluate((pageUrl) => {
    const results = [];
    const seen = new Set();

    function addCandidate(src, el, position, srcsetWidth) {
      if (!src || seen.has(src)) return;
      seen.add(src);

      // Get surrounding context
      const figure = el.closest("figure");
      const caption =
        figure?.querySelector("figcaption")?.textContent?.trim() || "";
      const alt = el.getAttribute("alt") || "";

      // Get surrounding paragraph text (first 200 chars)
      let surroundingText = "";
      const parent = el.parentElement;
      if (parent) {
        const sibling =
          parent.nextElementSibling || parent.previousElementSibling;
        if (sibling && sibling.tagName === "P") {
          surroundingText = sibling.textContent?.trim()?.slice(0, 200) || "";
        }
      }

      results.push({
        src,
        alt,
        caption,
        surroundingText,
        width: el.naturalWidth || 0,
        height: el.naturalHeight || 0,
        srcsetWidth: srcsetWidth || 0,
        position,
        pageUrl,
      });
    }

    // Extract from <img> elements
    const imgs = document.querySelectorAll("img");
    let imgPosition = 0;
    for (const img of imgs) {
      imgPosition++;

      // Try srcset first (highest resolution)
      const srcset = img.getAttribute("srcset");
      let bestSrc = null;
      let srcsetWidth = 0;

      if (srcset) {
        // Parse srcset in-page — pick highest width descriptor
        const entries = srcset
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((entry) => {
            const parts = entry.split(/\s+/);
            const url = parts[0];
            const desc = parts[1] || "";
            const wMatch = desc.match(/^(\d+)w$/);
            return { url, width: wMatch ? parseInt(wMatch[1], 10) : 0 };
          });
        const sorted = entries
          .filter((e) => e.width > 0)
          .sort((a, b) => b.width - a.width);
        if (sorted[0]) {
          bestSrc = sorted[0].url;
          srcsetWidth = sorted[0].width;
        } else {
          bestSrc = entries[entries.length - 1]?.url;
        }
      }

      // Fallback chain: srcset → data-src → src
      const finalSrc =
        bestSrc || img.dataset.src || img.dataset.lazySrc || img.src;
      addCandidate(finalSrc, img, imgPosition, srcsetWidth);
    }

    // Extract from <picture> <source> elements
    const sources = document.querySelectorAll("picture source");
    for (const source of sources) {
      const srcset = source.getAttribute("srcset");
      if (!srcset) continue;

      const entries = srcset
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((entry) => {
          const parts = entry.split(/\s+/);
          const url = parts[0];
          const desc = parts[1] || "";
          const wMatch = desc.match(/^(\d+)w$/);
          return { url, width: wMatch ? parseInt(wMatch[1], 10) : 0 };
        });
      const sorted = entries
        .filter((e) => e.width > 0)
        .sort((a, b) => b.width - a.width);
      const best = sorted[0]?.url || entries[entries.length - 1]?.url;
      const bestWidth = sorted[0]?.width || 0;

      if (best) {
        // Find the associated img for dimension info
        const picture = source.closest("picture");
        const img = picture?.querySelector("img");
        if (img) {
          addCandidate(best, img, 0, bestWidth);
        }
      }
    }

    return results;
  }, pageUrl);
}

/**
 * Download image binary buffer with safety checks.
 */
async function downloadImage(imageUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; JetMyMoto-ImageBot/1.0; +https://jetmymoto.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return { error: "bad-content-type", contentType };
    }

    const contentLength = parseInt(
      response.headers.get("content-length") || "0",
      10
    );
    if (contentLength > MAX_IMAGE_BYTES) {
      return { error: "too-large", size: contentLength };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_IMAGE_BYTES) {
      return { error: "too-large", size: buffer.length };
    }

    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    // Recover real dimensions from binary buffer via sharp
    let realWidth = 0;
    let realHeight = 0;
    try {
      const meta = await sharp(buffer).metadata();
      realWidth = meta.width || 0;
      realHeight = meta.height || 0;
    } catch {
      // Non-fatal — dimensions stay 0, will be filled by Gemini tagging
    }

    return { buffer, hash, contentType, size: buffer.length, realWidth, realHeight };
  } catch (err) {
    return { error: "fetch-fail", message: err.message };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Upload image buffer to Firebase Storage.
 */
function getExtensionForContentType(contentType) {
  switch ((contentType || "").toLowerCase()) {
    case "image/webp":
      return "webp";
    case "image/png":
      return "png";
    case "image/avif":
      return "avif";
    case "image/gif":
      return "gif";
    case "image/jpeg":
    case "image/jpg":
    default:
      return "jpg";
  }
}

function getFormatForContentType(contentType) {
  return getExtensionForContentType(contentType);
}

async function uploadToStorage(buffer, hash, source, contentType = "image/jpeg") {
  const extension = getExtensionForContentType(contentType);
  const storagePath = `assets/source/${source}/${hash}.${extension}`;

  if (DRY_RUN) {
    console.log(`  [DRY-RUN] Would upload → ${storagePath}`);
    return storagePath;
  }

  const file = bucket.file(storagePath);

  // Skip if already exists
  const [exists] = await file.exists();
  if (exists) {
    console.log(`  SKIP upload (exists): ${storagePath}`);
    return storagePath;
  }

  await file.save(buffer, {
    metadata: { contentType },
  });

  stats.uploaded++;
  return storagePath;
}

/**
 * Register image metadata in Firestore visualAssets collection.
 */
async function registerMetadata(record) {
  const docId = `${SOURCE_NAME}_${record.contentHash.slice(0, 16)}`;

  if (DRY_RUN) {
    console.log(`  [DRY-RUN] Would write → visualAssets/${docId}`);
    return docId;
  }

  // Check for existing doc (idempotent)
  const existing = await db.collection("visualAssets").doc(docId).get();
  if (existing.exists) {
    console.log(`  SKIP write (exists): visualAssets/${docId}`);
    return docId;
  }

  await db
    .collection("visualAssets")
    .doc(docId)
    .set({
      // Source info
      sourceUrl: record.sourceUrl,
      storagePath: record.storagePath,
      contentHash: `sha256:${record.contentHash}`,

      // Dimensions
      width: record.width,
      height: record.height,
      aspectRatio: record.aspectRatio,
      orientation: record.orientation,

      // Source classification
      source: SOURCE_NAME,
      type: "editorial",
      context: record.context,

      // Visual semantics (placeholder — enriched by Gemini tagging later)
      imageType: null,
      composition: null,
      framing: record.framing,
      lighting: null,
      background: null,
      subject: null,
      brand: null,
      model: null,
      tags: [],

      // Scores (enriched by Gemini tagging later)
      qualityScore: 0,
      cinematicScore: 0,

      // Harvest mode
      harvestMode: record.harvestMode || "broad",
      matchedBrand: record.matchedBrand || null,
      matchedModel: record.matchedModel || null,
      showroomCandidate: record.showroomCandidate || false,

      // Semantic intelligence
      semanticCategory: record.semanticCategory || null,
      semanticConfidence: record.semanticConfidence || null,
      semanticReasoning: record.semanticReasoning || null,
      showroomSafe: record.showroomSafe ?? null,
      detectionSource: record.detectionSource || null,
      serpConfidence: record.serpConfidence || null,
      transformed: record.transformed === true,
      format: record.format || null,
      pipeline: record.pipeline || null,

      // Usage tracking
      usageCount: 0,
      usableFor: [],

      // Content metadata from DOM
      alt: record.alt || "",
      caption: record.caption || "",
      surroundingText: record.surroundingText || "",
      position: record.position || 0,

      // Source intelligence
      sourcePriority: record.sourcePriority ?? 0.5,
      isPrimary: record.isPrimary ?? false,

      // State
      taggedByVision: false,
      createdAt: FieldValue.serverTimestamp(),
    });

  stats.firestoreWrites++;
  return docId;
}

// ── Process & Store Helper ───────────────────────────────────────────
// Shared by both semantic batch and non-semantic paths.
// Downloads binary, deduplicates, uploads, and registers metadata.

async function processAndStoreImage(img, resolvedUrl, opts) {
  const { pageUrl, context, pageTitle, modelMatch, semanticResult, log } = opts;

  // wasRewritten — if not explicitly passed, recompute
  const wasRewritten = opts.wasRewritten ?? (resolvedUrl !== resolveUrl(img.src, pageUrl));

  // Download binary
  const result = await downloadImage(resolvedUrl);

  if (result.error === "bad-content-type") {
    stats.rejectedBadContentType++;
    return;
  }
  if (result.error === "too-large") {
    stats.rejectedTooLarge++;
    return;
  }
  if (result.error === "fetch-fail") {
    stats.rejectedFetchFail++;
    return;
  }

  // Hash-based dedup
  if (seenHashes.has(result.hash)) {
    stats.rejectedDuplicate++;
    return;
  }
  seenHashes.add(result.hash);

  // Determine real dimensions
  const width = result.realWidth || img.srcsetWidth || (wasRewritten ? 0 : img.width) || 0;
  const height = result.realHeight || (wasRewritten ? 0 : img.height) || 0;

  // Final width check with real dimensions from binary
  if (width > 0 && width < MIN_IMAGE_WIDTH) {
    stats.rejectedSmall++;
    return;
  }

  let effectiveResult = result;
  let effectiveUrl = resolvedUrl;
  let transformed = false;
  let pipeline = null;

  if (IMAGE_TRANSFORM_ENABLED) {
    const transformedUrl = await transformImage(resolvedUrl);
    if (transformedUrl && transformedUrl !== resolvedUrl) {
      const transformedResult = await downloadImage(transformedUrl);
      if (!transformedResult.error) {
        effectiveResult = transformedResult;
        effectiveUrl = transformedUrl;
        transformed = true;
        pipeline = "cinematic_v1";
        stats.transformed++;
      } else {
        stats.transformFallbacks++;
      }
    }
  }

  // Upload to Firebase Storage
  const storagePath = await uploadToStorage(
    effectiveResult.buffer,
    effectiveResult.hash,
    SOURCE_NAME,
    effectiveResult.contentType
  );

  // Compute source priority based on position in article
  const position = img.position || 0;
  const sourcePriority =
    position <= 2 ? 0.95 :
    position <= 5 ? 0.80 :
    position <= 10 ? 0.60 : 0.40;
  const isPrimary = position >= 1 && position <= 2;

  // Register metadata
  const record = {
    sourceUrl: pageUrl,
    imageUrl: effectiveUrl,
    storagePath,
    contentHash: effectiveResult.hash,
    width: effectiveResult.realWidth || width,
    height: effectiveResult.realHeight || height,
    aspectRatio: computeAspectRatio(effectiveResult.realWidth || width, effectiveResult.realHeight || height),
    orientation: computeOrientation(effectiveResult.realWidth || width, effectiveResult.realHeight || height),
    framing: computeFraming(effectiveResult.realWidth || width),
    context,
    sourcePriority,
    isPrimary,
    alt: img.alt || "",
    caption: img.caption || "",
    surroundingText: img.surroundingText || "",
    position,
    // Targeted mode fields
    harvestMode: semanticResult ? "semantic" : MODEL_FILTER ? "targeted" : "broad",
    matchedBrand: modelMatch?.brand || null,
    matchedModel: modelMatch?.model || null,
    showroomCandidate: SHOWROOM || !!semanticResult,
    // Semantic enrichment
    semanticCategory: semanticResult?.category || null,
    semanticConfidence: semanticResult?.confidence || null,
    semanticReasoning: semanticResult?.reasoning || null,
    showroomSafe: semanticResult?.showroomSafe ?? null,
    detectionSource: semanticResult?.detectionSource || null,
    serpConfidence: semanticResult?.detectionSource === "serp" ? semanticResult?.confidence : null,
    transformed,
    format: transformed ? "webp" : getFormatForContentType(effectiveResult.contentType),
    pipeline,
  };

  await registerMetadata(record);
  harvestedImages.push(record);
  stats.imagesKept++;

  const modelTag = modelMatch ? ` [${modelMatch.brand} ${modelMatch.model}]` : "";
  const semTag = semanticResult ? ` conf=${semanticResult.confidence.toFixed(2)}` : "";
  log.info(
    `  ✓ Kept: ${effectiveUrl.slice(-60)} (${record.width}x${record.height}) [${context}] pri=${sourcePriority}${isPrimary ? ' ★' : ''}${transformed ? ' [cinematic_v1]' : ''}${modelTag}${semTag}`
  );
}

// ── Crawler ──────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("[Harvester] Crawlee Image Harvester — JetMyMoto Platform");
  console.log(`  Source:     ${SOURCE_URL}`);
  console.log(`  Name:       ${SOURCE_NAME}`);
  console.log(`  MaxDepth:   ${MAX_DEPTH}`);
  console.log(`  MaxReqs:    ${MAX_REQUESTS}`);
  console.log(`  Concurrency:${MAX_CONCURRENCY}`);
  console.log(`  MinWidth:   ${MIN_IMAGE_WIDTH}px`);
  console.log(`  DRY_RUN:    ${DRY_RUN}`);
  console.log(`  Mode:       ${SEMANTIC_MODE ? 'SEMANTIC' : MODEL_FILTER ? 'TARGETED' : 'BROAD'}${SHOWROOM && !SEMANTIC_MODE ? ' + SHOWROOM' : ''}`);
  if (MODEL_FILTER && !SEMANTIC_MODE) {
    console.log(`  Targets:    ${flatModelNames.length} models from ${Object.keys(modelTargets).length} brands`);
  }
  if (SEMANTIC_MODE) {
    console.log(`  Resolver:   LLM (Gemini 2.5 Flash via Google AI — batch mode)`);
    console.log(`  BatchSize:  ${SEMANTIC_BATCH_SIZE} images/call`);
    console.log(`  Targets:    ${knownTargets.reduce((n, t) => n + t.models.length, 0)} models from ${knownTargets.length} brands`);
    if (SERP_ENABLED) {
      console.log(`  SerpAPI:    ENABLED (pre-AI reverse image search layer)`);
    }
  }
  console.log(`  Transform:  ${IMAGE_TRANSFORM_ENABLED ? 'ENABLED (cinematic_v1)' : 'DISABLED'}`);
  console.log("=".repeat(60));

  // Configure Crawlee to use local storage in a temp dir
  const config = Configuration.getGlobalConfig();
  config.set("persistStorage", false);

  const crawler = new PlaywrightCrawler({
    maxConcurrency: MAX_CONCURRENCY,
    maxRequestsPerCrawl: MAX_REQUESTS,
    requestHandlerTimeoutSecs: 120,
    navigationTimeoutSecs: 60,
    headless: true,
    launchContext: {
      launchOptions: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    },
    browserPoolOptions: {
      preLaunchHooks: [
        async (_pageId, launchContext) => {
          launchContext.launchOptions = {
            ...launchContext.launchOptions,
          };
        },
      ],
    },
    preNavigationHooks: [
      async ({ page }) => {
        // Set large viewport so responsive images serve high-res versions
        await page.setViewportSize({ width: 1920, height: 1080 });
      },
    ],

    async requestHandler({ request, page, enqueueLinks, log }) {
      const pageUrl = request.loadedUrl || request.url;
      stats.pagesCrawled++;
      log.info(`[${stats.pagesCrawled}] Crawling: ${pageUrl}`);

      // Step 1: Auto-scroll to trigger lazy-loaded images
      await autoScroll(page);

      // Step 2: Extract image candidates from DOM
      const candidates = await extractImages(page, pageUrl);
      log.info(`  Found ${candidates.length} image candidates`);
      stats.imagesFound += candidates.length;

      // Get page title for model matching / semantic resolution
      const pageTitle = (MODEL_FILTER || SEMANTIC_MODE) ? await page.title() : "";

      // Step 3: Filter, download, upload each image
      const context = detectContext(pageUrl);

      // ── SEMANTIC BATCH MODE: Collect pre-filtered candidates ──────
      // In batch mode, we split into two passes:
      //   Pass 1: cheap pre-filters (dedup, blocklist, size) → collect candidates
      //   Pass 2: batch LLM call → process results → download/upload keepers
      const semanticCandidates = []; // { img, resolvedUrl, wasRewritten }

      for (const img of candidates) {
        let resolvedUrl = resolveUrl(img.src, pageUrl);

        // No valid src
        if (!resolvedUrl) {
          stats.rejectedNoSrc++;
          continue;
        }

        // Rewrite CDN/resizer URLs to full-resolution originals
        resolvedUrl = rewriteToHighRes(resolvedUrl);

        // URL-level dedup
        const normalizedUrl = resolvedUrl.split("?")[0];
        if (seenUrls.has(normalizedUrl)) {
          stats.rejectedDuplicate++;
          continue;
        }
        seenUrls.add(normalizedUrl);

        // URL blocklist check
        if (isBlockedUrl(resolvedUrl)) {
          stats.rejectedUi++;
          continue;
        }

        if (SEMANTIC_MODE) {
          // ── SEMANTIC: collect for batch resolution ────────────────
          // Pre-filter: skip images with low source priority (position > 15)
          const position = img.position || 0;
          const sourcePriority =
            position <= 2 ? 0.95 :
            position <= 5 ? 0.80 :
            position <= 10 ? 0.60 : 0.40;

          // In-DOM dimension pre-check (skip tiny thumbnails before LLM)
          const wasRewritten = resolvedUrl !== resolveUrl(img.src, pageUrl);
          const knownWidth = img.srcsetWidth || img.width;
          if (!wasRewritten && knownWidth > 0 && knownWidth < MIN_IMAGE_WIDTH) {
            stats.rejectedSmall++;
            continue;
          }

          semanticCandidates.push({ img, resolvedUrl, wasRewritten, sourcePriority, position });
          continue; // proceed to batch resolution after loop
        }

        // ── NON-SEMANTIC MODES: inline processing ──────────────────
        const textSignals = {
          alt: img.alt,
          caption: img.caption,
          surroundingText: img.surroundingText,
          pageTitle,
          pageUrl,
        };

        let modelMatch = null;

        if (MODEL_FILTER) {
          // REGEX MODE: word-boundary pattern matching
          modelMatch = matchModelTarget(textSignals);
          if (!modelMatch) {
            targetedStats.modelSkipped++;
            continue;
          }
          targetedStats.modelMatches++;
          const key = `${modelMatch.brand} ${modelMatch.model}`;
          targetedStats.matchedModels[key] = (targetedStats.matchedModels[key] || 0) + 1;
        }

        // ── SHOWROOM MODE: Quality filter
        if (SHOWROOM) {
          const showroomResult = showroomFilter(textSignals);
          if (!showroomResult.pass) {
            targetedStats.showroomRejected++;
            log.info(`  ✗ Showroom reject: ${resolvedUrl.slice(-50)} (${showroomResult.reason})`);
            continue;
          }
        }

        // In-DOM dimension check
        const wasRewritten = resolvedUrl !== resolveUrl(img.src, pageUrl);
        const knownWidth = img.srcsetWidth || img.width;
        if (!wasRewritten && knownWidth > 0 && knownWidth < MIN_IMAGE_WIDTH) {
          stats.rejectedSmall++;
          continue;
        }

        // Download, dedup, upload, register (non-semantic path)
        await processAndStoreImage(img, resolvedUrl, {
          pageUrl, context, pageTitle, modelMatch, semanticResult: null, log,
        });
      }

      // ── SEMANTIC BATCH RESOLUTION ────────────────────────────────
      if (SEMANTIC_MODE && semanticCandidates.length > 0) {
        log.info(`  📦 Batch resolving ${semanticCandidates.length} candidates (batch size: ${SEMANTIC_BATCH_SIZE})`);

        // Build batch input
        const batchInput = semanticCandidates.map((c, idx) => ({
          id: `${stats.pagesCrawled}-${idx}`,
          imageUrl: c.resolvedUrl,
          altText: c.img.alt || "",
          pageTitle,
          surroundingText: c.img.surroundingText || "",
          caption: c.img.caption || "",
          sourceUrl: pageUrl,
        }));

        // ── SERP PRE-RESOLUTION LAYER ──────────────────────────────
        // Resolve via SerpAPI first — high-confidence SERP hits skip LLM entirely
        const serpResolved = []; // indices already resolved by SERP
        const llmQueue = [];    // batchInput items that need LLM

        if (SERP_ENABLED && process.env.SERPAPI_KEY) {
          log.info(`  🔎 SerpAPI pre-resolution: ${batchInput.length} candidates`);
          const serpResults = await resolveBatchWithSerp(batchInput, knownTargets);

          for (let idx = 0; idx < batchInput.length; idx++) {
            const item = batchInput[idx];
            const serpResult = serpResults.get(item.id);
            serpStats.calls++;

            if (serpResult && serpResult.confidence > 0) {
              serpStats.confidenceSum += serpResult.confidence;
            }

            if (serpResult && serpResult.confidence >= 0.8 && serpResult.detectedModel) {
              // SERP resolved with high confidence — skip LLM
              serpStats.resolved++;
              serpResolved.push({
                idx,
                serpResult,
              });

              if (process.env.SEMANTIC_DEBUG) {
                log.info(`  🔎 [serp] RESOLVED: alt="${(batchInput[idx].altText || "").slice(0, 40)}" → ${serpResult.detectedBrand} ${serpResult.detectedModel} conf=${serpResult.confidence}`);
              }
            } else {
              // SERP couldn't resolve — queue for LLM
              serpStats.fallthrough++;
              llmQueue.push(item);
            }
          }

          serpStats.avgConfidence = serpStats.calls > 0
            ? serpStats.confidenceSum / serpStats.calls
            : 0;

          log.info(`  🔎 SerpAPI: ${serpStats.resolved} resolved, ${llmQueue.length} → LLM`);
        } else {
          // No SERP — all go to LLM
          llmQueue.push(...batchInput);
        }

        // ── PROCESS SERP-RESOLVED IMAGES ───────────────────────────
        for (const { idx, serpResult } of serpResolved) {
          const candidate = semanticCandidates[idx];

          // Convert SERP result to semantic result format for processAndStoreImage
          const semanticResult = {
            brand: serpResult.detectedBrand,
            model: serpResult.detectedModel,
            category: "unknown",
            confidence: serpResult.confidence,
            reasoning: "SerpAPI reverse image match",
            showroomSafe: true,
            shouldKeep: true,
            detectionSource: "serp",
          };

          semanticStats.calls++;
          semanticStats.kept++;
          semanticStats.confidenceSum += semanticResult.confidence;

          if (semanticResult.category) {
            semanticStats.categories[semanticResult.category] =
              (semanticStats.categories[semanticResult.category] || 0) + 1;
          }

          const modelMatch = {
            brand: serpResult.detectedBrand,
            model: serpResult.detectedModel,
          };
          const key = `${modelMatch.brand} ${modelMatch.model}`;
          semanticStats.matchedModels[key] = (semanticStats.matchedModels[key] || 0) + 1;

          await processAndStoreImage(candidate.img, candidate.resolvedUrl, {
            pageUrl, context, pageTitle, modelMatch, semanticResult, log,
            wasRewritten: candidate.wasRewritten,
          });
        }

        // ── LLM BATCH RESOLUTION (remaining images) ───────────────
        if (llmQueue.length > 0) {
          const resultsMap = await resolveBatch(llmQueue, knownTargets, {
            batchSize: SEMANTIC_BATCH_SIZE,
          });

          semanticStats.calls += llmQueue.length;
          semanticStats.apiCalls += Math.ceil(llmQueue.length / SEMANTIC_BATCH_SIZE);

          // Build index lookup: batchInput id → semanticCandidates index
          const idToIdx = new Map();
          for (let idx = 0; idx < batchInput.length; idx++) {
            idToIdx.set(batchInput[idx].id, idx);
          }

          // Process LLM results
          for (const item of llmQueue) {
            const idx = idToIdx.get(item.id);
            const candidate = semanticCandidates[idx];
            const semanticResult = resultsMap.get(item.id);

            if (!semanticResult) {
              semanticStats.errors++;
              continue;
            }

            // Tag with detection source
            semanticResult.detectionSource = "ai";

            // DEBUG: log each result
            if (process.env.SEMANTIC_DEBUG) {
              log.info(`  🔍 [batch] alt="${(candidate.img.alt || "").slice(0, 60)}" → brand=${semanticResult.brand} model=${semanticResult.model} conf=${semanticResult.confidence} keep=${semanticResult.shouldKeep} reason="${(semanticResult.reasoning || "").slice(0, 80)}"`);
            }

            semanticStats.confidenceSum += semanticResult.confidence;
            semanticStats.avgConfidence = semanticStats.confidenceSum / semanticStats.calls;

            if (semanticResult.category) {
              semanticStats.categories[semanticResult.category] =
                (semanticStats.categories[semanticResult.category] || 0) + 1;
            }

            if (!semanticResult.shouldKeep) {
              semanticStats.rejected++;
              if (semanticResult.confidence > 0.3) {
                log.info(`  ✗ Semantic reject: ${candidate.resolvedUrl.slice(-50)} (${semanticResult.reasoning.slice(0, 60)})`);
              }
              continue;
            }

            semanticStats.kept++;
            const modelMatch = semanticResult.brand
              ? { brand: semanticResult.brand, model: semanticResult.model }
              : null;

            if (modelMatch) {
              const key = `${modelMatch.brand} ${modelMatch.model || "unknown"}`;
              semanticStats.matchedModels[key] = (semanticStats.matchedModels[key] || 0) + 1;
            }

            // Download, dedup, upload, register (semantic path)
            await processAndStoreImage(candidate.img, candidate.resolvedUrl, {
              pageUrl, context, pageTitle, modelMatch, semanticResult, log,
              wasRewritten: candidate.wasRewritten,
            });
          }
        }

        // Update avg confidence
        if (semanticStats.calls > 0) {
          semanticStats.avgConfidence = semanticStats.confidenceSum / semanticStats.calls;
        }

        // Log batch efficiency
        const cacheStats = getCacheStats();
        const serpCacheStats = SERP_ENABLED ? getSerpCacheStats() : null;
        log.info(`  📦 Batch complete: ${semanticCandidates.length} images → ${serpResolved.length} serp + ${Math.ceil(llmQueue.length / SEMANTIC_BATCH_SIZE)} AI call(s) | cache: ${cacheStats.size} entries${serpCacheStats ? ` | serp-cache: ${serpCacheStats.size}` : ''}`);
      }

      // Step 4: Enqueue links for deeper crawling
      await enqueueLinks({
        globs: [`${new URL(SOURCE_URL).origin}/**`],
        transformRequestFunction(req) {
          // Respect max depth
          req.userData = req.userData || {};
          const parentDepth = request.userData?.depth || 0;
          if (parentDepth >= MAX_DEPTH) return false;
          req.userData.depth = parentDepth + 1;
          return req;
        },
      });

      // Polite delay between pages
      await page.waitForTimeout(1000 + Math.random() * 1000);
    },

    failedRequestHandler({ request, log }) {
      log.warning(`Failed: ${request.url} — ${request.errorMessages?.[0]}`);
      stats.errors.push({
        url: request.url,
        error: request.errorMessages?.[0] || "unknown",
      });
    },
  });

  // Seed the crawler
  await crawler.run([
    {
      url: SOURCE_URL,
      userData: { depth: 0 },
    },
  ]);

  // ── Harvest Report ─────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("[HARVEST REPORT]");
  console.log("=".repeat(60));
  console.log(`  Pages crawled:          ${stats.pagesCrawled}`);
  console.log(`  Images found:           ${stats.imagesFound}`);
  console.log(`  Images kept:            ${stats.imagesKept}`);
  console.log(`  Uploaded to Storage:    ${stats.uploaded}`);
  console.log(`  Firestore writes:       ${stats.firestoreWrites}`);
  console.log(`  Transformed assets:     ${stats.transformed}`);
  console.log(`  Transform fallbacks:    ${stats.transformFallbacks}`);
  console.log(`  ──────────────────────────────────`);
  console.log(`  Rejected (small):       ${stats.rejectedSmall}`);
  console.log(`  Rejected (UI/icons):    ${stats.rejectedUi}`);
  console.log(`  Rejected (duplicate):   ${stats.rejectedDuplicate}`);
  console.log(`  Rejected (no src):      ${stats.rejectedNoSrc}`);
  console.log(`  Rejected (fetch fail):  ${stats.rejectedFetchFail}`);
  console.log(`  Rejected (bad type):    ${stats.rejectedBadContentType}`);
  console.log(`  Rejected (too large):   ${stats.rejectedTooLarge}`);
  if (MODEL_FILTER) {
    console.log(`  Rejected (no model):    ${targetedStats.modelSkipped}`);
  }
  if (SHOWROOM && !SEMANTIC_MODE) {
    console.log(`  Rejected (showroom):    ${targetedStats.showroomRejected}`);
  }
  if (SEMANTIC_MODE) {
    const cacheStats = getCacheStats();
    if (SERP_ENABLED) {
      const serpCacheStats = getSerpCacheStats();
      console.log(`  SerpAPI calls:          ${serpStats.calls}`);
      console.log(`  SerpAPI resolved:       ${serpStats.resolved} (skipped LLM)`);
      console.log(`  SerpAPI → LLM:          ${serpStats.fallthrough}`);
      console.log(`  SerpAPI cache:          ${serpCacheStats.size} (${serpCacheStats.hits} hits)`);
      if (serpStats.calls > 0) {
        const serpPct = ((serpStats.resolved / serpStats.calls) * 100).toFixed(1);
        console.log(`  LLM reduction:          ${serpPct}%`);
      }
    }
    console.log(`  Semantic calls:         ${semanticStats.calls} (${semanticStats.apiCalls} AI call${semanticStats.apiCalls !== 1 ? 's' : ''}, batch=${SEMANTIC_BATCH_SIZE})`);
    console.log(`  Semantic kept:          ${semanticStats.kept}`);
    console.log(`  Semantic rejected:      ${semanticStats.rejected}`);
    console.log(`  Avg confidence:         ${semanticStats.avgConfidence.toFixed(3)}`);
    console.log(`  Cache entries:          ${cacheStats.size}`);
  }
  console.log(`  ──────────────────────────────────`);
  console.log(`  Errors:                 ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log(`\n  Error details:`);
    for (const err of stats.errors.slice(0, 10)) {
      console.log(`    ${err.url} → ${err.error}`);
    }
    if (stats.errors.length > 10) {
      console.log(`    ... and ${stats.errors.length - 10} more`);
    }
  }

  // Model match breakdown (targeted mode)
  if (MODEL_FILTER && !SEMANTIC_MODE && Object.keys(targetedStats.matchedModels).length > 0) {
    console.log(`\n  Model matches (regex):`);
    const sorted = Object.entries(targetedStats.matchedModels)
      .sort(([, a], [, b]) => b - a);
    for (const [model, count] of sorted) {
      console.log(`    ${model}: ${count} images`);
    }
  }

  // Semantic model breakdown
  if (SEMANTIC_MODE && Object.keys(semanticStats.matchedModels).length > 0) {
    console.log(`\n  Model matches (semantic):`);
    const sorted = Object.entries(semanticStats.matchedModels)
      .sort(([, a], [, b]) => b - a);
    for (const [model, count] of sorted) {
      console.log(`    ${model}: ${count} images`);
    }
    if (Object.keys(semanticStats.categories).length > 0) {
      console.log(`\n  Categories detected:`);
      for (const [cat, count] of Object.entries(semanticStats.categories).sort(([,a],[,b]) => b - a)) {
        console.log(`    ${cat}: ${count}`);
      }
    }
  }

  // Sample output
  if (harvestedImages.length > 0) {
    console.log(`\n  Sample harvested images:`);
    for (const img of harvestedImages.slice(0, 5)) {
      console.log(`    ${img.storagePath}`);
      const modelTag = img.matchedBrand ? ` | ${img.matchedBrand} ${img.matchedModel}` : "";
      console.log(
        `      ${img.width}x${img.height} | ${img.context} | alt="${(img.alt || "").slice(0, 50)}"${modelTag}`
      );
    }
  }

  console.log("=".repeat(60));

  // Write report to file
  const reportPath = path.resolve(
    __dirname,
    `../data/harvest_reports/${SOURCE_NAME}_${Date.now()}.json`
  );
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        source: SOURCE_NAME,
        sourceUrl: SOURCE_URL,
        timestamp: new Date().toISOString(),
        dryRun: DRY_RUN,
        mode: SEMANTIC_MODE ? "semantic" : MODEL_FILTER ? "targeted" : "broad",
        showroom: SHOWROOM || SEMANTIC_MODE,
        stats,
        targetedStats: MODEL_FILTER ? targetedStats : undefined,
        semanticStats: SEMANTIC_MODE ? semanticStats : undefined,
        serpStats: SEMANTIC_MODE && SERP_ENABLED ? serpStats : undefined,
        sampleImages: harvestedImages.slice(0, 20),
      },
      null,
      2
    )
  );
  console.log(`\nReport written to: ${reportPath}`);
}

main().catch((err) => {
  console.error("[Harvester] Fatal error:", err);
  process.exit(1);
});
