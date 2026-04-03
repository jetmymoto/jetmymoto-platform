import FirecrawlApp from "@mendable/firecrawl-js";
import dotenv from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { createRequire } from "module";
import fs from "fs";
const require = createRequire(import.meta.url);

const serviceAccount = JSON.parse(fs.readFileSync(new URL('../functions/serviceAccountKey.json', import.meta.url)));

// Load Environment Variables
dotenv.config();

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!FIRECRAWL_API_KEY || !GEMINI_API_KEY) {
  console.error("❌ Missing required API keys (FIRECRAWL_API_KEY or GEMINI_API_KEY) in .env");
  process.exit(1);
}

// Initialize LIVE Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: "movie-chat-factory",
  });
}

const db = getFirestore();
const bucket = getStorage().bucket("movie-chat-factory.appspot.com"); // Fallback bucket if env var isn't perfectly mapped

// Phase 1: The 5x5 Master Unit Configuration
const MASTER_FLEET = [
  // BMW
  { brand: "BMW", model: "R1300GS", queries: ["BMW R 1300 GS official press kit images site:press.bmwgroup.com", "BMW R1300GS review high-res images"] },
  { brand: "BMW", model: "F900GS", queries: ["BMW F 900 GS official press images", "BMW F900GS review photos"] },
  { brand: "BMW", model: "R1250RT", queries: ["BMW R 1250 RT touring press photos", "BMW R1250RT high-res images"] },
  { brand: "BMW", model: "S1000XR", queries: ["BMW S 1000 XR official press release photos"] },
  { brand: "BMW", model: "CE04", queries: ["BMW CE 04 electric scooter press images"] },
  // Ducati
  { brand: "Ducati", model: "MultistradaV4", queries: ["Ducati Multistrada V4 official press kit high res"] },
  { brand: "Ducati", model: "DesertX", queries: ["Ducati DesertX action press photos", "Ducati DesertX review gallery"] },
  { brand: "Ducati", model: "ScramblerIcon", queries: ["Ducati Scrambler Icon official photos"] },
  { brand: "Ducati", model: "DiavelV4", queries: ["Ducati Diavel V4 press launch images"] },
  { brand: "Ducati", model: "Monster", queries: ["Ducati Monster press kit photos high res"] },
  // Yamaha
  { brand: "Yamaha", model: "Tenere700", queries: ["Yamaha Tenere 700 T7 official press photos", "Yamaha Tenere 700 review gallery"] },
  { brand: "Yamaha", model: "Tracer9GT", queries: ["Yamaha Tracer 9 GT press kit images"] },
  { brand: "Yamaha", model: "MT09", queries: ["Yamaha MT-09 high res official photos"] },
  { brand: "Yamaha", model: "XSR900", queries: ["Yamaha XSR900 press release gallery"] },
  { brand: "Yamaha", model: "SuperTenere", queries: ["Yamaha Super Tenere 1200 official press photos"] },
  // Honda
  { brand: "Honda", model: "AfricaTwin", queries: ["Honda Africa Twin CRF1100L press kit images"] },
  { brand: "Honda", model: "NT1100", queries: ["Honda NT1100 touring official photos"] },
  { brand: "Honda", model: "NC750X", queries: ["Honda NC750X high res press gallery"] },
  { brand: "Honda", model: "XL750Transalp", queries: ["Honda XL750 Transalp press release images"] },
  { brand: "Honda", model: "CB500X", queries: ["Honda CB500X NX500 official photos"] },
  // KTM
  { brand: "KTM", model: "1290SuperAdventure", queries: ["KTM 1290 Super Adventure S press kit photos"] },
  { brand: "KTM", model: "890Adventure", queries: ["KTM 890 Adventure R high res action photos"] },
  { brand: "KTM", model: "390Adventure", queries: ["KTM 390 Adventure official gallery"] },
  { brand: "KTM", model: "1290SuperDukeGT", queries: ["KTM 1290 Super Duke GT press images"] },
  { brand: "KTM", model: "690SMCR", queries: ["KTM 690 SMC R press kit high res"] },
];

const app = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });

const DELAY_MS = 3000;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    images: {
      type: "array",
      items: {
        type: "object",
        properties: {
          imageUrl: { type: "string" },
          contextDescription: { type: "string" }
        },
        required: ["imageUrl", "contextDescription"]
      }
    }
  },
  required: ["images"]
};

// Phase 5: The AI Vision Filter (Quality Control)
async function evaluateImageQuality(imageBuffer) {
  const base64Image = imageBuffer.toString("base64");
  
  const payload = {
    contents: [
      {
        parts: [
          { text: "Analyze this image. Is this a clean, high-quality motorcycle image suitable for premium product display? The image must have no watermarks, the bike must be clearly visible, not cropped badly, and free of showroom clutter. Answer with a JSON object: { \"isApproved\": boolean, \"qualityScore\": number (0-1), \"reason\": string }." },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
    }
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini Vision API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(textResult);
  } catch (error) {
    console.error("  [Vision Error] Failed to evaluate image:", error.message);
    return { isApproved: false, qualityScore: 0, reason: "Vision API failure" };
  }
}

async function runPipeline() {
  console.log("🚀 Starting Fleet Visual Ingestion Engine (5x5 Master Config)\n");

  for (const unit of MASTER_FLEET) {
    console.log(`\n======================================================`);
    console.log(`🏍️  Processing: ${unit.brand} ${unit.model}`);
    console.log(`======================================================`);

    const targetUrls = new Set();

    // Phase 2: URL Discovery via Firecrawl /search
    for (const query of unit.queries) {
      console.log(`  [Phase 2] Searching: "${query}"`);
      try {
        const searchResult = await app.search(query, { limit: 2 });
        
        // Firecrawl SDK actually returns { web: [...] } for search
        const resultsArray = searchResult.web || searchResult.data || [];
        
        if (Array.isArray(resultsArray)) {
          resultsArray.forEach((res) => {
            if (res.url) targetUrls.add(res.url);
          });
        }
      } catch (err) {
        console.error(`  [Phase 2 Error] Search failed for ${query}:`, err.message);
      }
      await delay(DELAY_MS); // Strict Rate Limit Management
    }

    console.log(`  [Phase 2] Discovered ${targetUrls.size} potential source URLs.`);

    // Phase 3: Structured Extraction via Firecrawl /scrape

    for (const url of Array.from(targetUrls)) {
      console.log(`\n  [Phase 3] Extracting structured data from: ${url}`);
      try {
        const extractResult = await app.extract({
          urls: [url],
          prompt: "Extract all high-quality images of the motorcycle. Prefer clean product shots, side profile, or 3/4 angles. Ignore thumbnails, text overlays, and watermarks.",
          schema: EXTRACT_SCHEMA
        });

        // Log the full extract response for debugging
        console.log("    [DEBUG] Full extractResult:", JSON.stringify(extractResult, null, 2));

        if (extractResult.isError || !extractResult.data || !Array.isArray(extractResult.data.images)) {
          if (extractResult.isError) {
            console.error(`  [Phase 3 Error] Extract failed for ${url}:`, extractResult.content?.[0]?.text || extractResult.error);
          } else {
            console.log(`  [Phase 3] No structured images extracted from ${url}.`);
          }
          continue;
        }

        const images = extractResult.data.images;
        console.log(`  [Phase 3] Found ${images.length} potential images.`);

        let approvedCount = 0;

        for (const img of images) {
          if (approvedCount >= 3) break; // Limit to top 3 approved per URL to prevent bloat

          const { imageUrl, contextDescription } = img;
          if (!imageUrl.startsWith("http")) continue;

          console.log(`\n    -> Fetching image for QC: ${imageUrl.slice(0, 50)}...`);
          
          let imgResponse;
          try {
            imgResponse = await fetch(imageUrl);
            if (!imgResponse.ok) continue;
          } catch (e) {
            continue; // Skip broken links safely
          }

          const arrayBuffer = await imgResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Phase 5: AI Vision Filter
          console.log(`    -> Running Gemini 1.5 Pro Vision QC...`);
          const visionResult = await evaluateImageQuality(buffer);
          
          console.log(`    -> QC Result: ${visionResult.isApproved ? "✅ APPROVED" : "❌ REJECTED"} (Score: ${visionResult.qualityScore}) - ${visionResult.reason}`);

          if (visionResult.isApproved && visionResult.qualityScore >= 0.7) {
            // Phase 6: Storage & Pipeline Dispatch
            const n = Date.now();
            const storagePath = `raw_images/${unit.brand.toLowerCase()}/${unit.model.toLowerCase()}/raw_${n}.jpg`;
            const file = bucket.file(storagePath);
            
            console.log(`    -> Uploading to Storage: ${storagePath}`);
            await file.save(buffer, { metadata: { contentType: "image/jpeg" } });
            
            // Note: Since bucket uniform access is likely enabled based on prior tests, we skip makePublic()
            // and build the direct storage URL.
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

            const libraryDocId = `${unit.brand}_${unit.model}_${n}`;
            const jobDocId = `vaf_job_${libraryDocId}`;

            console.log(`    -> Writing to raw_image_library and dispatching asset_job...`);
            
            // Write to raw_image_library
            await db.collection("raw_image_library").doc(libraryDocId).set({
              brand: unit.brand,
              model: unit.model,
              sourceUrl: imageUrl,
              storagePath,
              publicUrl,
              contextDescription,
              visionScore: visionResult.qualityScore,
              ingestedAt: FieldValue.serverTimestamp()
            });

            // Write to asset_jobs to trigger VAF
            await db.collection("asset_jobs").doc(jobDocId).set({
              jobType: "visual_asset_pack",
              entityType: "rental",
              entityId: `${unit.brand.toLowerCase()}-${unit.model.toLowerCase()}`,
              entitySlug: `${unit.brand.toLowerCase()}-${unit.model.toLowerCase()}`,
              sourceImageUrl: publicUrl,
              assets: ["hero", "poster", "thumbnail"],
              captionMode: "generate",
              style: {
                theme: "cinematic-premium",
                gradientStrength: 0.7
              },
              text: {
                title: `${unit.brand} ${unit.model}`,
                subtitle: contextDescription.slice(0, 50) + "..."
              },
              promptOverride: `cinematic motorcycle scene, ${unit.brand} ${unit.model} riding through mountain roads, dramatic lighting, luxury travel aesthetic, ultra realistic, 16:9`,
              status: "pending",
              createdAt: FieldValue.serverTimestamp()
            });

            console.log(`    -> ✅ Image fully ingested and VAF job dispatched (${jobDocId})`);
            approvedCount++;
          }
          
          await delay(2000); // Rate limit between Gemini calls
        }

      } catch (err) {
        console.error(`  [Phase 3 Error] Scrape failed for ${url}:`, err.message);
      }
      
      await delay(DELAY_MS); // Strict Rate Limit Management
    }
  }

  console.log("\n✅ Fleet Visual Ingestion Engine pipeline completed.");
  process.exit(0);
}

runPipeline();
