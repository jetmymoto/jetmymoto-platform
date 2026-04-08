import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gauge, MapPin, ShieldCheck, Crosshair, Truck } from "lucide-react";
import { readGraphShard } from "@/core/network/networkGraph";
import { useAssetLibrary } from "@/hooks/useAssetLibrary";
import {
  getRentalBrand,
  getRentalModelName,
  getRentalCategoryLabel,
  getRentalPrice,
  formatRentalPrice,
  getRentalPosterUrl,
  CATEGORY_MEDIA,
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

function buildRentalDetailPath(rental, missionContext) {
  const path = `/rental/${rental?.slug || rental?.id || ""}`;

  if (!missionContext) {
    return path;
  }

  const params = new URLSearchParams();
  if (missionContext.insertionCode) params.set("insertion", missionContext.insertionCode);
  if (missionContext.extractionCode) params.set("extraction", missionContext.extractionCode);
  if (missionContext.missionSlug) params.set("mission", missionContext.missionSlug);
  params.set("flow", "one-way");

  return `${path}?${params.toString()}`;
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

  const assetId = useMemo(() => {
    return `${brand.toLowerCase()}-${modelName.toLowerCase().replace(/\s+/g, "")}`;
  }, [brand, modelName]);

  const { currentImage } = useAssetLibrary("rental", assetId, posterUrl);

  const detailPath = useMemo(() => buildRentalDetailPath(rental, missionContext), [rental, missionContext]);
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
      className={`group relative flex h-full flex-col overflow-hidden bg-[#050505] text-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(205,167,85,0.15)] ${
        isSelected ? "ring-1 ring-[#CDA755] shadow-[0_0_40px_rgba(205,167,85,0.25)]" : "border border-white/5"
      }`}
    >
      {/* ── Cinematic hover radial — amber radar glow ── */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(205,167,85,0.1),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* ── Hero image — fixed aspect ratio container, no layout jump ── */}
      <div className="relative aspect-[4/4.7] overflow-hidden border-b border-white/5 bg-[#050505]">
        <img
          src={currentImage}
          alt={`${brand} ${modelName}`}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            const fallbackUrl = CATEGORY_MEDIA[String(rental?.category || "").toLowerCase()] || CATEGORY_MEDIA.default;
            if (e.target.src !== fallbackUrl) {
              e.target.src = fallbackUrl;
            }
          }}
          className={`h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Film grain gradient overlay - much darker at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

        {/* Top-left labels */}
        <div className="absolute left-4 top-4 z-20 flex flex-col items-start gap-2">
          {topBadges.map((lbl, idx) => (
            <div
              key={idx}
              className={`border border-[#CDA755]/30 bg-[#050505]/80 px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-widest text-[#CDA755] backdrop-blur-sm`}
            >
              {lbl.label}
            </div>
          ))}
        </div>

        {/* Price Tag (Top Right) */}
        <div className="absolute right-4 top-4 z-20">
          <div className="flex flex-col items-end border border-white/5 bg-[#050505]/90 px-3 py-1.5 backdrop-blur-md">
            <span className="text-[9px] font-mono tracking-[0.2em] text-[#CDA755] uppercase">
              {missionContext ? "Base Rate" : "Per Day"}
            </span>
            <span className="font-mono text-lg font-bold tabular-nums text-white">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Content overlay bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#CDA755]">
              {operator?.name || rental.operator}
            </div>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">
              {brand}
            </div>
          </div>

          <h3 className="font-headline text-3xl font-bold uppercase leading-[0.9] tracking-[0.02em] text-white drop-shadow-md">
            {modelName}
          </h3>
        </div>
      </div>

      {/* ── Card body — pure #050505 ── */}
      <div className="flex flex-1 flex-col bg-[#050505] p-6">
        {/* Telemetry grid */}
        <div className="grid grid-cols-3 gap-0 border border-white/5 bg-[#050505]">
          <div className="border-r border-white/5 p-4 flex flex-col items-center">
            <div className="mb-2 text-[#CDA755] opacity-50"><Gauge size={14} /></div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1">
              Class
            </div>
            <div className="text-xs font-mono font-bold text-white tabular-nums text-center leading-tight">
              {categoryLabel}
            </div>
          </div>
          <div className="border-r border-white/5 p-4 flex flex-col items-center">
            <div className="mb-2 text-[#CDA755] opacity-50"><ShieldCheck size={14} /></div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1">
              Status
            </div>
            <div className="text-xs font-mono font-bold text-white tabular-nums">
              Verified
            </div>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="mb-2 text-[#CDA755] opacity-50"><MapPin size={14} /></div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1">
              Hub
            </div>
            <div className="text-xs font-mono font-bold text-white tabular-nums">
              {rental.airport}
            </div>
          </div>
        </div>

        {/* Suitability Chips */}
        {suitabilityChips.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2" data-testid="suitability-chips">
            {suitabilityChips.map((chip) => (
              <div
                key={chip}
                className="flex items-center gap-2 border border-[#CDA755]/20 bg-[#CDA755]/5 px-3 py-1.5"
              >
                <div className="w-1 h-1 bg-[#CDA755] rounded-full shrink-0" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#CDA755]">
                  {chip}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Split CTA — Tactical ── */}
        <div className="mt-auto flex flex-col gap-3 pt-6">
          <Link
            to={requestPath}
            className="flex w-full items-center justify-center gap-3 border border-[#CDA755] bg-[#CDA755] px-5 py-4 text-center text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#050505] transition-all duration-300 hover:bg-[#050505] hover:text-[#CDA755]"
            data-testid="cta-request"
          >
            <Crosshair size={14} />
            {isA2A ? "AUTHORIZE ONE-WAY" : "AUTHORIZE DEPLOYMENT"}
          </Link>
          <Link
            to={detailPath}
            className="flex w-full items-center justify-center gap-2 px-5 py-3 text-center text-[9px] font-mono uppercase tracking-[0.2em] text-[#CDA755]/50 transition-colors duration-300 hover:text-[#CDA755]"
          >
            VIEW ASSET DOSSIER
          </Link>
        </div>
      </div>
    </article>
  );
}