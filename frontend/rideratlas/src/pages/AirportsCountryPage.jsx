import { useParams, Link } from "react-router-dom";
import SeoHelmet from '../components/seo/SeoHelmet';
import { useMemo } from "react";

import CountryAirportGrid from "@/components/network/CountryAirportGrid";
import DeploymentCard from "@/components/airport/DeploymentCard";
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
  HR: "Croatia",
  US: "United States",
  CA: "Canada",
  MX: "Mexico"
};

const US_STATE_NAMES = {
  CA: "California",
  TX: "Texas",
  FL: "Florida",
  NY: "New York",
  IL: "Illinois",
  NV: "Nevada",
  CO: "Colorado",
  WA: "Washington",
  GA: "Georgia",
  TN: "Tennessee",
};

export default function AirportsCountryPage() {

  const { country } = useParams();

  const code = country.toUpperCase();
  const countryName = COUNTRY_NAMES[code] || code;

  const airports = useMemo(() => {
    return Object.values(GRAPH.airports || {}).filter(
      (a) => a.country?.toLowerCase() === country?.toLowerCase()
    );
  }, [country]);

  const countryRoutes = useMemo(() => {
    return airports.flatMap((airport) => {
      const routeSlugs = GRAPH.routesByAirport[airport.slug] || GRAPH.routesByAirport[airport.code] || [];
      return routeSlugs.map((slug) => GRAPH.routes[slug]).filter(Boolean);
    });
  }, [airports]);

  const regions = useMemo(() => {
    const unique = new Map();
    (countryRoutes || []).forEach(route => {
      if (route?.destination?.slug && !unique.has(route.destination.slug)) {
        unique.set(route.destination.slug, route.destination);
      }
    });
    return Array.from(unique.values());
  }, [countryRoutes]);

  const routes = countryRoutes.slice(0, 12);

  // UX Fallback if dataset is incomplete
  const displayRoutes = routes.length > 0 
    ? routes 
    : Object.values(GRAPH.routes || {}).slice(0, 5);

  const displayRegions = regions.length > 0 
    ? regions 
    : displayRoutes.map(r => r.destination).filter(Boolean).reduce((acc, dest) => {
        if (!acc.find(d => d.slug === dest.slug)) acc.push(dest);
        return acc;
      }, []);

  return (
    <div className="min-h-screen bg-black text-white py-20">

      <SeoHelmet
        title={`Motorcycle Shipping ${countryName} | JetMyMoto`}
        description={`Ship your motorcycle to ${countryName}. Secure air freight and vehicle logistics via major international airports.`}
        canonicalUrl={`https://jetmymoto.com/airports/country/${country.toLowerCase()}`}
      />

      {/* HERO */}
      <section className="relative h-[60vh] flex items-center justify-center border-b border-white/5 overflow-hidden">
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
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6 uppercase">
            {countryName}
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto italic">
            Certified motorcycle logistics infrastructure and expedition hubs in {countryName}.
          </p>
        </div>
      </section>

      {/* DEPLOYMENT HUBS (CARDS) */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-white/5">
        <h2 className="text-xs font-mono font-black tracking-[0.5em] text-amber-500 uppercase italic mb-10 flex items-center gap-4">
          <span className="w-8 h-px bg-amber-500/30" />
          Deployment Hubs
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {airports.slice(0, 6).map(airport => {
            const mission = {
              id: airport.code,
              airport_slug: airport.slug,
              airport_name: airport.city,
              region_desc: airport.region || airport.country,
              airport_code: airport.code,
              country_code: airport.country,
              coords: airport.coords || { lat: "0", long: "0" },
              weather: { temp: "--", condition: "Ready" },
              rental: { price: "--", class: "Logistics Hub" }
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

      {/* STATES (IF US) */}
      {(code === "US" || code === "CA") && (
        <section className="max-w-7xl mx-auto px-6 py-16 border-b border-white/5">
          <h2 className="text-xs font-mono font-black tracking-[0.5em] text-zinc-500 uppercase italic mb-8">
            Strategic Sectors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.entries(US_STATE_NAMES).map(([stCode, stName]) => (
              <div key={stCode} className="p-4 border border-white/5 bg-zinc-900/40 hover:border-amber-500/30 transition-all cursor-not-allowed opacity-60">
                <span className="text-[10px] font-mono text-zinc-500 block mb-1">{code}-{stCode}</span>
                <span className="font-bold text-sm uppercase italic">{stName}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AIRPORT GRID & REGIONS & ROUTES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Popular Airports */}
          <div className="lg:col-span-4">
            <h2 className="text-lg font-black uppercase italic mb-8 flex items-center gap-3">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Popular Airports
            </h2>
            <CountryAirportGrid airports={airports} />
          </div>

          {/* Ride Regions */}
          <div className="lg:col-span-4">
            <h2 className="text-lg font-black uppercase italic mb-8 flex items-center gap-3">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Ride Regions
            </h2>
            <div className="space-y-4">
              {displayRegions.length > 0 ? displayRegions.map(r => (
                <Link 
                  key={r.slug} 
                  to={`/destination/${r.slug}`} 
                  className="block group p-4 border border-white/5 bg-zinc-900/20 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase italic group-hover:text-amber-500 transition-colors">{r.name}</span>
                    <span className="text-[10px] font-mono text-zinc-600">Explore</span>
                  </div>
                </Link>
              )) : (
                <p className="text-zinc-500 italic text-sm">No regions identified in this sector.</p>
              )}
            </div>
          </div>

          {/* Popular Routes */}
          <div className="lg:col-span-4">
            <h2 className="text-lg font-black uppercase italic mb-8 flex items-center gap-3">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Popular Routes
            </h2>
            <div className="space-y-4">
              {displayRoutes.length > 0 ? displayRoutes.map(r => (
                <Link 
                  key={r.slug} 
                  to={`/route/${r.slug}`} 
                  className="block group p-4 border border-white/5 bg-zinc-900/20 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-500 mb-1">{r.airport.city} &rarr;</span>
                    <span className="font-bold uppercase italic group-hover:text-amber-500 transition-colors text-sm">{r.destination.name}</span>
                  </div>
                </Link>
              )) : (
                <p className="text-zinc-500 italic text-sm">No active routes mapped for this country.</p>
              )}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
