import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not set");
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: "movie-chat-factory",
  });
}

const db = getFirestore();
const snap = await db.collection("airports").limit(3).get();
console.log(snap.docs.map(d => ({ id: d.id, ...d.data() })));
