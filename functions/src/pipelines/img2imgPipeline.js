/* eslint-disable require-jsdoc, max-len */
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

if (!admin.apps.length) {
  admin.initializeApp();
}

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

const TEMPLATES = {
  "studio-normalize": {
    prompt:
      "Premium motorcycle in clean studio environment, deep black background #050505, subtle gold rim lighting #CDA755, sharp product photography, professional catalog image, 8K resolution",
    negativePrompt:
      "outdoor, nature, road, distorted motorcycle parts, cartoon, anime, text overlay, watermark, blurry, low quality",
    strength: 0.25,
    guidanceScale: 7.5,
    steps: 40,
  },
  "color-grade-luxury": {
    prompt:
      "Same motorcycle, premium color grading, deep contrast, warm amber highlights #CDA755, cinematic shadow depth, professional photography",
    negativePrompt:
      "flat colors, washed out, oversaturated, distorted parts, cartoon, anime",
    strength: 0.15,
    guidanceScale: 6.0,
    steps: 30,
  },
  "composition-cleanup": {
    prompt:
      "Same motorcycle centered in frame, clean minimal background, professional product photography, sharp focus on motorcycle",
    negativePrompt:
      "clutter, text, people, multiple vehicles, distorted, cartoon, watermark",
    strength: 0.20,
    guidanceScale: 7.0,
    steps: 35,
  },
  "cinematic-outdoor": {
    prompt:
      "Motorcycle parked on mountain road at golden hour, cinematic composition, shallow depth of field, warm lighting, professional travel photography",
    negativePrompt:
      "distorted parts, fake, cartoon, indoor, studio, flat lighting",
    strength: 0.35,
    guidanceScale: 7.0,
    steps: 35,
  },
};

async function callHuggingFaceImg2Img(sourceBuffer, template) {
  const { HfInference } = await import("@huggingface/inference");
  const hf = new HfInference(HF_API_KEY);

  const sourceBlob = new Blob([sourceBuffer], { type: "image/jpeg" });

  const result = await hf.imageToImage({
    model: "stabilityai/stable-diffusion-xl-refiner-1.0",
    inputs: sourceBlob,
    parameters: {
      prompt: template.prompt,
      negative_prompt: template.negativePrompt,
      strength: template.strength,
      guidance_scale: template.guidanceScale,
      num_inference_steps: template.steps,
    },
  });

  const arrayBuffer = await result.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function validateWithGemini(imageBuffer) {
  const base64Image = imageBuffer.toString("base64");

  const prompt = `Evaluate this AI-generated motorcycle image for premium product display.

Return ONLY a JSON object:
{
  "brandAccuracy": 0.0-1.0,
  "cinematicScore": 0.0-1.0,
  "compositionQuality": 0.0-1.0,
  "structuralIntegrity": 0.0-1.0,
  "reject": true/false,
  "rejectReason": "string or null"
}

Reject if: motorcycle parts are distorted, brand is unrecognizable, obvious AI artifacts, or image looks cartoonish.`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/jpeg", data: base64Image } },
        ],
      },
    ],
    generationConfig: { responseMimeType: "application/json" },
  };

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Gemini error (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

exports.img2imgPipeline = onDocumentCreated(
  {
    document: "img2img_jobs/{jobId}",
    memory: "1GiB",
    timeoutSeconds: 300,
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return null;

    const jobId = event.params.jobId;
    const job = snapshot.data();

    if (job.status !== "pending") {
      console.log(`[img2img] Job ${jobId} not pending (status: ${job.status})`);
      return null;
    }

    const db = admin.firestore();
    const jobRef = snapshot.ref;

    try {
      await jobRef.update({
        status: "processing",
        processingAt: FieldValue.serverTimestamp(),
      });

      const templateKey = job.template || "studio-normalize";
      const template = TEMPLATES[templateKey];
      if (!template) {
        throw new Error(`Unknown template: ${templateKey}`);
      }

      if (job.prompt) {
        template.prompt = job.prompt;
      }
      if (job.strength !== undefined) {
        template.strength = Math.max(0.1, Math.min(0.5, job.strength));
      }

      console.log(
        `[img2img] Job ${jobId}: template=${templateKey} strength=${template.strength}`
      );

      const sourceResponse = await fetch(job.sourceImageUrl);
      if (!sourceResponse.ok) {
        throw new Error(`Failed to fetch source image: HTTP ${sourceResponse.status}`);
      }
      const sourceBuffer = Buffer.from(await sourceResponse.arrayBuffer());
      console.log(`[img2img] Source image: ${sourceBuffer.length} bytes`);

      console.log("[img2img] Calling Hugging Face SDXL img2img...");
      const generatedBuffer = await callHuggingFaceImg2Img(sourceBuffer, template);
      console.log(`[img2img] Generated image: ${generatedBuffer.length} bytes`);

      console.log("[img2img] Running Gemini structural QC...");
      const qcResult = await validateWithGemini(generatedBuffer);
      console.log(
        `[img2img] QC: brand=${qcResult.brandAccuracy} cinematic=${qcResult.cinematicScore} structural=${qcResult.structuralIntegrity} reject=${qcResult.reject}`
      );

      const hardReject =
        qcResult.brandAccuracy < 0.85 ||
        qcResult.cinematicScore < 0.80 ||
        qcResult.structuralIntegrity < 0.90;

      if (qcResult.reject || hardReject) {
        const reason =
          qcResult.rejectReason ||
          `Hard gate: brand=${qcResult.brandAccuracy} cinematic=${qcResult.cinematicScore} structural=${qcResult.structuralIntegrity}`;

        console.log(`[img2img] REJECTED: ${reason}`);

        await jobRef.update({
          status: "rejected",
          qcResult,
          rejectReason: reason,
          completedAt: FieldValue.serverTimestamp(),
        });
        return null;
      }

      let bucket;
      try {
        const config = JSON.parse(process.env.FIREBASE_CONFIG || "{}");
        bucket = admin.storage().bucket(config.storageBucket);
      } catch {
        bucket = admin.storage().bucket();
      }

      const brand = (job.brand || "unknown").toLowerCase().replace(/\s+/g, "-");
      const model = (job.model || "unknown").toLowerCase().replace(/\s+/g, "-");
      const storagePath = `assets/generated/${brand}/${model}/${templateKey}_${Date.now()}.jpg`;

      const file = bucket.file(storagePath);
      await file.save(generatedBuffer, {
        metadata: { contentType: "image/jpeg" },
      });

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

      console.log(`[img2img] Uploaded to: ${storagePath}`);

      await jobRef.update({
        status: "completed",
        qcResult,
        outputStoragePath: storagePath,
        outputUrl: publicUrl,
        completedAt: FieldValue.serverTimestamp(),
      });

      if (job.dispatchAssetJob) {
        const assetJobId = `img2img_${jobId}`;
        await db.collection("asset_jobs").doc(assetJobId).set({
          jobType: "visual_asset_pack",
          entityType: job.entityType || "rental",
          entityId: job.entityId || `${brand}-${model}`,
          entitySlug: job.entitySlug || `${brand}-${model}`,
          sourceImageUrl: publicUrl,
          assets: ["hero", "poster", "thumbnail"],
          captionMode: "generate",
          style: { theme: "cinematic-premium", gradientStrength: 0.7 },
          text: {
            title: `${job.brand || "Unknown"} ${job.model || "Unknown"}`,
            subtitle: `AI-enhanced ${templateKey} variant`,
          },
          status: "pending",
          createdAt: FieldValue.serverTimestamp(),
        });
        console.log(`[img2img] Dispatched asset_job: ${assetJobId}`);
      }

      console.log(`[img2img] Job ${jobId} completed successfully.`);
      return null;
    } catch (error) {
      console.error(`[img2img] Job ${jobId} failed:`, error);
      await jobRef.update({
        status: "error",
        error: error.message,
        completedAt: FieldValue.serverTimestamp(),
      });
      return null;
    }
  }
);
