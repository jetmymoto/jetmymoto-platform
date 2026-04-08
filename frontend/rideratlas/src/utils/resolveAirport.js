import { GRAPH } from "@/core/network/networkGraph";
import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";
import { airportConfig } from "@/features/airport/data/airportConfig.generated.js";
import { staticAirports } from "@/features/airport/data/staticAirports";
import { staticAirportsEnriched } from "@/features/airport/data/staticAirportsEnriched";

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeSlug(value) {
  return String(value || "").trim().toLowerCase();
}

// Pre-built reverse index: slug → IATA code
const SLUG_TO_CODE = Object.fromEntries(
  Object.entries(AIRPORT_INDEX).map(([code, entry]) => [
    normalizeSlug(entry.slug),
    code,
  ])
);

function createDefaultArrivalOS(city) {
  return {
    arrivals: [{ label: `${city} Arrivals`, note: "Follow airport signage" }],
    departures: [{ label: `${city} Departures`, note: "Upper terminal level" }],
    baggageClaim: [{ label: "Baggage Claim", note: "Main terminal" }],
    rideshare: [{ label: "Uber / Lyft Pickup", note: "Rideshare zone" }],
    transport: [{ label: "Ground Transport", note: `${city} transit links` }],
  };
}

function buildStaticFallback(code) {
  const airportCode = normalizeCode(code);
  const airportSlug = normalizeSlug(code);

  // Try reverse slug → code first
  const resolvedCode = SLUG_TO_CODE[airportSlug] || airportCode;

  const baseAirport =
    airportConfig.find((a) => {
      return (
        normalizeCode(a.code) === resolvedCode ||
        normalizeSlug(a.slug) === airportSlug ||
        normalizeSlug(a.slug) === resolvedCode.toLowerCase()
      );
    }) || null;

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
      airportSlug,
  };

  if (!merged.arrivalOS) {
    merged.arrivalOS = createDefaultArrivalOS(
      merged.city || merged.name || finalCode
    );
  }

  return merged;
}

/**
 * Resolve an airport from any input format:
 *   - Direct IATA code: "CDG"
 *   - Lowercase IATA: "cdg"
 *   - Compound slug: "paris-cdg"
 *
 * Lookup chain:
 *   1. GRAPH.airports[CODE]          — direct IATA hit
 *   2. GRAPH.airportsBySlug[slug]    — slug index hit
 *   3. SLUG_TO_CODE reverse lookup   — slug → IATA → GRAPH
 *   4. Static fallback               — airportConfig + enriched data
 */
export function resolveAirport(input) {
  if (!input) return null;

  const code = normalizeCode(input);
  const slug = normalizeSlug(input);

  // 1. Direct IATA code
  const byCode = GRAPH.airports?.[code];
  if (byCode) return byCode;

  // 2. Slug index
  const bySlug = GRAPH.airportsBySlug?.[slug];
  if (bySlug) return bySlug;

  // 3. Reverse slug → IATA code → GRAPH
  const reversedCode = SLUG_TO_CODE[slug];
  if (reversedCode) {
    const byReversed = GRAPH.airports?.[reversedCode];
    if (byReversed) return byReversed;
  }

  // 4. Static fallback
  return buildStaticFallback(input);
}
