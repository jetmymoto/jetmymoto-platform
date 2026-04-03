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

function initFirestore() {
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
  if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

function loadSourceRecords() {
  const rows = [];

  for (const file of INPUT_FILES) {
    const payload = JSON.parse(fs.readFileSync(file, "utf8"));
    const records = Array.isArray(payload.records) ? payload.records : [];

    for (const record of records) {
      const brand = String(record.brand || "").trim();
      const model = String(record.model || "").trim();
      const year = Number(record.year);
      const source = String(record.source || "totalmotorcycle");
      const sourceUrl = String(record.sourceUrl || "");
      const category = record.category ? String(record.category) : null;
      const description = record.description ? String(record.description).trim() : "";

      const images = Array.isArray(record.images) ? record.images : [];
      for (let i = 0; i < images.length; i += 1) {
        const imageUrl = String(images[i] || "").trim();
        if (!imageUrl) continue;
        rows.push({
          brand,
          model,
          year,
          source,
          sourceUrl,
          category,
          description,
          imageUrl,
          imageIndex: i + 1,
        });
      }
    }
  }

  return rows;
}

function groupRows(rows) {
  const groups = new Map();

  for (const row of rows) {
    const key = `${row.brand}|||${row.model}|||${row.year}`;
    if (!groups.has(key)) {
      groups.set(key, {
        brand: row.brand,
        model: row.model,
        year: row.year,
        source: row.source,
        sourceUrl: row.sourceUrl,
        category: row.category || null,
        description: row.description || "",
        images: [],
      });
    }

    const target = groups.get(key);

    if (!target.category && row.category) target.category = row.category;
    if (!target.description && row.description) target.description = row.description;
    if (!target.sourceUrl && row.sourceUrl) target.sourceUrl = row.sourceUrl;

    target.images.push({
      url: row.imageUrl,
      index: row.imageIndex,
    });
  }

  return [...groups.values()];
}

function dedupeAndBuildImages(group) {
  const dedup = [];
  const seen = new Set();

  const sorted = [...group.images].sort((a, b) => a.index - b.index);
  for (const item of sorted) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    dedup.push(item.url);
  }

  return dedup.map((url, idx) => {
    const index = idx + 1;
    return {
      url,
      index,
      type: imageTypeByIndex(index),
    };
  });
}

async function migrate() {
  const db = initFirestore();
  const rows = loadSourceRecords();
  const grouped = groupRows(rows);

  let createdOrUpdated = 0;
  let skipped = 0;

  for (const group of grouped) {
    const images = dedupeAndBuildImages(group);
    if (images.length < 3) {
      skipped += 1;
      console.log(`✗ model skipped (<3 images) | ${buildSlug(group.brand, group.model)} | ${images.length} images`);
      continue;
    }

    const slug = buildSlug(group.brand, group.model);
    const ref = db.collection("motorcycles").doc(slug);

    const snap = await ref.get();
    const existingCreatedAt = snap.exists ? snap.get("createdAt") : null;

    const doc = {
      brand: group.brand,
      model: group.model,
      slug,
      year: group.year,
      category: group.category || null,
      images,
      imageCount: images.length,
      source: group.source || "totalmotorcycle",
      sourceUrl: group.sourceUrl || "",
      description: group.description || "",
      createdAt: existingCreatedAt || FieldValue.serverTimestamp(),
      updatedAt: Timestamp.now(),
      migration: {
        schemaVersion: 1,
        migratedAt: Timestamp.now(),
        deprecatedImageEntries: false,
      },
    };

    await ref.set(doc, { merge: false });
    createdOrUpdated += 1;

    console.log(`✓ model created | ${slug} | ${images.length} images`);
  }

  console.log("=== MIGRATION COMPLETE ===");
  console.log(`grouped models: ${grouped.length}`);
  console.log(`written models: ${createdOrUpdated}`);
  console.log(`skipped models: ${skipped}`);
}

migrate().catch((error) => {
  console.error(`fatal | ${error.message}`);
  process.exit(1);
});
