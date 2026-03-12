export const getRoutesByAirport = (graph, airportCode) => {
  return graph.routes.filter(
    r => r.airport.code === airportCode
  );
};

export const getRoutesByRegion = (graph, regionSlug) => {
  return graph.routes.filter(
    r => r.destination.slug === regionSlug
  );
};

export const getAirportsByRegion = (graph, regionSlug) => {
  const airportCodes = graph.edges
    .filter(e => e.to === regionSlug && e.type === "route")
    .map(e => e.from);

  return graph.airports.filter(a =>
    airportCodes.includes(a.code)
  );
};

export const getNeighborAirports = (graph, airportCode) => {
  const airport = graph.airports.find(a => a.code === airportCode);
  if (!airport) return [];

  return graph.airports.filter(
    a => a.country === airport.country && a.code !== airportCode
  );
};

export const getAirportsByCountry = (graph, countryCode) => {
  return graph.airports.filter(
    airport => airport.country === countryCode
  );
};

export const getRegionsByCountry = (graph, countryCode) => {
  const airports = getAirportsByCountry(graph, countryCode);

  const airportCodes = new Set(airports.map(a => a.code));

  const routes = graph.routes.filter(r =>
    airportCodes.has(r.airport.code)
  );

  const regionSlugs = new Set(
    routes.map(r => r.destination.slug)
  );

  return [...regionSlugs];
};

export const getRoutesByCountry = (graph, countryCode) => {
  const airports = getAirportsByCountry(graph, countryCode);

  const airportCodes = new Set(airports.map(a => a.code));

  return graph.routes.filter(r =>
    airportCodes.has(r.airport.code)
  );
};