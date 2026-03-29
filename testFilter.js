const fs = require('fs');
const internalDbPath = './frontend/rideratlas/src/features/poi/poiIndex.json';
const db = JSON.parse(fs.readFileSync(internalDbPath, 'utf8'));

const validPois = [];
for (const [key, poi] of Object.entries(db)) {
  const dest = poi.destination || poi.region?.toLowerCase();
  if (dest) {
    validPois.push({ key, ...poi });
  }
}

const cafe = validPois.find(p => p.category === 'CAFE');
const fuel = validPois.find(p => p.category === 'FUEL');
const scenic = validPois.find(p => p.category === 'SCENIC_POINT');

console.log('Cafe:', cafe?.name);
console.log('Fuel:', fuel?.name);
console.log('Scenic:', scenic?.name);
