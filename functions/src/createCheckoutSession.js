const {onRequest} = require("firebase-functions/v2/https");
const {z} = require("zod");
const cors = require("cors")({origin: true});
const {db} = require("./lib/firebaseAdmin");

const checkoutSessionSchema = z.object({
  bookingRef: z.string().min(1).max(120),
  email: z.string().email(),
  amountCents: z.number().int().min(100).max(1000000).optional(),
  currency: z.string().min(3).max(3).optional(),
  productName: z.string().min(1).max(120).optional(),
  productDescription: z.string().min(1).max(200).optional(),
});

function compactMetadata(metadata) {
  const cleaned = {};

  Object.entries(metadata).forEach(([key, value]) => {
    if (typeof value !== "string") {
      return;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    cleaned[key] = trimmed.slice(0, 500);
  });

  return cleaned;
}

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
      const payload = checkoutSessionSchema.parse(req.body || {});
      bookingRef = payload.bookingRef;
      const email = payload.email;

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

      let bookingData = null;
      const directBookingDoc = await db.collection("bookings").doc(bookingRef).get();
      if (directBookingDoc.exists) {
        bookingData = directBookingDoc.data() || null;
      } else {
        const bookingQuery = await db.collection("bookings").where("bookingRef", "==", bookingRef).limit(1).get();
        if (!bookingQuery.empty) {
          bookingData = bookingQuery.docs[0].data() || null;
        }
      }

      const isRentalBooking = bookingData?.requestMode === "rental";
      const amountCents = bookingData?.brokerFeeCents || payload.amountCents || 19900;
      const currency = String(payload.currency || "eur").toLowerCase();
      const productName = payload.productName || (isRentalBooking
        ? "JetMyMoto Tactical Hardware Priority Reservation"
        : "JetMyMoto Priority Deposit");
      const productDescription = payload.productDescription || (isRentalBooking
        ? `${bookingData?.selectedRentalMachine || "Rental booking"} @ ${bookingData?.selectedRentalAirport || "hub"}`
        : `Booking ${bookingRef}`);
      const legalAcknowledgement = bookingData?.legalAcknowledgement || {};
      const metadata = compactMetadata({
        bookingRef,
        requestMode: String(bookingData?.requestMode || ""),
        rentalId: String(bookingData?.rentalId || ""),
        operatorId: String(bookingData?.selectedRentalOperatorId || ""),
        selectedMachine: String(bookingData?.selectedRentalMachine || ""),
        ackSecurityDeposit: String(legalAcknowledgement.acknowledgedSecurityDeposit || ""),
        ackDepositPolicy: String(legalAcknowledgement.acknowledgedDepositPolicy || ""),
        ackCancellation: String(legalAcknowledgement.acknowledgedCancellationPolicy || ""),
        ackReservationFee: String(legalAcknowledgement.acknowledgedReservationFee || ""),
        legalAcknowledgedAt: String(legalAcknowledgement.acknowledgedAt || ""),
      });

      const successUrl = req.headers.origin ? `${req.headers.origin}?payment=success` : "https://your-domain.com/success";
      const cancelUrl = req.headers.origin ? `${req.headers.origin}?payment=cancel` : "https://your-domain.com/cancel";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: productName,
                description: productDescription,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        metadata,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      console.log(`Stripe session created successfully for bookingRef: ${bookingRef}`);

      res.json({success: true, url: session.url});
    } catch (err) {
      if (err instanceof z.ZodError || (err && err.issues)) {
        return res.status(400).json({
          success: false,
          error: "Invalid checkout payload",
          details: err.issues || err.errors,
        });
      }

      console.error(`Error for bookingRef ${bookingRef}:`, err.message);
      res.status(500).json({
        success: false,
        error: "Stripe session creation failed",
      });
    }
  });
});
