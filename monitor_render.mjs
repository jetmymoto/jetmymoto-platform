import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const keyPath = "/workspaces/jetmymoto-platform/keys/service-account.json";
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: "movie-chat-factory",
  });
}

const db = getFirestore();

async function monitorJob() {
  console.log("Searching for render job: jetmymoto-shard-01");
  
  // Try finding it by ID first
  let jobRef = db.collection("render_jobs").doc("jetmymoto-shard-01");
  let jobDoc = await jobRef.get();
  
  if (!jobDoc.exists) {
    // Try searching by a field if ID doesn't match
    console.log("Job not found by ID, searching by missionId or jobId field...");
    const snapshot = await db.collection("render_jobs")
      .where("missionId", "==", "jetmymoto-shard-01")
      .get();
    
    if (snapshot.empty) {
        const snapshot2 = await db.collection("render_jobs")
          .where("jobId", "==", "jetmymoto-shard-01")
          .get();
        if (snapshot2.empty) {
            console.log("No job found with ID or missionId 'jetmymoto-shard-01'");
            return;
        }
        jobDoc = snapshot2.docs[0];
    } else {
        jobDoc = snapshot.docs[0];
    }
  }

  const data = jobDoc.data();
  console.log("Job Status:", data.status || "N/A");
  console.log("Progress:", data.progress || "N/A");
  console.log("Segments Written:", data.segmentsWritten || data.segments_written || "N/A");
  console.log("Segment Paths:", JSON.stringify(data.segmentPaths || data.segment_paths || [], null, 2));
  console.log("Full Data:", JSON.stringify({ id: jobDoc.id, ...data }, null, 2));
}

monitorJob().catch(console.error);
