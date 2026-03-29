const {onRequest} = require("firebase-functions/v2/https");
const {db, admin} = require("./lib/firebaseAdmin");

exports.stripeWebhook = onRequest(async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const event = req.body;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingRef = session.metadata.bookingRef;

    console.log("💰 PAYMENT SUCCESS:", bookingRef);

    if (bookingRef) {
      await db.collection("bookings").doc(bookingRef).set({
        paymentStatus: "paid",
        status: "reservation_confirmed",
        stripeCheckoutSessionId: session.id || null,
        stripePaymentIntentId: session.payment_intent || null,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});
    }
  }

  res.sendStatus(200);
});
