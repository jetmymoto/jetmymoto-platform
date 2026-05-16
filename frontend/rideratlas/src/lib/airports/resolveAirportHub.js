/**
 * Resolve an airport object from the network graph with fallback handling.
 * 
 * @param {string} code - The IATA code or slug to resolve
 * @param {object} graph - The network graph (Snapshot or full GRAPH)
 * @returns {object|null}
 */
export function resolveAirportHub(code, graph) {
  if (!code || !graph) return null;
  const normalizedCode = String(code).toUpperCase().trim();
  
  // 1. Direct Lookup (V2 entities)
  if (graph.entities?.airports?.[normalizedCode]) {
    return graph.entities.airports[normalizedCode];
  }
  
  // 2. Direct Lookup (Legacy flat)
  if (graph.airports?.[normalizedCode]) {
    return graph.airports[normalizedCode];
  }

  // 3. Slug Lookup
  const slug = String(code).toLowerCase().trim();
  if (graph.indexes?.airportsBySlug?.[slug]) {
    return graph.indexes.airportsBySlug[slug];
  }
  
  if (graph.airportsBySlug?.[slug]) {
    return graph.airportsBySlug[slug];
  }

  return null;
}

/**
 * Deterministic title formatting for Airport Hubs.
 * 
 * @param {object} airport 
 * @param {string} airportCode 
 * @returns {string}
 */
export function formatAirportHubTitle(airport, airportCode) {
  const code = airport?.code || airportCode;
  
  const displayCity =
    airport?.city ||
    airport?.hubCity ||
    airport?.destinationCity ||
    code;

  const displayName =
    airport?.displayName ||
    airport?.name ||
    airport?.airportName ||
    (displayCity && displayCity !== code ? `${displayCity} Airport` : code);

  // If we have a city and it's not the code, prefer the city name for the hero title
  if (displayCity && displayCity !== code) {
    return displayCity;
  }

  return displayName || code || "Unknown Hub";
}

/**
 * Safely appends "Hub" suffix without duplication.
 */
export function withHubSuffix(label) {
  if (!label) return null;
  const trimmed = String(label).trim();
  if (!trimmed) return null;
  
  // Prevent double "Hub Hub"
  return /hub$/i.test(trimmed) ? trimmed : `${trimmed} Hub`;
}

/**
 * Deterministic eyebrow formatting for Airport Hubs.
 * 
 * @param {object} airport 
 * @param {string} airportCode 
 * @returns {string}
 */
export function formatAirportHubEyebrow(airport, airportCode) {
  const city = airport?.city || airport?.hubCity || "";
  const code = airport?.code || airportCode || "";
  
  if (city && code) {
    return withHubSuffix(`${city} ${code}`);
  }
  
  if (city) return withHubSuffix(city);
  
  const name = airport?.displayName || airport?.name || airport?.airportName;
  if (name) return withHubSuffix(name);
  
  if (code) return withHubSuffix(code);
  
  return "Airport Hub Data Pending";
}
