import { useReducer, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import SeoHelmet from "@/components/seo/SeoHelmet";
import OneWayHero from "@/components/oneway/OneWayHero";
import HowItWorksStrip from "@/components/oneway/HowItWorksStrip";
import DecisionFork from "@/components/oneway/DecisionFork";
import CorridorGrid from "@/components/oneway/CorridorGrid";
import WhyOneWay from "@/components/oneway/WhyOneWay";
import NarratorSpotlight from "@/components/oneway/NarratorSpotlight";
import OneWayBottomCTA from "@/components/oneway/OneWayBottomCTA";

import {
  GRAPH,
  readGraphShard,
  getGraphShardStatus,
  loadGraphShard,
} from "@/core/network/networkGraph";
import { withBrandContext } from "@/utils/navigationTargets";

// ─── Shard loader hook (Wave 3.5 non-blocking pattern) ───────────────────────
// Triggers a re-render once both "rentals" and "a2a" shards have settled.
// Initial paint is always instant — no blocking data fetches at the top level.

function useShards(shardNames) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const cleanups = shardNames.map((name) => {
      const status = getGraphShardStatus(name);
      if (status === "idle") {
        loadGraphShard(name).then(forceUpdate);
        return () => {};
      }
      if (status === "loading") {
        const interval = setInterval(() => {
          if (getGraphShardStatus(name) === "loaded") {
            clearInterval(interval);
            forceUpdate();
          }
        }, 50);
        return () => clearInterval(interval);
      }
      return () => {};
    });

    return () => cleanups.forEach((cleanup) => cleanup());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OneWayRentalsPage() {
  const location = useLocation();
  const corridorGridRef = useRef(null);

  // Non-blocking shard hydration — re-renders once both shards are ready
  useShards(["rentals", "a2a"]);

  const rentalShard = readGraphShard("rentals");
  const a2aShard    = readGraphShard("a2a");
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // O(1) corridor slugs from core graph index
  const allMissionSlugs = useMemo(
    () => GRAPH?.indexes?.allMissionSlugs ?? [],
    []
  );

  // A2A shard-derived data
  const rentalsForCorridor  = useMemo(() => a2aShard?.rentalsForCorridor  ?? {}, [a2aShard]);
  const corridorsByRental   = useMemo(() => a2aShard?.corridorsByRental   ?? {}, [a2aShard]);
  const corridorPriceRadar  = useMemo(() => a2aShard?.corridorPriceRadar  ?? {}, [a2aShard]);

  // Rental map (needed by CorridorCard for price resolution)
  const rentalsMap = useMemo(() => rentalShard?.rentals ?? {}, [rentalShard]);

  // Hardware-validated corridors — only slugs that have ≥1 qualifying rental
  const activeCorriderSlugs = useMemo(
    () => allMissionSlugs.filter((slug) => (rentalsForCorridor[slug]?.length ?? 0) > 0),
    [allMissionSlugs, rentalsForCorridor]
  );

  const inventoryAvailable = activeCorriderSlugs.length > 0;
  const featuredMissionSlug = searchParams.get("mission") || "";
  const featuredRentalId = searchParams.get("rental") || "";
  const featuredMission = useMemo(() => {
    if (!featuredMissionSlug) return null;
    return GRAPH?.missions?.[featuredMissionSlug] ?? null;
  }, [featuredMissionSlug]);
  const featuredRental = useMemo(() => {
    if (!featuredRentalId) return null;
    return rentalsMap?.[featuredRentalId] ?? null;
  }, [featuredRentalId, rentalsMap]);
  const featuredMissionIsActive = Boolean(
    featuredMissionSlug && activeCorriderSlugs.includes(featuredMissionSlug)
  );

  // Cheapest price across all active corridors — for DecisionFork price signal
  const { cheapestPrice, cheapestCurrency } = useMemo(() => {
    let min = Infinity;
    let cur = "EUR";

    for (const slug of activeCorriderSlugs) {
      for (const rentalId of rentalsForCorridor[slug] ?? []) {
        const r = rentalsMap[rentalId];
        if (!r) continue;
        const price = r?.pricing?.pricePerDay ?? r?.price_day ?? Infinity;
        if (price < min) {
          min = price;
          cur = r.currency ?? "EUR";
        }
      }
    }

    return { cheapestPrice: min < Infinity ? min : null, cheapestCurrency: cur };
  }, [activeCorriderSlugs, rentalsForCorridor, rentalsMap]);

  const handleExplore = () => {
    corridorGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-[#CDA755] selection:text-black font-sans">
      <SeoHelmet
        title="One-Way Motorcycle Rentals | JetMyMoto"
        description={`Pick up a motorcycle in one city, ride the scenic route, and drop it off in another. ${activeCorriderSlugs.length > 0 ? `${activeCorriderSlugs.length} hardware-validated corridors` : "One-way corridors"} across Europe and beyond.`}
        canonicalUrl="https://jetmymoto.com/one-way-rentals"
      />

      {/* ── 1. Hero ── */}
      <OneWayHero
        corridorCount={activeCorriderSlugs.length}
        onExplore={handleExplore}
      />

      {/* ── 2. How It Works ── */}
      <HowItWorksStrip />

      {/* ── 3. Decision Fork ── */}
      <DecisionFork
        inventoryAvailable={inventoryAvailable}
        corridorCount={activeCorriderSlugs.length}
        cheapestPrice={cheapestPrice}
        cheapestCurrency={cheapestCurrency}
        onBlitzScroll={handleExplore}
      />

      {/* ── 4. Corridor Grid (Revenue Engine) ── */}
      <section ref={corridorGridRef} className="max-w-7xl mx-auto px-6 pb-24">
        {featuredMission && (
          <div className="mb-8 flex flex-col gap-4 border border-[#CDA755]/20 bg-[#1E1E1E] p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-mono text-[10px] font-black tracking-[0.32em] text-[#CDA755] uppercase">
                One-Way Recovery
              </div>
              <h2 className="mt-3 text-xl md:text-2xl font-black tracking-tighter uppercase italic text-white">
                {featuredMissionIsActive ? "Your Corridor Is Still Live" : "Corridor Context Restored"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-500 max-w-2xl italic">
                {featuredRental
                  ? `${featuredRental.bikeName || featuredRental.title || "This machine"} can run ${featuredMission.insertion_airport} to ${featuredMission.extraction_airport}.`
                  : `Continue from ${featuredMission.insertion_airport} to ${featuredMission.extraction_airport} without losing the one-way context.`}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={withBrandContext(`/a2a/${featuredMission.slug}`, location.search)}
                className="inline-flex items-center justify-center gap-3 border border-[#CDA755] bg-[#CDA755] px-6 py-4 text-center text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#050505] transition-all duration-300 hover:bg-white"
              >
                Open Corridor Briefing
              </Link>
              <button
                onClick={handleExplore}
                className="inline-flex items-center justify-center gap-3 border border-white/10 bg-white/5 px-6 py-4 text-center text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-[#CDA755]/40 hover:text-[#CDA755]"
              >
                Browse Matching Corridors
              </button>
            </div>
          </div>
        )}

        {/* Section header */}
        <div className="mb-10">
          <div className="font-mono text-[10px] font-black tracking-[0.5em] text-[#CDA755] uppercase mb-4">
            Active Corridors
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white">
            Choose Your Ride
          </h2>
          <p className="mt-3 text-sm text-zinc-500 max-w-xl italic">
            Every card below is hardware-validated — a real bike at the pickup city ready to ride to the drop-off.
            {activeCorriderSlugs.length > 0
              ? ` ${activeCorriderSlugs.length} corridors currently live.`
              : ""}
          </p>
        </div>

        <CorridorGrid
          allMissionSlugs={allMissionSlugs}
          rentalsForCorridor={rentalsForCorridor}
          rentalsMap={rentalsMap}
          corridorPriceRadar={corridorPriceRadar}
          highlightedMissionSlug={featuredMissionIsActive ? featuredMissionSlug : ""}
        />
      </section>

      {/* ── 5. Why One-Way ── */}
      <WhyOneWay />

      {/* ── 6. Narrator Spotlight ── */}
      <NarratorSpotlight />

      {/* ── 7. Bottom CTA ── */}
      <OneWayBottomCTA
        corridorCount={activeCorriderSlugs.length}
        cheapestPrice={cheapestPrice}
        cheapestCurrency={cheapestCurrency}
        onScrollToGrid={handleExplore}
      />
    </div>
  );
}
