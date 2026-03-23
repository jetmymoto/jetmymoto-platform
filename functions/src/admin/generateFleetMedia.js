/* eslint-disable indent, require-jsdoc */
const {onCall, HttpsError} = require("firebase-functions/v2/https");
// Temporarily duplicated constant for CommonJS compatibility
const CINEMATIC_NEGATIVE_PROMPT =
  "text, typography, captions, subtitles, watermark, logo, UI, " +
  "HUD, dashboard overlay, borders, frames, split screen, poster " +
  "layout, infographic styling, product card, interface elements, " +
  "floating labels, pure black #000000 void background, neon glow, " +
  "sci-fi holograms, cartoon, anime, illustration, low detail, " +
  "duplicate wheels, malformed rider, deformed hands, broken " +
  "anatomy, fake motion blur, CGI toy look";

const GEMINI_API_KEY = "AIzaSyCrd9PsP3XlyE8D1r_FzGCCr7mE1OI0Fu8"; // Move to Secret Manager later
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "your_secure_webhook_secret"; 
const GOOGLE_VIDEO_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"; // Update to the specific Veo/Video endpoint when fully available
const INTERNAL_ADMIN_EMAILS = (process.env.INTERNAL_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
const RETRYABLE_STATUS_CODES = new Set([429, 503]);
const BACKOFF_DELAYS_MS = [2000, 4000, 8000];

function ensureAuthenticatedAdmin(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  const token = request.auth.token || {};
  const email = request.auth.token && request.auth.token.email ?
    String(request.auth.token.email).toLowerCase() :
    "";
  const hasAdminClaim = token.admin === true || token.role === "admin";
  const isAllowlistedAdmin = email && INTERNAL_ADMIN_EMAILS.includes(email);

  if (!hasAdminClaim && !isAllowlistedAdmin) {
    throw new HttpsError("permission-denied", "Admin access is required.");
  }
}

function validatePayload(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new HttpsError(
        "invalid-argument",
        "Expected a non-empty array of media generation jobs.",
    );
  }

  return data.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new HttpsError(
          "invalid-argument",
          `Item at index ${index} must be an object.`,
      );
    }

    const rentalId = typeof item.rental_id === "string" ?
      item.rental_id.trim() :
      "";
    const prompt = typeof item.ai_video_prompt === "string" ?
      item.ai_video_prompt.trim() :
      "";

    if (!rentalId) {
      throw new HttpsError(
          "invalid-argument",
          `Item at index ${index} is missing rental_id.`,
      );
    }

    if (!prompt) {
      throw new HttpsError(
          "invalid-argument",
          `Item at index ${index} is missing ai_video_prompt.`,
      );
    }

    return {
      rentalId,
      aiVideoPrompt: prompt,
    };
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(headerValue) {
  if (!headerValue || typeof headerValue !== "string") {
    return null;
  }

  const seconds = Number(headerValue);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const dateMs = Date.parse(headerValue);
  if (Number.isNaN(dateMs)) {
    return null;
  }

  return Math.max(dateMs - Date.now(), 0);
}

exports.generateFleetMedia = onCall(
    {
      memory: "256MiB",
      timeoutSeconds: 120,
    },
    async (request) => {
      ensureAuthenticatedAdmin(request);

      const jobs = validatePayload(request.data);

      if (!VIDEO_WEBHOOK_URL) {
        throw new HttpsError(
            "failed-precondition",
            "VIDEO_WEBHOOK_URL is not configured.",
        );
      }

      const results = [];

      for (const job of jobs) {
        const payload = {
          contents: [{
            parts: [{
              text: job.aiVideoPrompt + "\n\n" + CINEMATIC_NEGATIVE_PROMPT 
            }]
          }],
          // Provider-specific metadata injection for the webhook
          metadata: {
            rental_id: job.rentalId,
            webhook_url: VIDEO_WEBHOOK_URL
          }
        };

        const headers = {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY // Gemini specific auth
        };

        try {
          let providerResponse = null;
          let dispatchError = null;

          for (
            let attempt = 0;
            attempt <= BACKOFF_DELAYS_MS.length;
            attempt++
          ) {
            const response = await fetch(GOOGLE_VIDEO_ENDPOINT, {
              method: "POST",
              headers,
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              try {
                providerResponse = await response.json();
              } catch (parseError) {
                providerResponse = null;
              }

              dispatchError = null;
              break;
            }

            const errorText = await response.text();
            const shouldRetry =
              RETRYABLE_STATUS_CODES.has(response.status) &&
              attempt < BACKOFF_DELAYS_MS.length;

            console.error("Video generation dispatch failed", {
              rentalId: job.rentalId,
              status: response.status,
              attempt: attempt + 1,
              retrying: shouldRetry,
              body: errorText,
            });

            if (!shouldRetry) {
              dispatchError = `dispatch_failed_${response.status}`;
              break;
            }

            const retryAfterMs = parseRetryAfterMs(
                response.headers.get("retry-after"),
            );
            const backoffMs = retryAfterMs || BACKOFF_DELAYS_MS[attempt];
            await sleep(backoffMs);
          }

          if (dispatchError) {
            results.push({
              rental_id: job.rentalId,
              queued: false,
              error: dispatchError,
            });
            continue;
          }

          results.push({
            rental_id: job.rentalId,
            queued: true,
            provider_job_id: providerResponse && providerResponse.id ?
              providerResponse.id :
              null,
          });
        } catch (error) {
          console.error("Video generation dispatch exception", {
            rentalId: job.rentalId,
            error: error.message,
          });
          results.push({
            rental_id: job.rentalId,
            queued: false,
            error: "dispatch_exception",
          });
        }
      }

      const queuedCount = results.filter((result) => result.queued).length;

      return {
        status: "processing",
        queued_count: queuedCount,
        failed_count: jobs.length - queuedCount,
        // Keep per-item results for internal admin diagnostics.
        results,
      };
    },
);
