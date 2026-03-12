import fs from "fs";
import path from "path";

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node importAirportsCSV.mjs <csv-file>");
  process.exit(1);
}

const csv = fs.readFileSync(csvPath, "utf8").trim();
const lines = csv.split("\n").slice(1);

const airports = {};

for (const line of lines) {
  const [code, city, country] = line.split(",");

  const slug =
    city.toLowerCase().replace(/\s+/g, "-") + "-" + code.toLowerCase();

  airports[code] = {
    code,
    city,
    country,
    slug,
    continent: "north-america",
  };
}

const outputPath =
  "src/features/airport/network/airportIndex.js";

const existing = fs.readFileSync(outputPath, "utf8");

const insert = Object.entries(airports)
  .map(
    ([k, v]) =>
      `"${k}": ${JSON.stringify(v, null, 2)}`
  )
  .join(",\n");

const updated =
  existing.replace(
    /export const AIRPORT_INDEX = {/,
    `export const AIRPORT_INDEX = {\n${insert},`
  );

fs.writeFileSync(outputPath, updated);

console.log(`Imported ${lines.length} airports`);
