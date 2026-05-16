import { GRAPH } from "@/core/network/networkGraph";
import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";
import { airportConfig } from "@/features/airport/data/airportConfig.generated.js";
import { staticAirports } from "@/features/airport/data/staticAirports";
import { staticAirportsEnriched } from "@/features/airport/data/staticAirportsEnriched";

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeSlug(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, '-');
}

// Pre-built reverse indexes for fast deterministic lookup
const SLUG_TO_CODE = {};
const NAME_TO_CODE = {};

Object.entries(AIRPORT_INDEX).forEach(([code, entry]) => {
  const iata = normalizeCode(code);
  
  // 1. Index by slug
  if (entry.slug) {
    const fullSlug = normalizeSlug(entry.slug);
    SLUG_TO_CODE[fullSlug] = iata;
    
    // If slug is "city-iata" (e.g. "munich-muc"), also index "city"
    if (fullSlug.includes('-')) {
      const parts = fullSlug.split('-');
      if (parts[parts.length - 1].toUpperCase() === iata) {
        const citySlug = parts.slice(0, -1).join('-');
        SLUG_TO_CODE[citySlug] = iata;
      }
    }
  }
  
  // 2. Index by city
  if (entry.city) {
    NAME_TO_CODE[normalizeSlug(entry.city)] = iata;
  }
  
  // 3. Index by full name
  if (entry.name) {
    NAME_TO_CODE[normalizeSlug(entry.name)] = iata;
  }
});

function createDefaultArrivalOS(city) {
  return {
    arrivals: [{ label: `${city} Arrivals`, note: "Follow airport signage" }],
    departures: [{ label: `${city} Departures`, note: "Upper terminal level" }],
    baggageClaim: [{ label: "Baggage Claim", note: "Main terminal" }],
    rideshare: [{ label: "Uber / Lyft Pickup", note: "Rideshare zone" }],
    transport: [{ label: "Ground Transport", note: `${city} transit links` }],
  };
}

function buildStaticFallback(input) {
  const iataCode = normalizeCode(input);
  const inputSlug = normalizeSlug(input);

  // Try reverse lookup chain
  const resolvedCode = SLUG_TO_CODE[inputSlug] || NAME_TO_CODE[inputSlug] || iataCode;

  const baseAirport =
    airportConfig.find((a) => {
      const aCode = normalizeCode(a.code);
      const aSlug = normalizeSlug(a.slug);
      return (
        aCode === resolvedCode ||
        aSlug === inputSlug ||
        aSlug === resolvedCode.toLowerCase()
      );
    }) || AIRPORT_INDEX[resolvedCode];

  if (!baseAirport) return null;

  const finalCode = normalizeCode(baseAirport.code);
  const staticData = staticAirports?.[finalCode] || {};
  const enrichedData = staticAirportsEnriched?.[finalCode] || {};

  const merged = {
    ...baseAirport,
    ...staticData,
    ...enrichedData,
    code: finalCode,
    airportCode: finalCode,
    iata: finalCode,
    slug:
      normalizeSlug(enrichedData.slug) ||
      normalizeSlug(staticData.slug) ||
      normalizeSlug(baseAirport.slug) ||
      inputSlug,
  };

  if (!merged.arrivalOS) {
    merged.arrivalOS = createDefaultArrivalOS(
      merged.city || merged.name || finalCode
    );
  }

  return merged;
}

/**
 * Resolve an airport from any input format (IATA, slug, or name).
 * Chain of truth:
 *   1. Exact IATA code match in GRAPH
 *   2. Reverse index match (slug or city name)
 *   3. Static fallback
 * 
 * @param {string} input - The identifier to resolve (e.g. "MUC", "munich", "munich-muc")
 * @returns {object|null} The resolved canonical airport object
 */
export function resolveAirport(input) {
  if (!input) return null;

  const iataCode = normalizeCode(input);
  const inputSlug = normalizeSlug(input);

  // 1. Check direct IATA code first (Highest Priority)
  let airport = GRAPH.airports?.[iataCode];
  if (airport) return airport;

  // 2. Check reverse indexes
  const resolvedCode = SLUG_TO_CODE[inputSlug] || NAME_TO_CODE[inputSlug];
  if (resolvedCode) {
    airport = GRAPH.airports?.[resolvedCode];
    if (airport) return airport;
  }

  // 3. Check GRAPH BySlug index
  const bySlug = GRAPH.airportsBySlug?.[inputSlug];
  if (bySlug) return bySlug;

  // 4. Static fallback (Ensures we always return something if it exists in source)
  return buildStaticFallback(input);
}

