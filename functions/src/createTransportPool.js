const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.createTransportPool = onRequest({ memory: "256MiB", cors: true }, (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  cors(req, res, async () => {
    try {
      const { bookingRef, createdByEmail, targetParticipants } = req.body;

      if (!bookingRef || !createdByEmail || !targetParticipants) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      const db = admin.firestore();
      
      // 1. Validate booking exists
      const bookingsRef = db.collection("bookings");
      const bookingQuery = await bookingsRef.where("bookingRef", "==", bookingRef).get();
      
      let bookingDocId = null;
      let bookingData = null;

      if (!bookingQuery.empty) {
        bookingDocId = bookingQuery.docs[0].id;
        bookingData = bookingQuery.docs[0].data();
      } else {
        // Fallback: check if the booking document ID itself is the bookingRef
        const directDoc = await bookingsRef.doc(bookingRef).get();
        if (directDoc.exists) {
          bookingDocId = directDoc.id;
          bookingData = directDoc.data();
        } else {
          return res.status(404).json({ success: false, error: "BOOKING_NOT_FOUND" });
        }
      }

      // 2. Generate poolId
      const poolId = `POOL-${Date.now()}`;

      // 3. Compute fields
      const requiredDepositPerPerson = 500;
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // Now + 48h
      
      const BASE_URL =
        process.env.FRONTEND_BASE_URL ||
        req.headers.origin ||
        "https://jetmymoto.com";
      const shareUrl = `${BASE_URL}/pool/${poolId}`;

      const poolData = {
        poolId,
        bookingRef,
        createdByEmail,
        pickupCity: bookingData.pickupCity || "Unknown Origin",
        destinationCity: bookingData.destinationCity || "Unknown Destination",
        estimatedPrice: bookingData.estimatedPrice || 0,
        targetParticipants,
        participantsPaid: 0,
        amountCollected: 0,
        requiredDepositPerPerson,
        status: "OPEN",
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        shareUrl
      };

      // 4. Create pool document
      const poolRef = db.collection("pools").doc(poolId);
      await poolRef.set(poolData);

      // 5. Link booking to pool
      await bookingsRef.doc(bookingDocId).update({
        poolId: poolId,
        status: "POOL_OPEN"
      });

      // 6. Create owner participant
      await poolRef.collection("participants").add({
        email: createdByEmail,
        displayName: "Owner",
        status: "PENDING",
        depositAmount: requiredDepositPerPerson,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 7. Response
      res.status(200).json({
        success: true,
        poolId,
        url: `/pool/${poolId}`
      });

    } catch (err) {
      console.error("Error creating transport pool:", err);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });
});
