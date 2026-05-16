import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync('./functions/serviceAccountKey.json'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });

async function run() {
  const bucket = getStorage().bucket("movie-chat-factory.firebasestorage.app");
  
  try {
    const [files] = await bucket.getFiles({ prefix: '13clean/bmw/r1300gs/' });
    for (const file of files) {
      const [metadata] = await file.getMetadata();
      console.log(`File: ${file.name}`);
      console.log(`Metadata:`, JSON.stringify(metadata.metadata || {}, null, 2));
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
