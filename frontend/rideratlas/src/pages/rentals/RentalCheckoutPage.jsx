import React, { useEffect, useReducer } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, MapPin, Shield, Zap, FileText } from "lucide-react";
import {
  getGraphShardStatus,
  loadGraphShard,
  readGraphSnapshot,
  readGraphShard,
} from "@/core/network/networkGraph";
import {
  formatRentalPrice,
  getRentalBrand,
  getRentalCategoryLabel,
  getRentalModelName,
  getRentalPosterUrl,
} from "@/features/rentals/utils/rentalFormatters";
import { withBrandContext } from "@/utils/navigationTargets";
import SalesSharkChatWidget from "@/features/rentals/components/SalesSharkChatWidget";

// ── Loading Skeleton ──
function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-48 rounded bg-white/5" />
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="h-10 w-3/4 bg-white/5 rounded" />
              <div className="aspect-[4/3] rounded-sm bg-white/5" />
              <div className="h-20 w-full rounded bg-white/5" />
            </div>
            <div className="space-y-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-sm bg-white/5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 404 State ──
function NotFoundState({ rentalId, withCtx }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center px-6 py-20">
        <div className="w-full overflow-hidden rounded-sm border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96)_0%,rgba(5,6,6,0.96)_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
          <div className="border-b border-white/10 px-6 py-4 text-[11px] uppercase tracking-[0.28em] text-[#CDA755] font-mono font-bold sm:px-8">
            Machine Not Indexed
          </div>
          <div className="space-y-6 px-6 py-10 sm:px-8 sm:py-12">
            <h1 className="text-3xl font-serif font-black italic uppercase tracking-tight text-white sm:text-4xl">
              Hardware Unavailable
            </h1>
            <p className="max-w-2xl text-sm font-mono tracking-widest leading-7 text-zinc-500 uppercase">
              The graph engine does not expose a rental for ID{" "}
              <span className="font-bold text-white/80">{rentalId || "unknown"}</span>.
              It may have been unlisted or the shard has not yet hydrated.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to={withCtx("/airport")}
                className="inline-flex items-center gap-2 rounded-sm border border-[#CDA755]/40 bg-[#CDA755]/10 px-6 py-4 text-[10px] font-black font-mono uppercase tracking-[0.25em] text-[#CDA755] hover:bg-[#CDA755] hover:text-[#050505] transition-all"
              >
                Explore Hubs <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page Component ──
export default function RentalCheckoutPage() {
  const { rentalId = "" } = useParams();
  const location = useLocation();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const graph = readGraphSnapshot();
  const withCtx = (path) => withBrandContext(path, location.search);

  // ── Load Rentals Shard ──
  useEffect(() => {
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
  }, []);

  const rentalShard = readGraphShard("rentals");
  const rentalStatus = getGraphShardStatus("rentals");

  // ── Loading ──
  if (!rentalShard) {
    if (rentalStatus === "loaded") {
      return <NotFoundState rentalId={rentalId} withCtx={withCtx} />;
    }
    return <CheckoutSkeleton />;
  }

  // ── Resolve rental ──
  const rentalsMap = rentalShard?.rentals ?? {};
  const operators = rentalShard?.operators ?? {};

  const rental =
    rentalsMap?.[rentalId] ||
    Object.values(rentalsMap).find(
      (r) => r?.id === rentalId || r?.slug === rentalId
    ) ||
    null;

  if (!rental) {
    return <NotFoundState rentalId={rentalId} withCtx={withCtx} />;
  }

  const operator = operators?.[rental.operatorId || rental.operator];
  const airport = graph.entities.airports?.[rental.airportCode || rental.airport];

  const brand = getRentalBrand(rental);
  const modelName = getRentalModelName(rental);
  const categoryLabel = getRentalCategoryLabel(rental);
  const formattedPrice = formatRentalPrice(rental);
  const posterUrl = getRentalPosterUrl(rental);
  const machineLabel = `${brand} ${modelName}`.trim();
  const operatorName =
    operator?.name || rental.operatorId || rental.operator || "Verified Operator";
  const airportLabel =
    airport?.name || rental.airportCode || rental.airport || "Deployment Hub";
  const airportCity = airport?.city || airportLabel;

  const topTerrain = categoryLabel.toLowerCase().includes("adventure") 
    ? "mixed terrain and high-altitude switchbacks" 
    : categoryLabel.toLowerCase().includes("touring") 
      ? "long-range endurance and paved mountain passes" 
      : "dynamic regional deployment";
  const season = "the upcoming riding season";
  const idealTerrain = categoryLabel.toLowerCase().includes("adventure") ? "Alpine / Mixed" : "Highway / Paved";

  return (
    <div className="min-h-screen bg-[#050505] pb-20 text-white selection:bg-[#CDA755] selection:text-[#050505]">
      {/* ── Top Bar ── */}
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <Link
          to={withCtx(`/rentals/${rental.airportCode || rental.airport}/${rental.slug || rentalId}`)}
          className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-500 hover:text-[#CDA755] transition-colors"
        >
          <ArrowLeft size={14} />
          Abort & Return to Briefing
        </Link>
      </div>

      {/* ── Main Grid ── */}
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          
          {/* ── Left: Machine Intel ── */}
          <div className="space-y-8">
            
            {/* Mission Briefing Header */}
            <div className="border-b border-white/10 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#CDA755] font-black">
                  Mission Secure
                </h2>
                <div className="flex items-center gap-2 bg-red-950/30 border border-red-900/50 rounded-sm px-3 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-red-400 font-bold">
                    High Demand
                  </span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif font-black italic uppercase tracking-tight text-white mb-3 leading-[1.05]">
                {machineLabel}
              </h1>
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-400">
                <MapPin size={12} className="text-[#CDA755]" />
                {airportLabel} Staging
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-white/5 shadow-[0_0_40px_rgba(205,167,85,0.05)] bg-[#0A0A0A]">
              <img
                src={posterUrl}
                alt={machineLabel}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="flex flex-col gap-2">
                  <span className="inline-block w-max rounded-sm border border-[#CDA755]/50 bg-[#050505]/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-[#CDA755] font-black backdrop-blur-md">
                    {categoryLabel} Class
                  </span>
                </div>
              </div>
            </div>

            {/* Narrative Layer */}
            <div className="border-l-2 border-[#CDA755]/50 pl-5 py-1">
              <p className="font-mono text-[11px] leading-6 tracking-[0.1em] text-zinc-400 uppercase font-semibold">
                Staged at <span className="text-white font-black">{airportCity}</span>. This <span className="text-white font-black">{categoryLabel}</span> platform is precision-engineered for <span className="text-[#CDA755]">{topTerrain}</span>. {operatorName} has this unit verified and ready for {season}. Secure your priority reservation to lock this exact machine.
              </p>
            </div>

            {/* Intel Card */}
            <div className="rounded-sm border border-[#CDA755]/10 bg-[#0A0A0A] p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#CDA755]/30 to-transparent" />
              <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CDA755] font-black">
                Reservation Intel
              </h3>
              <div className="space-y-3">
                {[
                  ["Operator", operatorName],
                  ["Daily Rate", formattedPrice],
                  ["Staging Hub", airportLabel],
                  ["Class", categoryLabel],
                  ["Suitability", idealTerrain],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-bold">
                      {label}
                    </span>
                    <span className="font-mono text-[11px] text-white font-black uppercase tracking-widest text-right">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badge Strip */}
            <div className="flex flex-col gap-4 rounded-sm border border-white/5 bg-[#0A0A0A] p-5">
              {[
                { icon: Shield, title: "Verified Operator", desc: "Machine is guaranteed and road-ready." },
                { icon: Zap, title: "Priority Deposit", desc: "€50 locks your dates. Balance at pickup." },
                { icon: FileText, title: "Dossier Issued", desc: "Digital boarding pass generated instantly." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <item.icon size={14} className="mt-0.5 shrink-0 text-[#CDA755]" />
                  <div>
                    <p className="text-[10px] font-black font-mono uppercase tracking-widest text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ── Right: Tactical Terminal ── */}
          <div className="relative">
            <div className="sticky top-24">
              <SalesSharkChatWidget rental={rental} operator={operator} airport={airport} />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
