import { GRAPH } from "@/core/network/networkGraph";
import { missions } from "@/data/missions";

function normalizePathSegment(value) {
  return typeof value === "string" && value ? value.toLowerCase() : "";
}

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

export function getCanonicalAirportPath(airportCode) {
  const code = normalizePathSegment(airportCode);
  return code ? `/airport/${code}` : "/airport";
}

export function getCanonicalAirportCountryPath(country) {
  const countrySlug = normalizePathSegment(country);
  return countrySlug ? `/airport/country/${countrySlug}` : "/airport";
}

export function getCanonicalAirportContinentPath(continent) {
  const continentSlug = normalizePathSegment(continent);
  return continentSlug ? `/airport/continent/${continentSlug}` : "/airport";
}

export function getCanonicalPaths() {
  const routeSlug = getFeaturedRouteSlug();
  const destinationSlug = getFeaturedDestinationSlug();
  const rentalAirportCode = getFeaturedRentalAirportCode();
  const poiSlug = getFeaturedPoiSlug();
  const missionId = getFeaturedMissionId();

  return {
    airports: "/airport",
    hub: getCanonicalAirportPath(rentalAirportCode),
    route: routeSlug ? `/route/${routeSlug}` : "/airport",
    destination: destinationSlug ? `/destination/${destinationSlug}` : "/airport",
    rentals: rentalAirportCode
      ? `${getCanonicalAirportPath(rentalAirportCode)}?mode=rent`
      : "/airport",
    poi: poiSlug ? `/poi/${poiSlug}` : "/airport",
    mission: missionId ? `/mission/${missionId}` : "/airport",
    logistics: "/moto-airlift",
  };
}
