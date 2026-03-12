import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AIRPORT_INDEX } from "../../src/features/airport/network/airportIndex.js";
import { GENERATED_RIDE_ROUTES } from "../../src/features/routes/data/generatedRideRoutes.js";
import { RIDE_DESTINATIONS } from "../../src/features/routes/data/rideDestinations.js";
import { continentIndex } from "../../src/features/airport/network/continentIndex.js"; // Import continentIndex

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = "https://jetmymoto.com";

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

const now = new Date().toISOString();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `
<url>
  <loc>${u}</loc>
  <lastmod>${now}</lastmod>
</url>`).join("")}
</urlset>`;

const output = path.resolve(__dirname, "../../public/sitemap.xml");

fs.writeFileSync(output, xml);

console.log("✅ Sitemap generated:", output);
