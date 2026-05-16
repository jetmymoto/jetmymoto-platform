import React, { useMemo, useEffect, useReducer, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  getGraphShardStatus,
  loadGraphShard,
  readGraphSnapshot,
  readGraphShard,
} from "@/core/network/networkGraph";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/core/analytics/trackEvent";
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
import DossierLeadCapture from "./components/DossierLeadCapture";
import TacticalDossierTrap from "@/components/conversion/TacticalDossierTrap";
import A2AMissionsSection from "./sections/A2AMissionsSection";

import { SITE_MEDIA } from "@/config/siteMedia";

const HERO_VIDEO = SITE_MEDIA.EUROPE_PAGE_H1;

function RentalGridLoadingSkeleton({ airportCode }) {
  return (
    <section className="space-y-8" aria-label={`Loading rental fleet for ${airportCode}`}>
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,18,18,0.96)_0%,rgba(5,6,6,0.96)_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
        <div className="flex flex-col gap-6 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-7">
          <div className="min-w-0 animate-pulse">
            <div className="h-4 w-40 rounded-full bg-white/10" />
            <div className="mt-4 h-10 w-72 max-w-full rounded-full bg-white/10" />
            <div className="mt-3 h-4 w-80 max-w-full rounded-full bg-white/10" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-12 min-w-[190px] rounded-full border border-white/10 bg-white/5"
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-white/35 lg:px-7">
          <span>Fleet Sync Pending</span>
          <span>Preparing Showroom</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#121212_0%,#050606_100%)] shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
          >
            <div className="aspect-[4/3] animate-pulse bg-white/8" />
            <div className="space-y-4 p-6">
              <div className="h-3 w-24 rounded-full bg-white/10" />
              <div className="h-7 w-3/4 rounded-full bg-white/10" />
              <div className="h-4 w-full rounded-full bg-white/10" />
              <div className="h-4 w-2/3 rounded-full bg-white/10" />
              <div className="flex items-center justify-between pt-4">
                <div className="h-6 w-20 rounded-full bg-white/10" />
                <div className="h-10 w-28 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AirportTemplate({
  airport,
  intent,
  setIntent,
  initialRideMode = "bring"
}) {
  const [rideMode, setRideMode] = useState(initialRideMode);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const location = useLocation();
  const graph = readGraphSnapshot();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const queryMode = searchParams.get("mode") || initialRideMode;
  const queryRouteSlug = searchParams.get("route");
  const queryRentalId = searchParams.get("rental");

  const [selectedRentalId, setSelectedRentalId] = useState(queryRentalId || null);

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
    return graph.indexes.routesByAirport?.[a.code]
      ?.map(slug => graph.entities.routes?.[slug])
      .filter(Boolean) ?? [];
  }, [a.code, graph]);

  const { derivedRegions, derivedCountries, derivedTheater } = useMemo(() => {
    const rSet = new Set();
    const cSet = new Set();

    airportRoutes.forEach(r => {
      if (r.destination?.region) rSet.add(r.destination.region);
      if (r.destination?.country) cSet.add(r.destination.country);
    });

    const cluster = (() => {
      const clusterIds = graph.indexes.clusterByAirport?.[a.code] || [];
      return clusterIds.length > 0 ? graph.entities.clusters?.[clusterIds[0]] : null;
    })();

    return {
      derivedRegions: Array.from(rSet),
      derivedCountries: Array.from(cSet),
      derivedTheater: cluster?.region || a.continent || "Global"
    };
  }, [airportRoutes, a.code, a.continent, graph]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("AIRPORT TEMPLATE ACTIVE:", a.code);
    }
  }, [a.code]);

  useEffect(() => {
    setRideMode(queryMode === "rent" ? "rent" : "bring");
  }, [queryMode, a.code]);

  useEffect(() => {
    setSelectedRentalId(queryRentalId || null);
  }, [queryRentalId]);

  useEffect(() => {
    if (rideMode !== "rent" && !selectedRentalId) {
      return undefined;
    }

    const status = getGraphShardStatus("rentals");
    if (status === "idle") {
      loadGraphShard("rentals")
        .then(forceUpdate)
        .catch(() => {});
    } else if (status === "loading") {
      const interval = setInterval(() => {
        if (getGraphShardStatus("rentals") === "loaded") {
          clearInterval(interval);
          forceUpdate();
        }
      }, 50);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [rideMode, selectedRentalId]);

  const preselectedCtaRef = useRef(null);

  useEffect(() => {
    if (rideMode === "rent" && selectedRentalId) {
      const target = document.getElementById("airport-rental-section");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });

      trackEvent("rental_preselect_view", {
        airport_code: a.code,
        route_slug: queryRouteSlug || "",
        rental_id: selectedRentalId,
        source: "airport_preselect",
      });

      const focusTimer = setTimeout(() => {
        preselectedCtaRef.current?.focus();
      }, 600);
      return () => clearTimeout(focusTimer);
    }
  }, [rideMode, selectedRentalId, a.code, queryRouteSlug]);

  const routePreview = useMemo(() => {
    if (!queryRouteSlug) {
      return null;
    }

    return graph.entities.routes?.[queryRouteSlug] || null;
  }, [graph, queryRouteSlug]);

  const rentalShard = readGraphShard("rentals");
  const rentalsMap = rentalShard?.rentals ?? {};
  const rentalsByAirport = rentalShard?.rentalIndexes?.rentalsByAirport ?? {};

  const preselectedRental = useMemo(() => {
    if (!selectedRentalId || !Array.isArray(rentalsByAirport?.[a.code])) {
      return null;
    }

    const byAirportRental = rentalsByAirport?.[a.code]
      .map((id) => rentalsMap?.[id])
      .filter(Boolean)
      .find((rental) => rental?.id === selectedRentalId || rental?.slug === selectedRentalId);

    return byAirportRental || rentalsMap?.[selectedRentalId] || null;
  }, [selectedRentalId, a.code, rentalsByAirport, rentalsMap]);

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
        <div className="flex flex-col md:flex-row border border-white/10 rounded-sm overflow-hidden bg-[#050505]/50 backdrop-blur-md shadow-2xl">
          <button 
            onClick={() => setRideMode("bring")}
            className={`flex-1 py-10 px-6 flex flex-col items-center justify-center transition-all duration-300 ${
              rideMode === "bring" 
                ? "bg-amber-500 text-black border-b-4 border-black" 
                : "bg-transparent text-zinc-500 hover:bg-white/5"
            }`}
          >
            <span className="text-lg font-serif italic tracking-wide font-black uppercase mb-2">Ship Your Bike</span>
            <span className={`text-[10px] font-mono tracking-[0.2em] uppercase ${rideMode === "bring" ? "text-black/80 font-bold" : "text-zinc-600"}`}>
              White-Glove Shipping & Handoff
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
            <span className="text-lg font-serif italic tracking-wide font-black uppercase mb-2">Rent A Motorcycle</span>
            <span className={`text-[10px] font-mono tracking-[0.2em] uppercase ${rideMode === "rent" ? "text-black/80 font-bold" : "text-zinc-600"}`}>
              Curated Local Partners
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
            <A2AMissionsSection airportCode={a.code} />
            <MotoAirliftBookingForm />
          </motion.div>
        ) : (
          <motion.div key="rent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="max-w-7xl mx-auto px-6 pb-24" id="airport-rental-section">
            {!rentalShard ? (
              <RentalGridLoadingSkeleton airportCode={a.code} />
            ) : (
              <>
            <div className="mb-12 border-l-2 border-amber-500 pl-6">
              <h2 className="text-4xl font-serif italic text-white uppercase font-black mb-4">
                Premium Fleet at {a.code}
              </h2>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest leading-relaxed max-w-2xl">
                Ride immediately on arrival. Verified inventory from premium partners, pre-configured for {a.region || a.city} terrain conditions. Lock in your machine below.
              </p>
            </div>

            {preselectedRental ? (
              <div className="mb-8 rounded-[24px] border border-amber-400/40 bg-[#171717] p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-[#CDA755]">Journey Match: Recommended for this route</div>
                <div className="mt-2 text-lg font-black text-white">{preselectedRental?.brand || preselectedRental?.name || "Recommended Rental"}</div>
                <div className="mt-1 text-sm text-zinc-300">Selected from route {routePreview?.name || routePreview?.title || queryRouteSlug}</div>
                <button
                  ref={preselectedCtaRef}
                  type="button"
                  onClick={() => setSelectedRentalId(preselectedRental?.id)}
                  className="mt-3 rounded-full border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-200 transition hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-400/80"
                >
                  Scroll to recommended bike
                </button>
              </div>
            ) : null}

            <DossierLeadCapture airportCode={a.code} />

            <RentalGrid airportCode={a.code} highlightedRentalId={selectedRentalId} />

            <div className="mt-16">
              <TacticalDossierTrap hubName={a.city || a.code} />
            </div>
              </>
            )}
          </div>
        </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
