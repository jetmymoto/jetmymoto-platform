import React, { useMemo, useEffect, useState } from "react";
import { GRAPH } from "@/core/network/networkGraph";
import { motion, AnimatePresence } from "framer-motion";
// import { usePools } from "@/hooks/usePools";
// Components
import ArrivalOS from "./sections/ArrivalOS";
import {
  RecoverySection,
  UtilitySection,
  CityExtensionSection,
  RankingCards,
  PainPointsSection,
  PivotSection
} from "./sections/AirportSections";
import AirportControlPanel from "./sections/AirportControlPanel";
import RoutesGrid from "@/components/network/RoutesGrid";
import MotoAirliftBookingForm from "@/features/booking/MotoAirliftBookingForm";
// 🚀 Dual-Engine Implementation
import RentalGrid from "@/features/rentals/components/RentalGrid";
import LivePoolsPanel from "@/components/intelligence/LivePoolsPanel";

import { SITE_MEDIA } from "@/config/siteMedia";

const HERO_VIDEO = SITE_MEDIA.EUROPE_PAGE_H1;

export default function AirportTemplate({
  airport,
  intent,
  setIntent,
  initialRideMode = "bring"
}) {
  const [rideMode, setRideMode] = useState(initialRideMode);

  // const { pools, loading: poolsLoading, error: poolsError } = usePools(airport?.code);
  const pools = [];
  const poolsLoading = false;
  const poolsError = null;

  if (!airport) {
    return <div className="p-20 text-white">Loading airport...</div>;
  }

  const a = {
    code: airport.code ?? "UNK",
    name: airport.name ?? "",
    city: airport.city ?? "",
    country: airport.country ?? "",
    continent: airport.continent ?? "",
    region: airport.region ?? "",
    motto: airport.motto ?? "",
    staging: airport.staging ?? "",

    hero: {
      videoUrl: airport.hero?.videoUrl ?? HERO_VIDEO,
      posterUrl: airport.hero?.posterUrl ?? "",
    },

    controlPanel: Array.isArray(airport.controlPanel)
      ? airport.controlPanel
      : [],

    utilities: Array.isArray(airport.utilities)
      ? airport.utilities
      : [],

    recovery: airport.recovery ?? {
      premium: { name: "", location: "", href: "#", features: [] },
      budget: { name: "", location: "", href: "#", features: [] }
    },

    cityExtension: airport.cityExtension?.enabled
      ? airport.cityExtension
      : { enabled: false, headline: "", subline: "", items: [] },
  };

  const airportRoutes = useMemo(() => {
    return GRAPH.routesByAirport?.[a.code]
      ?.map(slug => GRAPH.routes[slug])
      .filter(Boolean) ?? [];
  }, [a.code]);

  const { derivedRegions, derivedCountries, derivedTheater } = useMemo(() => {
    const rSet = new Set();
    const cSet = new Set();

    airportRoutes.forEach(r => {
      if (r.destination?.region) rSet.add(r.destination.region);
      if (r.destination?.country) cSet.add(r.destination.country);
    });

    const cluster = Object.values(GRAPH.clusters || {}).find(c =>
      c.airports?.includes(a.code)
    );

    return {
      derivedRegions: Array.from(rSet),
      derivedCountries: Array.from(cSet),
      derivedTheater: cluster?.region || a.continent || "Global"
    };
  }, [airportRoutes, a.code, a.continent]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("AIRPORT TEMPLATE ACTIVE:", a.code);
    }
  }, [a.code]);

  useEffect(() => {
    setRideMode(initialRideMode);
  }, [initialRideMode, a.code]);

  const defaultRankingData = useMemo(
    () => ({
      moto: [
        {
          rank: "1",
          winner: true,
          title: "JetMyMoto MotoAirlift",
          price: "From €850",
          priceDetail: "round trip",
          bestFor: "Passionate Missions (4+ days)",
          sub: "Your own bike, received, prepped, and staged at our Riviera depot. Fly in, ride out.",
          access: "Handover corridor: 12 min",
          type: "internal",
          href: "#",
          cta: "Request Logistics Quote",
          features: ["Your own bike", "No deposit lock", "Prepped & ready"],
        },
        {
          rank: "2",
          winner: false,
          title: "Premium Motorcycle Rental",
          price: "€190",
          priceDetail: "/ day (avg)",
          bestFor: "Premium Comfort (2–3 days)",
          sub: "Late model GS / Multistrada. High daily rates + significant deposit locks.",
          access: "Terminal desk: 5 min",
          type: "internal",
          href: "#",
          cta: "Notify When Live",
          features: ["Recent models", "Airport pickup", "High deposit"],
        },
      ],
      car: [],
    }),
    []
  );

  const rankingData = a.rankings || defaultRankingData;
  const items = rankingData?.[intent] ?? [];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30">

      <ArrivalOS
        airport={a}
        intent={intent}
        setIntent={setIntent}
        airportRoutes={airportRoutes}
        derivedRegions={derivedRegions}
        derivedCountries={derivedCountries}
        derivedTheater={derivedTheater}
        rankingData={rankingData}
      />

      {/* RIDE MODE SELECTOR - 50/50 Dual Engine Bridge */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row border border-white/10 rounded-sm overflow-hidden bg-black/50 backdrop-blur-md shadow-2xl">
          <button 
            onClick={() => setRideMode("bring")}
            className={`flex-1 py-10 px-6 flex flex-col items-center justify-center transition-all duration-300 ${
              rideMode === "bring" 
                ? "bg-amber-500 text-black border-b-4 border-black" 
                : "bg-transparent text-zinc-500 hover:bg-white/5"
            }`}
          >
            <span className="text-lg font-serif italic tracking-wide font-black uppercase mb-2">Bring Your Bike</span>
            <span className={`text-[10px] font-mono tracking-[0.2em] uppercase ${rideMode === "bring" ? "text-black/80 font-bold" : "text-zinc-600"}`}>
              Global Airlift & Staging
            </span>
          </button>
          
          <div className="w-px bg-white/10 hidden md:block" />
          <div className="h-px w-full bg-white/10 md:hidden block" />

          <button 
            onClick={() => setRideMode("rent")}
            className={`flex-1 py-10 px-6 flex flex-col items-center justify-center transition-all duration-300 ${
              rideMode === "rent" 
                ? "bg-amber-500 text-black border-b-4 border-black" 
                : "bg-transparent text-zinc-500 hover:bg-white/5"
            }`}
          >
            <span className="text-lg font-serif italic tracking-wide font-black uppercase mb-2">Rent A Bike</span>
            <span className={`text-[10px] font-mono tracking-[0.2em] uppercase ${rideMode === "rent" ? "text-black/80 font-bold" : "text-zinc-600"}`}>
              Premium Fleet Partners
            </span>
          </button>
        </div>
      </div>

      {/* Conditionally Render Engine Components */}
      <AnimatePresence mode="wait">
        {rideMode === "bring" ? (
          <motion.div key="bring" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="max-w-7xl mx-auto px-6">
              <LivePoolsPanel pools={pools} loading={poolsLoading} error={poolsError} />
            </div>
            <AirportControlPanel airport={a} data={a.controlPanel} />
            <RankingCards items={items} />
            <PainPointsSection airport={a.code} />
            <PivotSection airport={a.code} />
            <RecoverySection data={a.recovery} />
            <UtilitySection data={a.utilities} />
            <CityExtensionSection data={a.cityExtension} />
            <RoutesGrid routes={airportRoutes} />
            <MotoAirliftBookingForm />
          </motion.div>
        ) : (
          <motion.div key="rent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="max-w-7xl mx-auto px-6 pb-24">
            <div className="mb-12 border-l-2 border-amber-500 pl-6">
              <h2 className="text-4xl font-serif italic text-white uppercase font-black mb-4">
                Premium Fleet at {a.code}
              </h2>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest leading-relaxed max-w-2xl">
                Ride immediately on arrival. Verified inventory from premium partners, pre-configured for {a.region || a.city} terrain conditions. Lock in your machine below.
              </p>
            </div>
            
            <RentalGrid airportCode={a.code} />
          </div>
        </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
