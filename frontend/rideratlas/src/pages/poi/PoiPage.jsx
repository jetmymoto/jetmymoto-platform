import { useParams, Link } from "react-router-dom"

import { POI_INDEX } from "@/features/poi/poiIndex"
import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";
import { useContext } from "react";
import { NetworkGraphContext } from "@/features/network/NetworkGraphContext";

export default function PoiPage() {

  const { slug } = useParams()

  const poi = POI_INDEX[slug]

  if (!poi) {
    return <div>POI not found</div>
  }

  const airport = AIRPORT_INDEX[poi.nearest_airport]

  const { routes: allRoutes } = useContext(NetworkGraphContext);
  const routes = allRoutes.filter(
    r => r.destination.slug === "dolomites" || r.destination.slug === "alps"
  )

  return (
    <div className="container mx-auto py-12">

      <h1 className="text-3xl font-bold mb-6">
        {poi.name}
      </h1>

      <p className="mb-4">
        {poi.description}
      </p>

      <h2 className="mt-8 text-xl font-semibold">
        Nearest Airport
      </h2>

      <Link
        to={`/airport/${(airport.code || "").toLowerCase()}`}
        className="text-blue-500"
      >
        {airport.city} ({airport.code})
      </Link>

      <h2 className="mt-10 text-xl font-semibold">
        Ride Routes From Nearby Airports
      </h2>

      <ul>
        {routes.slice(0,5).map(r => (
          <li key={r.slug}>
            <Link to={`/route/${r.slug}`} className="text-blue-500">
              Ride from {r.airport.city} to the {r.destination.name}
            </Link>
          </li>
        ))}
      </ul>

    </div>
  )
}
