import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync('./functions/serviceAccountKey.json'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "movie-chat-factory.appspot.com" // or movie-chat-factory.firebasestorage.app
  });
}

async function run() {
  const bucket = getStorage().bucket("movie-chat-factory.firebasestorage.app");
  try {
    const [files] = await bucket.getFiles({ prefix: '13clean/' });
    console.log("Files found:");
    files.slice(0, 20).forEach(file => console.log(file.name));
    if (files.length > 20) console.log(`...and ${files.length - 20} more`);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
