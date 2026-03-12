import { Helmet } from "react-helmet";
import { useParams, Link } from "react-router-dom"

import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex"
import { RIDE_DESTINATIONS } from "@/features/routes/data/rideDestinations";
import rideRegions from "@/features/rides/rideRegions.json";

export default function RideDestinationPage() {

  const { destinationSlug } = useParams()

  const destination = RIDE_DESTINATIONS.find(
    d => d.slug === destinationSlug
  )

  if (!destination) {
    return <div>Destination not found</div>
  }

  const airports = Object.values(AIRPORT_INDEX).filter(a =>
    destination.countries.includes(a.country)
  )

  const region = rideRegions[destinationSlug];

  return (
    <div className="container mx-auto py-12">
      <Helmet>
        <title>{destination.name} Motorcycle Riding Region | RiderAtlas</title>
        <meta name="description" content={`Explore the best motorcycle roads, points of interest, and logistical hubs for the ${destination.name} region.`} />
        <link rel="canonical" href={`https://jetmymoto.com/destination/${destination.slug}`} />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">
        {destination.name} Motorcycle Riding Region
      </h1>

      <p className="mb-8 text-lg text-zinc-400">
        An overview of the best motorcycle roads, points of interest, and logistical hubs for the {destination.name} region.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">Nearby Airports</h2>
          <ul className="space-y-3">
            {airports.map(a => (
              <li key={a.code}>
                <Link
                  to={`/route/${a.slug}-to-${destination.slug}`}
                  className="text-blue-500 hover:underline"
                >
                  Ride from {a.city} ({a.code})
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">Points of Interest</h2>
          {region && (
            <ul className="space-y-2">
              {region.pois.slice(0, 10).map(poi => (
                <li key={poi.slug}>
                  <Link to={`/poi/${poi.slug}`} className="text-blue-500 hover:underline">
                    {poi.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">Best Roads</h2>
          <ul className="space-y-2">
            <li className="text-zinc-400">Data for best roads not available yet.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
