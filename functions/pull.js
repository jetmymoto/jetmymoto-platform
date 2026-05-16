const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const serviceAccount = require("/workspaces/jetmymoto-platform/movie-chat-factory-firebase-adminsdk-fbsvc-fcca93d15b.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "movie-chat-factory.firebasestorage.app"
});
const bucket = admin.storage().bucket();
const targetDir = "/workspaces/jetmymoto-platform/functions/video-engine/temp_frames/mxp-to-muc-alpine-traverse/frames";
fs.mkdirSync(targetDir, { recursive: true });

async function pull() {
  const [files] = await bucket.getFiles({ prefix: "mapboxrawframes/mxp-to-muc-alpine-traverse/frames/frame_" });
  let downloaded = 0;
  for (const file of files) {
    if (file.name.endsWith('.png')) {
      const dest = path.join(targetDir, path.basename(file.name));
      await file.download({ destination: dest });
      downloaded++;
    }
  }
  console.log(`Downloaded ${downloaded} frames`);
  process.exit(0);
}
pull().catch(console.error);
