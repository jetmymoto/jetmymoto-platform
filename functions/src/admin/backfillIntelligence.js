/**
 * Admin Utility: Backfill Intelligence
 * 
 * Usage: Run this script via Node locally (with GOOGLE_APPLICATION_CREDENTIALS) 
 * or execute via Firebase Functions shell to backfill legacy pool documents 
 * with the new geographic intelligence clusters and scores.
 */

const admin = require("firebase-admin");
const { getGeoClusterKey } = require("../lib/geoIntelligence");
const { calculateRouteMatches } = require("../getRouteMatches");
const { normalizePoolDoc } = require("../lib/poolValidation");

// Only initialize if not already running in a Firebase context
if (!admin.apps.length) {
  admin.initializeApp();
}

async function backfillIntelligence() {
  const db = admin.firestore();
  console.log("Starting Intelligence Backfill...");

  try {
    const poolsSnap = await db.collection("pools").get();
    console.log(`Found ${poolsSnap.size} total pools to evaluate.`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const doc of poolsSnap.docs) {
      const rawData = doc.data();
      const poolId = doc.id;
      
      // Skip if it already has deep intelligence fields
      if (rawData.matchBreakdown && rawData.originCluster) {
        console.log(`Skipping ${poolId}: Already has intelligence.`);
        skippedCount++;
        continue;
      }

      console.log(`Processing legacy pool: ${poolId}`);

      // Normalize legacy data shape
      const safeData = normalizePoolDoc(rawData) || rawData;

      // Ensure airport code exists for querying
      if (!safeData.airportCode || safeData.airportCode === "UNK") {
        console.warn(`Warning: Pool ${poolId} has no airportCode. Setting default UNK cluster.`);
      }

      const poolForCalc = { ...safeData, id: poolId };

      // Compute Clusters
      const originCluster = getGeoClusterKey(safeData.origin?.lat, safeData.origin?.lng);
      const destinationCluster = getGeoClusterKey(safeData.destination?.lat, safeData.destination?.lng);

      // We only compute full match vectors if the pool is OPEN
      let matchScore = 0;
      let matchBreakdown = null;
      let recommendedPools = [];

      if (safeData.status === "OPEN") {
        const matchResult = await calculateRouteMatches(poolForCalc, db);
        matchScore = matchResult.score;
        matchBreakdown = matchResult.breakdown;
        recommendedPools = matchResult.recommendedPools;
      } else {
        matchBreakdown = {
          routeOverlap: 0,
          timeAlignment: 0,
          vehicleFit: 0,
          priceEfficiency: 0,
          directionalCompatibility: 0
        };
      }

      // Write back safely using merge
      await doc.ref.set({
        origin: safeData.origin,
        destination: safeData.destination,
        originCluster,
        destinationCluster,
        matchScore,
        matchBreakdown,
        recommendedPools,
        intelligenceUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        skipIntelligenceTrigger: true // Guard against fanout
      }, { merge: true });

      updatedCount++;
    }

    console.log(`\nBackfill Complete.`);
    console.log(`- Updated: ${updatedCount}`);
    console.log(`- Skipped: ${skippedCount}`);

  } catch (err) {
    console.error("Fatal error during backfill:", err);
  }
}

module.exports = { backfillIntelligence };

// Auto-run if executed directly via Node
if (require.main === module) {
  backfillIntelligence()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
