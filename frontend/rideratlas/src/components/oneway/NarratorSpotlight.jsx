import { Link } from "react-router-dom";
import { ArrowRight, Gauge, Cpu } from "lucide-react";

import { GRAPH } from "@/core/network/networkGraph";
import { A2A_NARRATIVE_INTEL } from "@/features/routes/data/a2aNarrativeIntel";

// ── Featured spotlight slugs (Price Killer flagship, Alpine epic, Nordic crossing) ──
const FEATURED_SLUGS = [
  "cdg-to-mad-iberian-corridor",
  "mxp-to-vie-alpine-eastward",
  "osl-to-cph-nordic-coast",
];

// ── Difficulty bar helper ─────────────────────────────────────────────────────

function DifficultyBar({ rating = 1, max = 5 }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`h-1 w-5 rounded-full transition-colors ${
            i < rating ? "bg-[#CDA755]" : "bg-white/8"
          }`}
        />
      ))}
      <span className="font-mono text-[9px] text-zinc-600 ml-1 uppercase tracking-widest">
        {rating < 2 ? "Easy" : rating < 3 ? "Moderate" : rating < 4 ? "Technical" : "Expert"}
      </span>
    </div>
  );
}

// ── Intel status badge ────────────────────────────────────────────────────────

function IntelBadge({ source }) {
  const isEnriched = source === "ai-enriched";
  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono text-[8px] font-black uppercase tracking-widest px-2.5 py-1 border ${
        isEnriched
          ? "border-[#CDA755]/40 bg-[#CDA755]/5 text-[#CDA755]"
          : "border-white/8 bg-white/3 text-zinc-600"
      }`}
    >
      <span className={`w-1 h-1 rounded-full ${isEnriched ? "bg-[#CDA755] animate-pulse" : "bg-zinc-600"}`} />
      {isEnriched ? "Iron Legion Enriched" : "Field Intel"}
    </div>
  );
}

// ── Single spotlight card ─────────────────────────────────────────────────────

function SpotlightCard({ mission, intel, index }) {
  if (!mission) return null;

  const pickupCode  = mission.insertion?.code  || mission.insertion_airport  || "";
  const pickupCity  = mission.insertion?.city  || pickupCode;
  const dropoffCode = mission.extraction?.code || mission.extraction_airport || "";
  const dropoffCity = mission.extraction?.city || dropoffCode;

  const pitch    = intel?.cinematic_pitch_enhanced || mission.cinematic_pitch || "";
  const anchor   = intel?.sensory_anchor           || null;
  const hardware = intel?.hardware_recommendation  || null;
  const tags     = intel?.terrain_tags             || [];
  const rating   = intel?.difficulty_rating        || null;
  const source   = intel?.source                   || "field-intel";
  const distance = mission.distance_km ?? mission.corridor_distance_km;

  // Alternate horizontal orientation per card
  const isReversed = index % 2 === 1;

  return (
    <article
      className={`grid md:grid-cols-5 gap-0 border border-white/8 bg-[#1E1E1E] group hover:border-[#CDA755]/20 transition-all duration-300 ${
        isReversed ? "md:direction-rtl" : ""
      }`}
    >
      {/* ── Left/Right accent panel ── */}
      <div
        className={`relative md:col-span-2 min-h-[220px] md:min-h-0 bg-[#050505] border-b md:border-b-0 border-white/5 flex flex-col justify-between p-8 overflow-hidden ${
          isReversed ? "md:order-last md:border-l border-white/5" : "md:border-r border-white/5"
        }`}
      >
        {/* Large IATA codes — decorative background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-mono font-black text-[120px] leading-none text-white/3 tabular-nums tracking-tighter">
            {pickupCode}
          </span>
        </div>

        {/* Corridor route display */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-3xl md:text-4xl font-black tabular-nums text-white">{pickupCode}</span>
            <ArrowRight size={16} className="text-[#CDA755] shrink-0" />
            <span className="font-mono text-3xl md:text-4xl font-black tabular-nums text-white">{dropoffCode}</span>
          </div>
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
            {pickupCity} → {dropoffCity}
          </div>
        </div>

        {/* Intel badge + distance */}
        <div className="relative z-10 space-y-3">
          <IntelBadge source={source} />
          {distance && (
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
              <Gauge size={9} />
              <span className="tabular-nums">{distance} km</span>
            </div>
          )}
          {rating && <DifficultyBar rating={rating} />}
        </div>
      </div>

      {/* ── Main content panel ── */}
      <div className={`md:col-span-3 p-8 md:p-10 flex flex-col justify-between ${isReversed ? "md:order-first" : ""}`}>

        {/* Mission title */}
        {mission.title && (
          <div className="mb-5">
            <h3 className="text-lg md:text-xl font-black tracking-tight italic text-white uppercase leading-tight">
              {mission.title}
            </h3>
          </div>
        )}

        {/* Cinematic pitch */}
        {pitch && (
          <p className="text-sm leading-7 text-zinc-400 mb-6 flex-1">
            {pitch}
          </p>
        )}

        {/* Sensory anchor pull-quote */}
        {anchor && (
          <blockquote className="border-l-2 border-[#CDA755]/40 pl-4 mb-6">
            <p className="text-xs leading-6 text-zinc-500 italic">
              {anchor}
            </p>
          </blockquote>
        )}

        <div className="space-y-5">
          {/* Terrain tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[8px] uppercase tracking-widest text-zinc-600 border border-white/8 px-2 py-1"
                >
                  {tag.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          )}

          {/* Hardware recommendation */}
          {hardware && (
            <div className="flex items-start gap-3 border-t border-white/5 pt-5">
              <Cpu size={12} className="text-[#CDA755] shrink-0 mt-0.5" />
              <p className="text-xs leading-6 text-zinc-500">
                <span className="text-white font-black">Hardware: </span>
                {hardware}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between border-t border-white/5 pt-5">
            <Link
              to={`/a2a/${mission.slug}`}
              className="group/link flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest text-[#CDA755] hover:text-white transition-colors"
            >
              View Mission Dossier
              <ArrowRight
                size={12}
                className="group-hover/link:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * NarratorSpotlight
 *
 * Showcases 3 featured A2A corridors with full Iron Legion editorial treatment.
 * Data sourced from A2A_NARRATIVE_INTEL (seeded field intel; will be replaced
 * by AI-enriched content when scripts/05-harvestA2ANarratives.mjs runs).
 *
 * Falls back gracefully to GRAPH.missions[slug] base data when intel not found.
 */
export default function NarratorSpotlight() {
  const intelIndex = Object.fromEntries(
    A2A_NARRATIVE_INTEL.map((n) => [n.slug, n])
  );

  const spotlightItems = FEATURED_SLUGS
    .map((slug) => ({
      mission: GRAPH.missions?.[slug] ?? null,
      intel: intelIndex[slug] ?? null,
    }))
    .filter((item) => item.mission !== null);

  if (spotlightItems.length === 0) return null;

  return (
    <section className="bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-24">

        {/* ── Section header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="font-mono text-[10px] font-black tracking-[0.5em] text-zinc-600 uppercase mb-4">
              Iron Legion // Mission Dossiers
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-tight">
              Featured Corridors
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-500 max-w-xl">
              Tactical mission briefings for the highest-priority fleet rebalancing corridors. Each dossier is pinned to the specific hardware validated for that route.
            </p>
          </div>

          {/* Intel pipeline status */}
          <div className="shrink-0 font-mono text-[9px] border border-white/8 bg-[#1E1E1E] px-5 py-3 text-zinc-600 uppercase tracking-widest space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CDA755] animate-pulse" />
              <span className="text-[#CDA755] font-black">Narrator Pipeline</span>
            </div>
            <div className="text-zinc-700 pl-3.5">SerpAPI → Gemini 2.5 Flash</div>
            <div className="text-zinc-700 pl-3.5">{FEATURED_SLUGS.length} corridors / harvest pending</div>
          </div>
        </div>

        {/* ── Spotlight cards ── */}
        <div className="space-y-6">
          {spotlightItems.map((item, i) => (
            <SpotlightCard
              key={item.mission.slug}
              mission={item.mission}
              intel={item.intel}
              index={i}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
