import { GRAPH } from "@/core/network/networkGraph";
import { missions } from "@/data/missions";

function firstKey(record) {
  return Object.keys(record || {})[0] || null;
}

function firstIndexedValue(indexRecord) {
  for (const value of Object.values(indexRecord || {})) {
    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }
  }

  return null;
}

export function getFeaturedRouteSlug() {
  return firstIndexedValue(GRAPH.routesByAirport) || firstKey(GRAPH.routes);
}

export function getFeaturedDestinationSlug() {
  const featuredRoute = GRAPH.routes?.[getFeaturedRouteSlug()];
  return featuredRoute?.destination?.slug || firstKey(GRAPH.destinations);
}

export function getFeaturedRentalAirportCode() {
  return (
    firstKey(GRAPH.rentalsByAirport) ||
    GRAPH.routes?.[getFeaturedRouteSlug()]?.airport?.code ||
    firstKey(GRAPH.airports)
  );
}

export function getFeaturedPoiSlug() {
  const featuredDestination = getFeaturedDestinationSlug();
  return (
    GRAPH.poisByDestination?.[featuredDestination]?.[0] ||
    firstKey(GRAPH.pois)
  );
}

export function getFeaturedMissionId() {
  return missions[0]?.id || null;
}

export function getCanonicalPaths() {
  const routeSlug = getFeaturedRouteSlug();
  const destinationSlug = getFeaturedDestinationSlug();
  const rentalAirportCode = getFeaturedRentalAirportCode();
  const poiSlug = getFeaturedPoiSlug();
  const missionId = getFeaturedMissionId();

  return {
    airports: "/airports",
    route: routeSlug ? `/route/${routeSlug}` : "/airports",
    destination: destinationSlug ? `/destination/${destinationSlug}` : "/airports",
    rentals: rentalAirportCode
      ? `/airport/${rentalAirportCode.toLowerCase()}?mode=rent`
      : "/airports",
    poi: poiSlug ? `/poi/${poiSlug}` : "/airports",
    mission: missionId ? `/mission/${missionId}` : "/airports",
    logistics: "/moto-airlift",
  };
}
