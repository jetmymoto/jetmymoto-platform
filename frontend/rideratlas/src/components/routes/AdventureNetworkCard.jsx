import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { GRAPH } from "@/core/network/networkGraph";

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
        GRAPH.airports?.[route.airportCode] ||
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
      className="group block bg-zinc-900/40 border border-white/5 p-6 transition-all duration-300 hover:bg-zinc-900 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] hover:-translate-y-1"
    >

      {/* STATUS BAR */}
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-6">
        <span className="text-emerald-400">Operational</span>
        <span>Signal Online</span>
      </div>

      {/* HUB HEADER */}
      <div>
        <h3 className="text-lg font-bold tracking-tight text-white uppercase">
          {displayIata} NETWORK
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          {displayCity}
        </p>
      </div>

      {/* NETWORK METRICS */}
      <div className="grid grid-cols-3 text-center mt-6 border-y border-white/5 py-4">
        <div>
          <p className="text-2xl font-bold text-white">{routeCount}</p>
          <p className="text-[10px] uppercase text-zinc-500 mt-1">Routes</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{countryCount}</p>
          <p className="text-[10px] uppercase text-zinc-500 mt-1">Countries</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{regionCount}</p>
          <p className="text-[10px] uppercase text-zinc-500 mt-1">Regions</p>
        </div>
      </div>

      {/* REGION PREVIEW */}
      <div className="mt-6">
        <div className="text-xs text-zinc-400">
          Access Routes
        </div>

        <ul className="mt-2 text-sm text-zinc-300 space-y-1 min-h-[60px]">
          {previewRegions.length > 0 ? (
            previewRegions.map(region => (
              <li key={region}>• {region}</li>
            ))
          ) : (
            <li className="text-zinc-600 italic">No routes detected</li>
          )}
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-6 flex justify-between items-center text-xs uppercase tracking-widest pt-4 border-t border-white/5">
        <span className="text-zinc-500">Signal</span>
        <span className="text-amber-500 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
          Engage Network →
        </span>
      </div>

    </Link>
  );
};

export default AdventureNetworkCard;
