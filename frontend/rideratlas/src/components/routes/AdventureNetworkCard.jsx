import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { GRAPH } from "@/core/network/networkGraph";
import { CINEMATIC_BACKGROUNDS } from "@/utils/cinematicBackgrounds";

const AdventureNetworkCard = ({ cluster }) => {
  if (import.meta.env.DEV) {
    console.log("CLUSTER DEBUG:", cluster);
  }

  const { routeCount, countryCount, regionCount, previewRegions } = useMemo(() => {

    const countries = new Set();
    const regions = new Set();
    const regionNames = new Set();

    (cluster.routes || []).forEach(route => {

      const airport =
        route.airport ||
        GRAPH.airports?.[route.originAirportCode] ||
        GRAPH.airportsBySlug?.[route.airport];

      const destination =
        route.destination ||
        GRAPH.destinations?.[route.destinationSlug] ||
        GRAPH.destinations?.[route.destination];

      if (airport?.country) {
        countries.add(airport.country);
      }

      if (destination?.slug) {
        regions.add(destination.slug);
      }

      if (destination?.name) {
        regionNames.add(destination.name);
      }

    });

    return {
      routeCount: cluster.routes?.length || 0,
      countryCount: countries.size,
      regionCount: regions.size,
      previewRegions: Array.from(regionNames).slice(0,3)
    };

  }, [cluster]);

  const mainAirportCode = cluster?.airports?.[0] || "TWR";
  const airportUrl = `/airport/${mainAirportCode.toLowerCase()}`;

  const displayIata = mainAirportCode.toUpperCase();
  const displayCity = cluster?.title || cluster?.region || "Hub";

  return (
    <Link
      to={airportUrl}
      className="group relative block overflow-hidden border border-white/5 bg-zinc-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:bg-zinc-900 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${CINEMATIC_BACKGROUNDS.courtyardClassic})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.72)_0%,rgba(10,10,10,0.88)_52%,rgba(5,6,6,0.97)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(205,167,85,0.18),transparent_42%)]" />
      <div className="absolute inset-y-6 left-6 w-px bg-gradient-to-b from-[#CDA755]/50 via-white/10 to-transparent" />

      <div className="relative z-10">
        {/* STATUS BAR */}
        <div className="mb-6 flex justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          <span className="text-emerald-400">Operational</span>
          <span>Signal Online</span>
        </div>

        {/* HUB HEADER */}
        <div>
          <h3 className="text-lg font-bold tracking-tight text-white uppercase">
            {displayIata} NETWORK
          </h3>
          <p className="mt-1 text-xs text-zinc-300">
            {displayCity}
          </p>
        </div>

        {/* NETWORK METRICS */}
        <div className="mt-6 grid grid-cols-3 border-y border-white/10 py-4 text-center backdrop-blur-[1px]">
          <div>
            <p className="text-2xl font-bold text-white">{routeCount}</p>
            <p className="mt-1 text-[10px] uppercase text-zinc-400">Routes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{countryCount}</p>
            <p className="mt-1 text-[10px] uppercase text-zinc-400">Countries</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{regionCount}</p>
            <p className="mt-1 text-[10px] uppercase text-zinc-400">Regions</p>
          </div>
        </div>

        {/* REGION PREVIEW */}
        <div className="mt-6">
          <div className="text-xs text-zinc-300">
            Access Routes
          </div>

          <ul className="mt-2 min-h-[60px] space-y-1 text-sm text-zinc-200">
            {previewRegions.length > 0 ? (
              previewRegions.map(region => (
                <li key={region}>• {region}</li>
              ))
            ) : (
              <li className="italic text-zinc-500">No routes detected</li>
            )}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs uppercase tracking-widest">
          <span className="text-zinc-400">Signal</span>
          <span className="flex items-center gap-2 text-amber-500 transition-transform group-hover:translate-x-1">
            Engage Network →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default AdventureNetworkCard;
