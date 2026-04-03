import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, "../functions/serviceAccountKey.json");
const BUCKET_NAME = "movie-chat-factory.firebasestorage.app";
const BASE_DOMAIN = "https://www.totalmotorcycle.com";
const MAIN_2025_URL = `${BASE_DOMAIN}/motorcycles/2025/`;
const ALT_2025_URL = `${BASE_DOMAIN}/2025-motorcycle-models`;
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const REQUEST_TIMEOUT_MS = 15_000;
const RETRIES = 3;
const RETRY_DELAY_MS = 2_000;
const MIN_BYTES = 100 * 1024;
const MIN_WIDTH = 1200;
const YEAR = 2025;
const SOURCE = "totalmotorcycle";

const BRANDS = [
  {
    brand: "Ducati",
    brandSlug: "ducati",
    keyword: "ducati",
    removeBrandRegex: /^2025\s+ducati\s+/i,
  },
  {
    brand: "Harley-Davidson",
    brandSlug: "harley-davidson",
    keyword: "harley",
    removeBrandRegex: /^2025\s+harley[-\s]?davidson\s+/i,
  },
  {
    brand: "Aprilia",
    brandSlug: "aprilia",
    keyword: "aprilia",
    removeBrandRegex: /^2025\s+aprilia\s+/i,
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeWhitespace(input) {
  return String(input || "").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(input) {
  return String(input || "")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-");
}

function stripTags(input) {
  return decodeHtmlEntities(String(input || "").replace(/<[^>]+>/g, " "));
}

function normalizeToken(input) {
  return String(input || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizeSlugPart(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[\/–—]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildSlug(brand, model) {
  return `${normalizeSlugPart(brand)}-${normalizeSlugPart(model)}`;
}

function modelSlug(model) {
  return normalizeSlugPart(model);
}

function ensureAllowedDomain(url) {
  return String(url || "").startsWith(`${BASE_DOMAIN}/`);
}

function imageTypeByIndex(index) {
  if (index === 1) return "profile-left";
  if (index === 2) return "profile-right";
  return "detail";
}

function classifyImage(url) {
  const base = path.basename(url).toLowerCase();
  if (/side|left|right|profile/.test(base)) return "profile";
  return "detail";
}

function cleanModelName(rawModel) {
  let model = normalizeWhitespace(rawModel);
  model = model.replace(/^2025(?:\.5)?\s+/i, "");
  model = model.replace(/^(ducati|harley[-\s]?davidson|aprilia)\s+/i, "");
  model = model.replace(/\s*[–-]\s*New model\b/gi, "");
  model = model.replace(/\s*[–-]\s*Refreshed\b/gi, "");
  model = model.replace(/\s*\(Replaced\)\s*/gi, " ");
  model = model.replace(/\s*\(?2025\.5\)?\s*/gi, " ");
  model = model.replace(/\s*\((US|USA|UK|EU|EUR|EUROPE|CAN|CANADA|AUS|ROW)\)\s*/gi, " ");
  model = model.replace(/\s+/g, " ").trim();
  return model;
}

function isLikelyNoise(url) {
  const lower = path.basename(url).toLowerCase();
  if (/-\d+x\d+\./i.test(lower)) return true;
  if (/thumb|thumbnail|icon|logo|banner|header|button|sprite/.test(lower)) return true;
  return false;
}

function detectCategory(model) {
  const value = String(model || "");
  if (/adventure|multistrada|desertx|tuareg|v-strom|travel/i.test(value)) return "Adventure";
  if (/streetfighter|monster|duke|naked|hyper|diavel/i.test(value)) return "Street";
  if (/panigale|supersport|rs\d+/i.test(value)) return "Sport";
  if (/road glide|street glide|touring|ultra/i.test(value)) return "Touring";
  if (/scrambler|heritage|fat boy|softail/i.test(value)) return "Heritage";
  return "Unknown";
}

function initFirebase() {
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: BUCKET_NAME,
    });
  }
  return {
    db: getFirestore(),
    bucket: getStorage().bucket(BUCKET_NAME),
  };
}

async function fetchText(url) {
  if (!ensureAllowedDomain(url)) throw new Error(`blocked domain: ${url}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchBuffer(url) {
  if (!ensureAllowedDomain(url)) throw new Error(`blocked domain: ${url}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const arr = await response.arrayBuffer();
    return Buffer.from(arr);
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchBufferWithRetries(url) {
  let lastError;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      return await fetchBuffer(url);
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES) {
        console.log(`  retry ${attempt}/${RETRIES - 1} | ${url}`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }
  throw lastError;
}

async function validateImage(buffer) {
  if (buffer.length <= MIN_BYTES) {
    throw new Error(`size ${buffer.length} <= ${MIN_BYTES}`);
  }
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || metadata.width < MIN_WIDTH) {
    throw new Error(`width ${metadata.width ?? "unknown"} < ${MIN_WIDTH}`);
  }
}

function storagePublicUrl(objectPath) {
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(objectPath)}?alt=media`;
}

function extractHrefs(html) {
  return [...html.matchAll(/<a [^>]*href="([^"]+)"/gi)].map((m) => m[1]);
}

function absoluteUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${BASE_DOMAIN}${url}`;
  return `${BASE_DOMAIN}/${url}`;
}

function findBrandGuideUrl(htmlSources, keyword) {
  const pages = Array.isArray(htmlSources) ? htmlSources : [htmlSources];
  for (const mainHtml of pages) {
  const links = extractHrefs(mainHtml)
    .map((href) => absoluteUrl(href))
    .filter((href) => ensureAllowedDomain(href));

  for (const href of links) {
    const low = href.toLowerCase();
    if (!low.includes("/motorcycles/2025/")) continue;
    if (!low.includes("-models")) continue;
    if (!low.includes(keyword.toLowerCase())) continue;
    return href;
  }
  }
  return null;
}

function extractModelListFromGuide(html, config) {
  const models = [];
  const seen = new Set();
  const prefix = `/motorcycles/2025/2025-${config.brandSlug}-`;
  const anchors = [...html.matchAll(/<a href="([^"]+)">([\s\S]*?)<\/a>/gi)];

  for (const anchor of anchors) {
    const href = anchor[1];
    const fullUrl = absoluteUrl(href);
    const lowUrl = fullUrl.toLowerCase();
    if (!lowUrl.includes(prefix)) continue;

    let title = normalizeWhitespace(stripTags(anchor[2]));
    title = title.replace(config.removeBrandRegex, "");
    title = title.replace(/^2025\s+/i, "");
    title = cleanModelName(title);
    if (!title) continue;

    const key = `${title}|${fullUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);
    models.push({ model: title, url: fullUrl });
  }

  return models;
}

function collectSrcsetUrls(srcset) {
  return String(srcset || "")
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function filenameMatchesModelOrBrand(url, model, brand) {
  const base = path.basename(url).split("?")[0];
  const token = normalizeToken(base);
  return token.includes(normalizeToken(model)) || token.includes(normalizeToken(brand));
}

function extractModelImages(html, brand, model) {
  const found = new Set();

  const anchors = [...html.matchAll(/<a href="([^"]+)"/gi)];
  for (const match of anchors) {
    const url = match[1];
    if (!url.includes("/wp-content/uploads/")) continue;
    if (!/\.jpe?g($|\?)/i.test(url)) continue;
    if (isLikelyNoise(url)) continue;
    if (!filenameMatchesModelOrBrand(url, model, brand)) continue;
    found.add(absoluteUrl(url).split("?")[0]);
  }

  const imgs = [...html.matchAll(/<img [^>]*>/gi)];
  for (const img of imgs) {
    const tag = img[0];
    const srcsetMatch = tag.match(/srcset="([^"]+)"/i);
    if (srcsetMatch) {
      for (const url of collectSrcsetUrls(srcsetMatch[1])) {
        if (!url.includes("/wp-content/uploads/")) continue;
        if (!/\.jpe?g($|\?)/i.test(url)) continue;
        if (isLikelyNoise(url)) continue;
        if (!filenameMatchesModelOrBrand(url, model, brand)) continue;
        found.add(absoluteUrl(url).split("?")[0]);
      }
    }

    const srcMatch = tag.match(/src="([^"]+)"/i);
    if (!srcMatch) continue;
    const src = srcMatch[1];
    if (!src.includes("/wp-content/uploads/")) continue;
    if (!/\.jpe?g($|\?)/i.test(src)) continue;
    if (isLikelyNoise(src)) continue;
    if (!filenameMatchesModelOrBrand(src, model, brand)) continue;
    found.add(absoluteUrl(src).split("?")[0]);
  }

  return [...found];
}

function selectTargetImages(urls) {
  const unique = [];
  const seen = new Set();
  for (const url of urls) {
    const token = normalizeToken(path.basename(url));
    if (!token || seen.has(token)) continue;
    seen.add(token);
    unique.push(url);
  }

  const profile = unique.filter((url) => classifyImage(url) === "profile");
  const detail = unique.filter((url) => classifyImage(url) === "detail");

  const selected = [];
  for (const url of profile.slice(0, 2)) selected.push(url);
  for (const url of detail.slice(0, 2)) selected.push(url);

  if (selected.length < 4) {
    for (const url of unique) {
      if (selected.length >= 4) break;
      if (!selected.includes(url)) selected.push(url);
    }
  }

  return selected;
}

function extractDescription(html) {
  const marker = /From the Manufacturer:?/i.exec(html);
  if (!marker) return "";
  const startIdx = marker.index;
  const endCandidates = [
    html.indexOf("<h3><strong>Manufacturer Websites", startIdx),
    html.indexOf("<h3><strong>Specifications", startIdx),
    html.indexOf("<h2><strong>Specifications", startIdx),
    html.indexOf("<h2><strong>", startIdx + 10),
  ].filter((x) => x >= 0);
  const endIdx = endCandidates.length > 0 ? Math.min(...endCandidates) : -1;
  const section = endIdx >= 0 ? html.slice(startIdx, endIdx) : html.slice(startIdx);

  const paragraphs = [...section.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => normalizeWhitespace(stripTags(m[1])))
    .filter((p) => p && !/^Published\b/i.test(p));
  if (paragraphs.length > 0) return paragraphs.slice(0, 4).join("\n\n");

  const fallbackStart = html.indexOf('<div class="entry-content');
  if (fallbackStart < 0) return "";
  const fallbackSection = html.slice(fallbackStart);
  const fb = [...fallbackSection.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => normalizeWhitespace(stripTags(m[1])))
    .filter((p) => p && p.length >= 30 && !/^Published\b/i.test(p))
    .slice(0, 4);
  return fb.join("\n\n");
}

async function processModel(db, bucket, config, modelEntry) {
  const model = modelEntry.model;
  const sourceUrl = modelEntry.url;
  const slug = buildSlug(config.brand, model);

  const ref = db.collection("motorcycles").doc(slug);
  const existing = await ref.get();
  const existingImageCount = existing.exists ? Number(existing.get("imageCount") || 0) : 0;
  if (existing.exists && existingImageCount >= 4) {
    console.log(`✓ skipped (already exists) | ${slug} | ${existingImageCount} images`);
    return { status: "skipped", slug, model, imageCount: existingImageCount };
  }

  const html = await fetchText(sourceUrl);
  const extracted = extractModelImages(html, config.brand, model);
  const selected = selectTargetImages(extracted);
  const description = extractDescription(html);

  const saved = [];
  let nextIndex = 1;
  for (const imageUrl of selected) {
    try {
      const buffer = await fetchBufferWithRetries(imageUrl);
      await validateImage(buffer);
      const objectPath = `13clean/${config.brandSlug}/${modelSlug(model)}/${nextIndex}.jpg`;
      await bucket.file(objectPath).save(buffer, {
        metadata: {
          contentType: "image/jpeg",
          metadata: {
            brand: config.brand,
            model,
            year: String(YEAR),
            source: SOURCE,
            sourceUrl,
            imageIndex: String(nextIndex),
          },
        },
      });
      saved.push(storagePublicUrl(objectPath));
      nextIndex += 1;
    } catch (error) {
      console.log(`  image failed | ${model} | ${imageUrl} | ${error.message}`);
    }
  }

  const uniqueUrls = [];
  const seen = new Set();
  for (const url of saved) {
    if (seen.has(url)) continue;
    seen.add(url);
    uniqueUrls.push(url);
  }

  const images = uniqueUrls.map((url, i) => ({
    url,
    index: i + 1,
    type: imageTypeByIndex(i + 1),
  }));

  const imageCount = images.length;
  const status = imageCount >= 3 ? "complete" : "incomplete";
  const hasProfilePair = imageCount >= 2;
  const hasDetails = imageCount >= 3;
  const existingCreatedAt = existing.exists ? existing.get("createdAt") : null;

  const doc = {
    brand: config.brand,
    model,
    slug,
    year: YEAR,
    category: detectCategory(model),
    images,
    imageCount,
    hasProfilePair,
    hasDetails,
    status,
    source: SOURCE,
    sourceUrl,
    description,
    createdAt: existingCreatedAt || FieldValue.serverTimestamp(),
    updatedAt: Timestamp.now(),
    migration: {
      schemaVersion: 2,
      migratedAt: Timestamp.now(),
      deprecatedImageEntries: false,
    },
  };

  await ref.set(doc, { merge: false });
  if (status === "incomplete") {
    console.log(`✗ incomplete | ${slug} | ${imageCount} images`);
    return { status: "incomplete", slug, model, imageCount };
  }
  console.log(`✓ created | ${slug} | ${imageCount} images`);
  return { status: "created", slug, model, imageCount };
}

async function main() {
  const { db, bucket } = initFirebase();
  const htmlSources = [];
  try {
    htmlSources.push(await fetchText(MAIN_2025_URL));
  } catch (_) {
    // Continue with alternate index page.
  }
  try {
    htmlSources.push(await fetchText(ALT_2025_URL));
  } catch (_) {
    // If both fail, downstream guide lookup will fail cleanly.
  }

  const summary = {
    extractedAt: new Date().toISOString(),
    brands: {},
  };

  for (const config of BRANDS) {
    const guideUrl = findBrandGuideUrl(htmlSources, config.keyword);
    if (!guideUrl) {
      console.log(`brand guide not found | ${config.brand}`);
      summary.brands[config.brand] = { guideUrl: null, models: [], results: [], error: "guide not found" };
      continue;
    }

    const guideHtml = await fetchText(guideUrl);
    const models = extractModelListFromGuide(guideHtml, config);
    const results = [];
    console.log(`=== BRAND START: ${config.brand} | models: ${models.length} ===`);

    for (const modelEntry of models) {
      try {
        const result = await processModel(db, bucket, config, modelEntry);
        results.push({ ...result, sourceUrl: modelEntry.url });
      } catch (error) {
        console.log(`✗ model failed | ${config.brand} | ${modelEntry.model} | ${error.message}`);
        results.push({
          status: "failed",
          slug: buildSlug(config.brand, modelEntry.model),
          model: modelEntry.model,
          sourceUrl: modelEntry.url,
          error: error.message,
        });
      }
    }

    summary.brands[config.brand] = {
      guideUrl,
      modelCount: models.length,
      models,
      results,
    };
  }

  const outputPath = path.resolve(__dirname, "../data/multi-brand-ingest-2025.json");
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log(`report written | ${outputPath}`);
}

main().catch((error) => {
  console.error(`fatal | ${error.message}`);
  process.exit(1);
});
