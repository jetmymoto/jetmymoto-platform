const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { getGeoClusterKey } = require("./lib/geoIntelligence");
const { calculateRouteMatches } = require("./getRouteMatches");
const { normalizePoolDoc } = require("./lib/poolValidation");

if (!admin.apps.length) admin.initializeApp();

exports.onPoolWrite = onDocumentWritten({ document: "pools/{poolId}" }, async (event) => {
  const snapshot = event.data;
  if (!snapshot || !snapshot.after.exists) return; // Deleted document

  const poolId = event.params.poolId;
  const rawAfter = snapshot.after.data();

  // Short circuit if this write was initiated by backfill
  if (rawAfter.skipIntelligenceTrigger) {
    console.log(`[onPoolWrite] Admin backfill mode for pool ${poolId}. Clearing flag.`);
    return snapshot.after.ref.update({
      skipIntelligenceTrigger: admin.firestore.FieldValue.delete()
    });
  }

  const after = normalizePoolDoc(rawAfter) || rawAfter;

  try {
    const db = admin.firestore();

    // 1. Calculate intended payload
    let originCluster = getGeoClusterKey(after.origin?.lat, after.origin?.lng);
    let destinationCluster = getGeoClusterKey(after.destination?.lat, after.destination?.lng);
    let matchScore = 0;
    let matchBreakdown = {
      routeOverlap: 0,
      timeAlignment: 0,
      vehicleFit: 0,
      priceEfficiency: 0,
      directionalCompatibility: 0
    };
    let recommendedPools = [];

    // Only compute match vectors if the pool is OPEN
    if (after.status === "OPEN") {
      const poolForCalc = { ...after, id: poolId };
      const matchResult = await calculateRouteMatches(poolForCalc, db);
      matchScore = matchResult.score;
      matchBreakdown = matchResult.breakdown;
      recommendedPools = matchResult.recommendedPools;
    } else {
      originCluster = "unknown";
      destinationCluster = "unknown";
    }

    // 2. Diff against current intelligence to ensure idempotency
    const targetPayload = {
      originCluster,
      destinationCluster,
      matchScore,
      matchBreakdown,
      recommendedPools,
      intelligenceStatus: "ready"
    };

    // Compare raw values safely to avoid stringify brittleness
    const currentBreakdown = rawAfter.matchBreakdown || {};
    const targetBreakdown = targetPayload.matchBreakdown;
    const isBreakdownDiff = 
      currentBreakdown.routeOverlap !== targetBreakdown.routeOverlap ||
      currentBreakdown.timeAlignment !== targetBreakdown.timeAlignment ||
      currentBreakdown.vehicleFit !== targetBreakdown.vehicleFit ||
      currentBreakdown.priceEfficiency !== targetBreakdown.priceEfficiency ||
      currentBreakdown.directionalCompatibility !== targetBreakdown.directionalCompatibility;

    const currentRecs = rawAfter.recommendedPools || [];
    const targetRecs = targetPayload.recommendedPools;
    const isRecsDiff = 
      currentRecs.length !== targetRecs.length ||
      currentRecs.some((val, i) => val !== targetRecs[i]);

    const isDifferent = 
      rawAfter.intelligenceStatus !== targetPayload.intelligenceStatus ||
      rawAfter.originCluster !== targetPayload.originCluster ||
      rawAfter.destinationCluster !== targetPayload.destinationCluster ||
      rawAfter.matchScore !== targetPayload.matchScore ||
      isBreakdownDiff ||
      isRecsDiff;

    if (!isDifferent) {
      console.log(`[onPoolWrite] Skipped: Intelligence already up to date for pool ${poolId}`);
      return null;
    }

    console.log(`[onPoolWrite] Started: Stamping intelligence for pool ${poolId} (Status: ${after.status})`);

    // 3. Write Back
    await snapshot.after.ref.update({
      ...targetPayload,
      intelligenceUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`[onPoolWrite] Success: Pool ${poolId} updated. Score: ${matchScore}, Recommended: ${recommendedPools.length}`);
    return null;

  } catch (error) {
    console.error(`[onPoolWrite] Failure: Error processing pool ${poolId}:`, error);
    return null; // Don't crash the trigger loop
  }
});