import dotenv from "dotenv";
dotenv.config();

const DEFAULT_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "movie-chat-factory";
const DEFAULT_REGION = process.env.FIREBASE_IMAGE_PROCESSING_REGION || process.env.FUNCTIONS_REGION || "us-central1";
const EXTENSION_ID = process.env.FIREBASE_IMAGE_PROCESSING_EXTENSION_ID || "";
const BASE_URL =
  process.env.FIREBASE_IMAGE_PROCESSING_URL ||
  (EXTENSION_ID
    ? `https://${DEFAULT_REGION}-${DEFAULT_PROJECT_ID}.cloudfunctions.net/${EXTENSION_ID}`
    : "");

const CINEMATIC_OPERATIONS = (imageUrl) => [
  { operation: "input", type: "url", url: imageUrl },
  { operation: "resize", width: 1600, height: 900, fit: "cover" },
  { operation: "modulate", brightness: 1.05, saturation: 1.1 },
  { operation: "normalize" },
  { operation: "sharpen" },
  { operation: "output", format: "webp", quality: 85 },
];

function extractOutputUrl(payload) {
  if (!payload) return null;
  if (typeof payload === "string") return payload;

  return (
    payload.url ||
    payload.outputUrl ||
    payload.outputURL ||
    payload.resultUrl ||
    payload.resultURL ||
    payload.downloadUrl ||
    payload.downloadURL ||
    payload.imageUrl ||
    payload.imageURL ||
    null
  );
}

export async function transformImage(imageUrl) {
  if (!imageUrl || !BASE_URL) return imageUrl;

  const operations = CINEMATIC_OPERATIONS(imageUrl);
  const endpoint = new URL(`${BASE_URL.replace(/\/$/, "")}/process`);
  endpoint.searchParams.set("operations", JSON.stringify(operations));

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);

    const response = await fetch(endpoint, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
      },
    });

    clearTimeout(timer);

    if (!response.ok) {
      return imageUrl;
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return extractOutputUrl(data) || imageUrl;
    }

    const text = (await response.text()).trim();
    return extractOutputUrl(text) || imageUrl;
  } catch {
    return imageUrl;
  }
}
