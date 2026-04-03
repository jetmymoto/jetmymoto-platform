/**
 * semanticModelResolver.mjs
 *
 * Visual Intelligence Agent for motorcycle image harvesting.
 * Uses LLM reasoning (Gemini 2.5 Flash) to identify motorcycle
 * brand/model from weak text signals when regex matching fails.
 *
 * Detection pipeline:
 *   1. Hard text match (exact model name)
 *   2. Semantic text inference (category → likely models)
 *   3. Context signals (URL structure, page type)
 *   4. Showroom quality assessment
 *
 * Usage:
 *   import { resolveModelSemantic } from "./lib/semanticModelResolver.mjs";
 *   const result = await resolveModelSemantic({ altText, pageTitle, ... });
 *   if (result.shouldKeep) { ... }
 */

import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ── Prompt ───────────────────────────────────────────────────────────
// Compact prompt — Gemini 2.5 Flash allocates ~700 thinking tokens from
// maxOutputTokens before generating content. Keep the prompt short and
// set maxOutputTokens high enough (1024) to accommodate both.

function buildPrompt(input) {
  return `Identify the motorcycle from these text signals for a premium rental platform showroom.

RULES:
- Only return models from the knownTargets list. Never invent models.
- If uncertain, return brand/model as null. Prefer null over wrong match.
- confidence 0.9+ = exact name match, 0.75-0.89 = strong inference, 0.6-0.74 = weak, <0.6 = reject
- showroomSafe = false if racing/track/motogp/crash/crowd/stunt/wheelie/extreme angles
- shouldKeep = true ONLY if confidence >= 0.75 AND showroomSafe = true
- category: adventure | sport | cruiser | touring | naked | scrambler | dual-sport | unknown

Return ONLY valid JSON (no code fences):
{"brand":"string|null","model":"string|null","category":"string","confidence":0.0,"reasoning":"one sentence","showroomSafe":true,"shouldKeep":true}

Input: ${JSON.stringify(input)}`;
}

// ── Rate Limiter ─────────────────────────────────────────────────────

let lastCallTime = 0;
const MIN_CALL_INTERVAL_MS = 250; // 4 calls/sec max (Gemini free tier safe)

async function rateLimitWait() {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_CALL_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_CALL_INTERVAL_MS - elapsed));
  }
  lastCallTime = Date.now();
}

// ── Resolver ─────────────────────────────────────────────────────────

/**
 * Resolve motorcycle brand/model from text signals using LLM reasoning.
 *
 * @param {Object} input
 * @param {string} input.imageUrl - URL of the image
 * @param {string} input.altText - Image alt text from DOM
 * @param {string} input.pageTitle - Page title
 * @param {string} input.surroundingText - Adjacent paragraph text
 * @param {string} input.caption - Figcaption text
 * @param {string} input.sourceUrl - Page URL
 * @param {Array} input.knownTargets - [{brand, models: string[]}]
 *
 * @returns {Promise<{brand, model, category, confidence, reasoning, showroomSafe, shouldKeep}>}
 */
export async function resolveModelSemantic(input) {
  if (!GEMINI_API_KEY) {
    return makeRejection("GEMINI_API_KEY not set in environment");
  }

  await rateLimitWait();

  const userPayload = {
    imageUrl: input.imageUrl || "",
    altText: input.altText || "",
    pageTitle: input.pageTitle || "",
    surroundingText: input.surroundingText || "",
    caption: input.caption || "",
    sourceUrl: input.sourceUrl || "",
    knownTargets: input.knownTargets || [],
  };

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: buildPrompt(userPayload) },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          // Disable thinking — this is a simple classification task.
          // Without this, Gemini 2.5 Flash burns ~700+ thinking tokens
          // from the maxOutputTokens budget, truncating the actual JSON response.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return makeRejection(`Gemini HTTP ${response.status}: ${errText.slice(0, 100)}`);
    }

    const data = await response.json();
    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // DEBUG: log raw response when SEMANTIC_DEBUG is set
    if (process.env.SEMANTIC_DEBUG && !raw) {
      const finishReason = data?.candidates?.[0]?.finishReason || "UNKNOWN";
      const blockReason = data?.promptFeedback?.blockReason || "none";
      console.error(`  [resolver-debug] EMPTY raw. finish=${finishReason} block=${blockReason} candidates=${JSON.stringify(data?.candidates?.length)} response keys=${Object.keys(data || {})}`);
    }

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      if (process.env.SEMANTIC_DEBUG) {
        console.error(`  [resolver-debug] NO JSON in raw: "${raw.slice(0, 200)}"`);
      }
      return makeRejection("LLM returned non-JSON response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and sanitize output
    return {
      brand: typeof parsed.brand === "string" ? parsed.brand : null,
      model: typeof parsed.model === "string" ? parsed.model : null,
      category: parsed.category || "unknown",
      confidence: typeof parsed.confidence === "number"
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0,
      reasoning: typeof parsed.reasoning === "string"
        ? parsed.reasoning.slice(0, 200)
        : "",
      showroomSafe: parsed.showroomSafe === true,
      shouldKeep: parsed.shouldKeep === true
        && parsed.confidence >= 0.75
        && typeof parsed.model === "string" && parsed.model !== null,
    };
  } catch (err) {
    return makeRejection(`LLM error: ${err.message}`);
  }
}

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
