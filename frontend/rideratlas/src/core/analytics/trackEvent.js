/**
 * Unified event tracking layer.
 *
 * Dispatches analytics events to:
 *   1. Google Analytics (window.gtag) — immediate
 *   2. Firestore `events` collection — batched (future: BigQuery when volume justifies)
 *
 * All analytics events should flow through trackEvent() rather than calling
 * window.gtag directly. This gives us a single place to add new sinks,
 * normalize payloads, and enforce schemas.
 */

import { collection, doc, writeBatch } from "firebase/firestore";

import { db } from "@/lib/firebase";

let eventBuffer = [];
const FLUSH_INTERVAL_MS = 5000;
const FLUSH_BATCH_SIZE = 10;

function generateSessionId() {
  const stored = typeof sessionStorage !== "undefined"
    ? sessionStorage.getItem("ra_session_id")
    : null;
  if (stored) return stored;

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("ra_session_id", id);
  }
  return id;
}

const SESSION_ID = typeof window !== "undefined" ? generateSessionId() : "ssr";

// ── GA4 dispatch ──

function sendToGtag(eventName, payload) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", eventName, payload);
}

// ── Firestore batch dispatch ──

async function flushToFirestore(events) {
  if (events.length === 0) return;

  try {
    const batch = writeBatch(db);
    const eventsRef = collection(db, "events");

    for (const event of events) {
      const ref = doc(eventsRef);
      batch.set(ref, event);
    }

    await batch.commit();
  } catch (err) {
    console.warn("[trackEvent] Firestore flush failed:", err?.message);
  }
}

function scheduleFlush() {
  if (eventBuffer.length >= FLUSH_BATCH_SIZE) {
    const batch = [...eventBuffer];
    eventBuffer = [];
    flushToFirestore(batch);
  }
}

// ── Periodic flush ──

if (typeof window !== "undefined") {
  setInterval(() => {
    if (eventBuffer.length > 0) {
      const batch = [...eventBuffer];
      eventBuffer = [];
      flushToFirestore(batch);
    }
  }, FLUSH_INTERVAL_MS);

  // Flush on page unload via sendBeacon fallback
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && eventBuffer.length > 0) {
      const batch = [...eventBuffer];
      eventBuffer = [];
      // Best-effort: try Firestore, but sendBeacon is more reliable here
      // For now, use Firestore flush; sendBeacon requires a REST endpoint
      flushToFirestore(batch);
    }
  });
}

// ── Public API ──

/**
 * Track an analytics event.
 *
 * @param {string} eventName — e.g. "lead_rental_booking", "overlay_impression"
 * @param {Record<string, unknown>} payload — event-specific data
 */
export function trackEvent(eventName, payload = {}) {
  const enriched = {
    ...payload,
    sessionId: SESSION_ID,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.pathname : "",
  };

  // 1. GA4 — immediate
  sendToGtag(eventName, enriched);

  // 2. Firestore — batched
  eventBuffer.push({ type: eventName, ...enriched });
  scheduleFlush();
}

export default trackEvent;
