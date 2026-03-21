import { buildNetworkGraph } from "./buildNetworkGraph";
import { runGraphHealthCheck } from "./graphHealthCheck";

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

export const GRAPH = validateGraph(buildNetworkGraph());

// Run the diagnostic health check
runGraphHealthCheck(GRAPH);
