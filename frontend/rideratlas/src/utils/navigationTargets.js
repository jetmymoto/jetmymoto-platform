import { readGraphSnapshot } from "@/core/network/networkGraph";
import { missions } from "@/data/missions";

function normalizePathSegment(value) {
  return typeof value === "string" && value ? value.toLowerCase() : "";
}

function getContextValue(searchInput) {
  if (typeof searchInput === "string") {
    const normalizedSearch = searchInput.startsWith("?")
      ? searchInput
      : `?${searchInput}`;
    return new URLSearchParams(normalizedSearch).get("ctx") || "";
  }

  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search).get("ctx") || "";
  }

  return "";
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
  const graph = readGraphSnapshot();
  return (
    firstIndexedValue(graph.indexes.routesByAirport) ||
    firstKey(graph.entities.routes)
  );
}

export function getFeaturedDestinationSlug() {
  const graph = readGraphSnapshot();
  const featuredRoute = graph.entities.routes?.[getFeaturedRouteSlug()];
  return featuredRoute?.destination?.slug || firstKey(graph.entities.destinations);
}

export function getFeaturedRentalAirportCode() {
  const graph = readGraphSnapshot();
  return (
    graph.entities.routes?.[getFeaturedRouteSlug()]?.airport?.code ||
    firstKey(graph.entities.airports)
  );
}

export function getFeaturedPoiSlug() {
  const graph = readGraphSnapshot();
  const featuredDestination = getFeaturedDestinationSlug();
  return (
    graph.indexes.poisByDestination?.[featuredDestination]?.[0] ||
    firstKey(graph.entities.pois)
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

export function withBrandContext(path, searchInput) {
  if (!path) {
    return "/";
  }

  const ctx = getContextValue(searchInput);
  if (!ctx || /(^|[?&])ctx=/.test(path)) {
    return path;
  }

  const [pathWithoutHash, hash = ""] = path.split("#");
  const separator = pathWithoutHash.includes("?") ? "&" : "?";
  return `${pathWithoutHash}${separator}ctx=${ctx}${hash ? `#${hash}` : ""}`;
}

export function getCanonicalPaths(searchInput) {
  const routeSlug = getFeaturedRouteSlug();
  const destinationSlug = getFeaturedDestinationSlug();
  const rentalAirportCode = getFeaturedRentalAirportCode();
  const poiSlug = getFeaturedPoiSlug();
  const missionId = getFeaturedMissionId();

  return {
    airports: withBrandContext("/airport", searchInput),
    hub: withBrandContext(getCanonicalAirportPath(rentalAirportCode), searchInput),
    route: withBrandContext(routeSlug ? `/route/${routeSlug}` : "/airport", searchInput),
    destination: withBrandContext(
      destinationSlug ? `/destination/${destinationSlug}` : "/airport",
      searchInput
    ),
    rentals: withBrandContext(
      rentalAirportCode
        ? `${getCanonicalAirportPath(rentalAirportCode)}?mode=rent`
        : "/airport",
      searchInput
    ),
    poi: withBrandContext(poiSlug ? `/poi/${poiSlug}` : "/airport", searchInput),
    mission: withBrandContext(missionId ? `/mission/${missionId}` : "/airport", searchInput),
    logistics: withBrandContext("/moto-airlift", searchInput),
  };
}
