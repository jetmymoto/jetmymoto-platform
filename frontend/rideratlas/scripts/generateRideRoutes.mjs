import fs from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

import * as airportPkg from "../src/features/airport/network/airportIndex.js"
import { DESTINATION_REGIONS } from "../src/features/routes/destinationRegions.js"
import { RIDE_DESTINATIONS } from "../src/features/routes/data/rideDestinations.js"

const AIRPORT_INDEX = airportPkg.AIRPORT_INDEX

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, "..", "src", "features", "routes", "data")

function generateRoutes() {
  const airports = Object.values(AIRPORT_INDEX);

  const routes = airports.flatMap(airport => {
    if (!airport.continent) return []
    const allowedDestinations = DESTINATION_REGIONS[airport.continent] || []

    return allowedDestinations.map(destSlug => {
      const destination = RIDE_DESTINATIONS.find(d => d.slug === destSlug)
      return {
        slug: `${airport.slug}-to-${destSlug}`,
        airport: {
            code: airport.code,
            slug: airport.slug,
            city: airport.city,
            country: airport.country,
        },
        destination: {
            slug: destination.slug,
            name: destination.name,
            countries: destination.countries,
        }
      }
    })
  })

  console.log("AIRPORTS:", airports.length)
  console.log("DESTINATIONS:", Object.values(DESTINATION_REGIONS).flat().length)
  console.log("ROUTES:", routes.length)

  // Write the combined routes to a file
  const outputPath = join(OUTPUT_DIR, "generatedRideRoutes.js")
  const fileContent = `export const GENERATED_RIDE_ROUTES = ${JSON.stringify(
    routes,
    null,
    2
  )};
`

  fs.writeFileSync(outputPath, fileContent)
  console.log(
    `✅ Generated ${routes.length} ride routes to ${outputPath}`
  )
}

generateRoutes()
