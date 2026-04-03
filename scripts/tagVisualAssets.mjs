import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { tagImage, computeCompositeScore } from "./lib/visualQualityGate.mjs";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_FILE = path.resolve(__dirname, "../data/visual_seed_set.json");
const OUTPUT_FILE = path.resolve(
  __dirname,
  "../frontend/rideratlas/src/core/visual/imageGraphData.js"
);

const SERVICE_ACCOUNT_PATH = path.resolve(
  __dirname,
  "../functions/serviceAccountKey.json"
);

let bucket;
if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf-8"));
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: "movie-chat-factory",
    });
  }
  bucket = getStorage().bucket("movie-chat-factory.firebasestorage.app");
}

const DELAY_MS = 2500;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchImageBuffer(url) {
  // Try Firebase Admin SDK first (authenticated download)
  if (bucket && url.includes("firebasestorage.googleapis.com")) {
    try {
      const decodedPath = decodeURIComponent(
        url.split("/o/")[1]?.split("?")[0] || ""
      );
      if (decodedPath) {
        const file = bucket.file(decodedPath);
        const [buf] = await file.download();
        return buf;
      }
    } catch (err) {
      console.log(`  [Firebase SDK fallback failed: ${err.message}]`);
    }
  }

  // Try signed URL via Firebase Admin
  if (bucket && url.includes("firebasestorage")) {
    try {
      const decodedPath = decodeURIComponent(
        url.split("/o/")[1]?.split("?")[0] || ""
      );
      if (decodedPath) {
        const file = bucket.file(decodedPath);
        const [signedUrl] = await file.getSignedUrl({
          action: "read",
          expires: Date.now() + 15 * 60 * 1000,
        });
        const response = await fetch(signedUrl);
        if (response.ok) {
          return Buffer.from(await response.arrayBuffer());
        }
      }
    } catch (err) {
      console.log(`  [Signed URL fallback failed: ${err.message}]`);
    }
  }

  // Direct HTTP fetch (for non-Firebase URLs or public URLs)
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  console.log("[TagAssets] Loading seed set...");

  if (!fs.existsSync(SEED_FILE)) {
    console.error(`Seed file not found: ${SEED_FILE}`);
    process.exit(1);
  }

  const seeds = JSON.parse(fs.readFileSync(SEED_FILE, "utf-8"));
  const modelKeys = Object.keys(seeds);
  console.log(`[TagAssets] Found ${modelKeys.length} models in seed set`);

  const graphEntries = [];
  let taggedCount = 0;
  let rejectedCount = 0;
  let errorCount = 0;
  let defaultedCount = 0;

  for (const modelKey of modelKeys) {
    const images = seeds[modelKey];

    for (const img of images) {
      const shortUrl = img.url.split("/").pop()?.slice(0, 40) || img.url;
      console.log(`\n[TagAssets] Processing: ${img.brand} ${img.model} (${shortUrl}...)`);

      const contentHash =
        "sha256:" + crypto.createHash("sha256").update(img.url).digest("hex");

      let tags = null;
      let usedVision = false;

      try {
        const buffer = await fetchImageBuffer(img.url);
        console.log(`  Fetched ${buffer.length} bytes, calling Gemini Vision...`);
        tags = await tagImage(buffer);
        usedVision = true;
      } catch (error) {
        console.log(`  Image fetch failed (${error.message}), using category defaults`);
      }

      if (!tags || tags.reject) {
        if (tags?.reject) {
          console.log(`  REJECTED by vision: ${tags.rejectReason}`);
          rejectedCount++;
        }
        // Generate intelligent defaults from metadata
        tags = generateDefaultTags(img);
        defaultedCount++;
      }

      const compositeScore = usedVision
        ? computeCompositeScore(tags)
        : tags.qualityScore;

      const id = modelKey.toLowerCase() + "_" + String(taggedCount).padStart(2, "0");

      const entry = {
        id,
        brand: tags.brand || img.brand,
        model: tags.model || img.model,
        category: img.category,
        type: tags.type,
        imageType: tags.imageType || tags.type,
        composition: tags.composition,
        framing: tags.framing || "medium",
        lighting: tags.lighting,
        background: tags.background || null,
        subject: tags.subject || "motorcycle",
        emotion: tags.emotion,
        tags: tags.tags || [],
        score: Math.round(compositeScore * 100) / 100,
        brandRecognizable: tags.brandRecognizable !== false,
        source: img.type || "press",
        license: img.license || "press-kit-editorial",
        usableFor: deriveUsableFor(tags, img.category),
        storageUrl: img.url,
        contentHash,
        dimensions: null,
        taggedAt: new Date().toISOString(),
        tagSource: usedVision ? "gemini-vision" : "category-default",
      };

      graphEntries.push(entry);
      taggedCount++;
      console.log(
        `  TAGGED [${entry.tagSource}]: type=${tags.type} comp=${tags.composition} emotion=${tags.emotion} score=${entry.score}`
      );

      if (usedVision) await delay(DELAY_MS);
    }
  }

  console.log(`\n========================================`);
  console.log(`[TagAssets] Complete`);
  console.log(`  Tagged (vision): ${taggedCount - defaultedCount}`);
  console.log(`  Tagged (defaults): ${defaultedCount}`);
  console.log(`  Rejected: ${rejectedCount}`);
  console.log(`  Total graph entries: ${graphEntries.length}`);
  console.log(`========================================`);

  const jsContent = `// Auto-generated by tagVisualAssets.mjs — ${new Date().toISOString()}
// Do NOT edit manually. Re-run: node scripts/tagVisualAssets.mjs

export const IMAGE_GRAPH_DATA = ${JSON.stringify(graphEntries, null, 2)};
`;

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, jsContent);
  console.log(`\nWrote ${graphEntries.length} entries to ${OUTPUT_FILE}`);
}

const CATEGORY_TAG_DEFAULTS = {
  adventure: {
    type: "action",
    imageType: "action",
    composition: "three_quarter",
    framing: "wide",
    lighting: "golden_hour",
    background: "mountain",
    subject: "motorcycle",
    emotion: "adventure",
    tags: ["adventure", "off-road", "touring"],
    qualityScore: 0.72,
    cinematicScore: 0.70,
    compositionScore: 0.70,
    structuralIntegrity: 0.85,
  },
  touring: {
    type: "cinematic",
    imageType: "lifestyle",
    composition: "side_profile",
    framing: "wide",
    lighting: "golden_hour",
    background: "road",
    subject: "motorcycle",
    emotion: "freedom",
    tags: ["touring", "highway", "distance"],
    qualityScore: 0.72,
    cinematicScore: 0.72,
    compositionScore: 0.70,
    structuralIntegrity: 0.85,
  },
  sport: {
    type: "studio",
    imageType: "studio",
    composition: "three_quarter",
    framing: "medium",
    lighting: "studio_soft",
    background: "studio",
    subject: "motorcycle",
    emotion: "power",
    tags: ["sport", "performance", "speed"],
    qualityScore: 0.74,
    cinematicScore: 0.72,
    compositionScore: 0.72,
    structuralIntegrity: 0.85,
  },
  cruiser: {
    type: "cinematic",
    imageType: "lifestyle",
    composition: "side_profile",
    framing: "wide",
    lighting: "dramatic",
    background: "road",
    subject: "motorcycle",
    emotion: "power",
    tags: ["cruiser", "chrome", "heritage"],
    qualityScore: 0.72,
    cinematicScore: 0.74,
    compositionScore: 0.70,
    structuralIntegrity: 0.85,
  },
  naked: {
    type: "studio",
    imageType: "studio",
    composition: "three_quarter",
    framing: "medium",
    lighting: "studio_soft",
    background: "studio",
    subject: "motorcycle",
    emotion: "power",
    tags: ["naked", "streetfighter", "urban"],
    qualityScore: 0.72,
    cinematicScore: 0.70,
    compositionScore: 0.72,
    structuralIntegrity: 0.85,
  },
  scooter: {
    type: "studio",
    imageType: "studio",
    composition: "side_profile",
    framing: "medium",
    lighting: "overcast",
    background: "urban",
    subject: "motorcycle",
    emotion: "calm",
    tags: ["scooter", "commuter", "city"],
    qualityScore: 0.68,
    cinematicScore: 0.65,
    compositionScore: 0.68,
    structuralIntegrity: 0.85,
  },
};

const DEFAULT_TAGS = {
  type: "studio",
  imageType: "studio",
  composition: "side_profile",
  framing: "medium",
  lighting: "studio_soft",
  background: null,
  subject: "motorcycle",
  emotion: "power",
  tags: [],
  qualityScore: 0.70,
  cinematicScore: 0.68,
  compositionScore: 0.68,
  structuralIntegrity: 0.85,
};

function generateDefaultTags(img) {
  const categoryKey = (img.category || "").toLowerCase();
  const base = CATEGORY_TAG_DEFAULTS[categoryKey] || DEFAULT_TAGS;
  return {
    ...base,
    brandRecognizable: true,
    reject: false,
    rejectReason: null,
  };
}

function deriveUsableFor(tags, category) {
  const uses = [];
  const imageType = tags.imageType || tags.type;

  if (imageType === "studio" || imageType === "action") {
    uses.push("rental");
  }
  if (imageType === "action" || imageType === "lifestyle") {
    uses.push("route");
    uses.push("overlay");
  }
  if (imageType === "lifestyle" || tags.background === "mountain" || tags.background === "road") {
    uses.push("destination");
  }
  if (imageType === "detail") {
    uses.push("gallery");
  }
  if (tags.compositionScore >= 0.8 || tags.cinematicScore >= 0.85) {
    uses.push("hero");
  }
  if (tags.framing === "tight" || imageType === "detail") {
    uses.push("thumbnail");
  }
  if (tags.framing === "wide" && tags.cinematicScore >= 0.75) {
    uses.push("hero");
  }

  if (uses.length === 0) uses.push("gallery");

  return [...new Set(uses)];
}

main().catch((err) => {
  console.error("[TagAssets] Fatal error:", err);
  process.exit(1);
});
