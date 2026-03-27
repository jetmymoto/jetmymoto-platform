import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AIRPORT_INDEX } from "../src/features/airport/network/airportIndex.js";
import { airportConfig } from "../src/features/airport/data/airportConfig.generated.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rideratlasRoot = path.resolve(__dirname, "..");
const rentalsPath = path.resolve(
  rideratlasRoot,
  "src/features/rentals/data/rentals.js"
);
const operatorsPath = path.resolve(
  rideratlasRoot,
  "src/features/rentals/data/operators.js"
);

const rentalsSource = fs.readFileSync(rentalsPath, "utf8");
const operatorsSource = fs.readFileSync(operatorsPath, "utf8");

const rentalBlocks = [
  ...rentalsSource.matchAll(/"[^"]+":\s*rental\(\{([\s\S]*?)\}\),?/g),
];
const rentalsByOperator = new Map();
const airportConfigByCode = new Map(
  airportConfig.map((airport) => [airport.code, airport])
);
const airportMetadataFallback = {
  AGP: { city: "Málaga", country: "ES" },
  BCN: { city: "Barcelona", country: "ES" },
  FCO: { city: "Rome", country: "IT" },
  FLR: { city: "Florence", country: "IT" },
  GVA: { city: "Geneva", country: "CH" },
  MAN: { city: "Manchester", country: "GB" },
  MUC: { city: "Munich", country: "DE" },
  NCE: { city: "Nice", country: "FR" },
};

for (const [, block] of rentalBlocks) {
  const operatorMatch = block.match(/operator:\s*"([^"]+)"/);
  const airportMatch = block.match(/airport:\s*"([^"]+)"/);

  if (!operatorMatch || !airportMatch) continue;

  const operatorSlug = operatorMatch[1].trim();
  const airportCode = airportMatch[1].trim().toUpperCase();

  if (!rentalsByOperator.has(operatorSlug)) {
    rentalsByOperator.set(operatorSlug, new Set());
  }

  rentalsByOperator.get(operatorSlug).add(airportCode);
}

const rentalOperators = new Set(rentalsByOperator.keys());
const registeredOperators = new Set(
  [...operatorsSource.matchAll(/^[ \t]*"([^"]+)":\s*operator\(/gm)].map(
    ([, key]) => key.trim()
  )
);

const missingOperators = [...rentalOperators]
  .filter((operatorSlug) => !registeredOperators.has(operatorSlug))
  .sort();

const providerConfig = [
  {
    match: (slug) => slug.startsWith("hertz-ride-"),
    name: "Hertz Ride",
    type: "global",
    website_url: "https://www.hertzride.com/en/locations",
  },
  {
    match: (slug) => slug.startsWith("imtbike-"),
    name: "IMTBIKE",
    type: "global",
    website_url: "https://www.imtbike.com/",
  },
  {
    match: (slug) =>
      slug.startsWith("eaglerider-") || slug.startsWith("eagle-rider-"),
    name: "EagleRider",
    type: "global",
    website_url: "https://www.eaglerider.com/",
  },
  {
    match: (slug) => slug.startsWith("motorent-"),
    name: "MotoRent",
    type: "local",
    website_url: "https://www.motorent.gr/",
  },
];

function inferProvider(slug) {
  return (
    providerConfig.find((candidate) => candidate.match(slug)) || {
      name: slug
        .split("-")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" "),
      type: "local",
      website_url: `https://www.jetmymoto.com/operators/${slug}`,
    }
  );
}

function inferName(slug, airportCodes) {
  const provider = inferProvider(slug);
  const cityNames = airportCodes
    .map((code) => {
      return (
        AIRPORT_INDEX[code]?.city ||
        airportConfigByCode.get(code)?.city ||
        airportMetadataFallback[code]?.city ||
        code
      );
    })
    .filter(Boolean);
  const label = cityNames.join(" / ");
  return label ? `${provider.name} ${label}` : provider.name;
}

function formatOperatorBlock(operatorSlug) {
  const airportCodes = [...(rentalsByOperator.get(operatorSlug) || [])].sort();
  const primaryAirportCode = airportCodes[0] || "";
  const airportMeta = {
    ...(airportMetadataFallback[primaryAirportCode] || {}),
    ...(airportConfigByCode.get(primaryAirportCode) || {}),
    ...(AIRPORT_INDEX[primaryAirportCode] || {}),
  };
  const provider = inferProvider(operatorSlug);
  const countryCode = String(airportMeta.country || "").toUpperCase();

  if (!primaryAirportCode || !countryCode) {
    throw new Error(`Unable to resolve airport metadata for ${operatorSlug}`);
  }

  return [
    `  ${JSON.stringify(operatorSlug)}: operator({`,
    `    id: ${JSON.stringify(operatorSlug)},`,
    `    slug: ${JSON.stringify(operatorSlug)},`,
    `    name: ${JSON.stringify(inferName(operatorSlug, airportCodes))},`,
    `    type: ${JSON.stringify(provider.type)},`,
    `    country: ${JSON.stringify(countryCode)},`,
    `    airports: [${airportCodes.map((code) => JSON.stringify(code)).join(", ")}],`,
    `    website_url: ${JSON.stringify(provider.website_url)}`,
    "  })",
  ].join("\n");
}

if (missingOperators.length === 0) {
  console.log("Missing operators injected: 0");
  process.exit(0);
}

const generatedBlocks = missingOperators.map(formatOperatorBlock).join(",\n");
const closingIndex = operatorsSource.lastIndexOf("\n};");

if (closingIndex === -1) {
  throw new Error("Could not find OPERATORS object terminator in operators.js");
}

const updatedOperatorsSource = `${operatorsSource.slice(0, closingIndex)},\n${generatedBlocks}${operatorsSource.slice(closingIndex)}`;

fs.writeFileSync(operatorsPath, updatedOperatorsSource);

console.log(`Missing operators injected: ${missingOperators.length}`);
console.log(missingOperators.join("\n"));
