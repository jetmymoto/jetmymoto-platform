// scripts/route-pipeline/destinations.mjs
// Shared destination loader for the route pipeline.
// Reads the canonical rideDestinations.js source of truth.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEST_FILE = path.resolve(
  __dirname,
  "../../frontend/rideratlas/src/features/routes/data/rideDestinations.js"
);

export function loadDestinations() {
  let src = fs.readFileSync(DEST_FILE, "utf8");
  // Strip the ES export so we can eval the object safely
  src = src.replace("export const RIDE_DESTINATIONS =", "var __d =");
  const fn = new Function(`${src}; return __d;`);
  return fn();
}

export function destinationsWithCoords() {
  const all = loadDestinations();
  return Object.values(all).filter(
    (d) => d.coords && d.coords.lat != null && d.coords.lng != null
  );
}
