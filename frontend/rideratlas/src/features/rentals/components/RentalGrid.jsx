import React, { useEffect, useMemo, useReducer, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Filter, SlidersHorizontal } from "lucide-react";
import {
  GRAPH,
  readGraphShard,
  getGraphShardStatus,
  loadGraphShard,
} from "@/core/network/networkGraph";
import RentalCard from "@/features/rentals/components/RentalCard";
import OperatorSelector from "@/features/rentals/components/OperatorSelector";
import PriceGapBadge from "@/features/rentals/components/PriceGapBadge";
import {
  getRentalBrand,
  getRentalCategoryLabel,
  getRentalPrice,
} from "@/features/rentals/utils/rentalFormatters";

const FILTER_SELECT_CLASS =
  "h-12 min-w-[190px] rounded-full border border-white/10 bg-[#121212] px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white outline-none transition-colors hover:border-[#CDA755]/45 focus:border-[#CDA755]";

// Force React re-render after async shard load completes.
function useForceUpdate() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return forceUpdate;
}

export default function RentalGrid({ airportCode, highlightedRentalId = null }) {
  const normalizedAirportCode = String(airportCode || "").toUpperCase();
  const forceUpdate = useForceUpdate();

  // ── Two-step state: null = operator selection, string = fleet reveal ──
  const [selectedOperator, setSelectedOperator] = useState(null);

  // ── Shard-first + GRAPH fallback ──
  const rentalsShard = readGraphShard("rentals");
  const shardStatus = getGraphShardStatus("rentals");
  const isShardLoading = shardStatus === "idle" || shardStatus === "loading";

  const rentalsMap = rentalsShard?.rentals || {};
  const operators = rentalsShard?.operators || {};
  const rentalIndexes = rentalsShard?.rentalIndexes || {};
  const rentalsByAirport = rentalIndexes?.rentalsByAirport || {};
  const rentalsByOperatorByAirport = rentalIndexes?.rentalsByOperatorByAirport || {};
  const cheapestByAirport = rentalIndexes?.cheapestByAirport || {};

  // ── Idle-guard: trigger shard load → re-render when done ──
  useEffect(() => {
    if (getGraphShardStatus("rentals") === "idle") {
      loadGraphShard("rentals")
        .then(forceUpdate)
        .catch((error) => {
          if (import.meta.env.DEV) {
            console.warn("Rentals shard load failed:", error);
          }
        });
    } else if (getGraphShardStatus("rentals") === "loading") {
      const interval = setInterval(() => {
        if (getGraphShardStatus("rentals") === "loaded") {
          clearInterval(interval);
          forceUpdate();
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [forceUpdate]);

  // ── Fleet-level data (Step 2 — only when operator selected) ──
  const rentalIds = selectedOperator
    ? rentalsByOperatorByAirport?.[normalizedAirportCode]?.[selectedOperator] || []
    : rentalsByAirport?.[normalizedAirportCode] || [];

  const rawRentals = useMemo(
    () => rentalIds.map((id) => rentalsMap?.[id]).filter(Boolean),
    [rentalsMap, rentalIds]
  );

  const totalMachines = rentalsByAirport?.[normalizedAirportCode]?.length || 0;

  const [filterType, setFilterType] = useState("ALL");
  const [filterBrand, setFilterBrand] = useState("ALL");
  const [sortPrice, setSortPrice] = useState("RECOMMENDED");

  // Reset filters when switching operators
  useEffect(() => {
    setFilterType("ALL");
    setFilterBrand("ALL");
    setSortPrice("RECOMMENDED");
  }, [selectedOperator]);

  const filterOptions = useMemo(() => {
    const brands = Array.from(
      new Set(rawRentals.map((rental) => getRentalBrand(rental)))
    ).sort((a, b) => a.localeCompare(b));

    const categories = Array.from(
      new Set(rawRentals.map((rental) => getRentalCategoryLabel(rental)))
    ).sort((a, b) => a.localeCompare(b));

    return {
      brands: ["ALL", ...brands],
      categories: ["ALL", ...categories],
    };
  }, [rawRentals]);

  const filteredRentals = useMemo(() => {
    const next = rawRentals.filter((rental) => {
      const brandMatches =
        filterBrand === "ALL" || getRentalBrand(rental) === filterBrand;
      const typeMatches =
        filterType === "ALL" ||
        getRentalCategoryLabel(rental) === filterType;

      return brandMatches && typeMatches;
    });

    if (sortPrice === "LOW_TO_HIGH") {
      next.sort((a, b) => getRentalPrice(a) - getRentalPrice(b));
    } else if (sortPrice === "HIGH_TO_LOW") {
      next.sort((a, b) => getRentalPrice(b) - getRentalPrice(a));
    }

    return next;
  }, [rawRentals, filterBrand, filterType, sortPrice]);

  const cheapest = cheapestByAirport?.[normalizedAirportCode] || null;

  // ── Empty state (no rentals at all for this airport) ──
  if (!isShardLoading && totalMachines === 0) {
    return (
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#121212_0%,#050505_100%)] px-8 py-20 text-center shadow-[0_30px_80px_rgba(5,5,5,0.22)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#A76330]/35 bg-[#A76330]/10 text-[#CDA755]">
          <SlidersHorizontal size={20} />
        </div>
        <div className="mt-6 text-[11px] uppercase tracking-[0.28em] text-white/45">
          Fleet Sync Pending
        </div>
        <h3 className="mt-3 text-3xl font-black uppercase tracking-[-0.03em] text-white">
          No Verified Rentals For {normalizedAirportCode}
        </h3>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/58">
          This hub does not currently expose a live rental showroom in the graph
          engine. The component is network-safe and will render inventory
          automatically as soon as rentals are indexed for this airport.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {/* ── Showroom Header ── */}
      <div className="sticky top-[92px] z-30 overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,18,18,0.96)_0%,rgba(5,5,5,0.96)_100%)] shadow-[0_24px_60px_rgba(5,5,5,0.26)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(205,167,85,0.14),transparent_30%),linear-gradient(90deg,rgba(167,99,48,0.08),transparent_35%)]" />

        <div className="relative flex flex-col gap-6 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.26em] text-[#CDA755]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#A76330]/35 bg-[#A76330]/10">
                <Filter size={14} />
              </div>
              Mobility Access Showroom
            </div>
            <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.03em] text-white md:text-3xl">
              {normalizedAirportCode} Rental Fleet
            </h2>
            <p className="mt-2 text-sm text-white/56">
              {selectedOperator
                ? "Browsing operator fleet. Refine by brand, type, and daily rate."
                : "Select a verified operator to explore their fleet."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {cheapest && (
              <PriceGapBadge cheapest={cheapest} airportCode={normalizedAirportCode} />
            )}

            {selectedOperator && (
              <>
                <select
                  value={filterBrand}
                  onChange={(event) => setFilterBrand(event.target.value)}
                  className={FILTER_SELECT_CLASS}
                  aria-label="Filter rentals by brand"
                >
                  {filterOptions.brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand === "ALL" ? "Brand: All" : `Brand: ${brand}`}
                    </option>
                  ))}
                </select>

                <select
                  value={filterType}
                  onChange={(event) => setFilterType(event.target.value)}
                  className={FILTER_SELECT_CLASS}
                  aria-label="Filter rentals by type"
                >
                  {filterOptions.categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "ALL" ? "Type: All" : `Type: ${category}`}
                    </option>
                  ))}
                </select>

                <select
                  value={sortPrice}
                  onChange={(event) => setSortPrice(event.target.value)}
                  className={FILTER_SELECT_CLASS}
                  aria-label="Sort rentals by price"
                >
                  <option value="RECOMMENDED">Price: Recommended</option>
                  <option value="LOW_TO_HIGH">Price: Low to High</option>
                  <option value="HIGH_TO_LOW">Price: High to Low</option>
                </select>
              </>
            )}
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/10 px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-white/45 lg:px-7">
          <span className="tabular-nums">{totalMachines} Machines Indexed</span>
          {selectedOperator && (
            <span className="tabular-nums">{filteredRentals.length} Visible</span>
          )}
        </div>
      </div>

      {/* ── Step 1: Operator Selection (or skeleton while loading) ── */}
      {!selectedOperator && (
        <OperatorSelector
          airportCode={normalizedAirportCode}
          rentalIndexes={rentalIndexes}
          operators={operators}
          onSelectOperator={setSelectedOperator}
          isLoading={isShardLoading}
        />
      )}

      {/* ── Step 2: Fleet Reveal ── */}
      {selectedOperator && (
        <>
          {/* Back to operators breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              onClick={() => setSelectedOperator(null)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#121212] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-[#CDA755]/40 hover:text-[#CDA755]"
            >
              <ArrowLeft size={14} />
              All Operators · {normalizedAirportCode}
            </button>
          </motion.div>

          {filteredRentals.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#121212_0%,#050505_100%)] px-8 py-20 text-center">
              <div className="text-[11px] uppercase tracking-[0.26em] text-[#CDA755]">
                No Match
              </div>
              <h3 className="mt-3 text-2xl font-black uppercase text-white">
                No Fleet Matches This Filter Stack
              </h3>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/56">
                Adjust brand or type filters to reopen the showroom. The component is
                still rendering from the indexed airport fleet only.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredRentals.map((rental, index) => (
                <motion.div
                  key={rental.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.35 }}
                >
                  <RentalCard
                    rental={rental}
                    isSelected={
                      rental?.id === highlightedRentalId || rental?.slug === highlightedRentalId
                    }
                  />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
