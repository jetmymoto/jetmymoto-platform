/**
 * serpImageResolver.mjs
 *
 * Pre-AI semantic layer using SerpAPI Google Reverse Image Search.
 * Resolves motorcycle brand/model from image URL metadata BEFORE
 * expensive LLM calls, reducing Gemini API cost by ~60%.
 *
 * Pipeline position:
 *   Crawlee → Pre-filter → SerpAPI → Decision → (optional LLM) → Storage
 *
 * Usage:
 *   import { resolveWithSerp, getSerpCacheStats } from "./lib/serpImageResolver.mjs";
 *   const result = await resolveWithSerp(image, knownTargets);
 *   if (result.confidence >= 0.75) { // skip LLM }
 */

import dotenv from "dotenv";
import { buildFlatModelTargets, matchModelTarget } from "./modelTargetMatcher.mjs";
dotenv.config();

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";

// ── Rate Limiting ────────────────────────────────────────────────────
// SerpAPI: max 5 requests/sec → 200ms minimum between calls
const MIN_CALL_INTERVAL_MS = 200;
let lastCallTime = 0;

async function rateLimitWait() {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_CALL_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_CALL_INTERVAL_MS - elapsed));
  }
  lastCallTime = Date.now();
}

// ── Response Cache ───────────────────────────────────────────────────
// key = FNV-1a hash of imageUrl, value = result
const serpCache = new Map();
const targetCache = new Map();
let cacheHits = 0;
let cacheMisses = 0;

function cacheKey(imageUrl) {
  let h = 0x811c9dc5;
  for (let i = 0; i < imageUrl.length; i++) {
    h ^= imageUrl.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function getFlatTargets(knownTargets = []) {
  const cacheToken = JSON.stringify(knownTargets || []);
  if (targetCache.has(cacheToken)) {
    return targetCache.get(cacheToken);
  }

  const flatTargets = buildFlatModelTargets(
    Object.fromEntries((knownTargets || []).map((target) => [target.brand, target.models || []]))
  );
  targetCache.set(cacheToken, flatTargets);
  return flatTargets;
}

function buildSignalParts(primary, kg, topTitles) {
  if (primary) {
    return [primary, kg, ...topTitles].filter(Boolean);
  }

  return topTitles.filter(Boolean);
}

// ── SerpAPI Caller ───────────────────────────────────────────────────

/**
 * Call SerpAPI Google Reverse Image Search.
 * Returns raw response or null on failure.
 */
async function callSerpApi(imageUrl) {
  if (!SERPAPI_KEY) return null;

  await rateLimitWait();

  const params = new URLSearchParams({
    engine: "google_reverse_image",
    image_url: imageUrl,
    api_key: SERPAPI_KEY,
  });

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);

    const response = await fetch(`${SERPAPI_ENDPOINT}?${params}`, {
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      if (process.env.SEMANTIC_DEBUG) {
        console.error(`  [serp-debug] HTTP ${response.status} for ${imageUrl.slice(-50)}`);
      }
      return null;
    }

    return await response.json();
  } catch (err) {
    if (process.env.SEMANTIC_DEBUG) {
      console.error(`  [serp-debug] Error: ${err.message} for ${imageUrl.slice(-50)}`);
    }
    return null;
  }
}

/**
 * Extract only the highest-value semantic signals from SerpAPI response.
 */
function extractSerpSignalsV2(data) {
  const primary = data?.search_information?.query_displayed || null;
  const kg = data?.knowledge_graph?.title || null;
  let topTitles = [];
  if (Array.isArray(data?.image_results)) {
    topTitles = data.image_results.slice(0, 5).map((result) => result?.title).filter(Boolean);
  }

  return { primary, kg, topTitles };
}

// ── Main Resolver ────────────────────────────────────────────────────

/**
 * Resolve motorcycle brand/model using SerpAPI reverse image search.
 *
 * @param {Object} image - Image input with:
 *   { imageUrl, altText, pageTitle, surroundingText, sourceUrl }
 * @param {Array<{brand: string, models: string[]}>} knownTargets
 * @returns {Promise<{detectedBrand: string|null, detectedModel: string|null, confidence: number, signalSource: "serp"}>}
 */
export async function resolveWithSerp(image, knownTargets) {
  const imageUrl = image.imageUrl || "";
  const flatTargets = getFlatTargets(knownTargets);

  // Check cache first
  const key = cacheKey(imageUrl);
  if (serpCache.has(key)) {
    cacheHits++;
    return serpCache.get(key);
  }
  cacheMisses++;

  // Default rejection result
  const noMatch = {
    detectedBrand: null,
    detectedModel: null,
    confidence: 0.5,
    signalSource: "serp",
  };

  // Call SerpAPI
  const data = await callSerpApi(imageUrl);

  const { primary, kg, topTitles } = data ? extractSerpSignalsV2(data) : { primary: null, kg: null, topTitles: [] };
  const signal = buildSignalParts(primary, kg, topTitles).join(" ").toLowerCase();

  const primaryMatch = primary ? matchModelTarget(primary, flatTargets) : null;
  const knowledgeMatch = primary ? (kg ? matchModelTarget(kg, flatTargets) : null) : null;
  const titlesMatch = topTitles.length > 0 ? matchModelTarget(topTitles.join(" "), flatTargets) : null;

  let detectedBrand = null;
  let detectedModel = null;
  let confidence = 0.5;

  if (primaryMatch) {
    detectedBrand = primaryMatch.brand;
    detectedModel = primaryMatch.model;
    confidence = 0.95;
  } else if (knowledgeMatch) {
    detectedBrand = knowledgeMatch.brand;
    detectedModel = knowledgeMatch.model;
    confidence = 0.9;
  } else if (titlesMatch) {
    detectedBrand = titlesMatch.brand;
    detectedModel = titlesMatch.model;
    confidence = 0.8;
  }

  const result = {
    detectedBrand,
    detectedModel,
    confidence,
    signalSource: "serp",
  };

  serpCache.set(key, result);

  if (process.env.SEMANTIC_DEBUG) {
    const status = confidence >= 0.8 ? `✓ SERP HIT (${confidence})` : `→ LLM (${confidence})`;
    console.error(
      `  [serp-v2] ${status} → ${detectedBrand || "?"} ${detectedModel || "?"} | signal='${signal.slice(0, 80)}' | url=${imageUrl.slice(-50)}`
    );
  }

  return result;
}

// ── Batch Resolver ───────────────────────────────────────────────────
/**
 * Resolve multiple images via SerpAPI sequentially (rate-limited).
 * Returns Map<id, serpResult> for each image.
 *
 * @param {Array<{id: string, imageUrl: string, altText: string, pageTitle: string, surroundingText: string, sourceUrl: string}>} images
 * @param {Array<{brand: string, models: string[]}>} knownTargets
 * @returns {Promise<Map<string, Object>>}
 */
export async function resolveBatchWithSerp(images, knownTargets) {
  const results = new Map();
  for (const img of images) {
    const result = await resolveWithSerp(img, knownTargets);
    results.set(img.id, result);
  }
  return results;
}

// ── Stats ────────────────────────────────────────────────────────────
export function getSerpCacheStats() {
  return {
    size: serpCache.size,
    hits: cacheHits,
    misses: cacheMisses,
  };
}
