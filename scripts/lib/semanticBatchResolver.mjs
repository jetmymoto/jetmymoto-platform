/**
 * semanticBatchResolver.mjs
 *
 * Batch Visual Intelligence Agent for motorcycle image harvesting.
 * Sends N images per Gemini API call instead of 1, cutting cost ~10-20x.
 *
 * Uses Gemini 2.5 Flash with thinkingBudget: 0 (classification task).
 *
 * Usage:
 *   import { resolveBatch, buildKnownTargets } from "./lib/semanticBatchResolver.mjs";
 *   const results = await resolveBatch(images, knownTargets);
 */

import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ── Batch size ───────────────────────────────────────────────────────
// Gemini 2.5 Flash has a 1M token context window.
// Each image payload is ~200-400 tokens of text signals.
// With BATCH_SIZE=20: ~8K input tokens + ~4K output tokens = well within limits.
const DEFAULT_BATCH_SIZE = 20;

// ── Response Cache ───────────────────────────────────────────────────
// key = SHA256(imageUrl + altText + caption), value = result
const resultCache = new Map();

function cacheKey(img) {
  // Use a fast hash of the text signals that matter for classification
  const raw = `${img.imageUrl || ""}|${img.altText || ""}|${img.caption || ""}`;
  // Simple FNV-1a-style string hash — faster than crypto for cache keys
  let h = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0; // unsigned 32-bit
}

// ── Prompt ───────────────────────────────────────────────────────────

function buildBatchPrompt(images, knownTargets) {
  return `You are a Visual Intelligence Agent for a premium motorcycle rental showroom.
Identify the motorcycle from text signals for EACH entry below. You have ONLY text metadata (altText, caption, surroundingText, pageTitle, sourceUrl) — use these signals to infer brand/model.

RULES:
- Only return models from the knownTargets list. Never invent models.
- If uncertain, return brand/model as null. Prefer null over wrong match.
- confidence 0.9+ = exact name match in text, 0.75-0.89 = strong inference, 0.6-0.74 = weak, <0.6 = reject
- showroomSafe = false if text mentions racing/track/motogp/crash/crowd/stunt/wheelie/extreme angles
- shouldKeep = true ONLY if confidence >= 0.75 AND showroomSafe AND model is not null
- category: adventure | sport | cruiser | touring | naked | scrambler | dual-sport | unknown

Return ONLY a valid JSON array (no code fences, no extra text). One object per entry, preserving the id:
[{"id":"string","brand":"string|null","model":"string|null","category":"string","confidence":0.0,"reasoning":"one sentence","showroomSafe":true,"shouldKeep":true}]

knownTargets: ${JSON.stringify(knownTargets)}

entries: ${JSON.stringify(images)}`;
}

// ── Rate Limiter ─────────────────────────────────────────────────────

let lastCallTime = 0;
const MIN_CALL_INTERVAL_MS = 500; // Batch calls are heavier — 2/sec max

async function rateLimitWait() {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_CALL_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_CALL_INTERVAL_MS - elapsed));
  }
  lastCallTime = Date.now();
}

// ── Batch Resolver ───────────────────────────────────────────────────

/**
 * Resolve a batch of images in a single LLM call.
 *
 * @param {Array<Object>} images - Array of image inputs, each with:
 *   { id, imageUrl, altText, pageTitle, surroundingText, caption, sourceUrl }
 * @param {Array<{brand: string, models: string[]}>} knownTargets
 * @param {Object} [options]
 * @param {number} [options.batchSize] - Max images per API call (default: 20)
 * @returns {Promise<Map<string, Object>>} Map of id → result
 */
export async function resolveBatch(images, knownTargets, options = {}) {
  if (!GEMINI_API_KEY) {
    return makeRejectionMap(images, "GEMINI_API_KEY not set in environment");
  }

  if (!images || images.length === 0) {
    return new Map();
  }

  const batchSize = options.batchSize || DEFAULT_BATCH_SIZE;
  const allResults = new Map();

  // Check cache first — partition into cached and uncached
  const uncached = [];
  for (const img of images) {
    const key = cacheKey(img);
    if (resultCache.has(key)) {
      allResults.set(img.id, resultCache.get(key));
    } else {
      uncached.push(img);
    }
  }

  if (process.env.SEMANTIC_DEBUG && allResults.size > 0) {
    console.error(`  [batch-debug] Cache hits: ${allResults.size}/${images.length}`);
  }

  // Process uncached images in batches
  for (let i = 0; i < uncached.length; i += batchSize) {
    const batch = uncached.slice(i, i + batchSize);
    const batchResults = await callGemini(batch, knownTargets);

    for (const [id, result] of batchResults) {
      allResults.set(id, result);
      // Cache the result
      const img = batch.find((b) => b.id === id);
      if (img) {
        resultCache.set(cacheKey(img), result);
      }
    }
  }

  return allResults;
}

/**
 * Single Gemini API call for one batch of images.
 */
async function callGemini(batch, knownTargets) {
  const results = new Map();

  // Compact payload — only send fields the LLM needs
  const compactBatch = batch.map((img) => ({
    id: img.id,
    altText: img.altText || "",
    pageTitle: img.pageTitle || "",
    surroundingText: (img.surroundingText || "").slice(0, 400),
    caption: img.caption || "",
    sourceUrl: img.sourceUrl || "",
  }));

  await rateLimitWait();

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildBatchPrompt(compactBatch, knownTargets) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096, // ~200 tokens per image × 20 = 4K
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      if (process.env.SEMANTIC_DEBUG) {
        console.error(`  [batch-debug] Gemini HTTP ${response.status}: ${errText.slice(0, 200)}`);
      }
      return makeRejectionMap(batch, `Gemini HTTP ${response.status}: ${errText.slice(0, 100)}`);
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (process.env.SEMANTIC_DEBUG) {
      const finishReason = data?.candidates?.[0]?.finishReason || "UNKNOWN";
      const usage = data?.usageMetadata;
      console.error(`  [batch-debug] finish=${finishReason} promptTokens=${usage?.promptTokenCount || "?"} candidateTokens=${usage?.candidatesTokenCount || "?"} batch=${batch.length}`);
    }

    // Extract JSON array from response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      if (process.env.SEMANTIC_DEBUG) {
        console.error(`  [batch-debug] NO JSON array in raw: "${raw.slice(0, 300)}"`);
      }
      return makeRejectionMap(batch, "LLM returned non-JSON response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed)) {
      return makeRejectionMap(batch, "LLM returned non-array response");
    }

    // Map parsed results by id
    for (const item of parsed) {
      if (!item.id) continue;

      results.set(item.id, {
        brand: typeof item.brand === "string" ? item.brand : null,
        model: typeof item.model === "string" ? item.model : null,
        category: item.category || "unknown",
        confidence: typeof item.confidence === "number"
          ? Math.min(1, Math.max(0, item.confidence))
          : 0,
        reasoning: typeof item.reasoning === "string"
          ? item.reasoning.slice(0, 200)
          : "",
        showroomSafe: item.showroomSafe === true,
        shouldKeep: item.shouldKeep === true
          && item.confidence >= 0.75
          && typeof item.model === "string" && item.model !== null,
      });
    }

    // Fill in any missing ids (LLM dropped them) with rejections
    for (const img of batch) {
      if (!results.has(img.id)) {
        results.set(img.id, makeRejection(`LLM omitted result for id=${img.id}`));
      }
    }

    return results;
  } catch (err) {
    if (process.env.SEMANTIC_DEBUG) {
      console.error(`  [batch-debug] Error: ${err.message}`);
    }
    return makeRejectionMap(batch, `LLM error: ${err.message}`);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Build known targets array from model_targets.json structure.
 * Converts { "BMW": ["R1250GS", ...] } → [{ brand: "BMW", models: ["R1250GS", ...] }]
 */
export function buildKnownTargets(modelTargetsObj) {
  return Object.entries(modelTargetsObj).map(([brand, models]) => ({
    brand,
    models,
  }));
}

function makeRejection(reason) {
  return {
    brand: null,
    model: null,
    category: "unknown",
    confidence: 0,
    reasoning: reason,
    showroomSafe: false,
    shouldKeep: false,
  };
}

function makeRejectionMap(images, reason) {
  const map = new Map();
  for (const img of images) {
    map.set(img.id, makeRejection(reason));
  }
  return map;
}

/**
 * Get cache stats for reporting.
 */
export function getCacheStats() {
  return { size: resultCache.size };
}
