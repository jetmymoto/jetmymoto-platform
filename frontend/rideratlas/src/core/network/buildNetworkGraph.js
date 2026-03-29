import { AIRPORT_INDEX } from "../../features/airport/network/airportIndex";
import { staticAirports } from "@/features/airport/data/staticAirports";
import { staticAirportsEnriched } from "@/features/airport/data/staticAirportsEnriched";
import { RIDE_DESTINATIONS } from "../../features/routes/data/rideDestinations";
import { GENERATED_RIDE_ROUTES } from "../../features/routes/data/generatedRideRoutes";
import { ENRICHED_ROUTE_INTEL } from "../../features/routes/data/enrichedRouteIntel";
import { ENRICHED_POIS } from "../../features/routes/data/enrichedPois";
import { A2A_MISSIONS } from "../../features/routes/data/a2aMissions";
import RIDE_REGIONS from "../../features/rides/rideRegions.json";

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

// ── Centralized casing normalization (Phase 2 safety) ──
const normalizeCountry = (c) => (c || "").trim().toLowerCase();
const normalizeContinent = (c) => (c || "").trim().toLowerCase();

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
  const poisByAirport = {};

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
      // Merge enriched route intel (cinematic copy, telemetry summary) if available
      const intel = ENRICHED_ROUTE_INTEL[destination.slug];
      destinations[destination.slug] = intel
        ? { ...destination, ...intel, slug: destination.slug }
        : destination;
      destinationMap.set(destination.name, destinations[destination.slug]);
      
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
    if (!route.slug) continue;

    const rawAirportCode = route.airportCode || route.airport?.code || route.airport;
    const airportCode = String(rawAirportCode || "").trim().toUpperCase();
    const destinationSlug = String(
      route.destinationSlug || route.destination?.slug || route.destination || ""
    ).trim().toLowerCase();

    const airport = airportCode ? AIRPORT_INDEX[airportCode] : undefined;
    const destination = destinationSlug ? destinations[destinationSlug] : undefined;

    const hydratedRoute = {
      ...route,
      airport: airport || route.airport,
      destination: destination || route.destination,
      // New canonical fields
      originAirportCode: airportCode,
      distanceKm: route.distance,
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

  for (const [regionSlug, region] of Object.entries(RIDE_REGIONS || {})) {
    const destinationSlug = region?.slug || regionSlug || "other";
    const regionPois = toArray(region?.pois);

    for (const poi of regionPois) {
      if (!poi?.slug) continue;

      const normalizedPoi = {
        ...poi,
        destination: destinationSlug,
        region: destinationSlug,
      };

      pois[poi.slug] = normalizedPoi;

      if (!poisByDestination[destinationSlug]) {
        poisByDestination[destinationSlug] = [];
      }

      poisByDestination[destinationSlug].push(poi.slug);
    }
  }

  // ── Enriched POIs from route-pipeline (Stage 4 output) ──
  for (const enrichedPoi of ENRICHED_POIS) {
    if (!enrichedPoi?.slug) continue;

    const destSlug = enrichedPoi.destination_slug || "other";
    const normalizedPoi = {
      ...enrichedPoi,
      destination: destSlug,
      region: destSlug,
    };

    // Only add if not already present from rideRegions
    if (!pois[enrichedPoi.slug]) {
      pois[enrichedPoi.slug] = normalizedPoi;
      if (!poisByDestination[destSlug]) {
        poisByDestination[destSlug] = [];
      }
      poisByDestination[destSlug].push(enrichedPoi.slug);
      
      const airportCode = enrichedPoi.nearest_airport?.toUpperCase() || "UNKNOWN";
      if (!poisByAirport[airportCode]) {
        poisByAirport[airportCode] = [];
      }
      poisByAirport[airportCode].push(enrichedPoi.slug);
    }
  }

  // ── Phase 2: Precomputed indexes (eliminates all Object.values().filter() scans) ──
  const airportsByContinent = {};
  const airportsByCountry = {};
  const routesByCountry = {};       // Set-based to prevent duplicates
  const clusterByAirport = {};      // Array — airport can appear in multiple clusters
  const neighborsByAirport = {};
  const regionsByCountry = {};      // Set-based to prevent duplicates
  const allAirportCodes = [];
  const allRouteSlugs = [];
  const allDestinationSlugs = [];

  // Index airports by continent and country
  for (const code in airports) {
    const a = airports[code];
    const continent = normalizeContinent(a.continent) || "other";
    const country = normalizeCountry(a.country);

    allAirportCodes.push(code);

    if (!airportsByContinent[continent]) airportsByContinent[continent] = [];
    airportsByContinent[continent].push(code);

    if (country) {
      if (!airportsByCountry[country]) airportsByCountry[country] = [];
      airportsByCountry[country].push(code);
    }
  }

  // Index routes by country + regions by country (Set-based for dedup)
  const routesByCountrySets = {};
  const regionsByCountrySets = {};

  for (const [airportCode, slugs] of Object.entries(routesByAirport)) {
    const airport = airports[airportCode];
    const country = normalizeCountry(airport?.country);

    if (country) {
      if (!routesByCountrySets[country]) routesByCountrySets[country] = new Set();
      slugs.forEach(s => routesByCountrySets[country].add(s));

      if (!regionsByCountrySets[country]) regionsByCountrySets[country] = new Set();
      slugs.forEach(slug => {
        const destSlug = routes[slug]?.destination?.slug;
        if (destSlug) regionsByCountrySets[country].add(destSlug);
      });
    }
  }

  // Convert Sets → Arrays
  for (const k in routesByCountrySets) routesByCountry[k] = [...routesByCountrySets[k]];
  for (const k in regionsByCountrySets) regionsByCountry[k] = [...regionsByCountrySets[k]];

  // clusterByAirport — array to handle multi-cluster membership
  for (const [clusterId, cluster] of Object.entries(clusters)) {
    (cluster.airports || []).forEach(code => {
      if (!clusterByAirport[code]) clusterByAirport[code] = [];
      clusterByAirport[code].push(clusterId);
    });
  }

  // neighborsByAirport — same country, different code
  for (const code in airports) {
    const country = normalizeCountry(airports[code].country);
    neighborsByAirport[code] = (airportsByCountry[country] || []).filter(c => c !== code);
  }

  // Collect all keys for iteration-free access
  for (const slug in routes) allRouteSlugs.push(slug);
  for (const slug in destinations) allDestinationSlugs.push(slug);

  // ── A2A Missions (Airport-to-Airport open-jaw corridors) ──
  const missions = {};
  const missionsByInsertion = {};
  const missionsByExtraction = {};
  const missionsByTheater = {};
  const allMissionSlugs = [];

  for (const mission of A2A_MISSIONS) {
    if (!mission?.slug) continue;

    const insertionCode = (mission.insertion_airport || "").toUpperCase();
    const extractionCode = (mission.extraction_airport || "").toUpperCase();
    const theaterSlug = (mission.theater || "").toLowerCase();

    const hydrated = {
      ...mission,
      insertion: airports[insertionCode] || { code: insertionCode },
      extraction: airports[extractionCode] || { code: extractionCode },
      theaterData: destinations[theaterSlug] || null,
    };

    missions[mission.slug] = hydrated;
    allMissionSlugs.push(mission.slug);

    if (insertionCode) {
      if (!missionsByInsertion[insertionCode]) missionsByInsertion[insertionCode] = [];
      missionsByInsertion[insertionCode].push(mission.slug);
    }
    if (extractionCode) {
      if (!missionsByExtraction[extractionCode]) missionsByExtraction[extractionCode] = [];
      missionsByExtraction[extractionCode].push(mission.slug);
    }
    if (theaterSlug) {
      if (!missionsByTheater[theaterSlug]) missionsByTheater[theaterSlug] = [];
      missionsByTheater[theaterSlug].push(mission.slug);
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
    // ── Phase 2: New precomputed indexes ──
    airportsByContinent,
    airportsByCountry,
    routesByCountry,
    clusterByAirport,
    neighborsByAirport,
    regionsByCountry,
    allAirportCodes,
    allRouteSlugs,
    allDestinationSlugs,
    poisByAirport,
    // ── A2A Missions ──
    missions,
    missionsByInsertion,
    missionsByExtraction,
    missionsByTheater,
    allMissionSlugs,
  };
}
