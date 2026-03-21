import { buildNetworkGraph } from "./buildNetworkGraph";
import { runGraphHealthCheck } from "./graphHealthCheck";
import { buildRentalGraph } from "./buildRentalGraph";

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

const coreGraph = validateGraph(buildNetworkGraph());
const rentalGraph = buildRentalGraph();

export const GRAPH = {
  ...coreGraph,
  ...rentalGraph
};

// Run the diagnostic health check
runGraphHealthCheck(GRAPH);
