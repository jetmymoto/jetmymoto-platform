import { useParams, Link } from "react-router-dom";
import SeoHelmet from '../components/seo/SeoHelmet'; // Import SeoHelmet
import { useMemo } from "react";

import CountryAirportGrid from "@/components/network/CountryAirportGrid";
import { GRAPH } from "@/core/network/networkGraph";





const COUNTRY_NAMES = {
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  DE: "Germany",
  CH: "Switzerland",
  AT: "Austria",
  PT: "Portugal",
  NL: "Netherlands",
  BE: "Belgium",
  CZ: "Czech Republic",
  PL: "Poland",
  GR: "Greece",
  HR: "Croatia"
};

export default function AirportsCountryPage() {

  const { country } = useParams();

  const code = country.toUpperCase();
  const countryName = COUNTRY_NAMES[code] || code;

  const airports = (Object.values(GRAPH.airports || {})).filter(
    (a) => a.country.toLowerCase() === country.toLowerCase()
  );

  const countryRoutes = useMemo(() => {
    return GRAPH.routes.filter(r => r.airport.country === code);
  }, [code]);

  const regions = useMemo(() => {
    const uniqueRegions = new Map();
    countryRoutes.forEach(route => {
      if (route.destination && !uniqueRegions.has(route.destination.slug)) {
        uniqueRegions.set(route.destination.slug, route.destination);
      }
    });
    return Array.from(uniqueRegions.values());
  }, [countryRoutes]);

  const routes = countryRoutes.slice(0, 12);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20">

      <SeoHelmet
        title={`Motorcycle Shipping ${countryName} | JetMyMoto`}
        description={`Ship your motorcycle to ${countryName}. Secure air freight and vehicle logistics via major international airports.`}
        canonicalUrl={`https://jetmymoto.com/airports/country/${country.toLowerCase()}`}
      />

      <section className="relative h-[70vh] flex items-center justify-center border-b border-white/5 overflow-hidden">

        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source
            src="https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_videos%2F_ContryPageH1video.mp4?alt=media&token=b806223e-d96f-4fae-b9d0-3ba67243e98e"
            type="video/mp4"
          />
        </video>

        <div className="relative z-10 text-center px-6">

          <h1 className="text-5xl md:text-6xl font-bold italic tracking-tight mb-6">
            Motorcycle Shipping {countryName}
          </h1>

          <p className="text-zinc-400 text-lg max-w-2xl mx-auto italic">
            An overview of motorcycle shipping options and popular riding destinations in {countryName}.
          </p>

        </div>

      </section>

<section className="max-w-7xl mx-auto px-6 py-20">

  <h2 className="text-2xl font-bold mb-10 uppercase italic">
    Deployment Hubs
  </h2>

  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

    {(airports || []).slice(0,6).map(airportInfo => {

      const airport = GRAPH.airports[airportInfo.code];

      if (!airport) return null;

      const mission = {
        id: airport.code,
        airport_name: airport.city,
        region_desc: airport.region || airport.country,
        airport_code: airport.code,
        country_code: airport.country,
        coords: airport.coords || { lat: "0", long: "0" },
        weather: {
          temp: "--",
          condition: "Ready"
        },
        rental: {
          price: "--",
          class: "Logistics Hub"
        }
      };

      return (
        <DeploymentCard
          key={airport.code}
          mission={mission}
        />
      );

    })}

  </div>

</section>

      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>

            <h2 className="text-2xl font-bold mb-6">
              Popular Airports
            </h2>

            <CountryAirportGrid airports={airports} />

          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Ride Regions</h2>
            <ul className="space-y-3">
              {(regions || []).map(r => (
                <li key={r.slug}>
                  <Link to={`/destination/${r.slug}`} className="text-blue-500 hover:underline">
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Popular Routes</h2>
            <ul className="space-y-3">
              {routes.slice(0, 10).map(r => (
                <li key={r.slug}>
                  <Link to={`/route/${r.slug}`} className="text-blue-500 hover:underline">
                    {r.airport.city} to {r.destination.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}