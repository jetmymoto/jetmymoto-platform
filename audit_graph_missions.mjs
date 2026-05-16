import { AIRPORT_INDEX } from "./frontend/rideratlas/src/features/airport/network/airportIndex.js";
import { A2A_MISSIONS } from "./frontend/rideratlas/src/features/routes/data/a2aMissions.js";
import { GENERATED_RIDE_ROUTES } from "./frontend/rideratlas/src/features/routes/data/generatedRideRoutes.js";

const routesByAirport = {};

function addRoute(r) {
  if (!r) return;
  const code = r.insertion_airport || r.origin || r.airport?.code;
  if (!code) return;
  if (!routesByAirport[code]) {
    routesByAirport[code] = new Set();
  }
  routesByAirport[code].add(r.slug || r.id || r.title);
}

A2A_MISSIONS.forEach(addRoute);
GENERATED_RIDE_ROUTES.forEach(addRoute);

// Also check embedded missions in AIRPORT_INDEX
for (const code in AIRPORT_INDEX) {
  const airport = AIRPORT_INDEX[code];
  if (airport.missions) {
    if (!routesByAirport[code]) {
      routesByAirport[code] = new Set();
    }
    Object.keys(airport.missions).forEach(slug => {
      routesByAirport[code].add(slug);
    });
  }
}

const report = [];
for (const code in AIRPORT_INDEX) {
  const count = routesByAirport[code] ? routesByAirport[code].size : 0;
  report.push({
    code,
    city: AIRPORT_INDEX[code].city,
    count,
    region: AIRPORT_INDEX[code].region,
    continent: AIRPORT_INDEX[code].continent
  });
}

console.log(JSON.stringify(report, null, 2));
