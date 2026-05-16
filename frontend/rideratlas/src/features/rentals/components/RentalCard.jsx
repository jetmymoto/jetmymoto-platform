import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Crosshair } from "lucide-react";
import { readGraphShard } from "@/core/network/networkGraph";
import { useAssetLibrary } from "@/hooks/useAssetLibrary";
import SafeImage from "@/components/ui/SafeImage";
import {
  getRentalBrand,
  getRentalModelName,
  getRentalCategoryLabel,
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
  const isA2A = Boolean(missionContext);
  
  // TODO: replace with GRAPH.oneWayCompatibleByMission[missionSlug].includes(rental.id)

  return (
    <article
      data-testid={`rental-card-${rental?.slug || rental?.id || "unknown"}`}
      className={`group relative flex h-full flex-col overflow-hidden border border-white/10 bg-[#050505] text-white transition-all duration-500 hover:-translate-y-1 ${
        isSelected ? "ring-1 ring-[#CDA755]/70 shadow-[0_0_40px_rgba(205,167,85,0.18)]" : "shadow-[0_18px_36px_-18px_rgba(0,0,0,0.45)]"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <SafeImage
          src={currentImage}
          alt={`${brand} ${modelName}`}
          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
          fallback={CATEGORY_MEDIA[String(rental?.category || "").toLowerCase()] || CATEGORY_MEDIA.default}
          showPlaceholder={true}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-8 lg:p-10">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#CDA755]/70">
              {operator?.name || rental.operator || "Fleet Partner"}
            </div>
            <h3 className="mt-2 font-headline text-3xl font-bold tracking-tight uppercase">
              {brand} {modelName}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#CDA755]">ID: {String(rental?.id || rental?.slug || "N/A").toUpperCase()}</span>
        </div>

        <div className="space-y-4 mb-8 font-mono text-[11px] uppercase tracking-wider">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="opacity-50">Category</span>
            <span>{categoryLabel}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="opacity-50">Price</span>
            <span>{formattedPrice}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="opacity-50">Hub</span>
            <span>{rental.airport || rental.airportCode || "—"}</span>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <Link
            to={requestPath}
            className={`flex w-full items-center justify-center gap-3 border px-5 py-4 text-center text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all ${
              isSelected
                ? "border-[#CDA755] bg-[#CDA755] text-[#050505]"
                : "border-[#CDA755]/40 text-white hover:bg-[#CDA755] hover:text-[#050505]"
            }`}
            data-testid="cta-request"
          >
            <Crosshair size={14} />
            {isA2A ? "AUTHORIZE ONE-WAY" : "CONFIGURE JOURNEY"}
          </Link>
          <Link
            to={detailPath}
            className="flex w-full items-center justify-center gap-2 text-center text-[9px] font-mono uppercase tracking-[0.2em] text-[#CDA755]/60 transition-colors duration-300 hover:text-[#CDA755]"
          >
            VIEW ASSET DOSSIER
          </Link>
        </div>
      </div>
    </article>
  );
}
