import { buildNetworkGraph } from "./src/core/network/buildNetworkGraph.js";

const GRAPH = buildNetworkGraph();
console.log("CLUSTER_COUNT:", Object.keys(GRAPH.clusters).length);

let totalRoutes = 0;
let maxRoutes = 0;
let airportCount = Object.keys(GRAPH.routesByAirport).length;

for (const [airportCode, routes] of Object.entries(GRAPH.routesByAirport)) {
  totalRoutes += routes.length;
  if (routes.length > maxRoutes) maxRoutes = routes.length;
}

console.log("ROUTES_IN_GRAPH:", Object.keys(GRAPH.routes).length);
console.log("AVERAGE_ROUTES_PER_AIRPORT:", airportCount > 0 ? (totalRoutes / airportCount).toFixed(2) : 0);
console.log("MAX_ROUTES_PER_AIRPORT:", maxRoutes);
