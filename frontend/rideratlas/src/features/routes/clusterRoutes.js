import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";

/**
 * @param {string} str
 * @returns {string}
 */
const toKebabCase = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

/**
 * @param {Array<object>} routes
 * @returns {Array<object>}
 */
export function clusterRoutesByAirport(routes) {
  if (!routes || routes.length === 0) {
    return [];
  }

  const routesByAirport = routes.reduce((acc, route) => {
    const airportCode = route.airport.code;
    if (!acc[airportCode]) {
      const airportData = Object.values(AIRPORT_INDEX).find(a => a.code === airportCode) || {};
      acc[airportCode] = {
        airport: { 
          ...route.airport,
          code: airportCode,
          slug: airportData.slug 
        },
        routes: [],
      };
    }
    acc[airportCode].routes.push(route);
    return acc;
  }, {});

  const clusters = Object.values(routesByAirport).map(
    ({ airport, routes }) => {
      // Sort routes inside each cluster by destination name
      const sortedRoutes = [...routes].sort((a, b) =>
        a.destination.name.localeCompare(b.destination.name)
      );

      const countryCount = new Set((sortedRoutes || []).flatMap(r => r.destination?.countries || [])).size;
      const regionCount = new Set((sortedRoutes || []).map(r => r.destination?.slug)).size;

      return {
        id: `${airport.code.toLowerCase()}-network`,
        airport,
        title: `${airport.code} Adventure Network`,
        slug: `${toKebabCase(airport.city)}-adventure-network`,
        routes: sortedRoutes,
        routeCount: sortedRoutes.length,
        countryCount,
        regionCount,
      };
    }
  );

  // Sort clusters by routeCount (desc) and then by city name (asc)
  clusters.sort((a, b) => {
    if (a.routeCount !== b.routeCount) {
      return b.routeCount - a.routeCount;
    }
    return a.airport.city.localeCompare(b.airport.city);
  });

  return clusters;
}
