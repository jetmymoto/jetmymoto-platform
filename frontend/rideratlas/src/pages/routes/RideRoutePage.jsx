import SeoHelmet from '../../components/seo/SeoHelmet'; // Import SeoHelmet
import { useParams, Link } from "react-router-dom";
import { POI_INDEX } from "@/features/poi/poiIndex";
import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";
import { GENERATED_RIDE_ROUTES } from "@/features/routes/data/generatedRideRoutes.js";

export default function RideRoutePage() {

  const { routeSlug } = useParams()
  const route = GENERATED_RIDE_ROUTES.find(r => r.slug === routeSlug);

  if (!route) {
    return <div className="p-20 text-white">Route not found</div>;
  }

  const { airport, destination } = route;

  const routeSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": `${destination.name} Motorcycle Route`,
    "touristType": "Motorcycle",
    "location": destination.countries.join(", ")
  }

  const pois = Object.values(POI_INDEX).filter(
    p => p.region.toLowerCase() === destination.name.toLowerCase()
  )

  return (
    <div className="container mx-auto py-12">
      <SeoHelmet
        title={`Ship Motorcycle from ${airport.city} ${airport.code} to ${destination.name} | JetMyMoto`}
        description={`Ship your motorcycle from ${airport.city} Airport to the ${destination.name} and ride its most legendary roads.`}
        canonicalUrl={`https://jetmymoto.com/route/${route.slug}`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(routeSchema)
        }}
      />

      <h1 className="text-3xl font-bold mb-6">
        Motorcycle Route: {airport.city} ({airport.code}) → {destination.name}
      </h1>

      <p className="mb-4">
        Ship your motorcycle to {airport.city} Airport and ride through the {destination.name}.
      </p>

      <p>
        JetMyMoto provides secure motorcycle air freight to {airport.city} with customs support and logistics assistance.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to={`/airport/${airport.code?.toLowerCase()}`} className="text-blue-500 block p-4 border border-blue-500 rounded hover:bg-blue-500 hover:text-white text-center">
          Back to {airport.city} Airport
        </Link>
        <Link to={`/destination/${destination.slug}`} className="text-blue-500 block p-4 border border-blue-500 rounded hover:bg-blue-500 hover:text-white text-center">
          Explore the {destination.name}
        </Link>
        <Link to={`/destination/${destination.slug}`} className="text-blue-500 block p-4 border border-blue-500 rounded hover:bg-blue-500 hover:text-white text-center">
          Nearby POIs in {destination.name}
        </Link>
        <Link to="/moto-airlift#booking" className="text-blue-500 block p-4 border border-blue-500 rounded hover:bg-blue-500 hover:text-white text-center">
          Ship Motorcycle Here
        </Link>
      </div>

      <h2 className="mt-10 text-xl font-semibold">
        Stops along this route
      </h2>

      <ul>
        {(pois || []).slice(0,5).map(p => (
          <li key={p.slug}>
            <Link to={`/poi/${p.slug}`} className="text-blue-500">
              {p.name}
            </Link>
          </li>
        ))}
      </ul>

    </div>
  )

}
