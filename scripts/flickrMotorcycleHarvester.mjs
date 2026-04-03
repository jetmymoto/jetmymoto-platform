import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import sharp from "sharp";
import { PlaywrightCrawler } from "crawlee";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, "../functions/serviceAccountKey.json");
const BUCKET_NAME = "movie-chat-factory.firebasestorage.app";

const START_URL = "https://www.flickr.com/groups/motorcycles_in_beautiful_pictures/pool/";
const OUTPUT_PREFIX = "11clean";
const MAX_REQUESTS = parseInt(process.env.MAX_REQUESTS || "400", 10);
const TARGET_SAVED = parseInt(process.env.TARGET_SAVED || "300", 10);
const MAX_CONCURRENCY = parseInt(process.env.MAX_CONCURRENCY || "5", 10);
const FETCH_TIMEOUT_MS = 30000;
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
const MIN_BYTES = 50 * 1024;

const REJECT_TERMS = [
  "people",
  "portrait",
  "girl",
  "model",
  "selfie",
  "event",
  "festival",
  "crowd",
  "show",
  "expo",
  "custom build show",
  "meeting",
];

const ACCEPT_TERMS = [
  "motorcycle",
  "bike",
  "honda",
  "yamaha",
  "ducati",
  "bmw",
  "ktm",
  "kawasaki",
  "suzuki",
  "triumph",
];

const ATV_TERMS = [
  "atv",
  "quad",
  "polaris",
  "can-am",
  "four wheeler",
];

const IMAGE_REJECT_TERMS = [
  "logo",
  "banner",
  "ads",
  "promo",
  "icon",
];

const DRY_RUN = process.env.DRY_RUN === "1";

if (!DRY_RUN && !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`Missing service account: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

let bucket = null;
if (!DRY_RUN) {
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf-8"));
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: BUCKET_NAME,
    });
  }
  bucket = getStorage().bucket();
}

const stats = {
  photoPages: 0,
  saved: 0,
  rejected: 0,
  duplicates: 0,
  fetchFailed: 0,
  skippedExisting: 0,
};

const seenPageUrls = new Set();
const seenHashes = new Set();

function logReject(reason) {
  stats.rejected++;
  console.log(`✗ rejected | ${reason}`);
}

function sourceDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "invalid-domain";
  }
}

function logImageDecision(status, { domain, imageUrl, width, height, reason }) {
  const size = width && height ? `${width}x${height}` : "unknown";
  const imagePart = imageUrl ? ` | ${imageUrl}` : "";
  console.log(`${status} | ${domain} | ${size} | ${reason}${imagePart}`);
}

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function textDecision(title, alt) {
  const text = normalizeText(`${title} ${alt}`);

  for (const term of ATV_TERMS) {
    if (text.includes(term)) {
      return { keep: false, reason: `atv detected: ${term}` };
    }
  }

  for (const term of REJECT_TERMS) {
    if (text.includes(term)) {
      return { keep: false, reason: `text reject: ${term}` };
    }
  }

  for (const term of ACCEPT_TERMS) {
    if (text.includes(term)) {
      return { keep: true, reason: `text keep: ${term}` };
    }
  }

  return { keep: true, reason: "trusted pool fallback" };
}

function highestResFlickrUrl(url) {
  if (!url) return null;

  const clean = url.split("?")[0];
  const variants = [
    clean.replace(/_[a-z]\.(jpg|jpeg|png|webp)$/i, "_h.$1"),
    clean.replace(/_[a-z]\.(jpg|jpeg|png|webp)$/i, "_b.$1"),
    clean.replace(/_[a-z]\.(jpg|jpeg|png|webp)$/i, "_k.$1"),
    clean,
  ];

  return [...new Set(variants)];
}

async function fetchImage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JetMyMoto-FlickrHarvester/1.0; +https://jetmymoto.com)",
        Referer: "https://www.flickr.com/",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } finally {
    clearTimeout(timer);
  }
}

async function fetchBestImage(urls) {
  let lastError = null;
  for (const url of urls) {
    try {
      const buffer = await fetchImage(url);
      return { buffer, finalUrl: url };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("No image URL succeeded");
}

async function inspectBuffer(buffer) {
  const image = sharp(buffer).rotate();
  const metadata = await image.metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    jpegBuffer: await image.jpeg({ quality: 90, mozjpeg: true }).toBuffer(),
  };
}

async function uploadImage({ jpegBuffer, hash, pageUrl, title, width, height }) {
  const storagePath = `${OUTPUT_PREFIX}/${hash}.jpg`;

  if (DRY_RUN) {
    return { storagePath, created: true };
  }

  const file = bucket.file(storagePath);
  const [exists] = await file.exists();
  if (exists) {
    stats.skippedExisting++;
    return { storagePath, created: false };
  }

  await file.save(jpegBuffer, {
    metadata: {
      contentType: "image/jpeg",
      metadata: {
        source: "flickr",
        pageUrl,
        title: title || "",
        width: String(width),
        height: String(height),
      },
    },
  });

  return { storagePath, created: true };
}

async function extractPoolLinks(page) {
  const urls = new Set();

  for (let i = 0; i < 4; i++) {
    const hrefs = await page.$$eval("a.overlay", (anchors) =>
      anchors.map((anchor) => anchor.href).filter(Boolean)
    );
    hrefs.forEach((href) => {
      const normalized = href.split("?")[0];
      if (/^https:\/\/www\.flickr\.com\/photos\//.test(normalized)) {
        urls.add(normalized);
      }
    });

    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(700);
  }

  return [...urls];
}

function shouldStop() {
  return stats.saved >= TARGET_SAVED;
}

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: MAX_REQUESTS + 25,
  maxConcurrency: MAX_CONCURRENCY,
  requestHandlerTimeoutSecs: 120,

  async requestHandler({ request, page, addRequests }) {
    if (shouldStop()) return;

    if (!request.url.includes("flickr.com")) {
      logReject(`external request blocked: ${request.url}`);
      return;
    }

    if (request.userData?.label === "pool") {
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(600);

      const links = await extractPoolLinks(page);
      const uniqueLinks = links.filter((link) => {
        if (seenPageUrls.has(link)) return false;
        seenPageUrls.add(link);
        return true;
      });

      const sliced = uniqueLinks.slice(0, Math.max(0, MAX_REQUESTS - seenPageUrls.size + uniqueLinks.length));
      await addRequests(
        sliced.map((url) => ({
          url,
          userData: { label: "photo" },
        }))
      );
      return;
    }

    stats.photoPages++;
    await page.waitForLoadState("domcontentloaded");
    await page.locator('meta[property="og:image"], img.main-photo').first().waitFor({ timeout: 2500 }).catch(() => {});

    const pageUrl = page.url().split("?")[0];
    const title = await page.title();
    const extracted = await page.evaluate(() => {
      const img = document.querySelector("img.main-photo");
      const og = document.querySelector('meta[property="og:image"]');
      return {
        imageUrl: img?.src || og?.content || "",
        alt: img?.getAttribute("alt") || "",
      };
    });

    const imageUrl = extracted.imageUrl;
    const alt = extracted.alt || "";
    const pageDomain = sourceDomain(pageUrl);

    if (!imageUrl) {
      logImageDecision("✗ rejected", {
        domain: pageDomain,
        imageUrl: "",
        width: 0,
        height: 0,
        reason: "no image url",
      });
      stats.rejected++;
      return;
    }

    if (!imageUrl.includes("staticflickr.com")) {
      throw new Error(`non-staticflickr image url: ${imageUrl}`);
    }

    const imageDomain = sourceDomain(imageUrl);
    if (imageDomain !== "staticflickr.com" && !imageDomain.endsWith(".staticflickr.com")) {
      throw new Error(`external image domain: ${imageDomain}`);
    }

    const imageUrlLower = imageUrl.toLowerCase();
    for (const term of IMAGE_REJECT_TERMS) {
      if (imageUrlLower.includes(term)) {
        logImageDecision("✗ rejected", {
          domain: imageDomain,
          imageUrl,
          width: 0,
          height: 0,
          reason: `graphic url term: ${term}`,
        });
        stats.rejected++;
        return;
      }
    }

    const textResult = textDecision(title, alt);
    if (!textResult.keep) {
      logImageDecision("✗ rejected", {
        domain: imageDomain,
        imageUrl,
        width: 0,
        height: 0,
        reason: textResult.reason,
      });
      stats.rejected++;
      return;
    }

    try {
      const { buffer } = await fetchBestImage(highestResFlickrUrl(imageUrl));

      if (buffer.length < MIN_BYTES) {
        logImageDecision("✗ rejected", {
          domain: imageDomain,
          imageUrl,
          width: 0,
          height: 0,
          reason: "file size < 50KB",
        });
        stats.rejected++;
        return;
      }

      const hash = crypto.createHash("sha1").update(buffer).digest("hex");
      if (seenHashes.has(hash)) {
        stats.duplicates++;
        console.log("✗ rejected | duplicate");
        return;
      }

      const inspected = await inspectBuffer(buffer);
      const aspectRatio = inspected.height > 0 ? inspected.width / inspected.height : 0;
      if (aspectRatio > 3 || aspectRatio < 0.3) {
        logImageDecision("✗ rejected", {
          domain: imageDomain,
          imageUrl,
          width: inspected.width,
          height: inspected.height,
          reason: "banner ratio",
        });
        stats.rejected++;
        return;
      }

      if (inspected.width < 1200 || inspected.height < 800) {
        logImageDecision("✗ rejected", {
          domain: imageDomain,
          imageUrl,
          width: inspected.width,
          height: inspected.height,
          reason: "below 1200x800",
        });
        stats.rejected++;
        return;
      }

      seenHashes.add(hash);
      const uploadResult = await uploadImage({
        jpegBuffer: inspected.jpegBuffer,
        hash,
        pageUrl,
        title,
        width: inspected.width,
        height: inspected.height,
      });

      if (!uploadResult.created) {
        logImageDecision("✗ rejected", {
          domain: imageDomain,
          imageUrl,
          width: inspected.width,
          height: inspected.height,
          reason: `existing object ${uploadResult.storagePath}`,
        });
        return;
      }

      stats.saved++;
      logImageDecision("✓ accepted", {
        domain: imageDomain,
        imageUrl,
        width: inspected.width,
        height: inspected.height,
        reason: uploadResult.storagePath,
      });
    } catch (error) {
      stats.fetchFailed++;
      logImageDecision("✗ rejected", {
        domain: sourceDomain(imageUrl),
        imageUrl,
        width: 0,
        height: 0,
        reason: `fetch failed: ${error.message}`,
      });
      stats.rejected++;
    }
  },

  async failedRequestHandler({ request, error }) {
    console.log(`✗ rejected | page failed ${request.url} | ${error?.message || "unknown"}`);
  },
});

async function main() {
  console.log("[FlickrHarvester] Starting");
  console.log(`  Start URL:     ${START_URL}`);
  console.log(`  Target saved:  ${TARGET_SAVED}`);
  console.log(`  Max requests:  ${MAX_REQUESTS}`);
  console.log(`  Concurrency:   ${MAX_CONCURRENCY}`);
  console.log(`  DRY_RUN:       ${DRY_RUN}`);

  await crawler.run([
    {
      url: START_URL,
      userData: { label: "pool" },
    },
  ]);

  console.log("");
  console.log("[FlickrHarvester] Summary");
  console.log(`  Photo pages:      ${stats.photoPages}`);
  console.log(`  Saved:            ${stats.saved}`);
  console.log(`  Rejected:         ${stats.rejected}`);
  console.log(`  Duplicates:       ${stats.duplicates}`);
  console.log(`  Fetch failed:     ${stats.fetchFailed}`);
  console.log(`  Existing skipped: ${stats.skippedExisting}`);
}

main().catch((error) => {
  console.error(`[FlickrHarvester] Fatal: ${error.message}`);
  process.exit(1);
});
