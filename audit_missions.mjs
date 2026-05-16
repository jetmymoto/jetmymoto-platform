import fs from 'fs';

const missionsData = JSON.parse(fs.readFileSync('data/a2a_missions_v5.json', 'utf8'));
const airportIndex = JSON.parse(fs.readFileSync('frontend/rideratlas/src/features/airport/network/airportIndex.js', 'utf8').replace('export const AIRPORT_INDEX = ', '').replace(/;$/, ''));

const missions = missionsData.missions;
const airportMissionCount = {};

// Initialize counts for all airports in index
for (const code in airportIndex) {
  airportMissionCount[code] = 0;
}

// Count missions per insertion airport
missions.forEach(mission => {
  const code = mission.insertion_airport;
  if (airportMissionCount[code] !== undefined) {
    airportMissionCount[code]++;
  } else {
    // Some missions might have airports not in the index?
    airportMissionCount[code] = 1;
  }
});

const insufficientAirports = [];

for (const code in airportMissionCount) {
  if (airportMissionCount[code] < 3) {
    insufficientAirports.push({
      code,
      city: airportIndex[code]?.city || 'Unknown',
      count: airportMissionCount[code],
      region: airportIndex[code]?.region || 'Unknown'
    });
  }
}

console.log(JSON.stringify(insufficientAirports, null, 2));
