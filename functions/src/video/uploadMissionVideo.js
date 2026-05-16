const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const {admin} = require("../lib/firebaseAdmin");

function sanitizeSlug(slug) {
  return String(slug || "mission")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "mission";
}

async function createContentHash(filePath) {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash("sha1").update(buffer).digest("hex").slice(0, 16);
}

async function uploadMissionVideo({localFilePath, slug}) {
  const safeSlug = sanitizeSlug(slug);
  const contentHash = await createContentHash(localFilePath);
  const destination = path.posix.join(
      "mission-videos",
      safeSlug,
      `${contentHash}.mp4`,
  );

  let bucket;
  try {
    const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || "{}");
    bucket = admin.storage().bucket(firebaseConfig.storageBucket);
  } catch (error) {
    bucket = admin.storage().bucket();
  }

  await bucket.upload(localFilePath, {
    destination,
    metadata: {
      contentType: "video/mp4",
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return {
    storagePath: destination,
    videoUrl: `https://storage.googleapis.com/${bucket.name}/${destination}`,
    contentHash,
  };
}

module.exports = {
  uploadMissionVideo,
};