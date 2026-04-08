import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { withBrandContext } from "@/utils/navigationTargets";

/**
 * OneWayBottomCTA
 *
 * Final conversion section at the bottom of the OneWayRentalsPage.
 * Two action paths:
 *   1. Primary  — "Choose Your Corridor"  → scrolls back to the CorridorGrid
 *   2. Secondary — "Airlift Your Machine" → links to /moto-airlift
 *
 * Props:
 *   corridorCount    {number}   hardware-validated active corridors
 *   cheapestPrice    {number|null}
 *   cheapestCurrency {string}
 *   onScrollToGrid   {fn}       callback to scroll corridorGridRef into view
 */
export default function OneWayBottomCTA({
  corridorCount = 0,
  cheapestPrice = null,
  cheapestCurrency = "EUR",
  onScrollToGrid,
}) {
  const location = useLocation();
  const withCtx = (path) => withBrandContext(path, location.search);

  const sym = cheapestCurrency === "USD" ? "$" : cheapestCurrency === "GBP" ? "£" : "€";
  const priceLabel =
    cheapestPrice !== null ? `From ${sym}${Math.round(cheapestPrice)}/day` : "Live Pricing";

  return (
    <section className="relative border-t border-white/5 overflow-hidden bg-[#050505]">
      {/* Amber gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CDA755]/40 to-transparent" />

      {/* Subtle background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">

        {/* Eyebrow */}
        <div className="font-mono text-[10px] font-black tracking-[0.5em] text-[#CDA755] uppercase mb-6 flex items-center justify-center gap-3">
          <Zap size={11} /> The One-Way Fleet
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase italic text-white leading-[0.9] mb-6">
          Pick Up in One City. <br />
          Drop Off in Another.
        </h2>

        {/* Sub-copy */}
        <p className="text-zinc-500 text-base md:text-lg italic max-w-2xl mx-auto mb-12 leading-relaxed">
          {corridorCount > 0
            ? `${corridorCount} hardware-validated corridors. Fleet-rebalancing rates. No round-trip required.`
            : "Fleet-rebalancing rates. No round-trip required."}
        </p>

        {/* Stats strip */}
        <div className="inline-flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest text-zinc-600 border border-white/5 bg-[#1E1E1E] px-8 py-3 mb-12 flex-wrap justify-center">
          {corridorCount > 0 && (
            <>
              <span>
                <span className="text-white font-black text-base tabular-nums">{corridorCount}</span>{" "}
                Active Corridors
              </span>
              <span className="text-white/10">|</span>
            </>
          )}
          <span>
            <span className="text-[#CDA755] font-black">{priceLabel}</span>
          </span>
          <span className="text-white/10">|</span>
          <span>Avg 35% Below Rack Rate</span>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Primary — scroll to grid */}
          <button
            onClick={onScrollToGrid}
            className="group flex items-center gap-4 px-10 py-5 bg-[#CDA755] text-black font-mono text-xs font-black uppercase tracking-widest hover:bg-white transition-colors duration-200"
          >
            Browse Live Corridors
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          {/* Secondary — airlift */}
          <Link
            to={withCtx("/moto-airlift")}
            className="group flex items-center gap-4 px-10 py-5 bg-transparent border border-white/10 text-zinc-400 font-mono text-xs font-black uppercase tracking-widest hover:border-white/30 hover:text-white transition-all duration-200"
          >
            Airlift Your Machine
            <ArrowRight
              size={14}
              className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all"
            />
          </Link>
        </div>

        {/* Fine print */}
        <p className="mt-10 font-mono text-[9px] text-zinc-700 uppercase tracking-widest italic">
          All corridors hardware-validated · Pricing reflects live operator tariffs · No hidden repositioning fees
        </p>
      </div>
    </section>
  );
}
