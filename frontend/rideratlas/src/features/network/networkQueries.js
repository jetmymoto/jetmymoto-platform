export const getRoutesByAirport = (graph, airportCode) => {
  const routeSlugs = graph.routesByAirport[airportCode] || [];
  return routeSlugs.map(slug => graph.routes[slug]).filter(Boolean);
};

export const getRoutesByRegion = (graph, regionSlug) => {
  const routeSlugs = graph.routesByDestination[regionSlug] || [];
  return routeSlugs.map(slug => graph.routes[slug]).filter(Boolean);
};

export const getAirportsByRegion = (graph, regionSlug) => {
  const routeSlugs = graph.routesByDestination[regionSlug] || [];
  const airportCodes = new Set(
    routeSlugs
      .map(slug => graph.routes[slug])
      .filter(Boolean)
      .map(route => route.airport?.code || route.airport)
  );

  return Array.from(airportCodes)
    .map(code => graph.airports[code])
    .filter(Boolean);
};

export const getNeighborAirports = (graph, airportCode) => {
  const airport = graph.airports[airportCode];
  if (!airport) return [];

  return Object.values(graph.airports).filter(
    a => a.country === airport.country && a.code !== airportCode
  );
};

export const getAirportsByCountry = (graph, countryCode) => {
  return Object.values(graph.airports).filter(
    airport => airport.country === countryCode
  );
};

export const getRegionsByCountry = (graph, countryCode) => {
  const airports = getAirportsByCountry(graph, countryCode);

  const regionSlugs = new Set();
  airports.forEach(airport => {
    const routeSlugs = graph.routesByAirport[airport.code] || [];
    routeSlugs.forEach(slug => {
      const route = graph.routes[slug];
      if (route && route.destination) {
        regionSlugs.add(route.destination.slug || route.destination);
      }
    });
  });

  return Array.from(regionSlugs);
};

export const getRoutesByCountry = (graph, countryCode) => {
  const airports = getAirportsByCountry(graph, countryCode);

  const allRoutes = [];
  airports.forEach(airport => {
    const routeSlugs = graph.routesByAirport[airport.code] || [];
    routeSlugs.forEach(slug => {
      const route = graph.routes[slug];
      if (route) {
        allRoutes.push(route);
      }
    });
  });

  return allRoutes;
};