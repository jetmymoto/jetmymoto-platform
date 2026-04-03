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
const TARGET_PREFIX = "13clean";
const PAGE_URL =
  "https://www.totalmotorcycle.com/motorcycles/2025/2025-bmw-r1300gs-adventure";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const REQUEST_TIMEOUT_MS = 15_000;
const RETRY_LIMIT = 3;
const RETRY_WAIT_MS = 2_000;
const CONSECUTIVE_FAIL_WAIT_MS = 5_000;
const MIN_BYTES = 100 * 1024;

const IMAGES = [
  "https://www.totalmotorcycle.com/wp-content/uploads/2024/07/2025-BMW-R1300GS-Adventure1.jpg",
  "https://www.totalmotorcycle.com/wp-content/uploads/2024/07/2025-BMW-R1300GS-Adventure2.jpg",
  "https://www.totalmotorcycle.com/wp-content/uploads/2024/07/2025-BMW-R1300GS-Adventure3.jpg",
  "https://www.totalmotorcycle.com/wp-content/uploads/2024/07/2025-BMW-R1300GS-Adventure4.jpg",
  "https://www.totalmotorcycle.com/wp-content/uploads/2024/07/2025-BMW-R1300GS-Adventure5.jpg",
  "https://www.totalmotorcycle.com/wp-content/uploads/2024/07/2025-BMW-R1300GS-Adventure6.jpg",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getFirebaseBucket() {
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf-8"));
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: BUCKET_NAME,
    });
  }
  return getStorage().bucket(BUCKET_NAME);
}

async function downloadWithRetry(url, index) {
  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": USER_AGENT,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer;
    } catch (error) {
      const isLast = attempt === RETRY_LIMIT;
      if (isLast) {
        throw new Error(`download failed after 3 attempts (${error.message})`);
      }
      await sleep(RETRY_WAIT_MS);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`unreachable retry branch for index ${index}`);
}

async function validateImageBuffer(buffer) {
  if (buffer.length <= MIN_BYTES) {
    throw new Error(`size ${buffer.length} bytes <= 100KB`);
  }

  try {
    await sharp(buffer).metadata();
  } catch (error) {
    throw new Error(`invalid image buffer (${error.message})`);
  }
}

function buildMetadata(index) {
  return {
    brand: "BMW",
    model: "R1300GS Adventure",
    year: "2025",
    source: "totalmotorcycle",
    sourceUrl: PAGE_URL,
    imageIndex: String(index),
  };
}

async function uploadToStorage(bucket, buffer, index) {
  const objectPath = `${TARGET_PREFIX}/bmw-r1300gs-${index}.jpg`;
  const file = bucket.file(objectPath);
  await file.save(buffer, {
    metadata: {
      contentType: "image/jpeg",
      metadata: buildMetadata(index),
    },
  });
  return objectPath;
}

async function main() {
  const bucket = getFirebaseBucket();
  let consecutiveFailures = 0;
  let savedCount = 0;

  for (let i = 0; i < IMAGES.length; i += 1) {
    const index = i + 1;
    const url = IMAGES[i];

    try {
      const buffer = await downloadWithRetry(url, index);
      await validateImageBuffer(buffer);
      await uploadToStorage(bucket, buffer, index);
      console.log(`✓ saved | ${index} | ${buffer.length} bytes`);
      consecutiveFailures = 0;
      savedCount += 1;
    } catch (error) {
      console.log(`✗ failed | ${index} | ${error.message}`);
      consecutiveFailures += 1;
      if (consecutiveFailures >= 2) {
        await sleep(CONSECUTIVE_FAIL_WAIT_MS);
      }
    }
  }

  if (savedCount !== IMAGES.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`fatal | ${error.message}`);
  process.exit(1);
});
