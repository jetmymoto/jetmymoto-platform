// --------------------------------------------------
// JetMyMoto Airport SEO Generator
// Compatible with ES module export files
// --------------------------------------------------

const fs = require("fs");
const path = require("path");

// --------------------------------------------------
// Load airportIndex.js safely
// --------------------------------------------------

const airportIndexPath = path.join(
  __dirname,
  "../../src/features/airport/network/airportIndex.js"
);

const raw = fs.readFileSync(airportIndexPath, "utf8");

const match = raw.match(/export const AIRPORT_INDEX\s*=\s*({[\s\S]*});?/);

if (!match) {
  console.error("❌ Could not parse AIRPORT_INDEX.");
  process.exit(1);
}

const airportIndex = eval("(" + match[1] + ")");

// --------------------------------------------------
// Generate SEO data
// --------------------------------------------------

const SEO_INDEX = {};

Object.values(airportIndex).forEach((airport) => {

  const city = airport.city;
  const code = airport.code;

  const keywords = [
    `motorcycle shipping ${city}`,
    `ship motorcycle to ${city}`,
    `air freight motorcycle ${city}`,
    `motorcycle transport ${city}`,
    `supercar shipping ${city}`
  ];

  const routes = [
    `${city} motorcycle tour routes`,
    `${city} scenic driving roads`,
    `${city} alpine riding routes`
  ];

  SEO_INDEX[code] = {
    seoTitle: `Motorcycle Shipping ${city} | JetMyMoto`,
    seoDescription: `Secure motorcycle air freight and vehicle logistics to ${city}. Ship your bike internationally with JetMyMoto.`,
    keywords,
    routes
  };

});

// --------------------------------------------------
// Write SEO index
// --------------------------------------------------

const output = path.join(
  __dirname,
  "../../src/features/airport/network/airportSEOIndex.js"
);

fs.writeFileSync(
  output,
  "export const AIRPORT_SEO_INDEX = " + JSON.stringify(SEO_INDEX, null, 2)
);

console.log("✅ Airport SEO index generated successfully.");