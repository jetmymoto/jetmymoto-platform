import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin, Gauge } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolvePrice(rental) {
  return rental?.pricing?.pricePerDay ?? rental?.price_day ?? null;
}

function formatPrice(price, currency = "EUR") {
  if (price == null || !isFinite(price)) return null;
  const sym = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";
  return `${sym}${Math.round(price)}`;
}

function scarcityConfig(count) {
  if (count === 1) return { label: "Last available", color: "text-red-400 border-red-500/30 bg-red-500/5" };
  if (count === 2) return { label: "Only 2 left", color: "text-amber-400 border-amber-500/30 bg-amber-500/5" };
  return { label: `${count} bikes available`, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" };
}

function formatTheater(theaterSlug) {
  if (!theaterSlug || theaterSlug === "unknown") return null;
  return theaterSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * CorridorCard — Price Killer grid card.
 *
 * Hardware gate is enforced by CorridorGrid (never rendered if qualifyingRentals is empty).
 *
 * Props:
 *   mission           {object}    hydrated mission from GRAPH.missions[slug]
 *   qualifyingRentals {string[]}  rental IDs from rentalsForCorridor[slug]
 *   rentalsMap        {object}    { [id]: rental } from rentalShard.rentals
 *   isGhostPivot      {boolean}   marks this as a Ghost Hub radar suggestion
 */
export default function CorridorCard({ mission, qualifyingRentals = [], rentalsMap = {}, isGhostPivot = false }) {
  if (!mission) return null;

  const pickupCode   = mission.insertion?.code  || mission.insertion_airport  || "";
  const pickupCity   = mission.insertion?.city  || pickupCode;
  const dropoffCode  = mission.extraction?.code || mission.extraction_airport || "";
  const dropoffCity  = mission.extraction?.city || dropoffCode;
  const theaterLabel = formatTheater(mission.theater);

  // ── Price computation (memoized, pure) ──
  const { cheapestRental, cheapestPrice, rackRate } = useMemo(() => {
    if (qualifyingRentals.length === 0) return { cheapestRental: null, cheapestPrice: null, rackRate: null };

    const resolved = qualifyingRentals
      .map((id) => {
        const r = rentalsMap[id];
        if (!r) return null;
        const price = resolvePrice(r);
        return price != null ? { rental: r, price } : null;
      })
      .filter(Boolean);

    if (resolved.length === 0) return { cheapestRental: null, cheapestPrice: null, rackRate: null };

    const best = resolved.reduce((acc, cur) => (cur.price < acc.price ? cur : acc));
    // Rack rate = 45 % above fleet rebalancing rate (standard round-trip market premium)
    const rack = Math.round(best.price * 1.45);

    return { cheapestRental: best.rental, cheapestPrice: best.price, rackRate: rack };
  }, [qualifyingRentals, rentalsMap]);

  const currency = cheapestRental?.currency ?? "EUR";
  const scarcity = scarcityConfig(qualifyingRentals.length);

  return (
    <Link
      to={`/a2a/${mission.slug}`}
      className="group relative flex flex-col border border-white/8 bg-[#1E1E1E] hover:border-[#CDA755]/40 transition-all duration-200 overflow-hidden"
    >
      {/* Ghost Hub ribbon */}
      {isGhostPivot && (
        <div className="absolute top-0 left-0 right-0 font-mono text-[8px] font-black uppercase tracking-widest text-center bg-zinc-800 text-zinc-500 py-1.5 border-b border-white/5">
          Routes Into {dropoffCity}
        </div>
      )}

      <div className={`flex flex-col flex-1 p-6 ${isGhostPivot ? "pt-9" : ""}`}>

        {/* ── Header: Pickup → Dropoff ── */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-2xl font-black tabular-nums text-white">{pickupCode}</span>
              <ArrowRight size={14} className="text-[#CDA755]" />
              <span className="font-mono text-2xl font-black tabular-nums text-white">{dropoffCode}</span>
            </div>
            <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              {pickupCity} → {dropoffCity}
            </div>
          </div>

          {/* Scarcity badge */}
          <div className={`shrink-0 font-mono text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border rounded-sm ${scarcity.color}`}>
            {scarcity.label}
          </div>
        </div>

        {/* ── Theater badge ── */}
        {theaterLabel && (
          <div className="flex items-center gap-1.5 mb-4">
            <MapPin size={10} className="text-zinc-600" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 italic">
              {theaterLabel}
            </span>
          </div>
        )}

        {/* ── Mission title ── */}
        {mission.title && (
          <h3 className="text-base font-black tracking-tight italic text-white mb-3 leading-tight">
            {mission.title}
          </h3>
        )}

        {/* ── Cinematic pitch snippet ── */}
        {mission.cinematic_pitch && (
          <p className="text-xs leading-6 text-zinc-500 line-clamp-3 mb-5 flex-1">
            {mission.cinematic_pitch}
          </p>
        )}

        {/* Spacer when no pitch */}
        {!mission.cinematic_pitch && <div className="flex-1" />}

        {/* ── Journey metadata ── */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
          {(mission.distance_km || mission.corridor_distance_km) && (
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
              <Gauge size={10} />
              <span className="tabular-nums">{mission.distance_km ?? mission.corridor_distance_km} km</span>
            </div>
          )}
          {mission.duration_days && (
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
              <Clock size={10} />
              <span>{mission.duration_days} days</span>
            </div>
          )}
        </div>

        {/* ── Price Radar / Separator ── */}
        <div className="border-t border-white/5 pt-4">
          {cheapestPrice !== null ? (
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-2">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">One-Way Fleet Rate</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-mono text-2xl font-black tabular-nums text-[#CDA755]">
                      {formatPrice(cheapestPrice, currency)}
                    </span>
                    <span className="font-mono text-xs text-zinc-600">/day</span>
                    {rackRate && (
                      <span className="font-mono text-xs text-zinc-600 line-through tabular-nums">
                        {formatPrice(rackRate, currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[#CDA755] group-hover:translate-x-1 transition-transform">
                <span className="font-mono text-[9px] uppercase tracking-widest">Route Intel</span>
                <ArrowRight size={12} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest italic">
                Checking availability...
              </span>
              <ArrowRight size={12} className="text-zinc-700" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
