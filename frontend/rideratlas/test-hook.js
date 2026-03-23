const { GRAPH } = require('./src/core/network/networkGraph.js');

function getRouteSlugsForDestination(slug) {
  const indexed = GRAPH.routesByDestination?.[slug];
  if (Array.isArray(indexed) && indexed.length > 0) {
    return indexed;
  }
  return Object.keys(GRAPH.routes || {}).filter((routeSlug) => {
    const route = GRAPH.routes?.[routeSlug];
    if (!route) return false;
    return (
      route.destination?.slug === slug ||
      route.destinationSlug === slug ||
      route.destination === slug ||
      route.destination?.id === slug
    );
  });
}

console.log('Testing alps destination...');
const rawDestination = GRAPH.destinations?.['alps'];
console.log('rawDestination:', !!rawDestination, rawDestination?.name);

const routeSlugs = getRouteSlugsForDestination('alps');
console.log('routeSlugs found:', routeSlugs.length);

const routes = routeSlugs
  .map((routeSlug) => GRAPH.routes?.[routeSlug])
  .filter(Boolean);
console.log('routes found:', routes.length);

const airportCodes = new Set();
routes.forEach(route => {
  if (route.origin?.code) {
    airportCodes.add(route.origin.code);
  }
  if (route.originCode) {
    airportCodes.add(route.originCode);
  }
  if (!route.origin?.code && route.slug) {
    const parts = route.slug.split('-to-');
    if (parts[0]) {
      const code = parts[0].split('-').pop().toUpperCase();
      airportCodes.add(code);
    }
  }
});

console.log('airportCodes found:', Array.from(airportCodes));

const poiMap = new Map();
routes.forEach(route => {
  (route.pois || []).forEach(poi => {
    const key = poi.slug || poi.name;
    if (!key) return;
    if (!poiMap.has(key)) {
      poiMap.set(key, {
        name: poi.name || '',
        elevation: poi.elevation || 'N/A',
        type: poi.type || 'POI',
      });
    }
  });
});

const pois = Array.from(poiMap.values()).slice(0, 50);
console.log('pois found:', pois.length);