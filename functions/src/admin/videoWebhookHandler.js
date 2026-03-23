/* eslint-disable indent, require-jsdoc */
const crypto = require("crypto");
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");

const VIDEO_PROVIDER = (process.env.VIDEO_PROVIDER || "LOCAL_TEST")
  .trim()
  .toUpperCase();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "your_secure_webhook_secret";

if (!admin.apps.length) {
  admin.initializeApp();
}

function extractSignature(req) {
  const candidateHeaders = [
    WEBHOOK_SIGNATURE_HEADER,
    "x-provider-signature",
    "x-video-provider-signature",
    "stripe-signature",
    "svix-signature",
  ];
  const tokens = [];
  let timestamp = "";

  candidateHeaders.forEach((headerName) => {
    const headerValue = req.get(headerName);
    if (!headerValue) {
      return;
    }

    headerValue
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        if (
          part.startsWith("t=") ||
          part.startsWith("ts=") ||
          part.startsWith("timestamp=")
        ) {
          timestamp = part.split("=", 2)[1] || timestamp;
          return;
        }

        if (part.startsWith("v1=") || part.startsWith("sha256=")) {
          tokens.push(part.split("=", 2)[1] || "");
          return;
        }

        if (part.startsWith("v1,") || part.startsWith("sha256,")) {
          tokens.push(part.split(",", 2)[1] || "");
          return;
        }

        tokens.push(part);
      });
  });

  return {
    timestamp,
    signatures: tokens.filter(Boolean),
  };
}

function timingSafeMatch(expectedValues, providedSignatures) {
  return expectedValues.some((expected) => {
    const expectedBuffer = Buffer.from(expected);

    return providedSignatures.some((provided) => {
      const normalized = provided.trim();
      const providedBuffer = Buffer.from(normalized);

      if (providedBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
    });
  });
}

function verifyGenericWebhookSignature(req) {
  if (!WEBHOOK_SECRET) {
    console.error("WEBHOOK_SECRET is not configured.");
    return false;
  }

  const {timestamp, signatures} = extractSignature(req);
  if (signatures.length === 0) {
    return false;
  }

  const rawPayload = Buffer.isBuffer(req.rawBody) ?
    req.rawBody :
    Buffer.from(JSON.stringify(req.body || {}));
  const payloadVariants = [rawPayload];

  if (timestamp) {
    payloadVariants.push(
        Buffer.from(`${timestamp}.${rawPayload.toString("utf8")}`),
    );
  }

  const expectedSignatures = payloadVariants.flatMap((payload) => {
    const digest = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(payload)
      .digest();

    return [
      digest.toString("hex"),
      `sha256=${digest.toString("hex")}`,
      `v1=${digest.toString("hex")}`,
      digest.toString("base64"),
      `sha256=${digest.toString("base64")}`,
      `v1=${digest.toString("base64")}`,
    ];
  });

  return timingSafeMatch(expectedSignatures, signatures);
}

function verifyRunwayWebhookSignature(req) {
  // Placeholder strategy: replace with the exact Runway header parsing and
  // payload canonicalization once the vendor contract is locked.
  return verifyGenericWebhookSignature(req);
}

function verifyLumaWebhookSignature(req) {
  // Placeholder strategy: replace with the exact Luma hashing algorithm and
  // header semantics once the vendor contract is locked.
  return verifyGenericWebhookSignature(req);
}

function verifyWebhookSignature(req) {
  switch (VIDEO_PROVIDER) {
    case "LOCAL":
    case "LOCAL_TEST":
    case "TEST":
    case "GENERIC":
      return verifyGenericWebhookSignature(req);

    case "RUNWAY":
      return verifyRunwayWebhookSignature(req);

    case "LUMA":
      return verifyLumaWebhookSignature(req);

    default:
      console.warn(`Unknown VIDEO_PROVIDER '${VIDEO_PROVIDER}'.`);
      return verifyGenericWebhookSignature(req);
  }
}

function extractWebhookData(body) {
  const payload = body && typeof body === "object" ? body : {};
  const metadata = payload.metadata && typeof payload.metadata === "object" ?
    payload.metadata :
    {};

  const rentalId = typeof metadata.rental_id === "string" ?
    metadata.rental_id.trim() :
    "";
  const videoUrl = typeof payload.video_url === "string" ?
    payload.video_url.trim() :
    typeof payload.output_url === "string" ?
      payload.output_url.trim() :
      "";
  const providerJobId = typeof payload.id === "string" ? payload.id : "";
  const providerStatus = typeof payload.status === "string" ?
    payload.status :
    "";

  return {
    rentalId,
    videoUrl,
    providerJobId,
    providerStatus,
    rawPayload: payload,
  };
}

exports.videoWebhookHandler = onRequest(
    {
      memory: "256MiB",
      cors: false,
    },
    async (req, res) => {
      if (req.method !== "POST") {
        res.status(405).json({error: "Method not allowed"});
        return;
      }

      try {
        // 1. Extract the provider's signature (Adjust header name based on final provider docs)
        const signature = req.headers['x-provider-signature'] || req.headers['x-goog-signature'];
        
        if (!signature) {
          console.error("Webhook rejected: Missing signature");
          return res.status(401).send("Unauthorized");
        }

        // 2. Cryptographic HMAC Verification
        // You MUST use req.rawBody to calculate the hash, not the parsed JSON
        const expectedSignature = crypto
          .createHmac('sha256', WEBHOOK_SECRET)
          .update(req.rawBody)
          .digest('hex');

        if (signature !== expectedSignature) {
          console.error("Webhook rejected: Invalid HMAC signature");
          return res.status(401).send("Unauthorized");
        }

        // 3. Process the validated payload
        const data = req.body;
        const finalVideoUrl = data.video_url || data.output_url;
        const rentalId = data.metadata?.rental_id;

        if (!rentalId) {
          res.status(400).json({error: "Missing metadata.rental_id"});
          return;
        }

        if (!finalVideoUrl) {
          res.status(400).json({error: "Missing finished video URL"});
          return;
        }

        const db = admin.firestore();
        const trackingDocRef = db.doc("admin_tasks/video_generations");
        const jobDocId = encodeURIComponent(rentalId);
        const jobDocRef = trackingDocRef.collection("jobs").doc(jobDocId);

        console.log("Video generation completed", {
          rentalId,
          videoUrl: finalVideoUrl,
          providerJobId: data.id || null,
          providerStatus: data.status || "completed",
        });

        await trackingDocRef.set({
          lastCompletedAt: FieldValue.serverTimestamp(),
          lastCompletedRentalId: rentalId,
        }, {merge: true});

        await jobDocRef.set({
          rentalId,
          finalVideoUrl,
          providerJobId: data.id || null,
          providerStatus: data.status || "completed",
          completedAt: FieldValue.serverTimestamp(),
          rawWebhookPayload: data,
        }, {merge: true});

        res.status(200).json({
          ok: true,
          rental_id: rentalId,
        });
      } catch (error) {
        console.error("Webhook processing failed:", error);
        return res.status(500).send("Internal Server Error");
      }
    },
);
