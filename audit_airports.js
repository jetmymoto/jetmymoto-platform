import { buildNetworkGraph } from "./frontend/rideratlas/src/core/network/buildNetworkGraph.js";

const GRAPH = buildNetworkGraph();

let missingRoutes = 0;
let missingDestinations = 0;
let brokenLinks = 0;
let workingAirports = 0;

console.log("Airports Tested:", Object.keys(GRAPH.airports).length);

for (const code of Object.keys(GRAPH.airports)) {
    workingAirports++;
    
    // Simulate loading airport
    const airport = GRAPH.airports[code];
    const routeSlugs = GRAPH.routesByAirport[code] || [];
    
    for (const slug of routeSlugs) {
        if (!GRAPH.routes[slug]) {
            console.log(`[Error] Missing route ${slug} for airport ${code}`);
            missingRoutes++;
            brokenLinks++;
        } else {
            const dest = GRAPH.routes[slug].destination;
            if (dest && dest.slug && !GRAPH.destinations[dest.slug]) {
                console.log(`[Error] Missing destination ${dest.slug} for route ${slug}`);
                missingDestinations++;
                brokenLinks++;
            }
        }
    }
}

console.log({
    workingAirports,
    missingRoutes,
    missingDestinations,
    brokenLinks
});
