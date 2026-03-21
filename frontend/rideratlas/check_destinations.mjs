import { DESTINATION_REGIONS } from "./src/features/routes/destinationRegions.js";
import { RIDE_DESTINATIONS } from "./src/features/routes/data/rideDestinations.js";

const allSlugs = RIDE_DESTINATIONS.map(d => d.slug);
for (const region in DESTINATION_REGIONS) {
  for (const slug of DESTINATION_REGIONS[region]) {
    if (!allSlugs.includes(slug)) {
      console.log('Missing slug in RIDE_DESTINATIONS:', slug);
    }
  }
}
