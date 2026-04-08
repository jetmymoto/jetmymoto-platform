import { buildNetworkGraph } from "./buildNetworkGraph";
import { runGraphHealthCheck } from "./graphHealthCheck";
import { createGraphShardRuntime } from "./graphShardRuntime.js";
import {
  GRAPH_SHARD_PUBLIC_CONTRACT,
} from "./graphShards.contract.js";
import {
  createGraphRentalShardLoader,
  mergeCoreGraphWithRentalShard,
} from "./graphRentalShard.js";
import { createGraphA2AShardLoader } from "./graphA2AShard.js";
import { buildImageGraph } from "../visual/buildImageGraph.js";
import { createPoiFilteredShard } from "@/features/poi/poiFilteredShard";

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
const IMAGE_GRAPH = buildImageGraph();
const poiFilteredShard = createPoiFilteredShard();

const GRAPH_SHARD_LOADERS = {
  poiFiltered: async () => poiFilteredShard,
  poiDetails: async () => poiFilteredShard,
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

export function readGraphSnapshot() {
  return GRAPH_SNAPSHOT;
}

graphShardRuntime.register("rentals", createGraphRentalShardLoader());
graphShardRuntime.register("a2a", createGraphA2AShardLoader(coreGraph));
graphShardRuntime.register("overlays", async () => {
  const rentalShard = await loadGraphShard("rentals");
  const mergedGraph = mergeCoreGraphWithRentalShard(coreGraph, rentalShard);
  const { buildGraphOverlayShard } = await import("./graphOverlayShard.js");
  return buildGraphOverlayShard(mergedGraph);
});

export const GRAPH = {
  // ── Legacy flat access (KEEP until Phase 4) ──
  ...coreGraph,

  // ── Deprecated eager overlay exports ──
  patriotOverlays: {},
  publishedOverlayUrls: [],
  overlayRejections: [],

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
    airports:     coreGraph.airports,
    routes:       coreGraph.routes,
    destinations: coreGraph.destinations,
    pois:         coreGraph.pois,
  },

  // ── New canonical indexes ──
  indexes: {
    routesByAirport:      coreGraph.routesByAirport,
    routesByDestination:  coreGraph.routesByDestination,
    airportsBySlug:       coreGraph.airportsBySlug,
    destinationsByRegion: coreGraph.destinationsByRegion,
    poisByDestination:    coreGraph.poisByDestination,
    poisByAirport:        coreGraph.poisByAirport,
    // Phase 2: New precomputed indexes
    airportsByContinent:  coreGraph.airportsByContinent,
    airportsByCountry:    coreGraph.airportsByCountry,
    routesByCountry:      coreGraph.routesByCountry,
    clusterByAirport:     coreGraph.clusterByAirport,
    neighborsByAirport:   coreGraph.neighborsByAirport,
    regionsByCountry:     coreGraph.regionsByCountry,
    allAirportCodes:      coreGraph.allAirportCodes,
    allRouteSlugs:        coreGraph.allRouteSlugs,
    allDestinationSlugs:  coreGraph.allDestinationSlugs,
    // ── A2A Mission indexes (Phase 3) ──
    missionsByInsertion:     coreGraph.missionsByInsertion,
    missionsByExtraction:    coreGraph.missionsByExtraction,
    missionsByTheater:       coreGraph.missionsByTheater,
    missionsByCorridorPair:  coreGraph.missionsByCorridorPair,
    missionsByContinent:     coreGraph.missionsByContinent,
    allMissionSlugs:         coreGraph.allMissionSlugs,
  },

  // ── Image Graph (visual brain) ──
  imageGraph: IMAGE_GRAPH,
};

const GRAPH_SNAPSHOT = {
  entities: {
    airports: coreGraph.airports,
    routes: coreGraph.routes,
    destinations: coreGraph.destinations,
    pois: coreGraph.pois,
    clusters: coreGraph.clusters,
  },
  indexes: GRAPH.indexes,
};

// Run the diagnostic health check
runGraphHealthCheck(GRAPH);

function defineDeprecatedGraphField(key, fallbackValue, message) {
  let warned = false;

  Object.defineProperty(GRAPH, key, {
    get() {
      if (import.meta.env.DEV && !warned) {
        console.warn(message);
        warned = true;
      }

      return fallbackValue;
    },
    configurable: true,
  });
}

defineDeprecatedGraphField(
  "patriotOverlays",
  {},
  "[DEPRECATED] GRAPH.patriotOverlays is deprecated. Use readGraphShard('overlays') instead."
);
