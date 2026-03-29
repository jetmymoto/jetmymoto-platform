import React, { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// ── Curated expedition catalog ────────────────────────────────────────────
// Each route is an editorial entry. GRAPH data enriches but never blocks;
// the catalog renders instantly from this static set.

const EXPEDITION_CATALOG = [
  {
    slug: "alpine-arc",
    title: "Alpine Arc",
    countries: ["France", "Italy", "Switzerland"],
    region: "Europe",
    duration: "6–9 days",
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
    difficulty: "Easy",
    rideType: "Coastal",
    blurb: "Big Sur, redwood forests, and seven hundred miles of ocean-edge highway from San Francisco to San Diego.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    graphDest: "socal-coast",
  },
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
    <div className="relative flex flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111] h-[420px]">
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

// ── Route Card ────────────────────────────────────────────────────────────

function RouteCard({ route, index, shardState, rentalShard }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const countriesLabel = (route.countries ?? []).join(" → ");
  const ctaHref = route.graphDest
    ? `/destination/${encodeURIComponent(route.graphDest)}`
    : "/routes";

  const rentalLoading = shardState === "idle" || shardState === "loading";
  const rentalsByDest = rentalShard?.rentalIndexes?.rentalsByDestination ?? {};
  const hasLocalRental = (rentalsByDest[route.graphDest] ?? []).length > 0;

  return (
    <motion.div
      {...cardReveal(index)}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111] h-[420px] cursor-pointer"
    >
      {/* Background image — loads independently, never blocks card shell */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-[1200ms] ease-out ${
            imgLoaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-[1.04]`}
          style={route.image ? { backgroundImage: `url(${route.image})` } : undefined}
        />
        {route.image && (
          <img
            src={route.image}
            alt=""
            className="sr-only"
            onLoad={() => setImgLoaded(true)}
          />
        )}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
        )}
      </div>

      {/* Gradient overlay — darkens subtly on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/60 to-transparent transition-opacity duration-500 group-hover:from-[#0a0a0a]/95" />

      {/* Hover explore label */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
        <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#CDA755]/80 border border-[#CDA755]/20 rounded-full px-5 py-2 backdrop-blur-sm bg-black/20">
          Explore Route
        </span>
      </div>

      {/* Content */}
      <Link to={ctaHref} className="relative z-10 flex flex-col gap-3 p-7 transition-transform duration-500 group-hover:-translate-y-1">
        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
            {route.rideType}
          </span>
          <span className="text-white/15">·</span>
          <span
            className={`text-[10px] font-mono uppercase tracking-[0.2em] ${
              route.difficulty === "Advanced"
                ? "text-red-400/70"
                : route.difficulty === "Easy"
                  ? "text-emerald-400/70"
                  : "text-amber-400/70"
            }`}
          >
            {route.difficulty}
          </span>
          <span className="text-white/15">·</span>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
            {route.duration}
          </span>
        </div>

        {/* Route title */}
        <h3 className="font-serif text-2xl md:text-3xl text-white leading-tight tracking-tight">
          {route.title}
        </h3>

        {/* Countries */}
        <p className="text-[13px] text-white/50 font-mono tracking-wide">
          {countriesLabel}
        </p>

        {/* Blurb */}
        <p className="text-sm text-white/35 leading-relaxed line-clamp-2 max-w-sm">
          {route.blurb}
        </p>

        {/* Availability — only this row shows skeleton when shard loading */}
        <div className="flex items-center gap-3 mt-1 h-5">
          {rentalLoading ? (
            <div className="h-4 w-28 rounded-full bg-white/[0.06] animate-pulse" />
          ) : hasLocalRental ? (
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-400/70">
              Local rentals available
            </span>
          ) : (
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25">
              Ship your bike
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ── No Results State ──────────────────────────────────────────────────────

function NoResults({ onReset }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <p className="text-white/50 text-lg font-serif">
        No routes match this selection
      </p>
      <p className="text-white/30 text-sm mt-2 max-w-sm">
        Try adjusting region or difficulty to broaden the expedition scope.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 px-6 py-2 rounded-full text-[11px] font-mono uppercase tracking-[0.2em] border border-[#CDA755]/30 text-[#CDA755] hover:bg-[#CDA755]/10 transition-colors"
      >
        Reset Filters
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
        Plan My Route & Shipping
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────

export default function RouteDiscoverySection({
  GRAPH = {},
  rentalShard,
  shardStatus = "idle",
}) {
  const [regionFilter, setRegionFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const resetFilters = useCallback(() => {
    setRegionFilter("All");
    setTypeFilter("All");
    setDifficultyFilter("All");
  }, []);

  // Enrich catalog with GRAPH distance data when available
  const enrichedCatalog = useMemo(() => {
    const graphRoutes = GRAPH?.routes ?? {};
    const routesByDest = GRAPH?.routesByDestination ?? GRAPH?.indexes?.routesByDestination ?? {};

    return EXPEDITION_CATALOG.map((entry) => {
      if (!entry.graphDest) return entry;
      const routeSlugs = routesByDest[entry.graphDest] ?? [];
      let shortestDist = null;
      for (const slug of routeSlugs) {
        const r = graphRoutes[slug];
        const d = r?.distanceKm ?? r?.distance ?? null;
        if (d != null && (shortestDist === null || d < shortestDist)) {
          shortestDist = d;
        }
      }
      return { ...entry, distanceKm: shortestDist };
    });
  }, [GRAPH?.routes, GRAPH?.routesByDestination, GRAPH?.indexes?.routesByDestination]);

  const filteredRoutes = useMemo(() => {
    return enrichedCatalog.filter((r) => {
      if (regionFilter !== "All" && r.region !== regionFilter) return false;
      if (typeFilter !== "All" && r.rideType !== typeFilter) return false;
      if (difficultyFilter !== "All" && r.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [enrichedCatalog, regionFilter, typeFilter, difficultyFilter]);

  const hasFilters = regionFilter !== "All" || typeFilter !== "All" || difficultyFilter !== "All";

  return (
    <section className="relative py-28 bg-[#070707] text-white overflow-hidden border-t border-white/[0.04]">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(205,167,85,0.04),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
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
                Route Discovery
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif tracking-tight">
              Ride the world with intent
            </h2>
            <p className="text-white/40 mt-4 max-w-lg text-[15px] leading-relaxed">
              Curated routes and destination corridors for riders planning beyond the local horizon.
            </p>
          </div>

          {/* Filters */}
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

        {/* ── Route Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRoutes.length > 0
              ? filteredRoutes.map((route, i) => (
                  <RouteCard
                    key={route.slug}
                    route={route}
                    index={i}
                    shardState={shardStatus}
                    rentalShard={rentalShard}
                  />
                ))
              : hasFilters
                ? <NoResults onReset={resetFilters} />
                : Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />)
            }
          </AnimatePresence>
        </div>

        {/* Browse all */}
        {filteredRoutes.length > 0 && (
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
              View all expedition routes
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
