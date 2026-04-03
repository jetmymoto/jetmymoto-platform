import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, "../functions/serviceAccountKey.json");
const INPUT_FILES = [
  path.resolve(__dirname, "../data/bmw-full-models-2025.json"),
  path.resolve(__dirname, "../data/ktm-full-models-2025.json"),
];

function normalizeSlugPart(input) {
  return String(input)
    .toLowerCase()
    .replace(/[\/–—]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildSlug(brand, model) {
  return `${normalizeSlugPart(brand)}-${normalizeSlugPart(model)}`;
}

function imageTypeByIndex(index) {
  if (index === 1) return "profile-left";
  if (index === 2) return "profile-right";
  return "detail";
}

function dedupeImages(urls) {
  const seen = new Set();
  const unique = [];
  for (const url of urls) {
    const normalized = String(url || "").trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(normalized);
  }
  return unique;
}

function initFirestore() {
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
  if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

function loadRecords() {
  const records = [];
  for (const file of INPUT_FILES) {
    const payload = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const rec of payload.records || []) {
      records.push(rec);
    }
  }
  return records;
}

async function main() {
  const db = initFirestore();
  const records = loadRecords();

  let written = 0;
  for (const rec of records) {
    const brand = String(rec.brand || "").trim();
    const model = String(rec.model || "").trim();
    const year = Number(rec.year || 2025);
    const slug = buildSlug(brand, model);

    const uniqueUrls = dedupeImages(Array.isArray(rec.images) ? rec.images : []);
    const images = uniqueUrls.map((url, i) => ({
      url,
      index: i + 1,
      type: imageTypeByIndex(i + 1),
    }));

    const imageCount = images.length;
    const status = imageCount >= 3 ? "complete" : "incomplete";
    const hasProfilePair = imageCount >= 2;
    const hasDetails = imageCount >= 3;

    const ref = db.collection("motorcycles").doc(slug);
    const snap = await ref.get();
    const existingCreatedAt = snap.exists ? snap.get("createdAt") : null;

    const doc = {
      brand,
      model,
      slug,
      year,
      category: rec.category || null,
      images,
      imageCount,
      hasProfilePair,
      hasDetails,
      status,
      source: String(rec.source || "totalmotorcycle"),
      sourceUrl: String(rec.sourceUrl || ""),
      description: String(rec.description || ""),
      createdAt: existingCreatedAt || FieldValue.serverTimestamp(),
      updatedAt: Timestamp.now(),
      migration: {
        schemaVersion: 2,
        migratedAt: Timestamp.now(),
        deprecatedImageEntries: false,
      },
    };

    await ref.set(doc, { merge: false });
    written += 1;

    if (status === "incomplete") {
      console.log(`✗ incomplete | ${slug} | ${imageCount} images`);
    } else {
      console.log(`✓ model created | ${slug} | ${imageCount} images`);
    }
  }

  console.log("=== BMW/KTM SCHEMA SYNC COMPLETE ===");
  console.log(`records written: ${written}`);
}

main().catch((error) => {
  console.error(`fatal | ${error.message}`);
  process.exit(1);
});
