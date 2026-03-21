import SeoHelmet from '../../components/seo/SeoHelmet'; // Import SeoHelmet
import { useParams, Link } from "react-router-dom";
import { POI_INDEX } from "@/features/poi/poiIndex";
import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";
import { GENERATED_RIDE_ROUTES } from "@/features/routes/data/generatedRideRoutes.js";
import { GRAPH } from "@/core/network/networkGraph";

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

      <h2 className="mt-16 text-xl font-bold font-serif uppercase tracking-wider mb-2">
        Recommended Bikes for the {destination.name}
      </h2>
      <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-6">
        No bike? Rent locally at {airport.city} Airport.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {(GRAPH.rentalsByDestination?.[destination.slug?.toLowerCase()] || []).slice(0, 3).map(rentalId => {
           const rental = GRAPH.rentals[rentalId];
           if (!rental) return null;
           return (
             <div key={rentalId} className="border border-white/10 p-6 rounded-sm bg-zinc-900/50 hover:border-amber-500/40 transition-colors">
               <div className="flex justify-between items-center mb-4">
                 <div className="text-[10px] text-amber-500 font-mono uppercase tracking-[0.2em] font-black">{rental.category}</div>
                 <div className="text-[9px] text-zinc-500 bg-black px-2 py-1 font-mono uppercase border border-white/5">{rental.airport} Terminal</div>
               </div>
               <h3 className="font-bold uppercase text-white text-lg font-serif">
                 {rental.slug.split('-').slice(0,3).join(' ')}
               </h3>
               <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
                 <div>
                   <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Rate</div>
                   <div className="text-white font-mono font-black uppercase text-sm">≈ €150/day</div>
                 </div>
                 <button className="text-[9px] text-amber-500 uppercase tracking-widest border border-amber-500 px-3 py-1 hover:bg-amber-500 hover:text-black transition-colors rounded-sm">
                   View Specs
                 </button>
               </div>
             </div>
           )
        })}
        {(!GRAPH.rentalsByDestination?.[destination.slug?.toLowerCase()] || GRAPH.rentalsByDestination?.[destination.slug?.toLowerCase()].length === 0) && (
          <div className="col-span-full border border-white/5 bg-zinc-900/30 p-8 text-center">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">No Verified Fleet Data</div>
            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Bring your own machine to this destination.</div>
          </div>
        )}
      </div>

      <h2 className="mt-10 text-xl font-semibold font-serif uppercase tracking-wider">
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
