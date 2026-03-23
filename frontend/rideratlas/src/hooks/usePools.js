// 🔒 HARD LIMIT SAFETY
const MAX_POIS = 50;

let pois = [];

// ONLY use explicit destination-linked POIs
if (Array.isArray(GRAPH.poisByDestination?.[slug])) {
  pois = GRAPH.poisByDestination[slug]
    .slice(0, MAX_POIS)
    .map(normalizePoi);

} else {
  // 🚫 DO NOT TRUST route.pois blindly

  const poiMap = new Map();

  for (const route of routes) {
    const routePois = route.pois;

    // 🔥 CRITICAL GUARD
    if (!Array.isArray(routePois) || routePois.length > 500) {
      // skip suspicious/global datasets
      continue;
    }

    for (const poi of routePois) {
      if (!poi) continue;

      // 🔒 STRICT MATCH ONLY
      if (poi.destinationSlug !== slug) continue;

      const key = poi.slug || poi.name;
      if (!key) continue;

      if (!poiMap.has(key)) {
        poiMap.set(key, normalizePoi(poi));
      }

      // 🚀 EARLY EXIT (performance)
      if (poiMap.size >= MAX_POIS) break;
    }

    if (poiMap.size >= MAX_POIS) break;
  }

  pois = Array.from(poiMap.values());
}