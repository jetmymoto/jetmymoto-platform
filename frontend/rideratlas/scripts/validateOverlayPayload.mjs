// Validates overlay payload completeness at build time.
// Ensures every published overlay has all required renderData keys.
// Direct import — no async shard runtime needed.
//
// Usage: node scripts/validateOverlayPayload.mjs
// Exit 1 on failure (CI-safe).

import { buildNetworkGraph } from "../src/core/network/buildNetworkGraph.js";
import { buildRentalGraph } from "../src/core/network/buildRentalGraph.js";
import { INTENT_SIGNALS } from "../src/core/patriot/data/intentSignals.js";
import { buildGraphOverlayShard } from "../src/core/network/graphOverlayShard.js";

const REQUIRED_RENDER_KEYS = [
  "price",
  "currency",
  "bikeName",
  "category",
  "imageUrl",
  "operatorName",
  "reasons",
  "ctaPrimary",
  "ctaSecondary",
];

const coreGraph = buildNetworkGraph();
const rentalGraph = buildRentalGraph();
const merged = { ...coreGraph, ...rentalGraph };

const { patriotOverlays } = buildGraphOverlayShard(merged, INTENT_SIGNALS);

const entries = Object.entries(patriotOverlays || {});
const published = entries.filter(
  ([, overlay]) => overlay.publish?.status === "published"
);

let failures = 0;

for (const [id, overlay] of published) {
  const renderData = overlay.renderData;

  if (!renderData) {
    console.error(`FAIL: ${id} — missing renderData entirely`);
    failures++;
    continue;
  }

  const missing = REQUIRED_RENDER_KEYS.filter(
    (key) => !(key in renderData)
  );

  if (missing.length > 0) {
    console.error(`FAIL: ${id} — missing keys: ${missing.join(", ")}`);
    failures++;
  }
}

console.log(
  `Validated ${published.length} published overlays. Failures: ${failures}`
);

if (failures > 0) {
  process.exit(1);
}

console.log("All overlay payloads valid.");
