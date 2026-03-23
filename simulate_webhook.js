#!/usr/bin/env node

const crypto = require("crypto");

const DEFAULT_BASE_URL =
  process.env.WEBHOOK_BASE_URL ||
  "http://127.0.0.1:5001/movie-chat-factory/us-central1/videoWebhookHandler";
const DEFAULT_RENTAL_ID =
  process.env.RENTAL_ID || "bmw-r1300gs-mxp-eagle-rider-mxp";
const DEFAULT_VIDEO_URL =
  process.env.VIDEO_URL || "https://mock-provider.com/video-123.mp4";
const DEFAULT_SIGNATURE_STYLE =
  process.env.WEBHOOK_SIGNATURE_STYLE || "raw";

async function main() {
  const payload = {
    id: "mock-job-123",
    status: "completed",
    video_url: DEFAULT_VIDEO_URL,
    metadata: {
      rental_id: DEFAULT_RENTAL_ID,
    },
  };
  const rawPayload = JSON.stringify(payload);
  const headers = {
    "Content-Type": "application/json",
  };

  if (process.env.WEBHOOK_SECRET) {
    const timestamp = Math.floor(Date.now() / 1000);
    const payloadToSign = DEFAULT_SIGNATURE_STYLE === "timestamped" ?
      `${timestamp}.${rawPayload}` :
      rawPayload;
    const digest = crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET)
      .update(payloadToSign)
      .digest("hex");

    headers["x-provider-signature"] = DEFAULT_SIGNATURE_STYLE === "timestamped" ?
      `t=${timestamp},v1=${digest}` :
      digest;
  }

  console.log("POST", DEFAULT_BASE_URL);
  console.log(JSON.stringify(payload, null, 2));

  const response = await fetch(DEFAULT_BASE_URL, {
    method: "POST",
    headers,
    body: rawPayload,
  });

  const text = await response.text();
  console.log("status:", response.status);
  console.log("body:", text);

  if (!response.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("simulate_webhook failed:", error);
  process.exit(1);
});
