import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize to hit the emulator
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

initializeApp({
  projectId: "jetmymoto-platform",
});

const db = getFirestore();

async function runTest() {
  const jobId = `test-job-${Date.now()}`;
  
  const testJob = {
    jobType: "visual_asset_pack",
    entityType: "destination",
    entityId: "abruzzo-gran-sasso",
    entitySlug: "abruzzo-gran-sasso",
    sourceImageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000",
    assets: ["hero", "poster", "thumbnail"],
    captionMode: "generate",
    style: {
      theme: "cinematic-premium",
      gradientStrength: 0.75
    },
    text: {
      title: "Abruzzo Gran Sasso",
      subtitle: "Little Tibet | Advanced"
    },
    status: "pending",
    createdAt: new Date().toISOString()
  };

  console.log(`[Test] Writing test job to asset_jobs/${jobId}...`);
  await db.collection("asset_jobs").doc(jobId).set(testJob);

  console.log("[Test] Job written. Waiting for Visual Asset Factory to process...");
  
  // Wait for 20 seconds, checking status every 2 seconds
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 2000));
    
    const doc = await db.collection("asset_jobs").doc(jobId).get();
    const data = doc.data();
    console.log(`[Test] Status check ${i+1}: ${data.status}`);
    
    if (data.status === "completed") {
      console.log("[Test] ✅ Job completed successfully!");
      const libraryDoc = await db.collection("asset_library").doc("destination_abruzzo-gran-sasso").get();
      console.log("\n--- RESULT IN ASSET LIBRARY ---");
      console.log(JSON.stringify(libraryDoc.data(), null, 2));
      process.exit(0);
    } else if (data.status === "error") {
      console.error("[Test] ❌ Job failed with error:", data.error);
      process.exit(1);
    }
  }

  console.error("[Test] ⚠️ Timeout: Job is still in status:", (await db.collection("asset_jobs").doc(jobId).get()).data().status);
  process.exit(1);
}

runTest();
