import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: "movie-chat-factory",
  });
}

const db = getFirestore();

const collections = [
  "airports",
  "missions_v5",
  "trunk_routes",
  "motorcycles",
  "asset_library",
  "render_jobs"
];

for (const name of collections) {
  const snap = await db.collection(name).limit(2).get();
  console.log(`\n=== ${name} ===`);
  for (const doc of snap.docs) {
    console.log(JSON.stringify({ id: doc.id, ...doc.data() }, null, 2));
  }
}
