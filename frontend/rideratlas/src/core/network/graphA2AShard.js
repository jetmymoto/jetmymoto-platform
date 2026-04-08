// ─── A2A Graph Shard ────────────────────────────────────────────────────────
// Bridges the coreGraph (missions) and rentalShard (one-way inventory).
//
// Produced indexes (all O(1) on hot path):
//
//   rentalsForCorridor[missionSlug]
//     → [rentalId, ...] — rentals at the insertion hub whose dropoff_airports
//       includes the extraction hub. "Hardware-validated" corridors only.
//
//   corridorsByRental[rentalId]
//     → [missionSlug, ...] — reverse map; which missions can this bike serve?
//
//   corridorPriceRadar[extractionIATA]
//     → [{ missionSlug, insertionCode, cheapestRentalId, cheapestPricePerDay }, ...]
//       "Ghost Hub" upsell signal: user lands on a low-inventory extraction hub,
//       the radar shows corridors that end here with available one-way bikes.
// ─────────────────────────────────────────────────────────────────────────────

const normalizeCode = (value) => String(value || "").trim().toUpperCase();

/**
 * Build the A2A shard from the precomputed coreGraph and the loaded rentalShard.
 *
 * @param {object} coreGraph   - Output of buildNetworkGraph()
 * @param {object} rentalShard - Output of buildGraphRentalShard() (the rentals shard)
 * @returns {{ rentalsForCorridor, corridorsByRental, corridorPriceRadar }}
 */
export function buildA2AShard(coreGraph, rentalShard) {
  const missions = coreGraph?.missions ?? {};
  const rentals = rentalShard?.rentals ?? {};
  const rentalsByAirport =
    rentalShard?.rentalIndexes?.rentalsByAirport ?? {};

  const rentalsForCorridor = {};   // missionSlug → [rentalId]
  const corridorsByRental = {};    // rentalId    → [missionSlug]
  const corridorPriceRadar = {};   // extractionIATA → [CorridorRadarEntry]

  for (const [slug, mission] of Object.entries(missions)) {
    const insertionCode = normalizeCode(mission.insertion_airport);
    const extractionCode = normalizeCode(mission.extraction_airport);

    if (!insertionCode || !extractionCode) continue;

    const candidateIds = rentalsByAirport[insertionCode] ?? [];

    // Hardware filter: must be one-way enabled AND list the extraction hub
    const qualifying = candidateIds.filter((rentalId) => {
      const r = rentals[rentalId];
      if (!r?.one_way_enabled) return false;
      if (!Array.isArray(r.dropoff_airports)) return false;
      return r.dropoff_airports.some(
        (code) => normalizeCode(code) === extractionCode
      );
    });

    rentalsForCorridor[slug] = qualifying;

    // Reverse index
    for (const rentalId of qualifying) {
      if (!corridorsByRental[rentalId]) corridorsByRental[rentalId] = [];
      corridorsByRental[rentalId].push(slug);
    }

    // Corridor Price Radar entry (only corridors with at least one qualifying rental)
    if (qualifying.length > 0) {
      const cheapestEntry = qualifying.reduce(
        (best, rentalId) => {
          const price =
            rentals[rentalId]?.price_day ??
            rentals[rentalId]?.pricing?.pricePerDay ??
            Infinity;
          return price < best.price
            ? { rentalId, price }
            : best;
        },
        { rentalId: null, price: Infinity }
      );

      if (!corridorPriceRadar[extractionCode]) {
        corridorPriceRadar[extractionCode] = [];
      }
      corridorPriceRadar[extractionCode].push({
        missionSlug: slug,
        insertionCode,
        cheapestRentalId: cheapestEntry.rentalId,
        cheapestPricePerDay: cheapestEntry.price === Infinity ? null : cheapestEntry.price,
        currency: cheapestEntry.rentalId
          ? (rentals[cheapestEntry.rentalId]?.currency ?? null)
          : null,
      });
    }
  }

  return {
    rentalsForCorridor,
    corridorsByRental,
    corridorPriceRadar,
  };
}

/**
 * Factory for the shard runtime loader.
 * Accepts the already-built coreGraph singleton to avoid a redundant rebuild.
 * Mirrors the pattern used by createGraphRentalShardLoader.
 *
 * @param {object} coreGraph - The singleton graph from networkGraph.js
 * @returns {() => Promise<ReturnType<buildA2AShard>>}
 */
export function createGraphA2AShardLoader(coreGraph) {
  return async function loadGraphA2AShard() {
    const { buildRentalGraph } = await import("./buildRentalGraph.js");
    const { buildGraphRentalShard } = await import("./graphRentalShard.js");

    const rentalShard = buildGraphRentalShard(buildRentalGraph());

    return buildA2AShard(coreGraph, rentalShard);
  };
}
