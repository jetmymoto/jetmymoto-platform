import { AIRPORT_INDEX } from "../features/airport/network/airportIndex.js"
import { continentIndex } from "../features/airport/network/continentIndex.js"
import { GENERATED_RIDE_ROUTES } from "../features/routes/data/generatedRideRoutes.js"
import { RIDE_DESTINATIONS } from "../features/routes/data/rideDestinations.js"

export function runNetworkDiagnostics() {

  const airports = Object.values(AIRPORT_INDEX)

  const continentCounts = {}
  airports.forEach(a => {
    continentCounts[a.continent] = (continentCounts[a.continent] || 0) + 1
  })

  const clusterCounts = {}
  airports.forEach(a => {
    clusterCounts[a.region] = (clusterCounts[a.region] || 0) + 1
  })

  const routesByAirport = {}
  GENERATED_RIDE_ROUTES.forEach(route => {
    const origin = route.origin || route.airport?.code
    if (origin) {
      routesByAirport[origin] = (routesByAirport[origin] || 0) + 1
    }
  })

  const topHubs = Object.entries(routesByAirport)
    .map(([airport, count]) => ({ airport, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  let totalRoutes = 0;
  let maxRoutes = 0;
  const activeAirports = Object.values(routesByAirport).length;
  Object.values(routesByAirport).forEach(count => {
    totalRoutes += count;
    if (count > maxRoutes) maxRoutes = count;
  });

  const diagnostics = {
    AIRPORTS: airports.length,
    CONTINENTS: continentCounts,
    CLUSTERS: clusterCounts,
    CLUSTER_COUNT: Object.keys(clusterCounts).length,
    ROUTES: GENERATED_RIDE_ROUTES.length,
    DESTINATIONS: Object.keys(RIDE_DESTINATIONS).length,
    TOP_HUBS: topHubs,
    AVERAGE_ROUTES_PER_AIRPORT: activeAirports > 0 ? (totalRoutes / activeAirports).toFixed(2) : 0,
    MAX_ROUTES_PER_AIRPORT: maxRoutes,
    SEO_PAGES_ESTIMATE:
      GENERATED_RIDE_ROUTES.length +
      Object.keys(RIDE_DESTINATIONS).length +
      airports.length
  }

  console.group("🚀 RiderAtlas Network Diagnostics")

  console.log("✈️ AIRPORTS:", diagnostics.AIRPORTS)
  console.log("🌍 CONTINENTS:", diagnostics.CONTINENTS)
  console.log("🛰 CLUSTERS:", diagnostics.CLUSTERS)
  console.log("🛣 ROUTES:", diagnostics.ROUTES)
  console.log("🏔 DESTINATIONS:", diagnostics.DESTINATIONS)
  console.log("🏆 TOP HUBS:", diagnostics.TOP_HUBS.map(h => `${h.airport} — ${h.count} routes`).join(', '))
  console.log("📈 SEO PAGES:", diagnostics.SEO_PAGES_ESTIMATE)

  console.groupEnd()

  return diagnostics
}

if (typeof window !== 'undefined') {
  window.riderAtlasDiagnostics = runNetworkDiagnostics
} else {
  runNetworkDiagnostics()
}
