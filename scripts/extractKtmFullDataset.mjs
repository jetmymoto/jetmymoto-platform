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
const BASE_DOMAIN = "https://www.totalmotorcycle.com";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const REQUEST_TIMEOUT_MS = 15_000;
const MIN_BYTES = 100 * 1024;
const MIN_WIDTH = 1200;
const RETRIES = 3;
const RETRY_DELAY_MS = 2_000;

const MODEL_LIST = [
  "1390 Super Duke R EVO",
  "1390 Super Duke R",
  "990 Duke R",
  "790 Duke",
  "390 Duke",
  "250 Duke",
  "125 Duke",
  "1390 Super Duke GT",
  "1390 Super Adventure S Evo",
  "1390 Super Adventure S",
  "1390 Super Adventure R",
  "890 Adventure R",
  "790 Adventure",
  "450 Rally Replica",
  "450 SMR",
  "Freeride E",
  "SX-E2",
  "SX-E5",
  "450 XC-F",
  "350 XC-F",
  "350 XC-F Factory Edition",
  "250 XC-F",
  "300 XC",
  "250 XC",
  "125 XC",
  "500 EXC-F Champion Edition",
  "500 EXC-F Six Days",
  "500 EXC-F",
  "450 XCF-W",
  "350 EXC-F Champion Edition",
  "350 EXC-F",
  "300 XC-W Champion Edition",
  "300 XC-W Factory Edition",
  "300 XC-W Hardenduro",
  "300 XC-W",
  "250 XC-W",
  "150 XC-W",
  "450 SX-F",
  "450 SX-F Factory Edition",
  "350 SX-F",
  "250 SX-F",
  "250 SX-F Factory Edition",
  "250 SX-F Adamo Edition",
  "300 SX",
  "250 SX",
  "150 SX",
  "125 SX",
  "85 SX 19-16",
  "85 SX 17-14",
  "65 SX",
  "50 SX Factory Edition",
  "50 SX",
];

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

function normalizeToken(input) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function slugifyModel(model) {
  return model
    .toLowerCase()
    .replace(/[\/–—]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildModelUrl(model) {
  const slug = slugifyModel(model);
  return `${BASE_DOMAIN}/motorcycles/2025/2025-ktm-${slug}`;
}

function ensureAllowedDomain(url) {
  return url.startsWith(`${BASE_DOMAIN}/`) || url.startsWith("https://www.totalmotorcycle.com/");
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
  if (!ensureAllowedDomain(url)) {
    throw new Error(`blocked domain: ${url}`);
  }
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
  if (!ensureAllowedDomain(url)) {
    throw new Error(`blocked domain: ${url}`);
  }
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

function filenameMatchesModelOrKtm(url, model) {
  const base = path.basename(url).split("?")[0];
  const fileToken = normalizeToken(base);
  const modelToken = normalizeToken(model);
  return fileToken.includes(modelToken) || fileToken.includes("ktm");
}

function isLikelyNoise(url) {
  const lower = path.basename(url).toLowerCase();
  if (/-\d+x\d+\./i.test(lower)) return true;
  if (/thumb|thumbnail|icon|logo|banner|header|button|sprite/.test(lower)) return true;
  return false;
}

function collectSrcsetUrls(srcset) {
  return srcset
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function extractModelImages(html, model) {
  const found = new Set();

  const anchorMatches = [...html.matchAll(/<a href="([^"]+)"/gi)];
  for (const match of anchorMatches) {
    const url = match[1];
    if (!url.includes("/wp-content/uploads/")) continue;
    if (!/\.jpe?g($|\?)/i.test(url)) continue;
    if (isLikelyNoise(url)) continue;
    if (!filenameMatchesModelOrKtm(url, model)) continue;
    found.add(url.split("?")[0]);
  }

  const imgMatches = [...html.matchAll(/<img [^>]*>/gi)];
  for (const match of imgMatches) {
    const tag = match[0];

    const srcsetMatch = tag.match(/srcset="([^"]+)"/i);
    if (srcsetMatch) {
      const urls = collectSrcsetUrls(srcsetMatch[1]);
      for (const url of urls) {
        if (!url.includes("/wp-content/uploads/")) continue;
        if (!/\.jpe?g($|\?)/i.test(url)) continue;
        if (isLikelyNoise(url)) continue;
        if (!filenameMatchesModelOrKtm(url, model)) continue;
        found.add(url.split("?")[0]);
      }
    }

    const srcMatch = tag.match(/src="([^"]+)"/i);
    if (!srcMatch) continue;
    const src = srcMatch[1];
    if (!src.includes("/wp-content/uploads/")) continue;
    if (!/\.jpe?g($|\?)/i.test(src)) continue;
    if (isLikelyNoise(src)) continue;
    if (!filenameMatchesModelOrKtm(src, model)) continue;
    found.add(src.split("?")[0]);
  }

  return [...found];
}

function classifyImage(url) {
  const base = path.basename(url).toLowerCase();
  if (/side|left|right|profile/.test(base)) {
    return "profile";
  }
  return "detail";
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

function extractManufacturerDescription(html) {
  const markerRegex = /From the Manufacturer:?/i;
  const markerMatch = markerRegex.exec(html);
  if (!markerMatch) {
    return "";
  }

  const startIdx = markerMatch.index;
  const endCandidates = [
    html.indexOf("<h3><strong>Manufacturer Websites", startIdx),
    html.indexOf("<h3><strong>Specifications", startIdx),
    html.indexOf("<h2><strong>Specifications", startIdx),
    html.indexOf("<h2><strong>KTM Motorcycle Reviews", startIdx),
  ].filter((idx) => idx >= 0);
  const endIdx = endCandidates.length > 0 ? Math.min(...endCandidates) : -1;
  const section = endIdx >= 0 ? html.slice(startIdx, endIdx) : html.slice(startIdx);

  const paragraphs = [...section.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => normalizeWhitespace(stripTags(m[1])))
    .filter((p) => p && !/^Published\b/i.test(p));

  if (paragraphs.length === 0) {
    return "";
  }

  return paragraphs.slice(0, 4).join("\n\n");
}

function extractReviewDescriptionFallback(html) {
  const reviewAnchorIdx = html.search(/<a id="review"><\/a>/i);
  const startIdx = reviewAnchorIdx >= 0 ? reviewAnchorIdx : html.indexOf('<div class="entry-content');
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

  if (paragraphs.length === 0) {
    return "";
  }

  return paragraphs.slice(0, 4).join("\n\n");
}

function detectCategory(model) {
  if (/Adventure|Rally/i.test(model)) return "Adventure";
  if (/Duke|Super Duke/i.test(model)) return "Street";
  if (/SX|SMR/i.test(model)) return "Motocross";
  if (/XC|EXC|XCF/i.test(model)) return "Enduro";
  if (/Freeride|SX-E/i.test(model)) return "Electric";
  return "Unknown";
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

async function processModel(bucket, model) {
  const modelSlug = slugifyModel(model);
  const modelUrl = buildModelUrl(model);

  console.log(`=== KTM MODEL: ${model.toUpperCase()} ===`);

  const html = await fetchText(modelUrl);
  const extracted = extractModelImages(html, model);
  const selected = selectTargetImages(extracted);

  let description = extractManufacturerDescription(html);
  if (!description) {
    description = extractReviewDescriptionFallback(html);
  }

  const storedUrls = [];
  let index = 1;

  for (const imageUrl of selected) {
    try {
      const buffer = await fetchBufferWithRetries(imageUrl);
      await validateImage(buffer);

      const objectPath = `13clean/ktm/${modelSlug}/${index}.jpg`;
      const file = bucket.file(objectPath);
      await file.save(buffer, {
        metadata: {
          contentType: "image/jpeg",
          metadata: {
            brand: "KTM",
            model,
            year: String(YEAR),
            source: SOURCE,
            sourceUrl: modelUrl,
            imageIndex: String(index),
          },
        },
      });
      storedUrls.push(storagePublicUrl(objectPath));
      index += 1;
    } catch (error) {
      console.log(`  image failed | ${imageUrl} | ${error.message}`);
    }
  }

  console.log(`✓ images: ${storedUrls.length}`);
  if (description) {
    console.log("✓ description");
  } else {
    console.log("✗ description");
  }

  return {
    brand: "KTM",
    model,
    year: YEAR,
    category: detectCategory(model),
    images: storedUrls,
    description,
    source: SOURCE,
    sourceUrl: modelUrl,
  };
}

async function main() {
  const bucket = getBucket();
  const records = [];
  const failures = [];

  for (const model of MODEL_LIST) {
    try {
      const record = await processModel(bucket, model);
      records.push(record);
    } catch (error) {
      failures.push({ model, error: error.message });
      console.log(`✗ model failed | ${model} | ${error.message}`);
    }
  }

  const output = {
    extractedAt: new Date().toISOString(),
    source: SOURCE,
    year: YEAR,
    modelCountRequested: MODEL_LIST.length,
    modelList: MODEL_LIST,
    records,
    failures,
  };

  const outputPath = path.resolve(__dirname, "../data/ktm-full-models-2025.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log("=== KTM FULL BATCH COMPLETE ===");
  console.log(`models requested: ${MODEL_LIST.length}`);
  console.log(`models completed: ${records.length}`);
  console.log(`models failed: ${failures.length}`);
  console.log(`dataset written | ${outputPath}`);
}

main().catch((error) => {
  console.error(`fatal | ${error.message}`);
  process.exit(1);
});
