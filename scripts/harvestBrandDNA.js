/**
 * harvestBrandDNA.js — Perceptual Design Signal Extractor (v2)
 *
 * Replaces Firecrawl-based CSS extraction with:
 *   1. SerpAPI Google search to gather visual design context per brand
 *   2. Gemini LLM analysis to extract PERCEPTUAL design signals
 *
 * Targets: energy-first brands (Porsche, Red Bull, Garmin, Patagonia, Nike, Apple)
 * Output:  data/firecrawl_harvests/perceptual_brand_dna.json
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SERPAPI_KEY) {
  console.error("[Harvest] SERPAPI_KEY is not set in .env");
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error("[Harvest] GEMINI_API_KEY is not set in .env");
  process.exit(1);
}

const OUTPUT_PATH = path.join(__dirname, "..", "data", "firecrawl_harvests", "perceptual_brand_dna.json");

const BENCHMARK_TARGETS = [
  { url: "https://www.porsche.com", query: "porsche.com website design visual style hero section", category: "automotive-performance" },
  { url: "https://www.redbull.com", query: "redbull.com website design visual style hero section", category: "energy-adventure" },
  { url: "https://www.garmin.com", query: "garmin.com website design visual style hero section", category: "outdoor-tech" },
  { url: "https://www.patagonia.com", query: "patagonia.com website design visual style hero section", category: "outdoor-storytelling" },
  { url: "https://www.nike.com/launch", query: "nike.com launch website design visual style hero section", category: "athletic-energy" },
  { url: "https://www.apple.com/iphone/", query: "apple.com iphone website design visual style hero section", category: "premium-tech" },
];

const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const PERCEPTUAL_PROMPT = `You are a senior visual design analyst specializing in web design systems.

I will provide you with Google search result snippets about a brand's website design. Based on these snippets and your deep knowledge of this brand's actual website, extract PERCEPTUAL DESIGN SIGNALS.

Do NOT extract raw CSS values. Extract how the design FEELS and BEHAVES.

Return ONLY a valid JSON object with this exact structure:
{
  "brand": "string",
  "url": "string",
  "perceptualDNA": {
    "luminanceLayers": ["description of background darkness levels, surface layering"],
    "accentColors": ["#hex codes of primary accent/CTA colors used"],
    "gradientStyles": ["gradient direction and color transition descriptions"],
    "imageOverlayPatterns": ["how overlays sit on hero images — bottom-heavy fade, full scrim, vignette, etc"],
    "typographyBehavior": ["headline weight, tracking, size rhythm, serif vs sans behavior"],
    "sectionRhythm": ["section height patterns, spacing cadence, visual density"],
    "interactionEnergy": ["motion speed, hover behavior, scroll animation style, transition feel"]
  },
  "designEssence": "one sentence capturing the overall visual energy",
  "applicableToMotorcycleTravel": ["3-5 specific design patterns from this brand that would enhance a cinematic motorcycle travel platform"]
}`;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function searchSerpAPI(query) {
  const params = new URLSearchParams({
    engine: "google",
    q: query,
    api_key: SERPAPI_KEY,
    num: 10,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${SERPAPI_ENDPOINT}?${params}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`SerpAPI HTTP ${res.status}`);
    const data = await res.json();

    const snippets = [];
    if (data.organic_results) {
      for (const r of data.organic_results) {
        snippets.push({
          title: r.title || "",
          snippet: r.snippet || "",
          link: r.link || "",
        });
      }
    }
    if (data.knowledge_graph) {
      snippets.push({
        title: "Knowledge Graph",
        snippet: data.knowledge_graph.description || "",
        link: data.knowledge_graph.website || "",
      });
    }
    return snippets;
  } catch (err) {
    clearTimeout(timeout);
    console.error(`  [SerpAPI Error] ${err.message}`);
    return [];
  }
}

async function analyzeWithGemini(brand, url, category, searchContext) {
  const contextText = searchContext
    .map((s, i) => `[${i + 1}] ${s.title}\n${s.snippet}`)
    .join("\n\n");

  const userPrompt = `Brand: ${brand}
URL: ${url}
Category: ${category}

Search context about this brand's web design:
${contextText}

Now extract the perceptual design signals for this brand's website. Use both the search context and your knowledge of ${brand}'s actual website design.`;

  const body = {
    contents: [
      { role: "user", parts: [{ text: PERCEPTUAL_PROMPT + "\n\n" + userPrompt }] }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip markdown code fences if present
    let cleaned = text;
    cleaned = cleaned.replace(/```json\s*/gi, "").replace(/```\s*/g, "");
    cleaned = cleaned.trim();

    // Try direct parse first
    try {
      return JSON.parse(cleaned);
    } catch (_) {
      // fall through to regex extraction
    }

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Gemini response (first 300 chars): " + text.slice(0, 300));

    // Attempt lenient parse: strip trailing commas before } or ]
    let jsonStr = jsonMatch[0]
      .replace(/,\s*([\]}])/g, "$1");

    return JSON.parse(jsonStr);
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function harvest() {
  console.log("═══════════════════════════════════════════════");
  console.log("  Brand DNA Engine v2 — Perceptual Signal Extractor");
  console.log("  Using: SerpAPI + Gemini (no Firecrawl)");
  console.log("═══════════════════════════════════════════════\n");

  const results = [];

  for (const target of BENCHMARK_TARGETS) {
    const brandName = new URL(target.url).hostname.replace("www.", "").split(".")[0];
    console.log(`\n🔍 [${brandName.toUpperCase()}] Searching design signals...`);

    try {
      // Step 1: SerpAPI search for design context
      const snippets = await searchSerpAPI(target.query);
      console.log(`  → ${snippets.length} search results gathered`);

      if (snippets.length === 0) {
        console.warn(`  ⚠ No search results for ${target.url}, skipping`);
        continue;
      }

      await delay(1000);

      // Step 2: Gemini perceptual analysis (with retry)
      console.log(`  → Analyzing perceptual DNA via Gemini...`);
      let analysis = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          analysis = await analyzeWithGemini(brandName, target.url, target.category, snippets);
          break;
        } catch (err) {
          if (attempt < 2) {
            console.log(`  → Retry ${attempt}...`);
            await delay(3000);
          } else {
            throw err;
          }
        }
      }

      results.push({
        ...analysis,
        _meta: {
          harvestedAt: new Date().toISOString(),
          searchResultCount: snippets.length,
          category: target.category,
        },
      });

      console.log(`  ✓ Design essence: ${analysis.designEssence || "(none)"}`);
      console.log(`  ✓ Accent colors: ${analysis.perceptualDNA?.accentColors?.join(", ") || "(none)"}`);
      console.log(`  ✓ Applicable patterns: ${analysis.applicableToMotorcycleTravel?.length || 0}`);

    } catch (error) {
      console.error(`  ✗ [Error] ${brandName}: ${error.message}`);
      results.push({
        brand: brandName,
        url: target.url,
        error: error.message,
        _meta: { harvestedAt: new Date().toISOString(), category: target.category },
      });
    }

    await delay(2000);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  ✓ ${results.filter(r => !r.error).length}/${BENCHMARK_TARGETS.length} brands harvested successfully`);
  console.log(`  → Output: ${OUTPUT_PATH}`);
  console.log(`═══════════════════════════════════════════════`);
}

harvest();
