import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_FILE = path.resolve(__dirname, "../data/visual_seed_set.json");

const serviceAccountPath = path.resolve(
  __dirname,
  "../functions/serviceAccountKey.json"
);

if (!fs.existsSync(serviceAccountPath)) {
  console.error(
    "[IngestSeed] serviceAccountKey.json not found at:",
    serviceAccountPath
  );
  console.log(
    "[IngestSeed] Running in DRY-RUN mode (no Firestore/Storage writes)"
  );
}

const DRY_RUN = !fs.existsSync(serviceAccountPath);

let db, bucket;
if (!DRY_RUN) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: "movie-chat-factory",
    });
  }
  db = getFirestore();
  bucket = getStorage().bucket("movie-chat-factory.appspot.com");
}

const DELAY_MS = 500;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("[IngestSeed] Loading visual seed set...");

  if (!fs.existsSync(SEED_FILE)) {
    console.error(`Seed file not found: ${SEED_FILE}`);
    process.exit(1);
  }

  const seeds = JSON.parse(fs.readFileSync(SEED_FILE, "utf-8"));
  const modelKeys = Object.keys(seeds);
  console.log(`[IngestSeed] Found ${modelKeys.length} models`);

  let written = 0;
  let skipped = 0;

  for (const modelKey of modelKeys) {
    const images = seeds[modelKey];

    for (const img of images) {
      const contentHash =
        "sha256:" +
        crypto.createHash("sha256").update(img.url).digest("hex").slice(0, 16);

      const docId = `seed_${modelKey}_${contentHash.slice(7, 19)}`;

      if (DRY_RUN) {
        console.log(`  [DRY-RUN] Would write: raw_image_library/${docId}`);
        written++;
        continue;
      }

      const existingDoc = await db
        .collection("raw_image_library")
        .doc(docId)
        .get();

      if (existingDoc.exists) {
        console.log(`  SKIP (exists): ${docId}`);
        skipped++;
        continue;
      }

      await db
        .collection("raw_image_library")
        .doc(docId)
        .set({
          brand: img.brand,
          model: img.model,
          category: img.category,
          sourceUrl: img.url,
          storagePath: null,
          publicUrl: img.url,
          source: img.type || "press",
          license: img.license || "press-kit-editorial",
          composition: img.composition || "side_profile",
          quality: img.quality || "high",
          contentHash,
          status: "pending_tag",
          ingestedAt: FieldValue.serverTimestamp(),
        });

      console.log(`  WRITTEN: ${docId} (${img.brand} ${img.model})`);
      written++;
      await delay(DELAY_MS);
    }
  }

  console.log(`\n[IngestSeed] Complete: ${written} written, ${skipped} skipped`);

  if (DRY_RUN) {
    console.log(
      "\n[IngestSeed] DRY-RUN mode. Add functions/serviceAccountKey.json for live writes."
    );
  }
}

main().catch((err) => {
  console.error("[IngestSeed] Fatal:", err);
  process.exit(1);
});
