const {onRequest} = require("firebase-functions/v2/https");
const cors = require("cors")({origin: true});

exports.createCheckoutSession = onRequest({memory: "256MiB", cors: true}, (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  cors(req, res, async () => {
    let bookingRef = "unknown";
    try {
      bookingRef = req.body.bookingRef || "unknown";
      const email = req.body.email;

      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Missing STRIPE_SECRET_KEY");
      }

      if (process.env.STRIPE_SECRET_KEY.startsWith("pk_")) {
        throw new Error("Invalid key type: expected secret key (sk_), received publishable key (pk_)");
      }

      const keyPrefix = process.env.STRIPE_SECRET_KEY.substring(0, 14); // e.g. "sk_test_123456"
      console.log(`[DEBUG] STRIPE_SECRET_KEY starts with: ${keyPrefix}...`);

      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

      if (!bookingRef || bookingRef === "unknown" || !email) {
        return res.status(400).json({success: false, error: "Missing bookingRef or email"});
      }

      console.log(`Creating checkout session for bookingRef: ${bookingRef}`);

      const successUrl = req.headers.origin ? `${req.headers.origin}?payment=success` : "https://your-domain.com/success";
      const cancelUrl = req.headers.origin ? `${req.headers.origin}?payment=cancel` : "https://your-domain.com/cancel";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "JetMyMoto Priority Deposit",
                description: `Booking ${bookingRef}`,
              },
              unit_amount: 19900,
            },
            quantity: 1,
          },
        ],
        metadata: {
          bookingRef,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      console.log(`Stripe session created successfully for bookingRef: ${bookingRef}`);

      res.json({success: true, url: session.url});
    } catch (err) {
      console.error(`Error for bookingRef ${bookingRef}:`, err.message);
      res.status(500).json({
        success: false,
        error: "Stripe session creation failed",
      });
    }
  });
});
