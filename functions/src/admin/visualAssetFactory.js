/* eslint-disable indent, require-jsdoc, max-len */
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const sharp = require("sharp");
const { FieldValue } = require("firebase-admin/firestore");

if (!admin.apps.length) {
  admin.initializeApp();
}

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCrd9PsP3XlyE8D1r_FzGCCr7mE1OI0Fu8";
const POSTER_ENGINE_URL = "https://poster-engine-778225783812.us-central1.run.app/generate-poster";
const GEMINI_LLM_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Generate premium captions using Gemini LLM.
 */
async function generateCaption(entityName, entityType, assetType, terrain = "unknown") {
  const prompt = `Generate a premium, concise caption for a motorcycle travel visual.

Context:
- Location: ${entityName}
- Type: ${entityType}
- Asset: ${assetType}
- Terrain: ${terrain}

Rules:
- max 2 sentences
- no hype words
- no emojis
- cinematic but grounded

Return ONLY a JSON object with this structure:
{
  "title": "Short Title",
  "caption": "The caption text...",
  "alt": "Descriptive alt text"
}`;

  const payload = {
    contents: [{
      parts: [{text: prompt}],
    }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  try {
    const response = await fetch(GEMINI_LLM_ENDPOINT, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini LLM error (${response.status}):`, errorText);
      throw new Error(`Gemini LLM error: ${response.status}`);
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(textResult);
  } catch (error) {
    console.error("Caption generation failed:", error);
    return {
      title: entityName,
      caption: `Discover ${entityName}, a premier ${entityType} for motorcycle enthusiasts.`,
      alt: `${entityName} ${entityType} motorcycle visual`,
    };
  }
}

/**
 * Process and upload image to Firebase Storage.
 */
async function processAndUpload(sourceUrl, storagePath, assetType, fallbackUrl) {
  let response;
  try {
    response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (err) {
    if (fallbackUrl) {
      console.warn(`Failed to fetch from ${sourceUrl} (${err.message}), using fallback ${fallbackUrl}`);
      response = await fetch(fallbackUrl);
    } else {
      throw new Error(`Failed to fetch image from ${sourceUrl}: ${err.message}`);
    }
  }
  
  if (!response.ok) throw new Error(`Failed to fetch fallback image from ${fallbackUrl}`);
  const inputBuffer = await response.buffer();

  let outputBuffer;
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  // Apply asset-specific transformations
  switch (assetType) {
    case "hero":
      // Cinematic crop (e.g., 21:9 or 16:9)
      outputBuffer = await image
        .resize({
          width: 1920,
          height: 800,
          fit: "cover",
          position: "center",
        })
        .jpeg({quality: 85})
        .toBuffer();
      break;
    case "thumbnail":
      // Square resize
      outputBuffer = await image
        .resize(400, 400, {
          fit: "cover",
          position: "center",
        })
        .jpeg({quality: 80})
        .toBuffer();
      break;
    case "poster":
    default:
      // Normalize but keep aspect ratio
      outputBuffer = await image
        .resize({
          width: 1200,
          withoutEnlargement: true,
        })
        .jpeg({quality: 90})
        .toBuffer();
      break;
  }

  // Upload to bucket
  let bucket;
  try {
    const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || "{}");
    bucket = admin.storage().bucket(firebaseConfig.storageBucket);
  } catch (e) {
    bucket = admin.storage().bucket();
  }

  const file = bucket.file(storagePath);
  await file.save(outputBuffer, {
    metadata: {contentType: "image/jpeg"},
  });

  return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
}

/**
 * Main Trigger: Listen for asset_jobs
 */
exports.visualAssetFactory = onDocumentCreated({document: "asset_jobs/{jobId}"}, async (event) => {
  const snapshot = event.data;
  if (!snapshot) return null;

  const jobId = event.params.jobId;
  const jobData = snapshot.data();

  // 0. Only process pending jobs
  if (jobData.status !== "pending") {
    console.log(`Job ${jobId} is not pending. Status: ${jobData.status}`);
    return null;
  }

  const db = admin.firestore();
  const jobRef = snapshot.ref;

  try {
    // 1. Mark job as processing
    await jobRef.update({
      status: "processing",
      processingAt: FieldValue.serverTimestamp(),
    });

    // 2. Call Poster Engine (Existing System)
    const posterPayload = {
      mission_id: jobData.entityId,
      image_url: jobData.sourceImageUrl,
      title: jobData.text?.title || jobData.entityId,
      subtitle: jobData.text?.subtitle || "",
      difficulty: jobData.difficulty || "ADVANCED",
      poster_config: {
        gradient_strength: jobData.style?.gradientStrength || 0.75,
      },
    };

    console.log(`Calling Poster Engine for job ${jobId}...`);
    const posterRes = await fetch(POSTER_ENGINE_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(posterPayload),
    });

    if (!posterRes.ok) {
      const errorText = await posterRes.text();
      throw new Error(`Poster Engine error (${posterRes.status}): ${errorText}`);
    }

    const posterData = await posterRes.json();
    const variants = posterData.variants || {};
    // Use landscape variant from engine if available, fallback to source
    const baseImageUrl = variants.landscape || jobData.sourceImageUrl;

    // 3. Generate Multiple Assets (hero, poster, thumbnail)
    const assetTypes = jobData.assets || ["hero", "poster", "thumbnail"];
    const assetsOutput = {};

    for (const assetType of assetTypes) {
      console.log(`Processing ${assetType} for job ${jobId}...`);

      // 4. Generate Caption (NEW step)
      const captionData = await generateCaption(
        jobData.text?.title || jobData.entityId,
        jobData.entityType,
        assetType,
        jobData.terrain || "varied terrain",
      );

      // 5. Process and Upload to Storage (Path: assets/{type}/{id}/{assetType}.jpg)
      const storagePath = `assets/${jobData.entityType}/${jobData.entityId}/${assetType}.jpg`;
      const publicUrl = await processAndUpload(
        variants.landscape ? variants.landscape : jobData.sourceImageUrl, // Attempt engine image
        storagePath,
        assetType,
        jobData.sourceImageUrl // Explicit Fallback
      );

      assetsOutput[assetType] = {
        imageUrl: publicUrl,
        storagePath: storagePath,
        title: captionData.title,
        caption: captionData.caption,
        alt: captionData.alt,
      };
    }

    // 6. Write to asset_library (Canonical source for frontend)
    const libraryEntry = {
      entityType: jobData.entityType,
      entityId: jobData.entityId,
      entitySlug: jobData.entitySlug || jobData.entityId,
      status: "ready",
      engineVersion: posterData.engine_version || "v2.0",
      assets: assetsOutput,
      primaryAsset: jobData.primaryAsset || "hero",
      updatedAt: FieldValue.serverTimestamp(),
    };

    const libraryId = `${jobData.entityType}_${jobData.entityId}`;
    await db.collection("asset_library").doc(libraryId).set(libraryEntry);

    // 7. Mark job as completed
    await jobRef.update({
      status: "completed",
      completedAt: FieldValue.serverTimestamp(),
      resultLibraryId: libraryId,
    });

    console.log(`Job ${jobId} completed successfully. Entry: ${libraryId}`);
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    await jobRef.update({
      status: "error",
      error: error.message,
      failedAt: FieldValue.serverTimestamp(),
    });
  }

  return null;
});
