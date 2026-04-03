import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, "../functions/serviceAccountKey.json");

const BUCKET_NAME = "movie-chat-factory.firebasestorage.app";
const SOURCE_PREFIX = "assets/source/cycleworld";
const OUTPUT_PREFIX = "1models";
const SAMPLE_SIZE = 100;
const MAX_PARALLEL = 5;
const TRANSFORM_ENDPOINT =
  "https://us-central1-movie-chat-factory.cloudfunctions.net/ext-image-processing-api-handler/process";

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`Missing service account: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf-8"));
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: BUCKET_NAME,
  });
}

const bucket = getStorage().bucket();

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value}B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)}KB`;
  return `${(value / (1024 * 1024)).toFixed(2)}MB`;
}

function buildTransformUrl(imageUrl) {
  const operations = [
    { operation: "input", type: "url", url: imageUrl },
    { operation: "resize", width: 1600, height: 900, fit: "cover" },
    { operation: "modulate", brightness: 1.05, saturation: 0.9 },
    { operation: "normalize" },
    { operation: "sharpen" },
    { operation: "output", format: "webp", quality: 85 },
  ];

  const endpoint = new URL(TRANSFORM_ENDPOINT);
  endpoint.searchParams.set("operations", JSON.stringify(operations));
  return endpoint.toString();
}

async function getSourceFiles() {
  const [files] = await bucket.getFiles({ prefix: `${SOURCE_PREFIX}/` });
  return files.filter((file) => !file.name.endsWith("/"));
}

async function getReadUrl(file) {
  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 60 * 60 * 1000,
    version: "v4",
  });
  return signedUrl;
}

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "image/webp";
  return { buffer: Buffer.from(arrayBuffer), contentType };
}

async function saveOutput(filename, buffer, contentType) {
  const destination = `${OUTPUT_PREFIX}/${filename}`;
  const file = bucket.file(destination);

  await file.save(buffer, {
    metadata: {
      contentType,
      metadata: {
        source: SOURCE_PREFIX,
        pipeline: "cinematic_v1_test",
        transformed: "true",
      },
    },
  });

  return destination;
}

async function processFile(file) {
  try {
    const [metadata] = await file.getMetadata();
    const originalSize = Number(metadata.size || 0);
    const inputUrl = await getReadUrl(file);
    const transformUrl = buildTransformUrl(inputUrl);
    const { buffer, contentType } = await fetchBuffer(transformUrl);

    const outputFilename = `${path.basename(file.name, path.extname(file.name))}.webp`;
    await saveOutput(outputFilename, buffer, contentType || "image/webp");

    console.log(`✓ success | ${formatBytes(originalSize)} → ${formatBytes(buffer.length)} | ${outputFilename}`);

    return {
      success: true,
      originalSize,
      newSize: buffer.length,
    };
  } catch (error) {
    console.log(`✗ fail | fallback skipped | ${path.basename(file.name)}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function runPool(items, worker, concurrency) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runner() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runner());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log(`[TransformTest] Listing files from ${SOURCE_PREFIX}/ ...`);
  const files = await getSourceFiles();
  console.log(`[TransformTest] Found ${files.length} source images`);

  const sample = shuffle(files).slice(0, SAMPLE_SIZE);
  console.log(`[TransformTest] Selected ${sample.length} images`);
  console.log(`[TransformTest] Output folder: ${OUTPUT_PREFIX}/`);
  console.log(`[TransformTest] Max parallel: ${MAX_PARALLEL}`);

  const results = await runPool(sample, processFile, MAX_PARALLEL);

  const successResults = results.filter((result) => result?.success);
  const failCount = results.length - successResults.length;
  const totalProcessed = results.length;

  const avgReduction =
    successResults.length > 0
      ? successResults.reduce((sum, result) => {
          if (!result.originalSize) return sum;
          return sum + ((result.originalSize - result.newSize) / result.originalSize) * 100;
        }, 0) / successResults.length
      : 0;

  console.log("");
  console.log("[TransformTest] Summary");
  console.log(`  Total processed: ${totalProcessed}`);
  console.log(`  Success count:   ${successResults.length}`);
  console.log(`  Fail count:      ${failCount}`);
  console.log(`  Avg reduction:   ${avgReduction.toFixed(2)}%`);
}

main().catch((error) => {
  console.error(`[TransformTest] Fatal: ${error.message}`);
  process.exit(1);
});
