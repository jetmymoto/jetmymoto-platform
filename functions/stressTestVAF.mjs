import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

// Initialize LIVE Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
  projectId: "movie-chat-factory",
});

const db = getFirestore();

async function stressTest() {
  console.log("🚀 [Stress Test] Initializing live Visual Asset Factory stress test...");

  const timestamp = Date.now();
  
  // Define a batch of 3 concurrent jobs representing different entity types
  const jobs = [
    {
      id: `stress-dest-${timestamp}`,
      data: {
        jobType: "visual_asset_pack",
        entityType: "destination",
        entityId: "swiss-alps",
        entitySlug: "swiss-alps",
        sourceImageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=1000", // Mountain pass
        assets: ["hero", "poster", "thumbnail"],
        captionMode: "generate",
        style: { theme: "cinematic-premium", gradientStrength: 0.8 },
        text: { title: "Swiss Alps", subtitle: "Alpine Core" },
        status: "pending",
        createdAt: new Date().toISOString()
      }
    },
    {
      id: `stress-route-${timestamp}`,
      data: {
        jobType: "visual_asset_pack",
        entityType: "route",
        entityId: "transfagarasan-highway",
        entitySlug: "transfagarasan-highway",
        sourceImageUrl: "https://images.unsplash.com/photo-1626202454559-99436a18d172?auto=format&fit=crop&q=80&w=1000", // Winding road
        assets: ["hero", "poster", "thumbnail"],
        captionMode: "generate",
        style: { theme: "cinematic-premium", gradientStrength: 0.7 },
        text: { title: "Transfăgărășan Highway", subtitle: "Romania | Expert" },
        status: "pending",
        createdAt: new Date().toISOString()
      }
    },
    {
      id: `stress-rental-${timestamp}`,
      data: {
        jobType: "visual_asset_pack",
        entityType: "rental",
        entityId: "bmw-r1300gs-muc",
        entitySlug: "bmw-r1300gs-muc",
        sourceImageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000", // Motorcycle
        assets: ["hero", "poster", "thumbnail"],
        captionMode: "generate",
        style: { theme: "cinematic-premium", gradientStrength: 0.6 },
        text: { title: "BMW R 1300 GS", subtitle: "Munich Hub" },
        status: "pending",
        createdAt: new Date().toISOString()
      }
    }
  ];

  console.log(`\n📤 Dispatching ${jobs.length} concurrent jobs to production Firestore (asset_jobs)...`);

  try {
    // Write all jobs concurrently
    await Promise.all(jobs.map(job => 
      db.collection("asset_jobs").doc(job.id).set(job.data)
    ));
    console.log("✅ All jobs successfully queued. Engine should trigger now.");
  } catch (error) {
    console.error("❌ Failed to write jobs. You might need to authenticate your CLI locally. Error:", error.message);
    process.exit(1);
  }

  // Polling loop
  console.log("\n⏳ Monitoring job statuses (timeout in 60s)...");
  
  const statuses = new Map(jobs.map(j => [j.id, "pending"]));
  let allDone = false;
  let attempts = 0;
  const maxAttempts = 30; // 30 * 2s = 60s

  while (!allDone && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 2000));
    attempts++;
    
    let pendingCount = 0;
    
    for (const job of jobs) {
      if (statuses.get(job.id) === "completed" || statuses.get(job.id) === "error") {
        continue; // skip already finished
      }

      const doc = await db.collection("asset_jobs").doc(job.id).get();
      const status = doc.data()?.status || "unknown";
      
      if (statuses.get(job.id) !== status) {
        console.log(`[${job.data.entityType}] ${job.id} -> ${status}`);
        statuses.set(job.id, status);
      }
      
      if (status !== "completed" && status !== "error") {
        pendingCount++;
      }
    }
    
    if (pendingCount === 0) {
      allDone = true;
    }
  }

  if (!allDone) {
    console.error("\n⚠️ Timeout: Some jobs did not finish in time.");
  }

  // Final Verification
  console.log("\n🔎 Verifying Canonical Output in asset_library...");
  for (const job of jobs) {
    const status = statuses.get(job.id);
    if (status === "completed") {
      const libraryId = `${job.data.entityType}_${job.data.entityId}`;
      const libDoc = await db.collection("asset_library").doc(libraryId).get();
      
      if (libDoc.exists) {
        const data = libDoc.data();
        console.log(`\n✅ ${libraryId} successfully written!`);
        console.log(`   - Generated Assets: ${Object.keys(data.assets).join(", ")}`);
        console.log(`   - Caption: "${data.assets.hero?.caption}"`);
        console.log(`   - Public URL: ${data.assets.hero?.imageUrl}`);
      } else {
        console.log(`\n❌ ${libraryId} missing from asset_library despite job completing.`);
      }
    } else {
      const doc = await db.collection("asset_jobs").doc(job.id).get();
      console.log(`\n❌ Job ${job.id} ended with status: ${status}. Error: ${doc.data()?.error || 'Unknown'}`);
    }
  }

  process.exit(0);
}

stressTest();
