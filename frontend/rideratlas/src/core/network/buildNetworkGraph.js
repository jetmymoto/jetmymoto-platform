import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";
import { RIDE_DESTINATIONS } from "@/features/routes/data/rideDestinations";
import { GENERATED_RIDE_ROUTES } from "@/features/routes/data/generatedRideRoutes";
import { POI_INDEX } from "@/features/poi/poiIndex";

const toKebabCase = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export function buildNetworkGraph() {
  const airports = {};
  const clusters = {};
  const destinations = {};
  const routes = {};
  const airportsBySlug = {};
  const pois = {};

  const routesByAirport = {};
  const routesByDestination = {};
  const destinationsByType = {};

  for (const airportCode in AIRPORT_INDEX) {
    const airport = AIRPORT_INDEX[airportCode];
    airports[airport.code] = airport;
    airportsBySlug[airport.slug] = airport;
  }

  const destinationMap = new Map();
  for (const destination of RIDE_DESTINATIONS) {
    if (destination.slug) {
      destinations[destination.slug] = destination;
      destinationMap.set(destination.name, destination);
      const types = destination.type || ["other"];
      for (const t of types) {
        if (!destinationsByType[t]) {
          destinationsByType[t] = [];
        }
        destinationsByType[t].push(destination.slug);
      }
    }
  }

  const ALL_ROUTES = GENERATED_RIDE_ROUTES.map(route => {
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

  for (const route of ALL_ROUTES) {
    if (route.slug) {
      routes[route.slug] = route;
      if (!routesByAirport[route.airport.code]) {
        routesByAirport[route.airport.code] = [];
      }
      routesByAirport[route.airport.code].push(route.slug);
      if (!routesByDestination[route.destination.slug]) {
        routesByDestination[route.destination.slug] = [];
      }
      routesByDestination[route.destination.slug].push(route.slug);
    }
  }

  const routesGroupedByAirport = ALL_ROUTES.reduce((acc, route) => {
    const airportCode = route.airport.code;
    if (!acc[airportCode]) {
      const airportData = airports[airportCode] || {};
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

  const generatedClusters = Object.values(routesGroupedByAirport).map(
    ({ airport, routes: airportRoutes }) => {
      const sortedRoutes = [...airportRoutes].sort((a, b) =>
        a.destination.name.localeCompare(b.destination.name)
      );
      const countryCount = new Set((sortedRoutes || []).flatMap(r => {
          const dest = destinations[r.destination.slug];
          return dest ? dest.countries : [];
      })).size;
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

  generatedClusters.sort((a, b) => {
    if (a.routeCount !== b.routeCount) {
      return b.routeCount - a.routeCount;
    }
    return a.airport.city.localeCompare(b.airport.city);
  });

  for (const cluster of generatedClusters) {
    clusters[cluster.id] = cluster;
  }

  for (const poi of POI_INDEX) {
    if (poi.slug) {
      pois[poi.slug] = poi;
    }
  }

  return {
    airports,
    clusters,
    destinations,
    routes,
    airportsBySlug,
    pois,
    routesByAirport,
    routesByDestination,
    destinationsByType,
  };
}
