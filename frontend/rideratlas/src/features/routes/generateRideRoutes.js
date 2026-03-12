import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";
import { DESTINATION_REGIONS } from "./destinationRegions";

export function generateRideRoutes() {
  const airports = Object.values(AIRPORT_INDEX);

  const routes = airports.flatMap(airport => {
    const allowedDestinations = DESTINATION_REGIONS[airport.region] || []

    return allowedDestinations.map(dest => ({
      slug: `${airport.slug}-to-${dest}`,
      airport: airport.code,
      destination: dest
    }))
  })

  console.log("AIRPORTS:", airports.length)
  console.log("DESTINATIONS:", Object.values(DESTINATION_REGIONS).flat().length)
  console.log("ROUTES:", routes.length)

  return routes;
}
