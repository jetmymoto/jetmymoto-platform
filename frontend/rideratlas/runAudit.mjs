import { buildNetworkGraph } from "./src/core/network/buildNetworkGraph.js";
import fs from "fs";

const graph = buildNetworkGraph();

const clusterCount = Object.keys(graph.clusters).length;
const airports = Object.values(graph.airports);
const airportCount = airports.length;

let totalRoutes = 0;
let maxRoutes = 0;

for (const code in graph.routesByAirport) {
    const count = graph.routesByAirport[code].length;
    totalRoutes += count;
    if (count > maxRoutes) maxRoutes = count;
}

const avgRoutes = airportCount > 0 ? (totalRoutes / airportCount).toFixed(2) : 0;

console.log("GRAPH_STRUCTURE: continent -> cluster -> airport -> routes (Checks out? Need to verify)");
console.log("CLUSTER_COUNT:", clusterCount);
console.log("AVERAGE_ROUTES_PER_AIRPORT:", avgRoutes);
console.log("MAX_ROUTES_PER_AIRPORT:", maxRoutes);

// Analyze risks
const gtContent = fs.readFileSync("src/pages/GlobalTower.jsx", "utf8");
let renderRisk = "LOW";
if (gtContent.includes("flattenedRoutes") || gtContent.includes("cluster.routes.map") || gtContent.includes("GRAPH.routes.map")) {
    renderRisk = "HIGH (GlobalTower maps over flattenedRoutes or GRAPH.routes directly)";
}

const cytoContent = fs.existsSync("src/components/network/GlobalRouteNetwork.jsx") ? fs.readFileSync("src/components/network/GlobalRouteNetwork.jsx", "utf8") : "";
if (cytoContent.includes("Object.values(GRAPH.routes).forEach")) {
    renderRisk += " | HIGH (GlobalRouteNetwork loops over GRAPH.routes directly)";
}

console.log("RENDER_RISK:", renderRisk);

