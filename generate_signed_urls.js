// generate_signed_urls.js
// Generates signed preview URLs for 3 video files in Google Cloud Storage (ESM version)

import { Storage } from "@google-cloud/storage";

// Initialize storage (assumes GOOGLE_APPLICATION_CREDENTIALS env var is set)
const storage = new Storage();
const bucket = storage.bucket("movie-chat-factory.firebasestorage.app");

const files = [
  "ffmpeg1/mxp-to-muc-alpine-traverse/mxp-to-muc-alpine-traverse.mp4",
  "ffmpeg1/mxp-to-muc-alpine-traverse/mxp-to-muc-alpine-traverse_9x16.mp4",
  "ffmpeg1/mxp-to-muc-alpine-traverse/mxp-to-muc-alpine-traverse_1x1.mp4",
];

for (const path of files) {
  try {
    const [url] = await bucket.file(path).getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    console.log("\n🎬", path);
    console.log(url);
  } catch (err) {
    console.error("Error generating URL for", path, err.message);
  }
}
