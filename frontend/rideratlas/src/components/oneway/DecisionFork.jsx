import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Bike, Truck } from "lucide-react";
import { withBrandContext } from "@/utils/navigationTargets";

/**
 * DecisionFork
 *
 * 50/50 split panel: The Blitz (ride one-way rental) vs The Airlift (ship your own bike).
 *
 * Shard-aware:
 *   The Blitz panel is fully activated only when `inventoryAvailable` is true,
 *   indicating the a2a shard has confirmed hardware-validated corridors exist.
 *   Before the shard loads, the panel shows a skeleton state rather than false data.
 *
 * Props:
 *   inventoryAvailable  {boolean}   true once a2a shard loads and corridorCount > 0
 *   corridorCount       {number}    total hardware-validated corridors
 *   cheapestPrice       {number}    lowest one-way rate across all corridors
 *   cheapestCurrency    {string}    "EUR" | "USD" | "GBP"
 *   onBlitzScroll       {fn}        scrolls to CorridorGrid
 */
export default function DecisionFork({
  inventoryAvailable,
  corridorCount = 0,
  cheapestPrice = null,
  cheapestCurrency = "EUR",
  onBlitzScroll,
}) {
  const location = useLocation();
  const withCtx = (path) => withBrandContext(path, location.search);

  const currencySymbol =
    cheapestCurrency === "USD" ? "$" : cheapestCurrency === "GBP" ? "£" : "€";

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      {/* Section eyebrow */}
      <div className="text-center mb-12">
        <div className="font-mono text-[10px] font-black tracking-[0.5em] text-zinc-600 uppercase mb-4">
          Two Ways to Ride
        </div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white">
          Rent or Ship?
        </h2>
      </div>

      {/* 50/50 grid */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* ── LEFT: The Blitz (Rent one-way) ─────────────────────────────── */}
        <div
          className={`relative group border p-10 flex flex-col justify-between min-h-[420px] transition-all duration-300 ${
            inventoryAvailable
              ? "border-[#CDA755]/30 bg-[#CDA755]/5 hover:border-[#CDA755]/60"
              : "border-white/8 bg-[#1E1E1E]/60"
          }`}
        >
          {/* Active corridor pulse indicator */}
          {inventoryAvailable && (
            <div className="absolute top-6 right-6 flex items-center gap-2 font-mono text-[9px] text-[#CDA755] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CDA755] animate-pulse" />
              {corridorCount} Active
            </div>
          )}

          <div>
            <div className="mb-6 p-3 bg-[#CDA755]/10 inline-flex rounded">
              <Bike className="h-8 w-8 text-[#CDA755]" />
            </div>

            <div className="font-mono text-[10px] font-black tracking-[0.4em] text-[#CDA755] uppercase mb-3">
              The Blitz
            </div>

            <h3 className="text-3xl font-black tracking-tighter uppercase italic text-white mb-4">
              Ride a Pre-Positioned Bike
            </h3>

            <p className="text-zinc-400 text-sm leading-7 mb-6">
              One-way rentals are bikes that need to move between cities.{" "}
              <span className="text-zinc-200 italic">You ride the scenic route.</span>{" "}
              Pick up in one city, drop off in another — fleet rebalancing rates, no returns required.
            </p>

            {/* Price signal */}
            {inventoryAvailable && cheapestPrice !== null ? (
              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">From</span>
                <span className="font-mono text-3xl font-black tabular-nums text-[#CDA755]">
                  {currencySymbol}{Math.round(cheapestPrice)}
                </span>
                <span className="font-mono text-[10px] text-zinc-500 uppercase">/day</span>
                <span className="ml-2 font-mono text-[9px] text-zinc-600 line-through tabular-nums">
                  {currencySymbol}{Math.round(cheapestPrice * 1.45)}
                </span>
              </div>
            ) : (
              /* Skeleton while shard loads */
              <div className="h-10 w-32 bg-white/5 animate-pulse rounded mb-6" />
            )}
          </div>

          <button
            onClick={onBlitzScroll}
            disabled={!inventoryAvailable}
            className={`group/btn flex items-center gap-4 font-mono text-xs font-black uppercase tracking-widest italic transition-all px-8 py-4 ${
              inventoryAvailable
                ? "bg-[#CDA755] text-black hover:bg-[#e0bc6e] cursor-pointer"
                : "bg-white/5 text-zinc-600 cursor-wait"
            }`}
          >
            {inventoryAvailable ? "Browse Corridors" : "Loading Fleet..."}
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ── RIGHT: The Airlift (Ship your own bike) ─────────────────────── */}
        <div className="relative group border border-white/8 bg-[#1E1E1E] p-10 flex flex-col justify-between min-h-[420px] hover:border-white/20 transition-all duration-300">
          <div>
            <div className="mb-6 p-3 bg-white/5 inline-flex rounded">
              <Truck className="h-8 w-8 text-zinc-400" />
            </div>

            <div className="font-mono text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase mb-3">
              The Airlift
            </div>

            <h3 className="text-3xl font-black tracking-tighter uppercase italic text-white mb-4">
              Ship Your Own Machine
            </h3>

            <p className="text-zinc-400 text-sm leading-7 mb-6">
              Already own the perfect bike? JetMyMoto handles open-jaw motorcycle logistics —
              fly your machine to the pickup city, ride through, and we recover it from the drop-off.{" "}
              <span className="text-zinc-200 italic">End-to-end. No round-trip required.</span>
            </p>

            <div className="flex flex-col gap-2 mb-6">
              {["Door-to-tarmac collection", "Cross-border paperwork handled", "Insurance coordination included"].map(
                (feat) => (
                  <div key={feat} className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className="w-1 h-1 rounded-full bg-[#CDA755]" />
                    {feat}
                  </div>
                )
              )}
            </div>
          </div>

          <Link
            to={withCtx("/moto-airlift")}
            className="group/btn flex items-center gap-4 font-mono text-xs font-black uppercase tracking-widest italic transition-all px-8 py-4 bg-zinc-900 border border-white/10 hover:border-white/30 text-white"
          >
            Request Airlift Quote
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
