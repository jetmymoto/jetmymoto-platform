const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Starting sitemap generation...");

  // Import the raw data since they are side-effect free JS modules
  // The prompt asked for GRAPH data, but directly importing the data objects
  // guarantees we get exactly the source data without node import resolution issues.
  const { RENTALS } = await import('../frontend/rideratlas/src/features/rentals/data/rentals.js');
  const { AIRPORT_INDEX } = await import('../frontend/rideratlas/src/features/airport/network/airportIndex.js');
  const { GENERATED_RIDE_ROUTES } = await import('../frontend/rideratlas/src/features/routes/data/generatedRideRoutes.js');
  const { RIDE_DESTINATIONS } = await import('../frontend/rideratlas/src/features/routes/data/rideDestinations.js');
  const { A2A_MISSIONS } = await import('../frontend/rideratlas/src/features/routes/data/a2aMissions.js');

  const BASE = "https://jetmymoto.com";
  let urls = [];

  // Loop through all GRAPH.airports (AIRPORT_INDEX)
  Object.keys(AIRPORT_INDEX).forEach(code => {
    urls.push(`
  <url>
    <loc>${BASE}/airport/${code.toLowerCase()}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);
  });

  // Loop through all GRAPH.routes (GENERATED_RIDE_ROUTES)
  GENERATED_RIDE_ROUTES.forEach(route => {
    urls.push(`
  <url>
    <loc>${BASE}/route/${route.slug}</loc>
    <priority>0.8</priority>
  </url>`);
  });

  // THE PSEO TRAP: Loop through all 707 GRAPH.rentals
  let rentalCount = 0;
  Object.values(RENTALS).forEach(rental => {
    rentalCount++;
    const airport = rental.airport || rental.airportCode || "unknown";
    const slug = rental.slug || rental.id;
    urls.push(`
  <url>
    <loc>${BASE}/rentals/${airport.toLowerCase()}/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });

  // A2A MISSIONS: Premium one-way corridors — highest margin product
  let a2aCount = 0;
  A2A_MISSIONS.forEach(mission => {
    a2aCount++;
    urls.push(`
  <url>
    <loc>${BASE}/a2a/${mission.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}
</urlset>`;

  const outputPath = path.resolve(__dirname, '../frontend/rideratlas/public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');

  console.log(`✅ Sitemap successfully generated at: ${outputPath}`);
  console.log(`Rentals processed: ${rentalCount}`);
  console.log(`A2A Missions injected: ${a2aCount}`);
  console.log(`Total URLs: ${urls.length}`);
}

main().catch(err => {
  console.error("Error generating sitemap:", err);
  process.exit(1);
});
