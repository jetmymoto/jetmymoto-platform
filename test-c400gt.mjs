import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync("./functions/serviceAccountKey.json", "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const doc = await db.collection("motorcycles").doc("bmw-c400gt").get();
  console.log(doc.data().heroImage);
  process.exit(0);
}
run();
