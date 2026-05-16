import { useMemo } from "react";
import { readGraphSnapshot, readGraphShard } from "@/core/network/networkGraph";
import { resolveAirportHub } from "@/lib/airports/resolveAirportHub";

/**
 * Minimal Hook to resolve the Airport Experience payload.
 * Binds fields needed for top-of-page decision context.
 */
export function useAirportExperience(airportCode) {
  const graph = readGraphSnapshot();
  const rentalShard = readGraphShard("rentals");

  return useMemo(() => {
    if (!airportCode) return null;

    const code = String(airportCode).toUpperCase().trim();
    
    // Use defensive helper for airport resolution
    const airport = resolveAirportHub(code, graph);

    // 1. Calculate Mission Count
    const missions = graph.indexes?.missionsByInsertion?.[code] || [];
    const missionCount = missions.length;

    // 2. Calculate Rental Availability
    const rentals = rentalShard?.rentalIndexes?.rentalsByAirport?.[code] || [];
    const rentalCount = rentals.length;

    const hasRideLocal = missionCount > 0 || rentalCount > 0;

    // 3. Network Intelligence Calculator
    const missionData = (missions || [])
      .map((slug) => graph.entities?.missions?.[slug] || graph.missions?.[slug])
      .filter(Boolean);

    const extractionCounts = missionData.reduce((acc, m) => {
      const ext = m.extraction_airport || m.extraction?.code;
      if (ext) acc[ext] = (acc[ext] || 0) + 1;
      return acc;
    }, {});

    const sortedExtractions = Object.entries(extractionCounts).sort(
      (a, b) => b[1] - a[1]
    );

    const mostCommonFinish = sortedExtractions[0] ? sortedExtractions[0][0] : null;

    // Fastest Regional Access
    const airportRoutes = graph.indexes?.routesByAirport?.[code] || [];
    const routeData = airportRoutes
      .map((slug) => graph.entities?.routes?.[slug] || graph.routes?.[slug])
      .filter(Boolean);
    const fastestRoute = routeData.sort(
      (a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999)
    )[0];

    // Killer Metric (Heuristic + Manual overrides)
    let killerMetric = null;
    if (code === "ATH") {
      killerMetric =
        "From ATH, riders can reach 3 countries within 48 hours without returning to Athens.";
    } else if (code === "MXP") {
      killerMetric =
        "MXP provides immediate 1,500m+ altitude access within 90 minutes of insertion.";
    } else if (code === "MUC") {
      killerMetric =
        "MUC is the primary precision node for northbound Alpine extraction from Italy and the Balkans.";
    } else if (missionCount > 3) {
      killerMetric = `${airport?.city || code} maintains a high-density mission corridor network with ${missionCount} active deployments.`;
    }

    const network_intel = {
      most_common_finish: {
        value: mostCommonFinish,
        source: mostCommonFinish ? "computed" : "fallback",
        confidence:
          missionCount >= 3 ? "high" : missionCount > 0 ? "medium" : "low",
      },
      fastest_access: {
        value: fastestRoute?.destination?.name || fastestRoute?.destination || null,
        source: fastestRoute ? "computed" : "fallback",
        confidence: fastestRoute ? "high" : "low",
      },
      killer_metric: {
        value: killerMetric,
        source: killerMetric ? "manual" : "fallback",
        confidence: killerMetric ? "high" : "low",
      },
      mission_density: {
        value: missionCount > 5 ? "high" : missionCount > 2 ? "medium" : "low",
        source: "computed",
        confidence: "high",
      },
    };

    // 4. Operating Standard (Hub Operating Standard)
    const operatingStandard =
      airport?.operational_intel?.logistics_standard || null;

    return {
      airport: {
        code: code,
        name: airport?.name || airport?.displayName || airport?.city || code,
        city: airport?.city,
        region: airport?.region,
      },
      ride_local: {
        available: hasRideLocal,
        mission_count: missionCount,
        rental_count: rentalCount,
      },
      bring_your_own: {
        available: true,
      },
      network_intel,
      operating_standard: operatingStandard,
      summary: {
        default_path: "bring_your_own",
        bias: {
          ride_local: hasRideLocal ? "strong" : "none",
          bring_your_own: "strong",
        },
      },
    };
  }, [airportCode, graph, rentalShard]);
}


