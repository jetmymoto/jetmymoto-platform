import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync("movie-chat-factory-firebase-adminsdk-fbsvc-fcca93d15b.json", "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const FLAGSHIP_AIRPORTS = ["MXP", "NCE", "FCO", "BEG", "DBV", "SPU", "ZRH", "BCN", "LIS", "VCE"];

async function seed() {
  const snapshot = await db.collection("missions_v1").where("featured", "==", true).get();
  const missions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const flagshipMissions = missions.filter(m => FLAGSHIP_AIRPORTS.includes(m.start));

  console.log(`Found ${flagshipMissions.length} flagship missions to enrich.`);

  const batch = db.batch();

  flagshipMissions.forEach(mission => {
    const pageData = {
      missionId: mission.id,
      slug: mission.id.replace(/_/g, "-"), // Simple slug for now
      imageTheme: getTheme(mission.cluster),
      pageTheme: getTheme(mission.cluster),
      whyThisRide: `This mission was curated to showcase the absolute best of ${mission.start}. It combines technical performance with high-end luxury stays.`,
      briefing: [
        { day: 1, title: "Insertion & Initial Carve", description: "Deploy from the hub and immediately enter the first technical sector of the route." },
        { day: 2, title: "The High Pass", description: "The core challenge of the mission. Conquering the primary mountain or coastal range." },
        { day: 3, title: "Extraction & Debrief", description: "A final cinematic sweep back to the hub or extraction point." }
      ],
      bikeMatch: {
        headline: "The Perfect Steed",
        model: mission.start === "BLQ" ? "Ducati Multistrada V4" : "BMW R1300GS",
        reason: "Chosen for its asymmetric performance in these specific terrain types."
      },
      logistics: {
        insertion: `Handover at ${mission.start} Terminal`,
        extraction: `Return at ${mission.end} Terminal`,
        support: "24/7 Digital Concierge included"
      }
    };

    if (mission.missionType === "a2a") {
      pageData.a2aOffer = {
        discount: "35% Logistics Subsidy",
        reason: "Fleet rebalancing operation"
      };
    }

    const ref = db.collection("mission_pages_v1").doc(pageData.slug);
    batch.set(ref, pageData);
  });

  await batch.commit();
  console.log("Success: mission_pages_v1 enriched with flagship content.");
}

function getTheme(cluster) {
  switch (cluster?.toLowerCase()) {
    case "alps": return "alpine_technical";
    case "france": return "coastal_luxury";
    case "italy": return "cultural_grand_touring";
    case "iberia": return "coastal_luxury";
    case "balkans": return "balkan_raw";
    default: return "cultural_grand_touring";
  }
}

seed().catch(console.error);
