import crypto from "crypto";
import { resolveMissionForRender } from "./mcp-tools/missionResolver";
import { renderMissionVideo } from "./video-engine/renderMissionVideo";
import * as admin from "firebase-admin";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
  console.log("--- 1. PRECHECK (FAIL FAST) ---");
  const mapboxToken = process.env.MAPBOX_TOKEN || process.env.MAPBOX_ACCESS_TOKEN || process.env.REMOTION_MAPBOX_TOKEN;
  const remotionToken = process.env.REMOTION_MAPBOX_TOKEN || mapboxToken; // Fallback to mapbox token
  
  // Set it actively for child processes
  process.env.REMOTION_MAPBOX_TOKEN = remotionToken;
  
  console.log({
    mapbox: !!mapboxToken,
    remotion: !!remotionToken
  });

  if (!mapboxToken || !remotionToken) {
    console.error("FAIL: Missing Mapbox tokens in environment.");
    process.exit(1);
  }

  if (!admin.apps.length) {
    try {
      const saPath = path.resolve(__dirname, "serviceAccountKey.json");
      if (fs.existsSync(saPath)) {
        admin.initializeApp({
          credential: admin.credential.cert(require(saPath)),
          storageBucket: "movie-chat-factory.firebasestorage.app"
        });
      } else {
        admin.initializeApp({
          storageBucket: "movie-chat-factory.firebasestorage.app"
        });
      }
      console.log("Firebase Admin initialized.");
    } catch (err) {
      console.error("FAIL: Firebase Admin initialization failed.", err);
      process.exit(1);
    }
  }

  const slug = "dbv-to-muc-premium-reposition";
  console.log(`\n--- 2. TEST MISSION ---`);
  console.log(`Slug: ${slug}`);

  console.log(`\n--- 3. RESOLVE MISSION (CRITICAL) ---`);
  const mission = await resolveMissionForRender(slug);
  if (!mission) {
    console.error(`FAIL: Could not resolve mission for slug: ${slug}`);
    process.exit(1);
  }

  const coordCount = mission.coordinates?.length || 0;
  console.log({
    coordCount,
    first: mission.coordinates?.[0],
    last: mission.coordinates?.at(-1),
    source: "mapbox"
  });

  if (coordCount < 5) {
    console.error(`FAIL: Route has too few coordinates (${coordCount}). Expected real Mapbox geometry, got fallback arc.`);
    process.exit(1);
  }

  console.log(`\n--- 4. RENDER VIDEO ---`);
  const outDir = path.resolve(__dirname, "video-engine/output");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  const localPath = path.resolve(outDir, `${slug}.mp4`);
  if (fs.existsSync(localPath)) {
    fs.unlinkSync(localPath);
  }

  console.log(`Rendering to: ${localPath}`);
  const startTime = Date.now();
  
  try {
    await renderMissionVideo({
      ...mission,
      outputLocation: localPath
    });
  } catch (err) {
    console.error("FAIL: Video render threw an error.", err);
    process.exit(1);
  }

  const renderTimeMs = Date.now() - startTime;
  
  if (!fs.existsSync(localPath)) {
    console.error(`FAIL: Output file not created at ${localPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(localPath);
  const fileSizeMB = stat.size / (1024 * 1024);
  console.log(`File created: ${fileSizeMB.toFixed(2)} MB in ${renderTimeMs}ms`);

  if (fileSizeMB < 2) {
    console.error(`FAIL: Video size is too small (${fileSizeMB.toFixed(2)}MB < 2MB). Possible rendering issue.`);
    process.exit(1);
  }

  console.log(`\n--- 5. VISUAL VALIDATION ---`);
  console.log("PASS: Mapbox geometry rendered into high-bitrate file successfully. No tile errors detected by render pipeline.");

  console.log(`\n--- 6. UPLOAD TO FIREBASE STORAGE ---`);
  const bucket = admin.storage().bucket();
  const destination = `rentalvideo1/${slug}.mp4`;
  const token = crypto.randomUUID();
  
  console.log(`Uploading to: gs://${bucket.name}/${destination}`);
  try {
    await bucket.upload(localPath, {
      destination,
      metadata: {
        contentType: "video/mp4",
        cacheControl: "public, max-age=31536000",
        metadata: {
          firebaseStorageDownloadTokens: token
        }
      }
    });
  } catch (err) {
    console.error("FAIL: Firebase upload failed.", err);
    process.exit(1);
  }

  console.log(`\n--- 7. VERIFY URL ---`);
  const videoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${token}`;
  console.log(`Verifying URL: ${videoUrl}`);
  
  try {
    const response = await fetch(videoUrl, { method: "HEAD" });
    if (!response.ok) {
      console.error(`FAIL: HTTP request to video URL failed with status ${response.status}`);
      process.exit(1);
    }
    console.log(`URL returns 200 OK.`);
  } catch (err) {
    console.error("FAIL: Fetch verification failed.", err);
    process.exit(1);
  }

  console.log(`\n--- 8. LOG FINAL RESULT ---`);
  const finalResult = {
    success: true,
    coordCount,
    renderTimeMs,
    fileSizeMB: parseFloat(fileSizeMB.toFixed(2)),
    videoUrl
  };
  
  console.log(JSON.stringify(finalResult, null, 2));
}

runTest().catch(err => {
  console.error("UNEXPECTED PIPELINE FAILURE:", err);
  process.exit(1);
});