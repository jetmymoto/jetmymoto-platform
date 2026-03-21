const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();

exports.getRouteMatches = onRequest({ cors: true, memory: "256MiB" }, async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ success: false });
    }

    const db = admin.firestore();

    // 🔥 SIMPLE MATCHING (MVP)
    const poolsSnap = await db.collection("pools")
      .where("status", "==", "OPEN")
      .get();

    let bestMatch = null;

    poolsSnap.forEach(doc => {
      const pool = doc.data();

      // Check strings softly
      const pickupCity = pool.pickupCity || "";
      const destinationCity = pool.destinationCity || "";

      const routeKey = `${pickupCity}-${destinationCity}`.toLowerCase();
      const inputKey = `${from}-${to}`.toLowerCase();

      // Ensure we have a meaningful match of origin or destination
      if (routeKey.includes(from.toLowerCase()) || routeKey.includes(to.toLowerCase())) {
        bestMatch = {
          poolId: pool.poolId || doc.id,
          riders: pool.participantsPaid || 1,
          target: pool.targetParticipants || 4,
          price: pool.estimatedPrice || null
        };
      }
    });

    if (bestMatch) {
      return res.json({
        success: true,
        type: "join",
        data: bestMatch
      });
    }

    return res.json({
      success: true,
      type: "create"
    });

  } catch (err) {
    console.error("Error in getRouteMatches:", err);
    res.status(500).json({ success: false });
  }
});
