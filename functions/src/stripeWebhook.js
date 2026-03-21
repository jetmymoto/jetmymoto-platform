const {onRequest} = require("firebase-functions/v2/https");

exports.stripeWebhook = onRequest(async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const event = req.body;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingRef = session.metadata.bookingRef;

    console.log("💰 PAYMENT SUCCESS:", bookingRef);
    // TODO: Update Firestore -> mark booking as paid
  }

  res.sendStatus(200);
});
