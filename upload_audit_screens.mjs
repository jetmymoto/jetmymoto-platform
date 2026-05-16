import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve the service account key
const serviceAccountPath = path.resolve(__dirname, "keys/service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "movie-chat-factory.firebasestorage.app",
  });
}

const bucket = admin.storage().bucket();

async function uploadFiles(dir, prefix) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      await uploadFiles(fullPath, `${prefix}/${file}`);
      continue;
    }
    
    const destination = `${prefix}/${file}`;
    console.log(`Uploading ${fullPath} to gs://movie-chat-factory.firebasestorage.app/${destination}...`);
    
    await bucket.upload(fullPath, {
      destination: destination,
      metadata: {
        cacheControl: "public, max-age=3600",
        contentType: "image/png",
      },
    });
  }
}

async function run() {
  try {
    await uploadFiles("screenshots/p0_audit", "mission_audits");
    console.log("Upload complete.");
    
    // Generate signed URLs for the main ones
    const targets = [
      "mission_audits/desktop/a2a-mission.png",
      "mission_audits/desktop/normal-route.png",
      "mission_audits/mobile/a2a-mission.png",
      "mission_audits/mobile/normal-route.png",
    ];
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    console.log("\n--- SIGNED URLS (EXPIRE IN 7 DAYS) ---");
    for (const target of targets) {
      const [url] = await bucket.file(target).getSignedUrl({
        action: "read",
        expires: expiryDate,
      });
      console.log(`${target}: ${url}`);
    }
    
  } catch (error) {
    console.error("Upload failed:", error);
    process.exit(1);
  }
}

run();
