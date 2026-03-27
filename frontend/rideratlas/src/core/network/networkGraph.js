import { buildNetworkGraph } from "./buildNetworkGraph";
import { runGraphHealthCheck } from "./graphHealthCheck";
import { buildRentalGraph } from "./buildRentalGraph";
import { INTENT_SIGNALS } from "../patriot/data/intentSignals.js";
import { createGraphShardRuntime } from "./graphShardRuntime.js";
import {
  GRAPH_SHARD_PUBLIC_CONTRACT,
} from "./graphShards.contract.js";
import { buildOverlayIndexOnly } from "./graphOverlayIndex.js";
import { createGraphRentalShardLoader } from "./graphRentalShard.js";

function validateGraph(graph) {
  if (!graph.routesByAirport) {
    throw new Error("GRAPH VALIDATION FAILED: routesByAirport missing");
  }

  if (!graph.routesByDestination) {
    throw new Error("GRAPH VALIDATION FAILED: routesByDestination missing");
  }

  if (!graph.clusters) {
    throw new Error("GRAPH VALIDATION FAILED: clusters missing");
  }

  if (Object.keys(graph.routes || {}).length === 0) {
    console.warn("GRAPH VALIDATION WARNING: No routes found in graph");
  }

  return graph;
}

// ── Migration assertion helper (temporary — remove in Phase 4) ──
export function assertIndex(path, value) {
  if (value === undefined || value === null) {
    console.warn(`[GRAPH INDEX MISS]: ${path}`);
  }
  return value;
}

const coreGraph = validateGraph(buildNetworkGraph());
const rentalGraph = buildRentalGraph();

const GRAPH_SHARD_LOADERS = {
  // First Wave 2 slice: optional heavy POI details map loaded on demand.
  poiDetails: async () => {
    const module = await import("@/features/poi/poiFiltered.json");
    return module.default || null;
  },
};

const graphShardRuntime = createGraphShardRuntime(GRAPH_SHARD_LOADERS);

export async function loadGraphShard(name) {
  return graphShardRuntime.load(name);
}

export function readGraphShard(name) {
  return graphShardRuntime.read(name);
}

export function getGraphShardStatus(name) {
  return graphShardRuntime.status(name);
}

// Phase 1: Merge and alias — old flat paths stay, new canonical paths added
const merged = { ...coreGraph, ...rentalGraph };

// ── Overlay shard: lazy payload, eager indexes ──
// Heavy overlay enrichment (renderData + rental formatters) loads async.
// Light indexes stay in sync path for instant URL → ID resolution.
graphShardRuntime.register("overlays", async () => {
  const { buildGraphOverlayShard } = await import("./graphOverlayShard.js");
  return buildGraphOverlayShard(merged, INTENT_SIGNALS);
});
graphShardRuntime.register("rentals", createGraphRentalShardLoader(merged));

// ── Patriot pSEO indexes (light — no rental formatters) ──
const {
  rawPatriotOverlays,
  overlayIndexes,
  overlayRejections,
  publishedOverlayUrls,
} = buildOverlayIndexOnly(merged, INTENT_SIGNALS);

export const GRAPH = {
  // ── Legacy flat access (KEEP until Phase 4) ──
  ...merged,

  // ── Patriot pSEO overlays (raw — no renderData, deprecated) ──
  patriotOverlays: rawPatriotOverlays,
  publishedOverlayUrls,
  overlayRejections,

  // ── Additive Wave 2 shard runtime (non-breaking) ──
  shardMeta: {
    available: graphShardRuntime.keys(),
    contract: {
      ...GRAPH_SHARD_PUBLIC_CONTRACT,
      registered: graphShardRuntime.keys(),
    },
    referenceImplementation: GRAPH_SHARD_PUBLIC_CONTRACT.referenceImplementation,
    invariants: GRAPH_SHARD_PUBLIC_CONTRACT.invariants,
  },

  // ── New canonical entity stores ──
  entities: {
    airports:     merged.airports,
    routes:       merged.routes,
    rentals:      merged.rentals,
    destinations: merged.destinations,
    operators:    merged.operators,
    pois:         merged.pois,
  },

  // ── New canonical indexes ──
  indexes: {
    routesByAirport:      merged.routesByAirport,
    routesByDestination:  merged.routesByDestination,
    rentalsByAirport:     merged.rentalsByAirport,
    rentalsByOperator:    merged.rentalsByOperator,
    rentalsByType:        merged.rentalsByType,
    rentalsByDestination: merged.rentalsByDestination,
    airportsBySlug:       merged.airportsBySlug,
    destinationsByRegion: merged.destinationsByRegion,
    poisByDestination:    merged.poisByDestination,
    // Phase 2: New precomputed indexes
    airportsByContinent:  merged.airportsByContinent,
    airportsByCountry:    merged.airportsByCountry,
    routesByCountry:      merged.routesByCountry,
    clusterByAirport:     merged.clusterByAirport,
    neighborsByAirport:   merged.neighborsByAirport,
    regionsByCountry:     merged.regionsByCountry,
    allAirportCodes:      merged.allAirportCodes,
    allRouteSlugs:        merged.allRouteSlugs,
    allDestinationSlugs:  merged.allDestinationSlugs,
    // Patriot overlay indexes
    overlayIdByPath:         overlayIndexes.overlayIdByPath,
    overlayIdsByAirport:     overlayIndexes.overlayIdsByAirport,
    overlayIdsByRental:      overlayIndexes.overlayIdsByRental,
    overlayIdsByRoute:       overlayIndexes.overlayIdsByRoute,
    overlayIdsByDestination: overlayIndexes.overlayIdsByDestination,
    overlayIdsByOverlayType: overlayIndexes.overlayIdsByOverlayType,
    overlayIdsByIntentType:  overlayIndexes.overlayIdsByIntentType,
  },
};

// Run the diagnostic health check
runGraphHealthCheck(GRAPH);

// ── DEV deprecation warning for direct GRAPH.patriotOverlays access ──
if (import.meta.env.DEV) {
  const _rawOverlays = GRAPH.patriotOverlays;
  let _warnedOnce = false;
  Object.defineProperty(GRAPH, "patriotOverlays", {
    get() {
      if (!_warnedOnce) {
        console.warn(
          "[DEPRECATED] GRAPH.patriotOverlays is deprecated. Use readGraphShard('overlays') instead."
        );
        _warnedOnce = true;
      }
      return _rawOverlays;
    },
    configurable: true,
  });
}
