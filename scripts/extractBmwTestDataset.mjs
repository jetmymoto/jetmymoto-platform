import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ACCOUNT_PATH = path.resolve(
  __dirname,
  "../functions/serviceAccountKey.json"
);
const BUCKET_NAME = "movie-chat-factory.firebasestorage.app";
const YEAR = 2025;
const SOURCE = "totalmotorcycle";
const GUIDE_URL = "https://www.totalmotorcycle.com/motorcycles/2025/BMW-models";
const BASE_DOMAIN = "https://www.totalmotorcycle.com";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const REQUEST_TIMEOUT_MS = 15_000;
const MIN_BYTES = 100 * 1024;
const MIN_WIDTH = 1200;

const TEST_MODELS = new Set(["R1300GS", "R1300GS Adventure"]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtmlEntities(input) {
  return input
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-");
}

function stripTags(input) {
  return decodeHtmlEntities(input.replace(/<[^>]+>/g, " "));
}

function normalizeWhitespace(input) {
  return input.replace(/\s+/g, " ").trim();
}

function normalizeModelToken(input) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function slugifyModel(model) {
  return model
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ensureAbsoluteUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${BASE_DOMAIN}${url}`;
  }
  return `${BASE_DOMAIN}/${url}`;
}

function getBucket() {
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf-8"));
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: BUCKET_NAME,
    });
  }
  return getStorage().bucket(BUCKET_NAME);
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchBuffer(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const arr = await response.arrayBuffer();
    return Buffer.from(arr);
  } finally {
    clearTimeout(timeout);
  }
}

function extractBmwModelList(html) {
  const matches = [
    ...html.matchAll(
      /<li>\s*<a href="([^"]*\/motorcycles\/2025\/2025-bmw-[^"]+)">([^<]+)<\/a>/gi
    ),
  ];

  const seen = new Set();
  const models = [];
  for (const match of matches) {
    const rawUrl = match[1];
    const title = normalizeWhitespace(stripTags(match[2]));
    if (!title.startsWith("2025 BMW ")) {
      continue;
    }
    const model = title.replace(/^2025 BMW\s+/i, "").trim();
    const fullUrl = ensureAbsoluteUrl(rawUrl);
    const key = `${model}|${fullUrl}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    models.push({
      brand: "BMW",
      model,
      year: YEAR,
      url: fullUrl,
    });
  }
  return models;
}

function extractCategory(html) {
  const categoryTitles = [
    "Sport",
    "Adventure",
    "Tour",
    "Roadster",
    "Heritage",
    "Scooter / Urban Mobility / Maxi Scooter",
    "Concept &amp; Special",
  ];
  const map = new Map();
  for (const categoryTitle of categoryTitles) {
    const h4Start = html.indexOf(`<h4><strong>${categoryTitle}</strong></h4>`);
    if (h4Start < 0) {
      continue;
    }
    const ulStart = html.indexOf("<ul>", h4Start);
    const ulEnd = html.indexOf("</ul>", ulStart);
    if (ulStart < 0 || ulEnd < 0) {
      continue;
    }
    const ulBlock = html.slice(ulStart, ulEnd);
    const items = [
      ...ulBlock.matchAll(
        /<a href="([^"]*\/motorcycles\/2025\/2025-bmw-[^"]+)">([^<]+)<\/a>/gi
      ),
    ];
    for (const item of items) {
      const name = normalizeWhitespace(stripTags(item[2])).replace(/^2025 BMW\s+/i, "");
      map.set(name, normalizeWhitespace(stripTags(categoryTitle)));
    }
  }
  return map;
}

function matchesModelByFilename(url, modelToken) {
  const base = path.basename(url).toLowerCase();
  const normalizedBase = normalizeModelToken(base);
  return normalizedBase.includes(modelToken);
}

function getFirstValidFromSrcset(srcset, modelToken) {
  const parts = srcset.split(",").map((p) => p.trim());
  const urls = [];
  for (const part of parts) {
    const firstToken = part.split(/\s+/)[0];
    if (!firstToken) {
      continue;
    }
    if (!firstToken.includes("/wp-content/uploads/")) {
      continue;
    }
    if (/-\d+x\d+\./i.test(firstToken)) {
      continue;
    }
    if (!matchesModelByFilename(firstToken, modelToken)) {
      continue;
    }
    urls.push(firstToken);
  }
  return urls;
}

function extractModelImages(html, model) {
  const modelToken = normalizeModelToken(model);
  const found = new Set();

  const anchorMatches = [...html.matchAll(/<a href="([^"]+)"/gi)];
  for (const match of anchorMatches) {
    const url = match[1];
    if (!url.includes("/wp-content/uploads/")) {
      continue;
    }
    if (!/\.jpe?g($|\?)/i.test(url)) {
      continue;
    }
    if (/-\d+x\d+\./i.test(url)) {
      continue;
    }
    if (!matchesModelByFilename(url, modelToken)) {
      continue;
    }
    found.add(url.split("?")[0]);
  }

  const imgMatches = [...html.matchAll(/<img [^>]*>/gi)];
  for (const imgTagMatch of imgMatches) {
    const tag = imgTagMatch[0];
    const srcsetMatch = tag.match(/srcset="([^"]+)"/i);
    if (srcsetMatch) {
      const srcsetUrls = getFirstValidFromSrcset(srcsetMatch[1], modelToken);
      for (const url of srcsetUrls) {
        found.add(url.split("?")[0]);
      }
    }
    const srcMatch = tag.match(/src="([^"]+)"/i);
    if (!srcMatch) {
      continue;
    }
    const src = srcMatch[1];
    if (!src.includes("/wp-content/uploads/")) {
      continue;
    }
    if (!/\.jpe?g($|\?)/i.test(src)) {
      continue;
    }
    if (/-\d+x\d+\./i.test(src)) {
      continue;
    }
    if (!matchesModelByFilename(src, modelToken)) {
      continue;
    }
    found.add(src.split("?")[0]);
  }

  return [...found];
}

function extractManufacturerDescription(html) {
  const markerRegex = /From the Manufacturer:?<\/strong><\/h3>/i;
  const markerMatch = markerRegex.exec(html);
  if (!markerMatch) {
    return "";
  }
  const startIdx = markerMatch.index + markerMatch[0].length;
  const endMarkerIdx = html.indexOf("<h3><strong>Manufacturer Websites", startIdx);
  const section = endMarkerIdx >= 0 ? html.slice(startIdx, endMarkerIdx) : html.slice(startIdx);

  const paragraphs = [...section.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => normalizeWhitespace(stripTags(m[1])))
    .filter((p) => p && !/^Published\b/i.test(p));

  if (paragraphs.length === 0) {
    return "";
  }

  const selected = paragraphs.slice(0, 5);
  return selected.join("\n\n");
}

function extractReviewDescriptionFallback(html) {
  const reviewAnchorIdx = html.search(/<a id="review"><\/a>/i);
  const startIdx = reviewAnchorIdx >= 0 ? reviewAnchorIdx : html.indexOf("<div class=\"entry-content");
  if (startIdx < 0) {
    return "";
  }
  const section = html.slice(startIdx);
  const paragraphs = [...section.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => normalizeWhitespace(stripTags(m[1])))
    .filter((p) => {
      if (!p) return false;
      if (p.length < 30) return false;
      if (/^Published\b/i.test(p)) return false;
      if (/^Specifications\b/i.test(p)) return false;
      return true;
    });
  return paragraphs.slice(0, 5).join("\n\n");
}

async function validateImage(buffer) {
  if (buffer.length <= MIN_BYTES) {
    throw new Error(`size ${buffer.length} <= 100KB`);
  }
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || metadata.width < MIN_WIDTH) {
    throw new Error(`width ${metadata.width ?? "unknown"} < ${MIN_WIDTH}`);
  }
}

function storagePublicUrl(objectPath) {
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(objectPath)}?alt=media`;
}

async function processModel(bucket, modelEntry, category) {
  const html = await fetchText(modelEntry.url);
  const candidateImages = extractModelImages(html, modelEntry.model);
  let description = extractManufacturerDescription(html);
  if (!description) {
    description = extractReviewDescriptionFallback(html);
  }
  const modelSlug = slugifyModel(modelEntry.model);
  const storedUrls = [];
  let saveIndex = 1;

  for (const imageUrl of candidateImages) {
    try {
      const buffer = await fetchBuffer(imageUrl);
      await validateImage(buffer);

      const objectPath = `13clean/bmw/${modelSlug}/${saveIndex}.jpg`;
      const file = bucket.file(objectPath);
      await file.save(buffer, {
        metadata: {
          contentType: "image/jpeg",
          metadata: {
            brand: "BMW",
            model: modelEntry.model,
            year: String(YEAR),
            source: SOURCE,
            sourceUrl: modelEntry.url,
            imageIndex: String(saveIndex),
          },
        },
      });
      storedUrls.push(storagePublicUrl(objectPath));
      console.log(`✓ saved | ${modelEntry.model} | ${saveIndex} | ${buffer.length}`);
      saveIndex += 1;
    } catch (error) {
      console.log(`✗ failed | ${modelEntry.model} | ${imageUrl} | ${error.message}`);
    }
    await sleep(250);
  }

  return {
    brand: "BMW",
    model: modelEntry.model,
    year: YEAR,
    category: category || "Unknown",
    description,
    images: storedUrls,
    source: SOURCE,
    sourceUrl: modelEntry.url,
  };
}

async function main() {
  const guideHtml = await fetchText(GUIDE_URL);
  const allBmwModels = extractBmwModelList(guideHtml);
  const categoryMap = extractCategory(guideHtml);

  const testModels = allBmwModels.filter((m) => TEST_MODELS.has(m.model));
  const bucket = getBucket();

  const records = [];
  for (const modelEntry of testModels) {
    const record = await processModel(bucket, modelEntry, categoryMap.get(modelEntry.model));
    records.push(record);
  }

  const output = {
    extractedAt: new Date().toISOString(),
    guideSource: GUIDE_URL,
    bmwModelList: allBmwModels,
    testModeProcessed: [...TEST_MODELS],
    records,
  };

  const outputPath = path.resolve(__dirname, "../data/bmw-test-models-2025.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`dataset written | ${outputPath}`);
}

main().catch((error) => {
  console.error(`fatal | ${error.message}`);
  process.exit(1);
});
