import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gauge, MapPin, ShieldCheck, Crosshair, Truck } from "lucide-react";
import { readGraphShard } from "@/core/network/networkGraph";
import {
  getRentalBrand,
  getRentalModelName,
  getRentalCategoryLabel,
  getRentalPrice,
  formatRentalPrice,
  getRentalPosterUrl,
} from "@/features/rentals/utils/rentalFormatters";

/**
 * @typedef {Object} MissionContext
 * @property {string} insertionCode
 * @property {string} extractionCode
 * @property {string} missionSlug
 */

// ── Alpine regex for suitability chip derivation (O(1) per render) ──
const ALPINE_REGEX = /alp|dolom|mountain|pass|stelvio|grossglockner|tyrol/i;

function buildRentalRequestPath(rental, missionContext) {
  const params = new URLSearchParams({
    intent: "rent",
    airport: String(rental?.airportCode || rental?.airport || ""),
    rental: String(rental?.id || ""),
  });

  if (missionContext) {
    if (missionContext.insertionCode) params.set("insertion", missionContext.insertionCode);
    if (missionContext.extractionCode) params.set("extraction", missionContext.extractionCode);
    if (missionContext.missionSlug) params.set("mission", missionContext.missionSlug);
  }

  // Phase 3: Route strictly to the dedicated rental checkout engine
  return `/checkout/rental/${rental.id}?${params.toString()}`;
}

function buildShipPath(rental, missionContext) {
  const params = new URLSearchParams({
    intent: "ship",
    airport: String(rental?.airportCode || rental?.airport || ""),
    rental: String(rental?.id || ""),
  });

  if (missionContext) {
    if (missionContext.insertionCode) params.set("insertion", missionContext.insertionCode);
    if (missionContext.extractionCode) params.set("extraction", missionContext.extractionCode);
    if (missionContext.missionSlug) params.set("mission", missionContext.missionSlug);
  }

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

// ── Suitability chip derivation — inline O(1) logic ──
function deriveSuitabilityChips(rental) {
  const chips = [];
  const destinations = rental?.compatible_destinations || rental?.compatibleDestinations || [];
  const category = String(rental?.category || "").toLowerCase();

  const hasAlpineRoute = destinations.some((d) => ALPINE_REGEX.test(d));

  if (hasAlpineRoute) {
    chips.push("Stable in high-altitude switchbacks");
  }

  if (category === "adventure") {
    chips.push("Handles mixed terrain confidently");
  }

  return chips;
}

/**
 * @param {Object} props
 * @param {Object} props.rental
 * @param {boolean} [props.isSelected]
 * @param {MissionContext} [props.missionContext]
 */
export default function RentalCard({ rental, isSelected = false, missionContext }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const operators = readGraphShard("rentals")?.operators || {};
  const operator = operators?.[rental.operatorId || rental.operator];
  const brand = useMemo(() => getRentalBrand(rental), [rental]);
  const modelName = useMemo(() => getRentalModelName(rental), [rental]);
  const categoryLabel = useMemo(() => getRentalCategoryLabel(rental), [rental]);
  const formattedPrice = useMemo(() => formatRentalPrice(rental), [rental]);
  const posterUrl = useMemo(() => getRentalPosterUrl(rental), [rental]);
  const detailPath = useMemo(() => buildRentalDetailPath(rental), [rental]);
  const requestPath = useMemo(() => buildRentalRequestPath(rental, missionContext), [rental, missionContext]);
  const shipPath = useMemo(() => buildShipPath(rental, missionContext), [rental, missionContext]);
  const suitabilityChips = useMemo(() => deriveSuitabilityChips(rental), [rental]);

  const isA2A = Boolean(missionContext);
  
  // TODO: replace with GRAPH.oneWayCompatibleByMission[missionSlug].includes(rental.id)
  const isOpenJaw = Boolean(
    isA2A &&
    missionContext?.insertionCode &&
    missionContext?.extractionCode &&
    missionContext.insertionCode !== missionContext.extractionCode
  );

  const topBadges = useMemo(() => {
    const badges = [];

    // Priority 1: Open-Jaw Ready
    if (isOpenJaw) {
      badges.push({
        id: "open-jaw",
        label: "Open-Jaw Ready",
        className: "border-emerald-500/30 bg-emerald-500/20 text-[10px] font-semibold tracking-[0.18em] text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
      });
    }

    // Priority 2: Category
    if (categoryLabel) {
      badges.push({
        id: "category",
        label: categoryLabel,
        className: "border-[#CDA755]/35 bg-[rgba(5,5,5,0.72)] text-[10px] font-semibold tracking-[0.22em] text-[#CDA755]"
      });
    }

    // Priority 3: Airport fallback
    if (rental.airport) {
      badges.push({
        id: "airport",
        label: rental.airport,
        className: "border-white/10 bg-[rgba(5,5,5,0.62)] text-[10px] font-medium tracking-[0.18em] text-white/72"
      });
    }

    // Enforce max 2 badges to prevent visual clutter
    return badges.slice(0, 2);
  }, [isOpenJaw, categoryLabel, rental.airport]);

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#121212] text-white shadow-[0_24px_80px_rgba(5,5,5,0.28),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#CDA755]/40 hover:shadow-[0_30px_90px_rgba(167,99,48,0.22)] ${
        isSelected ? "ring-2 ring-amber-400/80 shadow-[0_0_0_3px_rgba(255,196,79,0.4)]" : ""
      }`}
    >
      {/* ── Cinematic hover radial — amber radar glow ── */}
      <div className="pointer-events-none absolute inset-0 z-10 rounded-[28px] bg-[radial-gradient(ellipse_at_top_right,rgba(205,167,85,0.14),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* ── Hero image — fixed aspect ratio container, no layout jump ── */}
      <div className="relative aspect-[4/4.7] overflow-hidden border-b border-white/10 bg-[#050505]">
        <img
          src={posterUrl}
          alt={`${brand} ${modelName}`}
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Film grain gradient overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.06)_0%,rgba(5,5,5,0.18)_30%,rgba(5,5,5,0.85)_100%)]" />

        <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2 pr-4">
          {topBadges.map((badge) => (
            <span
              key={badge.id}
              className={`rounded-full border px-3 py-1 uppercase backdrop-blur-md ${badge.className}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
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

      {/* ── Card body — #121212 → #050505 matte aluminum gradient ── */}
      <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,#121212_0%,#050505_100%)] p-6">
        {/* Telemetry grid */}
        <div className="grid grid-cols-3 gap-3 rounded-[22px] border border-white/10 bg-[rgba(87,76,67,0.12)] p-4 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <div>
            <div className="mb-2 flex justify-center text-[#CDA755]">
              <Gauge size={15} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
              Class
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white tabular-nums">
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
            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white tabular-nums">
              {rental.airport}
            </div>
          </div>
        </div>

        {/* Price block */}
        <div className="mt-5 rounded-[22px] border border-white/10 bg-[rgba(5,5,5,0.58)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-white/45">
                {missionContext ? "Base Machine Rate" : "Price Per Day"}
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-sans text-4xl font-black tabular-nums tracking-[-0.04em] text-white">
                  {formattedPrice}
                </span>
                <span className="pb-1 text-[11px] uppercase tracking-[0.22em] text-white/45">
                  / Day
                </span>
              </div>
              {missionContext && (
                <div className="mt-1.5 text-[9px] uppercase tracking-[0.2em] text-[#CDA755]/70">
                  + Broker & Logistics Fees
                </div>
              )}
            </div>
            <div className="mt-1 shrink-0 rounded-full border border-[#A76330]/30 bg-[rgba(167,99,48,0.12)] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[#CDA755]">
              Verified Rate
            </div>
          </div>

          {/* Destinations */}
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

        {/* ── Suitability Chips — "Why This Works" tactical bullets ── */}
        {suitabilityChips.length > 0 && (
          <div className="mt-4 space-y-2" data-testid="suitability-chips">
            {suitabilityChips.map((chip) => (
              <div
                key={chip}
                className="flex items-center gap-2.5 rounded-[14px] border border-[#CDA755]/20 bg-[rgba(205,167,85,0.06)] px-4 py-2.5"
              >
                <Crosshair size={12} className="shrink-0 text-[#CDA755]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#CDA755] tabular-nums">
                  {chip}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Split CTA — Dual-Engine conversion ── */}
        <div className="mt-auto flex flex-col gap-3 pt-5">
          <Link
            to={requestPath}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-[#CDA755]/60 bg-[#CDA755] px-5 py-4 text-center text-sm font-black uppercase tracking-[0.24em] text-[#050505] shadow-[0_4px_20px_rgba(205,167,85,0.25)] transition-all duration-300 hover:bg-[#F3E5C7] hover:shadow-[0_8px_30px_rgba(205,167,85,0.35)]"
            data-testid="cta-request"
          >
            <Crosshair size={14} />
            {isA2A ? "Request One-Way Machine" : "Request This Machine"}
          </Link>
          <Link
            to={shipPath}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-transparent px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-white/60 transition-all duration-300 hover:border-[#CDA755]/40 hover:text-[#CDA755]"
            data-testid="cta-ship"
          >
            <Truck size={13} />
            Ship Your Machine
          </Link>
        </div>
      </div>
    </article>
  );
}
