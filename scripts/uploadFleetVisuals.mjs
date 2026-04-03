/**
 * uploadFleetVisuals.mjs
 *
 * Downloads existing images from 'rental model images/' in Firebase Storage,
 * re-uploads them to a new 'fleet-visuals/' folder with standardized naming,
 * and makes them publicly accessible. Updates visual_seed_set.json with new URLs.
 *
 * Usage: node scripts/uploadFleetVisuals.mjs
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ACCOUNT_PATH = path.resolve(
  __dirname,
  "../functions/serviceAccountKey.json"
);
const SEED_FILE = path.resolve(__dirname, "../data/visual_seed_set.json");
const BUCKET_NAME = "movie-chat-factory.firebasestorage.app";
const NEW_FOLDER = "fleet-visuals";

// ── Init Firebase ────────────────────────────────────────────────────
const serviceAccount = JSON.parse(
  fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf-8")
);
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: BUCKET_NAME,
  });
}
const bucket = getStorage().bucket();

// ── Helpers ──────────────────────────────────────────────────────────
function toKebab(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildPublicUrl(filePath) {
  const encoded = encodeURIComponent(filePath);
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encoded}?alt=media`;
}

// ── Build mapping: model key → existing storage file ─────────────────
// Existing files use kebab-case .png in 'rental model images/'
function buildExistingFileMap(existingFiles) {
  const map = new Map();
  for (const f of existingFiles) {
    // Skip folder placeholder
    if (f.name.endsWith("/")) continue;
    // Extract filename without path and extension
    const basename = path.basename(f.name, path.extname(f.name));
    const normalized = basename.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    map.set(normalized, f);
  }
  return map;
}

function normalizeModelKey(brand, model) {
  return toKebab(`${brand} ${model}`);
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log("[UploadFleet] Loading seed set...");
  const seeds = JSON.parse(fs.readFileSync(SEED_FILE, "utf-8"));
  const modelKeys = Object.keys(seeds);
  console.log(`[UploadFleet] ${modelKeys.length} models in seed set`);

  // List existing files in source folder
  console.log("[UploadFleet] Listing existing files in 'rental model images/'...");
  const [existingFiles] = await bucket.getFiles({
    prefix: "rental model images/",
  });
  const existingMap = buildExistingFileMap(existingFiles);
  console.log(`[UploadFleet] Found ${existingMap.size} existing images`);
  for (const [key, file] of existingMap) {
    console.log(`  ${key} → ${file.name}`);
  }

  // Check if new folder already has files
  const [newFolderFiles] = await bucket.getFiles({
    prefix: `${NEW_FOLDER}/`,
    maxResults: 5,
  });
  const existingNewFiles = newFolderFiles.filter((f) => !f.name.endsWith("/"));
  if (existingNewFiles.length > 0) {
    console.log(
      `\n[UploadFleet] '${NEW_FOLDER}/' already has ${existingNewFiles.length}+ files.`
    );
    console.log("  Continuing — will skip already-uploaded files.");
  }

  let uploaded = 0;
  let skipped = 0;
  let noSource = 0;
  const updatedSeeds = { ...seeds };

  for (const modelKey of modelKeys) {
    const imgs = seeds[modelKey];
    const img = imgs[0];
    const normalizedKey = normalizeModelKey(img.brand, img.model);

    // Match against existing files (fuzzy: try exact, then partial)
    let sourceFile = existingMap.get(normalizedKey);
    if (!sourceFile) {
      // Try partial match — e.g., "bmw-r1300-gs" matches "bmw-r-1300-gs"
      for (const [key, file] of existingMap) {
        const condensedKey = normalizedKey.replace(/-/g, "");
        const condensedExisting = key.replace(/-/g, "");
        if (
          condensedKey === condensedExisting ||
          condensedKey.includes(condensedExisting) ||
          condensedExisting.includes(condensedKey)
        ) {
          sourceFile = file;
          break;
        }
      }
    }

    const ext = sourceFile
      ? path.extname(sourceFile.name)
      : ".jpg";
    const destPath = `${NEW_FOLDER}/${normalizedKey}${ext}`;
    const destFile = bucket.file(destPath);

    // Check if already uploaded
    const [exists] = await destFile.exists();
    if (exists) {
      // Get the download token from metadata
      const [metadata] = await destFile.getMetadata();
      const token =
        metadata.metadata?.firebaseStorageDownloadTokens || "";
      const publicUrl = token
        ? `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(destPath)}?alt=media&token=${token}`
        : buildPublicUrl(destPath);
      console.log(`  SKIP (exists): ${destPath}`);
      // Update seed URL
      updatedSeeds[modelKey] = imgs.map((i) => ({
        ...i,
        url: publicUrl,
      }));
      skipped++;
      continue;
    }

    if (!sourceFile) {
      console.log(
        `  NO SOURCE: ${img.brand} ${img.model} (${normalizedKey}) — no matching image in storage`
      );
      noSource++;
      continue;
    }

    // Download from source
    console.log(
      `\n[UploadFleet] Copying: ${sourceFile.name} → ${destPath}`
    );
    try {
      const [buffer] = await sourceFile.download();
      console.log(`  Downloaded ${buffer.length} bytes`);

      // Upload to new folder
      const downloadToken = crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);

      await destFile.save(buffer, {
        metadata: {
          contentType: ext === ".png" ? "image/png" : "image/jpeg",
          metadata: {
            brand: img.brand,
            model: img.model,
            category: img.category,
            source: "fleet-visual-pipeline",
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });

      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(destPath)}?alt=media&token=${downloadToken}`;
      console.log(`  Uploaded: ${publicUrl}`);

      // Update seed URL
      updatedSeeds[modelKey] = imgs.map((i) => ({
        ...i,
        url: publicUrl,
      }));
      uploaded++;
    } catch (err) {
      console.error(`  UPLOAD FAILED for ${destPath}: ${err.message}`);
    }
  }

  // Write updated seed file
  fs.writeFileSync(SEED_FILE, JSON.stringify(updatedSeeds, null, 2));

  console.log(`\n========================================`);
  console.log(`[UploadFleet] Complete`);
  console.log(`  Uploaded: ${uploaded}`);
  console.log(`  Skipped (already in ${NEW_FOLDER}/): ${skipped}`);
  console.log(`  No source image: ${noSource}`);
  console.log(`  Total models: ${modelKeys.length}`);
  console.log(`========================================`);
  console.log(`\nSeed file updated: ${SEED_FILE}`);
  console.log(
    `Models without source images (${noSource}) kept their original URLs.`
  );
}

main().catch((err) => {
  console.error("[UploadFleet] Fatal:", err);
  process.exit(1);
});
