function normalizePathSegment(value) {
  return typeof value === "string" && value ? value.toLowerCase() : "";
}

const FEATURED_TARGETS = Object.freeze({
  airportCode: "MXP",
  routeSlug: "milan-mxp-to-alps",
  destinationSlug: "alps",
  poiSlug: "360",
  missionId: "dolomiti-kings-loop",
});

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
  const routeSlug = FEATURED_TARGETS.routeSlug;
  const destinationSlug = FEATURED_TARGETS.destinationSlug;
  const rentalAirportCode = FEATURED_TARGETS.airportCode;
  const poiSlug = FEATURED_TARGETS.poiSlug;
  const missionId = FEATURED_TARGETS.missionId;

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
