import fs from "fs";
import path from "path";

// ===============================
// FILE PATHS
// ===============================

const airportFilePath = path.resolve(
  "./src/features/airport/network/airportIndex.js"
);

const outputFile = path.resolve(
  "./src/features/airport/network/continentIndex.js"
);

// ===============================
// LOAD AIRPORT DATASET
// ===============================

let fileContent = fs.readFileSync(airportFilePath, "utf8");

// remove export syntax
fileContent = fileContent.replace(
  "export const AIRPORT_INDEX =",
  "AIRPORT_INDEX ="
);

// evaluate dataset
let AIRPORT_INDEX = {};
eval(fileContent);

// convert object → array
const airportIndex = Object.values(AIRPORT_INDEX);

console.log("AIRPORT_INDEX keys:", Object.keys(AIRPORT_INDEX).length);
console.log("airportIndex length:", airportIndex.length);

// ===============================
// CONTINENT NAMES
// ===============================

const CONTINENT_NAMES = {
  europe: "Europe",
  asia: "Asia",
  "north-america": "North America",
  "south-america": "South America",
  africa: "Africa",
  oceania: "Oceania",
  antarctica: "Antarctica"
};

// ===============================
// NORMALIZE CONTINENT VALUES
// ===============================

function normalizeContinent(continent) {
  if (!continent) return null;

  const c = continent.toLowerCase().trim();

  if (c === "north america" || c === "na") return "north-america";
  if (c === "south america" || c === "sa") return "south-america";

  return c;
}

// ===============================
// BUILD CONTINENT MAP
// ===============================

const continentMap = {};

for (const airport of airportIndex) {

  if (!airport.slug) {
    console.warn("Missing slug:", airport);
    continue;
  }

  if (!airport.continent) {
    console.warn("Missing continent:", airport.slug);
    continue;
  }

  if (!airport.country) {
    console.warn("Missing country:", airport.slug);
    continue;
  }

  const continentSlug = normalizeContinent(airport.continent);

  if (!continentSlug) {
    console.warn("Invalid continent:", airport.slug);
    continue;
  }

  if (!continentMap[continentSlug]) {

    continentMap[continentSlug] = {
      slug: continentSlug,
      name: CONTINENT_NAMES[continentSlug] || continentSlug,
      airportCount: 0,
      countries: new Set(),
      airports: []
    };

  }

  const continent = continentMap[continentSlug];

  continent.airportCount += 1;
  continent.airports.push(airport.slug);
  continent.countries.add(airport.country.toLowerCase());

}

// ===============================
// BUILD FINAL INDEX
// ===============================

const continentIndex = {};

Object.values(continentMap)
  .sort((a, b) => a.name.localeCompare(b.name))
  .forEach((continent) => {

    continent.airports.sort();

    continentIndex[continent.slug] = {
      slug: continent.slug,
      name: continent.name,
      airportCount: continent.airportCount,
      countries: [...continent.countries].sort(),
      airports: continent.airports
    };

  });

// ===============================
// WRITE OUTPUT
// ===============================

const outputContent =
`export const continentIndex = ${JSON.stringify(continentIndex, null, 2)};

export default continentIndex;
`;

fs.writeFileSync(outputFile, outputContent);

// ===============================
// FINAL LOG
// ===============================

console.log("continentIndex generated successfully");
console.log("continents:", Object.keys(continentIndex).length);