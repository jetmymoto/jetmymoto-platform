import { AIRPORT_INDEX } from "../../features/airport/network/airportIndex";
import { staticAirports } from "@/features/airport/data/staticAirports";
import { staticAirportsEnriched } from "@/features/airport/data/staticAirportsEnriched";
import { RIDE_DESTINATIONS } from "../../features/routes/data/rideDestinations";
import { GENERATED_RIDE_ROUTES } from "../../features/routes/data/generatedRideRoutes";
import { POI_INDEX } from "../../features/poi/poiIndex";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

const toKebabCase = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const safeString = (val) => (val == null ? "" : String(val));

const safeCompare = (a, b) => {
  const strA = safeString(a).toLowerCase();
  const strB = safeString(b).toLowerCase();
  return strA.localeCompare(strB);
};

function createDefaultArrivalOS(city) {
  return {
    arrivals: [{ label: `${city} Arrivals`, note: "Follow airport signage" }],
    departures: [{ label: `${city} Departures`, note: "Upper terminal level" }],
    baggageClaim: [{ label: "Baggage Claim", note: "Main terminal" }],
    rideshare: [{ label: "Uber / Lyft Pickup", note: "Rideshare zone" }],
    transport: [{ label: "Ground Transport", note: `${city} transit links` }]
  };
}

export function buildNetworkGraph() {
  const airports = {};
  const airportsBySlug = {};
  const clusters = {};
  const routes = {};
  const routesByAirport = {};
  const routesByDestination = {};
  const destinations = {};
  const destinationsByRegion = {};
  const pois = {};
  const poisByDestination = {};

  for (const airportCode in AIRPORT_INDEX) {
    const base = AIRPORT_INDEX[airportCode];
    const ops = staticAirports[airportCode] || {};
    const enriched = staticAirportsEnriched[airportCode] || {};

    const merged = {
      ...base,
      ...ops,
      ...enriched
    };

    if (!merged.arrivalOS) {
      merged.arrivalOS = createDefaultArrivalOS(merged.city || merged.name || airportCode);
    }

    // Provide defaults for operational sections
    merged.recovery ??= {
      premium: { name: "", location: "", href: "#", features: [] },
      budget: { name: "", location: "", href: "#", features: [] }
    };
    merged.utilities ??= [];
    merged.cityExtension ??= { enabled: false, headline: "", subline: "", items: [] };

    airports[merged.code] = merged;
    if (merged.slug) {
      airportsBySlug[merged.slug] = merged;
    }
  }

  const destinationMap = new Map();
  const destinationsArray = toArray(RIDE_DESTINATIONS);
  for (const destination of destinationsArray) {
    if (destination.slug) {
      destinations[destination.slug] = destination;
      destinationMap.set(destination.name, destination);
      
      const region = destination.region || "Other";
      if (!destinationsByRegion[region]) {
        destinationsByRegion[region] = [];
      }
      destinationsByRegion[region].push(destination.slug);
    }
  }

  const ALL_ROUTES = GENERATED_RIDE_ROUTES.map(route => {
    // If the route's destination is in destinationMap, enrich it
    const destinationData = destinationMap.get(route.destination?.name || route.destination);
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
      // Hydrate airport and destination objects
      const airportCode = route.airportCode || route.airport?.code || route.airport;
      const destinationSlug = route.destinationSlug || route.destination?.slug || route.destination;

      const airport = AIRPORT_INDEX[airportCode];
      const destination = RIDE_DESTINATIONS[destinationSlug];

      const hydratedRoute = {
        ...route,
        airport,
        destination
      };

      routes[route.slug] = hydratedRoute;

      if (airportCode) {
        if (!routesByAirport[airportCode]) {
          routesByAirport[airportCode] = [];
        }
        routesByAirport[airportCode].push(route.slug);
      }

      if (destinationSlug) {
        if (!routesByDestination[destinationSlug]) {
          routesByDestination[destinationSlug] = [];
        }
        routesByDestination[destinationSlug].push(route.slug);
      }
    }
  }

  Object.entries(routesByAirport).forEach(([airportCode, routeSlugs]) => {
    const airport = airports[airportCode];

    if (!airport) return;

    clusters[airportCode.toLowerCase()] = {
      id: `${airportCode.toLowerCase()}-network`,
      title: `${airport.city} Hub`,
      region: airport.city,
      airports: [airportCode],
      routes: routeSlugs.map(slug => routes[slug]).filter(Boolean).sort((a,b) => (a.distance || 0) - (b.distance || 0)),
      media: {
        video: "/videos/default-cluster.mp4"
      }
    };
  });

  const poisArray = toArray(POI_INDEX);
  for (const poi of poisArray) {
    if (poi.slug) {
      pois[poi.slug] = poi;
      
      const destSlug = poi.destination || poi.region || poi.destination_slug || "other";
      if (!destinations[destSlug] && destSlug !== "other") {
        console.warn(`POI ${poi.slug} references missing destination ${destSlug}`);
      }
      
      if (!poisByDestination[destSlug]) {
        poisByDestination[destSlug] = [];
      }
      poisByDestination[destSlug].push(poi.slug);
    }
  }

  return {
    airports,
    airportsBySlug,
    clusters,
    routes,
    routesByAirport,
    routesByDestination,
    destinations,
    destinationsByRegion,
    pois,
    poisByDestination,
  };
}