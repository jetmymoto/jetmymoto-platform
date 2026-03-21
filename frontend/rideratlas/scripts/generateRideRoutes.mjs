import fs from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

import * as airportPkg from "../src/features/airport/network/airportIndex.js"
import { RIDE_DESTINATIONS } from "../src/features/routes/data/rideDestinations.js"

const AIRPORT_INDEX = airportPkg.AIRPORT_INDEX

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, "..", "src", "features", "routes", "data")

function haversineDistance(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // km

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const c =
    sinLat * sinLat +
    sinLng * sinLng * Math.cos(lat1) * Math.cos(lat2);

  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  return R * d;
}

// Fallback coordinates for major airports to keep the graph small
const FALLBACK_AIRPORT_COORDS = {
  "MDW": { lat: 41.78, lng: -87.75 },
  "SLC": { lat: 40.78, lng: -111.97 },
  "BWI": { lat: 39.17, lng: -76.66 },
  "IAD": { lat: 38.94, lng: -77.45 },
  "DCA": { lat: 38.85, lng: -77.04 },
  "YVR": { lat: 49.19, lng: -123.18 },
  "SAN": { lat: 32.73, lng: -117.18 },
  "TPA": { lat: 27.97, lng: -82.53 },
  "BNA": { lat: 36.12, lng: -86.67 },
  "YUL": { lat: 45.46, lng: -73.74 },
  "HNL": { lat: 21.31, lng: -157.92 },
  "AUS": { lat: 30.19, lng: -97.66 },
  "MXP": { lat: 45.63, lng: 8.72 },
  "FCO": { lat: 41.80, lng: 12.24 },
  "CDG": { lat: 49.00, lng: 2.54 },
  "LHR": { lat: 51.47, lng: -0.45 },
  "OSL": { lat: 60.19, lng: 11.10 }
};

function generateRoutes() {
  const airports = Object.values(AIRPORT_INDEX);
  const routes = [];

  const destinations = Object.values(RIDE_DESTINATIONS);

  destinations.forEach(destination => {
    if (!destination.coords) return;

    const airportDistances = airports
      .map(airport => {
        const coords = airport.coords || FALLBACK_AIRPORT_COORDS[airport.code];
        if (!coords) return null;

        return {
          airport,
          distance: haversineDistance(
            coords,
            destination.coords
          )
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance); // Keep all airports

    airportDistances.forEach(({ airport, distance }) => {
      const slug = `${airport.slug}-to-${destination.slug}`;

      routes.push({
        slug,
        origin: airport.code,
        destination: destination.slug,
        distance: Math.round(distance),
        airport: {
            code: airport.code,
            slug: airport.slug,
            city: airport.city,
            country: airport.country,
        },
        destinationDetails: {
            slug: destination.slug,
            name: destination.name,
            countries: destination.countries || [destination.continent],
        }
      });
    });
  });

  console.log("AIRPORTS:", airports.length);
  console.log("DESTINATIONS:", destinations.length);
  console.log("ROUTES:", routes.length);

  const outputPath = join(OUTPUT_DIR, "generatedRideRoutes.js");
  const fileContent = `export const GENERATED_RIDE_ROUTES = ${JSON.stringify(
    routes,
    null,
    2
  )};\n`;

  fs.writeFileSync(outputPath, fileContent);
  console.log(`✅ Generated ${routes.length} ride routes to ${outputPath}`);
}

generateRoutes();
