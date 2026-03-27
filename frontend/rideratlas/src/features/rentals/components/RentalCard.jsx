import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gauge, MapPin, Play, ShieldCheck } from "lucide-react";
import { GRAPH, readGraphShard } from "@/core/network/networkGraph";
import {
  getRentalBrand,
  getRentalModelName,
  getRentalCategoryLabel,
  getRentalPrice,
  formatRentalPrice,
  getRentalPosterUrl,
} from "@/features/rentals/utils/rentalFormatters";

function buildRentalRequestPath(rental, machineLabel, operatorName) {
  const params = new URLSearchParams({
    intent: "rent",
    airport: String(rental?.airportCode || rental?.airport || ""),
    rental: String(rental?.id || ""),
    machine: machineLabel,
    operator: operatorName,
    category: getRentalCategoryLabel(rental),
  });

  return `/moto-airlift?${params.toString()}#booking`;
}

function buildRentalDetailPath(rental) {
  return `/rental/${rental?.slug || rental?.id || ""}`;
}

function titleizeToken(token) {
  if (!token) return "";
  if (/^\d/.test(token)) return token.toUpperCase();
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function formatDestinationLabel(slug) {
  return String(slug || "")
    .split("-")
    .map(titleizeToken)
    .join(" ");
}

export default function RentalCard({ rental, isSelected = false }) {
  const [videoFailed, setVideoFailed] = useState(false);

  const operators =
    readGraphShard("rentals")?.operators || GRAPH.operators;
  const operator = operators?.[rental.operatorId || rental.operator];
  const brand = useMemo(() => getRentalBrand(rental), [rental]);
  const modelName = useMemo(() => getRentalModelName(rental), [rental]);
  const categoryLabel = useMemo(() => getRentalCategoryLabel(rental), [rental]);
  const formattedPrice = useMemo(() => formatRentalPrice(rental), [rental]);
  const posterUrl = useMemo(() => getRentalPosterUrl(rental), [rental]);
  const videoUrl = rental?.videoUrl || rental?.video?.url || null;
  const shouldRenderVideo = Boolean(videoUrl) && !videoFailed;
  const machineLabel = `${brand} ${modelName}`.trim();
  const detailPath = useMemo(() => buildRentalDetailPath(rental), [rental]);
  const requestPath = useMemo(
    () => buildRentalRequestPath(rental, machineLabel, operator?.name || rental.operatorId || rental.operator),
    [rental, machineLabel, operator]
  );

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#121212] text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#CDA755]/40 hover:shadow-[0_30px_90px_rgba(167,99,48,0.22)] ${
        isSelected ? "ring-2 ring-amber-400/80 shadow-[0_0_0_3px_rgba(255,196,79,0.4)]" : ""
      }`}
    >
      <div className="relative aspect-[4/4.7] overflow-hidden border-b border-white/10 bg-[#574C43]/20">
        {shouldRenderVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={posterUrl}
            onError={() => setVideoFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          >
            <source src={videoUrl} />
          </video>
        ) : (
          <img
            src={posterUrl}
            alt={`${brand} ${modelName}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.08)_0%,rgba(18,18,18,0.22)_30%,rgba(5,6,6,0.82)_100%)]" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full border border-[#CDA755]/35 bg-[rgba(18,18,18,0.72)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#CDA755] backdrop-blur-md">
            {categoryLabel}
          </span>
          <span className="rounded-full border border-white/10 bg-[rgba(18,18,18,0.62)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/72 backdrop-blur-md">
            {rental.airport}
          </span>
        </div>

        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(18,18,18,0.62)] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
          <Play size={12} className="text-[#CDA755]" />
          Showroom Loop
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/48">
              {operator?.name || rental.operator}
            </div>
            <div className="rounded-full border border-[#A76330]/30 bg-[rgba(87,76,67,0.22)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#CDA755]">
              Premium Fleet
            </div>
          </div>

          <div className="text-[12px] uppercase tracking-[0.28em] text-white/55">
            {brand}
          </div>
          <h3 className="mt-2 text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.03em] text-white">
            {modelName}
          </h3>
          <Link
            to={detailPath}
            className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#CDA755] transition-colors hover:text-[#F3E5C7]"
          >
            Open Machine Briefing
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,#121212_0%,#050606_100%)] p-6">
        <div className="grid grid-cols-3 gap-3 rounded-[22px] border border-white/10 bg-[rgba(87,76,67,0.12)] p-4 text-center">
          <div>
            <div className="mb-2 flex justify-center text-[#CDA755]">
              <Gauge size={15} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
              Class
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              {categoryLabel}
            </div>
          </div>
          <div>
            <div className="mb-2 flex justify-center text-[#CDA755]">
              <ShieldCheck size={15} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
              Operator
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              Verified
            </div>
          </div>
          <div>
            <div className="mb-2 flex justify-center text-[#CDA755]">
              <MapPin size={15} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
              Hub
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              {rental.airport}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[22px] border border-white/10 bg-[rgba(5,6,6,0.58)] p-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-white/45">
                Price Per Day
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-sans text-4xl font-black tabular-nums tracking-[-0.04em] text-white">
                  {formattedPrice}
                </span>
                <span className="pb-1 text-[11px] uppercase tracking-[0.22em] text-white/45">
                  / Day
                </span>
              </div>
            </div>
            <div className="rounded-full border border-[#A76330]/30 bg-[rgba(167,99,48,0.12)] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[#CDA755]">
              Verified Rate
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#CDA755]">
              Best For:
            </div>
            <div className="flex flex-wrap gap-2">
              {(rental.compatible_destinations || []).map((destination) => (
                <span
                  key={destination}
                  className="rounded-full border border-white/10 bg-[rgba(87,76,67,0.16)] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/78"
                >
                  {formatDestinationLabel(destination)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Link
          to={requestPath}
          className="mt-5 w-full rounded-[18px] border border-[#A76330]/60 bg-[#A76330]/12 px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-[#F3E5C7] transition-all duration-300 hover:border-[#CDA755] hover:bg-[#CDA755] hover:text-[#050606]"
        >
          Request This Machine
        </Link>
      </div>
    </article>
  );
}
