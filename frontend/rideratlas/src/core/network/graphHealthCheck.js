export function runGraphHealthCheck(graph) {
  let airportsCount = 0;
  let routesCount = 0;
  let clustersCount = 0;
  let destinationsCount = 0;

  let orphanRoutesCount = 0;
  let brokenDestinationsCount = 0;
  
  if (graph.airports) airportsCount = Object.keys(graph.airports).length;
  if (graph.routes) routesCount = Object.keys(graph.routes).length;
  if (graph.clusters) clustersCount = Object.keys(graph.clusters).length;
  if (graph.destinations) destinationsCount = Object.keys(graph.destinations).length;

  // Route Connectivity and Orphans
  const allRoutes = Object.values(graph.routes || {});
  allRoutes.forEach(route => {
    // Determine origin airport code (supporting varying data shapes)
    const originAirportCode = route.originAirportCode || route.airport?.code || route.airport;
    
    // Check if origin airport exists in graph
    if (!originAirportCode || !graph.airports[originAirportCode]) {
      // It might be using a slug or missing completely
      // This is an integrity warning, but for "orphan" we specifically check routesByAirport
    }
    
    // Check for orphan route (not indexed in routesByAirport)
    if (originAirportCode) {
      const indexedRoutes = graph.routesByAirport[originAirportCode] || [];
      if (!indexedRoutes.includes(route.slug)) {
        orphanRoutesCount++;
      }
    } else {
      orphanRoutesCount++; // No airport code means it's not indexed by airport
    }

    // Check for broken destinations
    const destSlug = route.destinationSlug || route.destination?.slug || route.destination;
    if (!destSlug || !graph.destinations[destSlug]) {
      brokenDestinationsCount++;
    }
  });

  // Calculate cluster coverage roughly
  let validClusters = 0;
  Object.values(graph.clusters || {}).forEach(cluster => {
    if (cluster.airports && cluster.airports.length > 0 && cluster.routes && cluster.routes.length > 0) {
      validClusters++;
    }
  });
  const clusterCoverage = clustersCount > 0 ? Math.round((validClusters / clustersCount) * 100) : 0;

  if (import.meta.env.DEV) {
    console.log(`
  Graph Health Report
  ===================
  Airports: ${airportsCount}
  Routes: ${routesCount}
  Clusters: ${clustersCount}
  Destinations: ${destinationsCount}

  Orphan Routes: ${orphanRoutesCount}
  Broken Destinations: ${brokenDestinationsCount}
  Cluster Coverage: ${clusterCoverage}%
  `);
  }
}
