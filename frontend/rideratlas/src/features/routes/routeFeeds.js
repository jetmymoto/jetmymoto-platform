import { GENERATED_RIDE_ROUTES } from "./data/generatedRideRoutes.js";
import { RIDE_DESTINATIONS } from "./data/rideDestinations.js";
import { clusterRoutesByAirport } from "./clusterRoutes.js";

// --- Data Enrichment ---

const destinationMap = new Map(RIDE_DESTINATIONS.map(d => [d.name, d]));

function getEnrichedRoutes() {
  return GENERATED_RIDE_ROUTES.map(route => {
    const destinationData = destinationMap.get(route.destination.name);
    if (destinationData) {
      return {
        ...route,
        destination: {
          ...route.destination,
          ...destinationData,
        }
      };
    }
    return route;
  });
}

const ALL_ROUTES = getEnrichedRoutes();

// --- Helpers ---

function limitItems(items, limit) {
  return items.slice(0, limit);
}

// --- Exported Functions ---

export function getRoutesByContinent(continentAirports, limit = 12) {
  const airportCodes = new Set(continentAirports.map(a => a.code));
  const routes = ALL_ROUTES.filter(route =>
    airportCodes.has(route.airport.code)
  );
  return limitItems(routes, limit);
}

export function getClustersByContinent(airports, limit = 12) {
  const airportCodeSet = new Set(airports.map(a => a.code));
  const routes = ALL_ROUTES.filter(route =>
    airportCodeSet.has(route.airport.code)
  );
  const clusters = clusterRoutesByAirport(routes);
  return limitItems(clusters, limit);
}

export function getRoutesByCountry(countryCode, limit = 8) {
  const routes = ALL_ROUTES.filter(
    route => route.airport.country === countryCode
  );
  return limitItems(routes, limit);
}

export function getClustersByCountry(countryCode, limit = 8) {
  const routes = ALL_ROUTES.filter(
    route => route.airport.country === countryCode
  );
  const clusters = clusterRoutesByAirport(routes);
  return limitItems(clusters, limit);
}

export function getRoutesByAirport(airportCode, limit = 6) {
  const routes = ALL_ROUTES.filter(
    route => route.airport.code === airportCode
  );
  return limitItems(routes, limit);
}

export function getAirportCluster(airportCode) {
  const routes = ALL_ROUTES.filter(
    route => route.airport.code === airportCode
  );
  const clusters = clusterRoutesByAirport(routes);
  return clusters.length > 0 ? clusters[0] : null;
}