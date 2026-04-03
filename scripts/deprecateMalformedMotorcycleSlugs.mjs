import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, "../functions/serviceAccountKey.json");
const TARGET_PREFIXES = ["ducati-2025-5-ducati-"];

function initDb() {
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
  if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

async function main() {
  const db = initDb();
  let updated = 0;

  for (const prefix of TARGET_PREFIXES) {
    const snap = await db
      .collection("motorcycles")
      .orderBy("__name__")
      .startAt(prefix)
      .endAt(`${prefix}\uf8ff`)
      .get();

    for (const doc of snap.docs) {
      await doc.ref.set(
        {
          deprecated: true,
          status: "incomplete",
          updatedAt: Timestamp.now(),
          migration: {
            deprecatedSlug: true,
            deprecatedAt: Timestamp.now(),
            deprecatedReason: "malformed 2025.5 slug",
          },
        },
        { merge: true }
      );
      updated += 1;
      console.log(`deprecated | ${doc.id}`);
    }
  }

  console.log(`deprecated docs: ${updated}`);
}

main().catch((error) => {
  console.error(`fatal | ${error.message}`);
  process.exit(1);
});

