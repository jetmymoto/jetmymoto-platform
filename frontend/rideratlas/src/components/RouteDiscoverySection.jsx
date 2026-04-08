import React, { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { A2A_MISSIONS } from "@/features/routes/data/a2aMissions";

// ── Curated mission catalog ───────────────────────────────────────────────
// Each entry is an editorial mission. GRAPH data enriches but never blocks;
// the catalog renders instantly from this static set.

const EXPEDITION_CATALOG = [
  {
    slug: "alpine-arc",
    title: "Alpine Arc",
    countries: ["France", "Italy", "Switzerland"],
    region: "Europe",
    duration: "6–9 days",
    durationMin: 6,
    difficulty: "Intermediate",
    rideType: "Touring",
    blurb: "Precision tarmac, border crossings, and iconic high-pass touring through the heart of the European Alps.",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80",
    graphDest: "alps",
  },
  {
    slug: "scottish-highland-line",
    title: "Highland Line",
    countries: ["Scotland"],
    region: "Europe",
    duration: "4–6 days",
    durationMin: 4,
    difficulty: "Intermediate",
    rideType: "Adventure",
    blurb: "Single-track roads, coastal sweeps, and raw highland terrain where the weather is half the ride.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80",
    graphDest: "scottish-highlands",
  },
  {
    slug: "norwegian-fjord-corridor",
    title: "Fjord Corridor",
    countries: ["Norway"],
    region: "Europe",
    duration: "5–8 days",
    durationMin: 5,
    difficulty: "Advanced",
    rideType: "Coastal",
    blurb: "Fjord-carved switchbacks, midnight sun riding, and ferry crossings through Scandinavia's most dramatic coastline.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?auto=format&fit=crop&w=1400&q=80",
    graphDest: "norwegian-fjords",
  },
  {
    slug: "pyrenees-traverse",
    title: "Pyrenees Traverse",
    countries: ["France", "Spain"],
    region: "Europe",
    duration: "5–7 days",
    durationMin: 5,
    difficulty: "Intermediate",
    rideType: "Mountain",
    blurb: "Mountain ridges, Col d'Aubisque, and vineyard descents connecting Atlantic France to the Mediterranean.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
    graphDest: "pyrenees",
  },
  {
    slug: "dolomites-circuit",
    title: "Dolomites Circuit",
    countries: ["Italy"],
    region: "Europe",
    duration: "3–5 days",
    durationMin: 3,
    difficulty: "Advanced",
    rideType: "Mountain",
    blurb: "UNESCO spires, Stelvio hairpins, and carved-out passes that define high-altitude European riding.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",
    graphDest: "dolomites",
  },
  {
    slug: "pacific-coast-sweep",
    title: "Pacific Coast Sweep",
    countries: ["USA"],
    region: "North America",
    duration: "4–7 days",
    durationMin: 4,
    difficulty: "Easy",
    rideType: "Coastal",
    blurb: "Big Sur, redwood forests, and seven hundred miles of ocean-edge highway from San Francisco to San Diego.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    graphDest: "socal-coast",
  },
];

// ── A2A normalization helpers ─────────────────────────────────────────────

const THEATER_RIDE_TYPE = {
  alps: "Mountain",
  dolomites: "Mountain",
  pyrenees: "Mountain",
  "dalmatian-coast": "Coastal",
  "norwegian-fjords": "Coastal",
  "scottish-highlands": "Adventure",
  "balkan-spine": "Adventure",
  "albanian-alps": "Adventure",
  "socal-coast": "Coastal",
};

function parseDurationDays(duration) {
  if (!duration) return 5;
  const parts = String(duration).split("\u2013").map((n) => parseInt(n, 10)).filter(Boolean);
  if (parts.length === 2) return Math.round((parts[0] + parts[1]) / 2);
  return parts[0] || 5;
}

function estimateBasePrice(distanceKm, durationDays) {
  const days = parseDurationDays(durationDays);
  const distanceFactor = (distanceKm ?? 0) * 0.08;
  return Math.round(days * 180 + distanceFactor);
}

function getImbalanceLevel(subsidyPct) {
  if (subsidyPct >= 42) return "CRITICAL";
  if (subsidyPct >= 38) return "HIGH";
  return "MODERATE";
}

function getBikeAvailability(subsidyPct) {
  if (subsidyPct >= 44) return 1;
  if (subsidyPct >= 41) return 2;
  if (subsidyPct >= 38) return 3;
  return 4;
}

function parseDurationMin(duration_days) {
  const match = String(duration_days ?? "5").match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 5;
}

function normalizeA2AMission(m) {
  const subsidyPct = m.price_radar?.subsidy_pct ?? 0;
  const basePrice = estimateBasePrice(m.distance_km, m.duration_days);
  const finalPrice = Math.round(basePrice * (1 - subsidyPct / 100));
  const savings = basePrice - finalPrice;
  return {
    slug: m.slug,
    title: m.title,
    countries: [`${m.insertion_airport} → ${m.extraction_airport}`],
    region: m.continent === "europe" ? "Europe" : "North America",
    duration: `${m.duration_days} days`,
    durationMin: parseDurationMin(m.duration_days),
    difficulty: "Advanced",
    rideType: THEATER_RIDE_TYPE[m.theater] ?? "Touring",
    blurb: m.cinematic_pitch ?? "",
    image: "",
    graphDest: m.theater ?? null,
    featuredBike: m.featuredBike ?? null,
    highlights: m.highlights ?? [],
    subsidyPct,
    basePrice,
    finalPrice,
    savings,
    isA2A: true,
    missionType: m.price_radar?.positioning ?? "a2a",
    priorityScore: subsidyPct,
    insertion_airport: m.insertion_airport,
    extraction_airport: m.extraction_airport,
    distance_km: m.distance_km,
    price_radar: m.price_radar ?? null,
  };
}

// A2A missions with subsidy (rebalancing corridors), sorted highest subsidy first
const A2A_REBALANCING = A2A_MISSIONS
  .filter((m) => m.price_radar?.subsidy_pct)
  .map(normalizeA2AMission)
  .sort((a, b) => b.subsidyPct - a.subsidyPct);

// Unified catalog: rebalancing A2A first (by subsidy desc), then editorial
const UNIFIED_CATALOG = [...A2A_REBALANCING, ...EXPEDITION_CATALOG];

// Featured = highest-subsidy corridor (shown at 2× width in grid)
const FEATURED_SLUG = A2A_REBALANCING[0]?.slug ?? null;

// ── Mission intent types ──────────────────────────────────────────────────

const MISSION_INTENTS = [
  { id: "all", label: "All Missions" },
  { id: "rebalancing", label: "Rebalancing Missions" },
  { id: "weekend", label: "Weekend Escape" },
  { id: "expedition", label: "Full Expedition" },
  { id: "technical", label: "Technical Challenge" },
  { id: "coastal", label: "Scenic Coastal" },
];

// ── Filter definitions ────────────────────────────────────────────────────

const REGIONS = ["All", "Europe", "North America"];
const RIDE_TYPES = ["All", "Touring", "Adventure", "Coastal", "Mountain"];
const DIFFICULTIES = ["All", "Easy", "Intermediate", "Advanced"];

// ── Motion tokens ─────────────────────────────────────────────────────────

const sectionReveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

const cardReveal = (i) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
});

// ── Skeleton Card ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="relative flex flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111] h-[440px]">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-[#111] via-zinc-800/40 to-zinc-800/20" />
      <div className="relative z-10 flex flex-col gap-3 p-7">
        <div className="h-3 w-28 rounded bg-white/[0.06] animate-pulse" />
        <div className="h-6 w-44 rounded bg-white/[0.08] animate-pulse" />
        <div className="h-3 w-36 rounded bg-white/[0.06] animate-pulse" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 w-16 rounded-full bg-white/[0.06] animate-pulse" />
          <div className="h-5 w-20 rounded-full bg-white/[0.06] animate-pulse" />
        </div>
        <div className="h-10 w-full rounded bg-white/[0.04] animate-pulse mt-1" />
      </div>
    </div>
  );
}

// ── Mission Selector ──────────────────────────────────────────────────────

function MissionSelector({ activeIntent, onSelect }) {
  return (
    <motion.div
      {...sectionReveal}
      viewport={{ once: true }}
      className="mb-10 flex flex-wrap gap-2"
    >
      {MISSION_INTENTS.map((intent) => (
        <button
          key={intent.id}
          type="button"
          onClick={() => onSelect(intent.id)}
          className={`px-5 py-2 rounded-full text-[12px] font-mono uppercase tracking-[0.18em] border transition-all duration-300 ${
            activeIntent === intent.id
              ? "border-[#CDA755] bg-[#CDA755]/15 text-[#CDA755] shadow-[0_0_16px_rgba(205,167,85,0.12)]"
              : "border-white/[0.1] bg-white/[0.02] text-white/45 hover:text-white/65 hover:border-white/[0.2]"
          }`}
        >
          {intent.label}
        </button>
      ))}
    </motion.div>
  );
}

// ── Filter Chip ───────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.15em] border transition-all duration-300 ${
        active
          ? "border-[#CDA755]/50 bg-[#CDA755]/10 text-[#CDA755]"
          : "border-white/[0.08] bg-transparent text-white/40 hover:text-white/60 hover:border-white/[0.15]"
      }`}
    >
      {label}
    </button>
  );
}

// ── Mission Card ──────────────────────────────────────────────────────────

function MissionCard({ mission, index, shardState, rentalShard, onMissionHover, isFeatured }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const isA2A = mission.isA2A ?? false;
  const isHangarPriority = isA2A && (mission.subsidyPct ?? 0) > 42;
  const isPriorityAlloc = isA2A && (mission.price_radar?.notes ?? "").includes("Hangar Club");

  const countriesLabel = (mission.countries ?? []).join(" → ");
  const ctaHref = mission.graphDest
    ? `/destination/${encodeURIComponent(mission.graphDest)}`
    : "/routes";

  const rentalLoading = shardState === "idle" || shardState === "loading";
  const rentalsByDest = rentalShard?.rentalIndexes?.rentalsByDestination ?? {};
  const hasLocalRental = (rentalsByDest[mission.graphDest] ?? []).length > 0;

  const routeCount = mission.routeCount ?? 0;

  const handleMouseEnter = () => {
    onMissionHover?.({
      image: mission.image,
      title: mission.title,
      subtitle: countriesLabel,
      blurb: mission.blurb,
      subsidyPct: mission.subsidyPct ?? null,
      basePrice: mission.basePrice ?? null,
      finalPrice: mission.finalPrice ?? null,
      savings: mission.savings ?? null,
      featuredBike: mission.featuredBike ?? null,
      insertion_airport: mission.insertion_airport ?? null,
      extraction_airport: mission.extraction_airport ?? null,
    });
  };

  return (
    <motion.div
      {...cardReveal(index)}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={handleMouseEnter}
      className={`group relative flex flex-col justify-end overflow-hidden rounded-2xl border ${
        isA2A ? "border-[#CDA755]/20" : "border-white/[0.06]"
      } bg-[#111] ${isFeatured ? "md:col-span-2 h-[520px]" : "h-[440px]"} cursor-pointer`}
    >
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        {mission.image ? (
          <>
            <div
              className={`absolute inset-0 bg-cover bg-center transition-all duration-[1200ms] ease-out ${
                imgLoaded ? "opacity-100" : "opacity-0"
              } group-hover:scale-[1.04]`}
              style={{ backgroundImage: `url(${mission.image})` }}
            />
            <img
              src={mission.image}
              alt=""
              className="sr-only"
              onLoad={() => setImgLoaded(true)}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
            )}
          </>
        ) : isA2A ? (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1408] via-[#0d0d0d] to-[#070707]">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg,#CDA755 0,#CDA755 1px,transparent 0,transparent 50%)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#050505]/60 to-transparent transition-opacity duration-500 group-hover:from-[#0a0a0a]/95" />

      {/* A2A glow ring */}
      {isA2A && (
        <div className="absolute inset-0 rounded-2xl ring-1 ring-[#CDA755]/10 group-hover:ring-[#CDA755]/30 transition-all duration-500 pointer-events-none" />
      )}

      {/* Hover overlay — mission CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
        <span className="text-[12px] font-mono uppercase tracking-[0.3em] text-[#CDA755] border border-[#CDA755]/25 rounded-full px-6 py-2.5 backdrop-blur-sm bg-[#050505]/30">
          Start Mission
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
          {isA2A ? "Fleet reposition mission" : hasLocalRental ? "Bike ready at destination" : "Ship your bike"}
        </span>
      </div>

      {/* Content */}
      <Link to={ctaHref} className="relative z-10 flex flex-col gap-2.5 p-7 transition-transform duration-500 group-hover:-translate-y-1">
        {/* Top badge row */}
        <div className="flex items-center gap-2 flex-wrap">
          {isA2A ? (
            <span className="text-[9px] font-mono uppercase tracking-[0.35em] text-[#CDA755]">
              Rebalancing Corridor
            </span>
          ) : (
            <span className="text-[9px] font-mono uppercase tracking-[0.35em] text-[#CDA755]/70">
              Mission Ready
            </span>
          )}
          {isHangarPriority && (
            <span className="text-[8px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-[#CDA755]/15 border border-[#CDA755]/30 text-[#CDA755]">
              Hangar Priority
            </span>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
            {mission.rideType}
          </span>
          <span className="text-white/15">·</span>
          <span
            className={`text-[10px] font-mono uppercase tracking-[0.2em] ${
              mission.difficulty === "Advanced"
                ? "text-red-400/70"
                : mission.difficulty === "Easy"
                  ? "text-emerald-400/70"
                  : "text-amber-400/70"
            }`}
          >
            {mission.difficulty}
          </span>
          <span className="text-white/15">·</span>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
            {mission.duration}
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-serif text-white leading-tight tracking-tight ${
          isFeatured ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
        }`}>
          {mission.title}
        </h3>

        {/* Subtitle */}
        <p className="text-[13px] text-white/50 font-mono tracking-wide">
          {countriesLabel}
        </p>

        {/* Subsidy indicator (A2A only) */}
        {isA2A && (mission.subsidyPct ?? 0) > 0 && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CDA755] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#CDA755]" />
            </span>
            <span className="text-[10px] font-mono tracking-[0.15em] text-[#CDA755]">
              Up to {mission.subsidyPct}% subsidised
            </span>
          </div>
        )}

        {/* Blurb */}
        <p className="text-sm text-white/35 leading-relaxed line-clamp-2 max-w-sm">
          {mission.blurb}
        </p>

        {/* Featured bike (A2A only) */}
        {isA2A && mission.featuredBike && (
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/30">
            Primary machine:{" "}
            <span className="text-white/50">{mission.featuredBike}</span>
          </p>
        )}

        {/* Intelligence row */}
        <div className="flex items-center gap-4 mt-1 min-h-[20px]">
          {isA2A ? (
            isPriorityAlloc ? (
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#CDA755]/80">
                Priority Allocation Available
              </span>
            ) : (
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-amber-400/60">
                Operator-paid return corridor
              </span>
            )
          ) : rentalLoading ? (
            <div className="h-4 w-28 rounded-full bg-white/[0.06] animate-pulse" />
          ) : hasLocalRental ? (
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-400/70">
              Deploy locally
            </span>
          ) : (
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25">
              Requires airlift
            </span>
          )}

          {routeCount > 1 && (
            <>
              <span className="text-white/10">·</span>
              <span className="text-[10px] font-mono tracking-[0.1em] text-white/20">
                {routeCount} route variations
              </span>
            </>
          )}
        </div>

        {/* Economics Panel — A2A missions only */}
        {isA2A && mission.finalPrice != null && (() => {
          const level = getImbalanceLevel(mission.subsidyPct);
          const urgencyColor =
            level === "CRITICAL" ? "text-red-400" :
            level === "HIGH"     ? "text-amber-400" :
                                   "text-white/40";
          const urgencyLabel =
            level === "CRITICAL" ? "Immediate redeployment required" :
            level === "HIGH"     ? "Fleet imbalance: high" :
                                   "Fleet imbalance: moderate";
          const bikeCount = getBikeAvailability(mission.subsidyPct);
          const pricePerDay = Math.floor(mission.finalPrice / parseDurationDays(mission.duration));
          return (
            <div className={`mt-3 ${!isFeatured ? "h-[172px] overflow-hidden" : ""}`}>
              <div
                className={`p-4 rounded-xl bg-[#0c0c0c] border border-[#CDA755]/20 transition-opacity duration-500 ${
                  isFeatured ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                } ${isFeatured ? "ring-1 ring-[#CDA755]/15 shadow-[0_0_20px_rgba(205,167,85,0.06)]" : ""}`}
              >
                <span className="text-[10px] text-white/35 font-mono tracking-[0.2em] block mb-2">
                  {mission.insertion_airport} → {mission.extraction_airport}
                </span>
                {isFeatured && (
                  <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#CDA755] mb-3">
                    Best value corridor
                  </p>
                )}

                {/* Price row */}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
                      Mission Rate
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className={`font-serif text-white ${isFeatured ? "text-3xl" : "text-2xl"}`}>
                        €{mission.finalPrice.toLocaleString()}
                      </span>
                      <span className="text-sm line-through text-white/25">
                        €{mission.basePrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-emerald-400">
                      Save €{mission.savings.toLocaleString()} on this mission
                    </span>
                    <div className="text-[10px] text-white/40 mt-0.5">
                      ~€{pricePerDay}/day
                    </div>
                  </div>
                </div>

                {/* Subsidy bar */}
                <div className="mt-3 h-[4px] w-full bg-white/5 rounded overflow-hidden">
                  <div
                    className="h-full bg-[#CDA755] rounded transition-all duration-700 group-hover:shadow-[0_0_6px_rgba(205,167,85,0.6)]"
                    style={{ width: `${mission.subsidyPct}%` }}
                  />
                </div>

                {/* Urgency + scarcity row */}
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase tracking-[0.15em] ${urgencyColor} ${
                    level === "CRITICAL" ? "animate-pulse" : ""
                  }`}>
                    {urgencyLabel}
                  </span>
                  <span className="text-[10px] font-mono text-red-400/80">
                    {bikeCount} bike{bikeCount !== 1 ? "s" : ""} left
                  </span>
                </div>

                {/* Trust line */}
                <p className="mt-2 text-[10px] text-white/40 leading-relaxed">
                  Operators subsidise this route to reposition fleet between markets
                </p>
              </div>
            </div>
          );
        })()}
      </Link>
    </motion.div>
  );
}

// ── No Results State ──────────────────────────────────────────────────────

function NoResults({ onReset }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <p className="text-white/50 text-lg font-serif">
        No missions match this selection
      </p>
      <p className="text-white/30 text-sm mt-2 max-w-sm">
        Try adjusting your intent or filters to broaden the mission scope.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 px-6 py-2 rounded-full text-[11px] font-mono uppercase tracking-[0.2em] border border-[#CDA755]/30 text-[#CDA755] hover:bg-[#CDA755]/10 transition-colors"
      >
        Reset All
      </button>
    </div>
  );
}

// ── Section Bridge CTA ────────────────────────────────────────────────────

function SectionBridgeCTA() {
  return (
    <motion.div
      {...sectionReveal}
      viewport={{ once: true }}
      className="mt-20 text-center"
    >
      <p className="text-white/30 text-sm max-w-md mx-auto">
        Need to get your bike there first?
        <br />
        <span className="text-white/50">
          JetMyMoto coordinates the logistics behind every international ride.
        </span>
      </p>
      <Link
        to="/moto-airlift"
        className="mt-6 inline-flex items-center gap-3 px-8 py-3 rounded-full border border-[#CDA755]/25 text-[12px] font-mono uppercase tracking-[0.2em] text-[#CDA755] hover:bg-[#CDA755]/10 hover:border-[#CDA755]/40 transition-all duration-300"
      >
        Plan My Mission Logistics
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}

// ── Intent → filter mapping ───────────────────────────────────────────────

function applyIntentFilter(catalog, intentId) {
  if (intentId === "all") return catalog;
  switch (intentId) {
    case "rebalancing":
      return catalog.filter((r) => r.isA2A ?? false);
    case "weekend":
      return catalog.filter((r) => r.durationMin <= 4);
    case "expedition":
      return catalog.filter((r) => r.durationMin >= 5);
    case "technical":
      return catalog.filter((r) => r.difficulty === "Advanced");
    case "coastal":
      return catalog.filter((r) => r.rideType === "Coastal");
    default:
      return catalog;
  }
}

// ── Main Section ──────────────────────────────────────────────────────────

export default function RouteDiscoverySection({
  GRAPH = {},
  rentalShard,
  shardStatus = "idle",
  onMissionFocus,
}) {
  const [missionIntent, setMissionIntent] = useState("all");
  const [regionFilter, setRegionFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const resetAll = useCallback(() => {
    setMissionIntent("all");
    setRegionFilter("All");
    setTypeFilter("All");
    setDifficultyFilter("All");
  }, []);

  const handleIntentSelect = useCallback((intentId) => {
    setMissionIntent(intentId);
    // Reset granular filters when intent changes
    setRegionFilter("All");
    setTypeFilter("All");
    setDifficultyFilter("All");
  }, []);

  // Enrich catalog with GRAPH intelligence
  const enrichedCatalog = useMemo(() => {
    const graphRoutes = GRAPH?.routes ?? {};
    const routesByDest = GRAPH?.routesByDestination ?? GRAPH?.indexes?.routesByDestination ?? {};

    return UNIFIED_CATALOG.map((entry) => {
      if (!entry.graphDest) return { ...entry, routeCount: 0, hasMultiRouteOptions: false, primaryRouteSlug: null };

      const routeSlugs = routesByDest[entry.graphDest] ?? [];
      let shortestDist = null;
      let primarySlug = null;

      for (const slug of routeSlugs) {
        const r = graphRoutes[slug];
        const d = r?.distanceKm ?? r?.distance ?? null;
        if (d != null && (shortestDist === null || d < shortestDist)) {
          shortestDist = d;
          primarySlug = slug;
        }
      }

      return {
        ...entry,
        distanceKm: shortestDist,
        routeCount: routeSlugs.length,
        hasMultiRouteOptions: routeSlugs.length > 1,
        primaryRouteSlug: primarySlug,
      };
    });
  }, [GRAPH?.routes, GRAPH?.routesByDestination, GRAPH?.indexes?.routesByDestination]);

  // Apply intent filter first, then granular filters
  const filteredMissions = useMemo(() => {
    const intentFiltered = applyIntentFilter(enrichedCatalog, missionIntent);
    return intentFiltered.filter((r) => {
      if (regionFilter !== "All" && r.region !== regionFilter) return false;
      if (typeFilter !== "All" && r.rideType !== typeFilter) return false;
      if (difficultyFilter !== "All" && r.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [enrichedCatalog, missionIntent, regionFilter, typeFilter, difficultyFilter]);

  const hasActiveFilters =
    missionIntent !== "all" || regionFilter !== "All" || typeFilter !== "All" || difficultyFilter !== "All";

  return (
    <section className="relative py-28 bg-[#070707] text-white overflow-hidden border-t border-white/[0.04]">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(205,167,85,0.04),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">

        {/* ── Mission Selector (intent layer) ── */}
        <MissionSelector activeIntent={missionIntent} onSelect={handleIntentSelect} />

        {/* ── Header + Filters ── */}
        <motion.div
          {...sectionReveal}
          viewport={{ once: true }}
          className="mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8"
        >
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="h-[1px] w-10 bg-[#CDA755]/40" />
              <span className="text-[#CDA755] font-mono text-[10px] tracking-[0.4em] uppercase">
                Mission Discovery
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif tracking-tight">
              Select your mission
            </h2>
            <p className="text-white/40 mt-4 max-w-lg text-[15px] leading-relaxed">
              Choose your intent. See what's possible. Initiate the ride.
            </p>
          </div>

          {/* Granular Filters */}
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {REGIONS.map((r) => (
              <FilterChip key={r} label={r} active={regionFilter === r} onClick={() => setRegionFilter(r)} />
            ))}
            <div className="w-px h-6 bg-white/[0.08] self-center mx-1 hidden sm:block" />
            {RIDE_TYPES.map((t) => (
              <FilterChip key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
            ))}
            <div className="w-px h-6 bg-white/[0.08] self-center mx-1 hidden sm:block" />
            {DIFFICULTIES.map((d) => (
              <FilterChip key={d} label={d} active={difficultyFilter === d} onClick={() => setDifficultyFilter(d)} />
            ))}
          </div>
        </motion.div>

        {/* ── Mission Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMissions.length > 0
              ? filteredMissions.map((mission, i) => (
                  <MissionCard
                    key={mission.slug}
                    mission={mission}
                    index={i}
                    isFeatured={mission.slug === FEATURED_SLUG && i === 0}
                    shardState={shardStatus}
                    rentalShard={rentalShard}
                    onMissionHover={onMissionFocus}
                  />
                ))
              : hasActiveFilters
                ? <NoResults onReset={resetAll} />
                : Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />)
            }
          </AnimatePresence>
        </div>

        {/* Browse all */}
        {filteredMissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <Link
              to="/routes"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-white/30 hover:text-[#CDA755] transition-colors"
            >
              View all missions
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}

        {/* ── Bridge CTA ── */}
        <SectionBridgeCTA />
      </div>
    </section>
  );
}
