/**
 * retryMapbox.ts
 *
 * Mapbox-safe HTTP downloader wrapper.
 * - Generic retry for transient network failures (3 attempts)
 * - Exponential backoff on 429 rate-limit responses (up to 5 attempts)
 * - Logs distinguish retryable vs terminal failures
 */

const GENERIC_RETRIES = 3;
const RATE_LIMIT_RETRIES = 5;
const BASE_BACKOFF_MS = 500;

export type MapboxFetchOptions = {
  label?: string; // e.g. "frame_0042" for logging
};

export class MapboxRateLimitError extends Error {
  constructor(public readonly retriesExhausted: number) {
    super(`Mapbox 429 rate-limit: exhausted ${retriesExhausted} retries`);
    this.name = "MapboxRateLimitError";
  }
}

export class MapboxTerminalError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`Mapbox ${status} terminal error: ${body}`);
    this.name = "MapboxTerminalError";
  }
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Determine if a status code is worth retrying.
 * 429 → rate limited (exponential backoff)
 * 5xx → transient server error (generic retry)
 * 4xx (except 429) → terminal, do not retry
 */
const isRetryable = (status: number): boolean =>
  status === 429 || (status >= 500 && status <= 599);

/**
 * Download a Mapbox URL and return the raw ArrayBuffer.
 * Handles 429 with exponential backoff and 5xx with linear backoff.
 */
export async function safeMapboxFetch(
  url: string,
  options: MapboxFetchOptions = {},
): Promise<ArrayBuffer> {
  const label = options.label ?? "frame";
  let genericAttempts = 0;
  let rateLimitAttempts = 0;

  while (true) {
    let response: Response;

    try {
      response = await fetch(url);
    } catch (networkErr) {
      genericAttempts++;
      if (genericAttempts >= GENERIC_RETRIES) {
        throw new Error(
          `[retryMapbox] ${label}: network error after ${genericAttempts} attempts — ${(networkErr as Error).message}`,
        );
      }
      const delay = BASE_BACKOFF_MS * genericAttempts;
      console.warn(
        `[retryMapbox] ${label}: network error (attempt ${genericAttempts}/${GENERIC_RETRIES}), retrying in ${delay}ms — ${(networkErr as Error).message}`,
      );
      await sleep(delay);
      continue;
    }

    if (response.ok) {
      return response.arrayBuffer();
    }

    // 429 — rate limited: exponential backoff
    if (response.status === 429) {
      rateLimitAttempts++;
      if (rateLimitAttempts >= RATE_LIMIT_RETRIES) {
        throw new MapboxRateLimitError(rateLimitAttempts);
      }
      const delay = BASE_BACKOFF_MS * Math.pow(2, rateLimitAttempts); // 1s, 2s, 4s, 8s
      console.warn(
        `[retryMapbox] ${label}: 429 rate-limited (attempt ${rateLimitAttempts}/${RATE_LIMIT_RETRIES}), backing off ${delay}ms`,
      );
      await sleep(delay);
      continue;
    }

    // 5xx — transient server error: generic retry with linear backoff
    if (response.status >= 500) {
      genericAttempts++;
      if (genericAttempts >= GENERIC_RETRIES) {
        const body = await response.text();
        throw new MapboxTerminalError(response.status, body);
      }
      const delay = BASE_BACKOFF_MS * genericAttempts;
      console.warn(
        `[retryMapbox] ${label}: ${response.status} server error (attempt ${genericAttempts}/${GENERIC_RETRIES}), retrying in ${delay}ms`,
      );
      await sleep(delay);
      continue;
    }

    // 4xx (not 429) — terminal, caller bug or bad token
    const body = await response.text();
    throw new MapboxTerminalError(response.status, body);
  }
}
