const fs = require("fs");
const path = require("path");

const airports = [
  "AGP","ALC","AMS","ARN","ATH","BCN","BER","BGY","BLQ","BRU","BUD",
  "CDG","CPH","CTA","DUB","DUS","EDI","FAO","FCO","FRA","GVA","HAM",
  "HEL","IST","LGW","LHR","LIN","LIS","LPA","LYS","MAD","MUC","MXP",
  "NAP","NCE","OPO","ORY","OSL","OTP","PMI","PRG","SPU","STR","TFS",
  "VCE","VIE","VLC","WAW","ZAG","ZRH"
];

function generateAirportConfig() {
  return airports.map(code => {
    return `  { 
    code: "${code}",
    name: "${code} Airport",
    country: "",
    region: "",
    theater: "",
    type: "hub",
    status: "PIPELINE",
    tier: "TIER_1",
    corridor: "",
    plannerEnabled: false,
    bookingEnabled: false,
seoEnabled: false,
    missions: [],
    lat: 0,
    lng: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }`;
  }).join(",\n");
}

const output = `
/* AUTO-GENERATED AIRPORT CONFIG */

export const airportConfig = [
${generateAirportConfig()}
];
`;

const targetPath = path.join(
  __dirname,
  "../src/features/airport/data/airportConfig.generated.js"
);

fs.writeFileSync(targetPath, output);

console.log("✅ Airport config generated at:");
console.log(targetPath);
