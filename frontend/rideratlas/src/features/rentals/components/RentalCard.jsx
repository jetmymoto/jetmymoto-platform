import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gauge, MapPin, Play, ShieldCheck } from "lucide-react";
import { GRAPH } from "@/core/network/networkGraph";

const CATEGORY_PRICE_MAP = {
  adventure: 185,
  touring: 210,
  cruiser: 165,
  classic: 145,
  scrambler: 175,
  "sport-touring": 225,
};

const CATEGORY_MEDIA = {
  adventure:
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=80",
  touring:
    "https://images.unsplash.com/photo-1529422643029-d4585747aaf2?auto=format&fit=crop&w=1600&q=80",
  cruiser:
    "https://images.unsplash.com/photo-1517846693594-1567da72af75?auto=format&fit=crop&w=1600&q=80",
  classic:
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
  scrambler:
    "https://images.unsplash.com/photo-1515777315835-281b94c9589f?auto=format&fit=crop&w=1600&q=80",
  "sport-touring":
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80",
  default:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80",
};

function titleizeToken(token) {
  if (!token) return "";
  if (/^\d/.test(token)) return token.toUpperCase();
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function splitModelTokens(rental) {
  const slugTokens = String(rental?.slug || "")
    .split("-")
    .filter(Boolean);
  const airportToken = String(rental?.airport || "").toLowerCase();
  const airportIndex = slugTokens.indexOf(airportToken);

  if (airportIndex <= 0) {
    return slugTokens;
  }

  return slugTokens.slice(0, airportIndex);
}

export function getRentalBrand(rental) {
  if (typeof rental?.brand === "string" && rental.brand.trim()) {
    return rental.brand.trim();
  }

  return titleizeToken(splitModelTokens(rental)[0] || "Unknown");
}

export function getRentalModelName(rental) {
  if (typeof rental?.model === "string" && rental.model.trim()) {
    return rental.model.trim();
  }

  if (typeof rental?.model_name === "string" && rental.model_name.trim()) {
    return rental.model_name.trim();
  }

  const tokens = splitModelTokens(rental).slice(1);

  if (tokens.length === 0) {
    return "Mission Spec";
  }

  return tokens.map(titleizeToken).join(" ");
}

export function getRentalCategoryLabel(rental) {
  return String(rental?.category || "mission-spec")
    .split("-")
    .map(titleizeToken)
    .join(" ");
}

export function getRentalPrice(rental) {
  if (typeof rental?.price_day === "number") {
    return rental.price_day;
  }

  if (typeof rental?.price === "number") {
    return rental.price;
  }

  if (typeof rental?.price_day === "string") {
    const parsed = Number.parseFloat(rental.price_day.replace(/[^0-9.]/g, ""));
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return CATEGORY_PRICE_MAP[String(rental?.category || "").toLowerCase()] || 150;
}

export function formatRentalPrice(rental) {
  const amount = getRentalPrice(rental);
  const currency = String(rental?.currency || "EUR").toUpperCase();

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);
}

export function getRentalPosterUrl(rental) {
  return (
    rental?.posterUrl ||
    rental?.imageUrl ||
    CATEGORY_MEDIA[String(rental?.category || "").toLowerCase()] ||
    CATEGORY_MEDIA.default
  );
}

function buildRentalRequestPath(rental, machineLabel, operatorName) {
  const params = new URLSearchParams({
    intent: "rent",
    airport: String(rental?.airport || ""),
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

function formatDestinationLabel(slug) {
  return String(slug || "")
    .split("-")
    .map(titleizeToken)
    .join(" ");
}

export default function RentalCard({ rental }) {
  const [videoFailed, setVideoFailed] = useState(false);

  const operator = GRAPH.operators?.[rental.operator];
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
    () => buildRentalRequestPath(rental, machineLabel, operator?.name || rental.operator),
    [rental, machineLabel, operator]
  );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#121212] text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#CDA755]/40 hover:shadow-[0_30px_90px_rgba(167,99,48,0.22)]">
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
