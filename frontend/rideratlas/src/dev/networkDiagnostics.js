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

  const diagnostics = {
    AIRPORTS: airports.length,
    CONTINENTS: continentCounts,
    CLUSTERS: clusterCounts,
    ROUTES: GENERATED_RIDE_ROUTES.length,
    DESTINATIONS: RIDE_DESTINATIONS.length,
    SEO_PAGES_ESTIMATE:
      GENERATED_RIDE_ROUTES.length +
      RIDE_DESTINATIONS.length +
      airports.length
  }

  console.group("🚀 RiderAtlas Network Diagnostics")

  console.log("✈️ AIRPORTS:", diagnostics.AIRPORTS)
  console.log("🌍 CONTINENTS:", diagnostics.CONTINENTS)
  console.log("🛰 CLUSTERS:", diagnostics.CLUSTERS)
  console.log("🛣 ROUTES:", diagnostics.ROUTES)
  console.log("🏔 DESTINATIONS:", diagnostics.DESTINATIONS)
  console.log("📈 SEO PAGES:", diagnostics.SEO_PAGES_ESTIMATE)

  console.groupEnd()

  return diagnostics
}

window.riderAtlasDiagnostics = runNetworkDiagnostics
