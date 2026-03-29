import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AIRPORT_INDEX } from "../../src/features/airport/network/airportIndex.js";
import { GENERATED_RIDE_ROUTES } from "../../src/features/routes/data/generatedRideRoutes.js";
import { RIDE_DESTINATIONS } from "../../src/features/routes/data/rideDestinations.js";
import { continentIndex } from "../../src/features/airport/network/continentIndex.js"; // Import continentIndex
import { buildNetworkGraph } from "../../src/core/network/buildNetworkGraph.js";
import { buildRentalGraph } from "../../src/core/network/buildRentalGraph.js";
import { buildGraphOverlayShard } from "../../src/core/network/graphOverlayShard.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = "https://jetmymoto.com";
const overlayGraph = {
  ...buildNetworkGraph(),
  ...buildRentalGraph(),
};
const { publishedOverlayUrls } = buildGraphOverlayShard(overlayGraph);

const urls = [];

// 1. Root page
urls.push(`${BASE}/`);

// 2. Static Airports page
urls.push(`${BASE}/airports`);

// 3. Continent pages
Object.keys(continentIndex).forEach(continentId => {
  urls.push(`${BASE}/airports/${continentId}`);
});

// 4. Country pages (extract unique country codes from AIRPORT_INDEX)
const uniqueCountryCodes = [...new Set(Object.values(AIRPORT_INDEX).map(airport => airport.country))];
uniqueCountryCodes.forEach(countryCode => {
  if (countryCode) { // Ensure countryCode is not empty
    urls.push(`${BASE}/airports/country/${countryCode.toLowerCase()}`);
  }
});

// 5. Airport pages (already covered)
Object.values(AIRPORT_INDEX).forEach(airport => {
  urls.push(`${BASE}/airport/${airport.slug}-motorcycle-shipping`);
});

// 6. Route pages (already covered)
GENERATED_RIDE_ROUTES.forEach(route => {
  urls.push(`${BASE}/route/${route.slug}`);
});

// 7. Ride destination pages (already covered)
RIDE_DESTINATIONS.forEach(destination => {
  urls.push(`${BASE}/destination/${destination.slug}`);
});

// 8. Patriot pSEO overlay pages (graph-driven — respects scoring, validation, publish gates)
(publishedOverlayUrls || []).forEach(entry => {
  if (entry.path) {
    urls.push(`${BASE}${entry.path}`);
  }
});

// 9. A2A Mission pages (premium one-way corridors — highest margin product)
const a2aSlugs = overlayGraph.allMissionSlugs || [];
a2aSlugs.forEach(slug => {
  urls.push({ loc: `${BASE}/a2a/${slug}`, priority: "0.9", changefreq: "weekly" });
});
console.log(`   → ${a2aSlugs.length} A2A Mission URLs injected`);

const now = new Date().toISOString();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => {
  const loc = typeof u === "string" ? u : u.loc;
  const priority = typeof u === "object" && u.priority ? `\n  <priority>${u.priority}</priority>` : "";
  const changefreq = typeof u === "object" && u.changefreq ? `\n  <changefreq>${u.changefreq}</changefreq>` : "";
  return `\n<url>\n  <loc>${loc}</loc>\n  <lastmod>${now}</lastmod>${priority}${changefreq}\n</url>`;
}).join("")}
</urlset>`;

const output = path.resolve(__dirname, "../../public/sitemap.xml");

fs.writeFileSync(output, xml);

console.log("✅ Sitemap generated:", output);
