import { buildNetworkGraph } from "./src/core/network/buildNetworkGraph.js";

const GRAPH = buildNetworkGraph();

let missingRoutes = 0;
let missingDestinations = 0;
let brokenLinks = 0;
let workingAirports = 0;

const airports = Object.keys(GRAPH.airports);
console.log("Airports Tested:", airports.length);

for (const code of airports) {
    workingAirports++;
    
    // Simulate loading airport
    const airport = GRAPH.airports[code];
    const routeSlugs = GRAPH.routesByAirport[code] || [];
    
    for (const slug of routeSlugs) {
        const route = GRAPH.routes[slug];
        if (!route) {
            console.log(`[Error] Missing route ${slug} for airport ${code}`);
            missingRoutes++;
            brokenLinks++;
        } else {
            const dest = route.destination;
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
