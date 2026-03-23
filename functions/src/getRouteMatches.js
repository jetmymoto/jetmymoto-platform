const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { getRouteOverlapScore, getDirectionalCompatibility } = require("./lib/geoIntelligence");

if (!admin.apps.length) admin.initializeApp();

// Exported as internal helper for trigger
async function calculateRouteMatches(pool, db = admin.firestore()) {
  const airportCode = pool.airportCode;
  const poolId = pool.id || pool.poolId;

  if (!airportCode) {
    console.warn(`[calculateRouteMatches] Aborted: Missing airportCode for pool ${poolId}`);
    return { recommendedPools: [], score: 0, breakdown: getEmptyBreakdown() };
  }

  if (pool.status !== "OPEN") {
    console.log(`[calculateRouteMatches] Skipped matches: Pool ${poolId} is ${pool.status}`);
    return { recommendedPools: [], score: 0, breakdown: getEmptyBreakdown() };
  }

  // Cost Control: Limit the initial broad query using a limit
  // Only query OPEN pools from the same airport, ordered deterministically
  const MAX_CANDIDATES = 100;
  const poolsSnap = await db.collection("pools")
    .where("airportCode", "==", airportCode)
    .where("status", "==", "OPEN")
    .orderBy("departureTime", "asc")
    .limit(MAX_CANDIDATES)
    .get();

  const candidates = [];

  poolsSnap.forEach(doc => {
    if (doc.id === poolId) return;

    const candidate = doc.data();
    candidate.id = doc.id;
    
    // Core Geographic Proximity Match
    const routeOverlap = getRouteOverlapScore(pool, candidate);
    
    // timeAlignment: 1 if within 24h, 0.5 within 48h, 0 otherwise
    let timeAlignment = 0;
    if (pool.departureTime && candidate.departureTime) {
      const pTime = pool.departureTime.toDate ? pool.departureTime.toDate() : new Date(pool.departureTime);
      const cTime = candidate.departureTime.toDate ? candidate.departureTime.toDate() : new Date(candidate.departureTime);
      const diffHours = Math.abs(pTime - cTime) / (1000 * 60 * 60);
      if (diffHours <= 24) timeAlignment = 1.0;
      else if (diffHours <= 48) timeAlignment = 0.5;
    } else {
      // Default to 0.5 if no time specified
      timeAlignment = 0.5;
    }

    // Hardware Compatibility
    let vehicleFit = 0.5;
    if (pool.vehicleType && candidate.vehicleType) {
      vehicleFit = pool.vehicleType === candidate.vehicleType ? 1.0 : 0.0;
    }

    // priceEfficiency: placeholder safe score
    const priceEfficiency = 0.8; 

    const directionalCompatibility = getDirectionalCompatibility(pool, candidate);

    const score = 
      routeOverlap * 0.35 +
      timeAlignment * 0.20 +
      vehicleFit * 0.15 +
      priceEfficiency * 0.10 +
      directionalCompatibility * 0.20;

    // Only keep decent matches (score > 0.3) to avoid saving junk recommendations
    if (score > 0.3) {
      candidates.push({
        id: candidate.id,
        score,
        breakdown: {
          routeOverlap,
          timeAlignment,
          vehicleFit,
          priceEfficiency,
          directionalCompatibility
        }
      });
    }
  });

  // Sort descending
  candidates.sort((a, b) => b.score - a.score);

  const topMatches = candidates.slice(0, 5);
  const bestScore = topMatches.length > 0 ? topMatches[0].score : 0;
  const bestBreakdown = topMatches.length > 0 ? topMatches[0].breakdown : getEmptyBreakdown();

  return {
    score: bestScore,
    breakdown: bestBreakdown,
    recommendedPools: topMatches.map(c => c.id)
  };
}

function getEmptyBreakdown() {
  return {
    routeOverlap: 0,
    timeAlignment: 0,
    vehicleFit: 0,
    priceEfficiency: 0,
    directionalCompatibility: 0
  };
}

// HTTP Endpoint for backward compatibility or direct calls
exports.getRouteMatches = onRequest({ cors: true, memory: "256MiB" }, async (req, res) => {
  try {
    const { from, to, pool } = req.body || {};

    const db = admin.firestore();

    // If a full pool object is provided, return intelligent matches
    if (pool && pool.airportCode) {
      const matchResult = await calculateRouteMatches(pool, db);
      return res.json({ success: true, data: matchResult });
    }

    // Legacy fallback (MVP strings)
    if (!from || !to) {
      return res.status(400).json({ success: false, error: "Missing from/to or pool object" });
    }

    const poolsSnap = await db.collection("pools")
      .where("status", "==", "OPEN")
      .get();

    let bestMatch = null;

    poolsSnap.forEach(doc => {
      const p = doc.data();
      const pickupCity = (p.pickupCity || "").toLowerCase();
      const destinationCity = (p.destinationCity || "").toLowerCase();
      const inputFrom = from.toLowerCase();
      const inputTo = to.toLowerCase();

      if (pickupCity.includes(inputFrom) && destinationCity.includes(inputTo)) {
        bestMatch = {
          poolId: p.poolId || doc.id,
          riders: p.participantsPaid || 1,
          target: p.targetParticipants || 4,
          price: p.estimatedPrice || null
        };
      }
    });

    if (bestMatch) {
      return res.json({ success: true, type: "join", data: bestMatch });
    }

    return res.json({ success: true, type: "create" });
  } catch (err) {
    console.error("Error in getRouteMatches:", err);
    res.status(500).json({ success: false });
  }
});

exports.calculateRouteMatches = calculateRouteMatches;
