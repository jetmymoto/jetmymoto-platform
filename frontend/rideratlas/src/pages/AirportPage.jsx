import { useParams, Link, Navigate } from "react-router-dom";
import SeoHelmet from '../components/seo/SeoHelmet'; // Import SeoHelmet
import { Helmet } from "react-helmet"; // Keep for keywords


import { useEffect, useMemo } from "react";
import AirportTemplate from "@/features/airport/AirportTemplate";

import {
  generateSEOKeywords,
  generateRecoveryHotels
} from "@/features/airport/utils/airportContentEngine";

import { getNearbyAirports } from "@/features/airport/utils/getNearbyAirports";
import { generateAirportSchema } from "@/features/airport/seo/generateAirportSchema";
import { GRAPH } from "@/core/network/networkGraph";







export default function AirportPage() {

  const { slug: fullSlug } = useParams();
  const baseSlug = fullSlug?.split("-motorcycle")[0];

  const airport = useMemo(() => {
    const airport = GRAPH.airportsBySlug[baseSlug];
    if (!airport) {
      console.error("Airport not found for slug:", baseSlug);
      return null;
    }
    return airport;
  }, [baseSlug]);
  
  useEffect(() => {
    // Legacy redirect for old IATA code URLs
    if (fullSlug && fullSlug.length === 3) {
      const airportByCode = Object.values(GRAPH.airports).find(a => a.code === fullSlug.toUpperCase());
      if (airportByCode) {
        window.location.replace(`/airport/${airportByCode.slug}-motorcycle-shipping`);
      }
    }
  }, [fullSlug]);

  // Canonical Redirect
  if (fullSlug !== baseSlug) {
    return <Navigate to={`/airport/${baseSlug}`} replace />;
  }

  if (!airport) {
    return (
      <div className="p-20 text-white text-center">
        <h1 className="text-2xl font-bold text-red-500">UNKNOWN AIRPORT ARRIVAL OS</h1>
        <p className="text-zinc-400">This airport slug is not recognized in the network.</p>
      </div>
    );
  }

  const keywords = generateSEOKeywords(airport);
  const hotels = generateRecoveryHotels(airport);
  const pois = (Object.values(GRAPH.pois) || []).filter(
    p => p.nearest_airport === airport.code
  );

  const nearby = getNearbyAirports(airport.code);

  const countryRegions = (Object.values(GRAPH.destinations) || []).filter(region =>
    (region.countries || []).includes(airport.country)
  );

  const routes = useMemo(() => (countryRegions || []).map(region => ({
      slug: `${airport.slug}-to-${region.slug}`,
      airport: airport,
      destination: region,
  })), [airport, countryRegions]);

  const title =
    `Motorcycle Shipping from ${airport.city} (${airport.code}) | JetMyMoto`;

  const description =
    `Secure motorcycle shipping from ${airport.city} Airport (${airport.code}). Fully insured air transport, customs support, and premium delivery across ${airport.region}. Get your instant quote today.`;

  const airportSchema = generateAirportSchema(airport);

  return (
    <>
      <SeoHelmet
        title={title}
        description={description}
        canonicalUrl={`https://jetmymoto.com/airport/${slug}-motorcycle-shipping`}
      />
      {/* Retain Helmet for keywords until SeoHelmet supports it */}
      <Helmet>
        <meta name="keywords" content={keywords.join(", ")} />
      </Helmet>

      {airportSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(airportSchema)
          }}
        />
      )}

      <AirportTemplate
        airport={airport}
        keywords={keywords}
        routes={routes}
        hotels={hotels}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-12">
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Popular Motorcycle Routes
          </h2>
          <ul className="text-white">
            {(routes || []).slice(0, 5).map(r => (
              <li key={r.slug}>
                <Link to={`/route/${r.slug}`} className="hover:text-amber-500">
                  Ride from {airport.city} to {r.destination.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Nearby Deployment Hubs
          </h2>
          <ul className="text-white">
            {(nearby || []).slice(0, 5).map(n => (
              <li key={n.slug}>
                <Link to={`/airport/${n.slug}-motorcycle-shipping`} className="hover:text-amber-500">
                  {n.city} ({n.code})
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Popular Riding Regions
          </h2>
          <ul className="text-white">
            {(Object.values(GRAPH.destinations) || []).map(d => (
              <li key={d.slug}>
                <Link to={`/destination/${d.slug}`} className="hover:text-amber-500">
                  Ride the {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Points of Interest near {airport.city}
          </h2>
          <ul className="text-white">
            {(pois || []).slice(0, 5).map(p => (
              <li key={p.slug}>
                <Link to={`/poi/${p.slug}`} className="hover:text-amber-500">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="py-20 border-t border-white/5">

        <h2 className="text-xl font-bold mb-8 uppercase italic">
            Nearby Logistics Hubs
          </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {(nearby || []).map(a => (
            <Link
              key={a.code}
              to={`/airport/${a.slug}-motorcycle-shipping`}
              className="border border-white/5 p-6 hover:border-amber-500/40 transition"
            >

              <div className="text-lg font-bold italic">
                {a.city}
              </div>

              <div className="text-xs text-zinc-500 uppercase font-mono mt-2">
                {a.code}
              </div>

            </Link>
          ))}

        </div>

      </section>

    </>
  );
}
