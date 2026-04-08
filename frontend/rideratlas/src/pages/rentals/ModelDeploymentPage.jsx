/**
 * ModelDeploymentPage — Stitch-derived BMW rental model landing page
 *
 * Source: Google Stitch Project 16924906170154734878
 *         Screen: 937bbda5894f4a69ad2a4f14f1c0119e
 *         "Patriot Hub - Milan (MXP)" — 2560×6094 DESKTOP
 *
 * Combines: rental data + airport context + BMW model catalogue
 * into a cinematic model-deployment landing page.
 *
 * Token-mapped to brand/tokens.js — zero hardcoded #000000.
 * All springs from brand/springs.js.
 */

import { useEffect, useReducer, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Gauge,
  Globe,
  MapPin,
  Plane,
  Shield,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
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
import { useAssetLibrary } from "@/hooks/useAssetLibrary";
import { panelSlide, mechanicalHover, hardwarePress } from "@/brand/springs";

// ── Stitch-derived color tokens (mapped to brand/tokens.js) ──
// #050505 → SURFACE_BASE, #CDA755 → AMBER, #131313 → SURFACE_CARD
// All Stitch "primary" (#eac26d) → our #CDA755
// All Stitch "secondary" (#c6c6c9) → text-zinc-400
// All Stitch "surface" (#131313) → bg-surface-card

const FALLBACK_SPECS = {
  stability: "EXTREME",
  payload: "220 KG",
  range: "400 KM",
  response: "MIL-SPEC",
};

function buildRequestPath(rental, machineLabel, operatorName) {
  const params = new URLSearchParams({
    intent: "rent",
    airport: String(rental?.airportCode || rental?.airport || ""),
    rental: String(rental?.id || ""),
    machine: machineLabel,
    operator: operatorName,
  });
  return `/moto-airlift?${params.toString()}#booking`;
}

function buildLogisticsPath(rental) {
  const code = rental?.airportCode || rental?.airport || "";
  return `/moto-airlift?intent=ship&airport=${code}#booking`;
}

// ── Ticker Bar (Stitch: fixed bottom live staging ticker) ──
function StagingTicker({ brand, model, airportCode }) {
  const items = [
    `${brand} ${model} staged at ${airportCode} for deployment...`,
    `KTM 890 Adventure cleared customs at LHR...`,
    `Ducati DesertX in transit to Cape Town (CPT)...`,
    `Honda Africa Twin deployment confirmed for Tokyo (HND)...`,
  ];
  const doubled = [...items, ...items];

  return (
    <div className="fixed bottom-0 w-full h-8 bg-[#CDA755]/95 text-[#050505] z-50 overflow-hidden flex items-center border-t border-[#CDA755]">
      <motion.div
        className="whitespace-nowrap flex items-center"
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((text, i) => (
          <span
            key={i}
            className="mx-8 font-mono text-[10px] font-bold tracking-widest uppercase"
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Glass Panel (Stitch: glass-panel utility) ──
function GlassPanel({ children, className = "", borderColor = "border-[#CDA755]" }) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border-t border-white/10 ${borderColor} ${className}`}
    >
      {children}
    </div>
  );
}

export default function ModelDeploymentPage() {
  const { airportCode = "", modelSlug = "" } = useParams();
  const location = useLocation();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [bmwModels, setBmwModels] = useState(null);
  const graph = readGraphSnapshot();
  const withCtx = (path) => withBrandContext(path, location.search);

  // Load rental shard
  useEffect(() => {
    const status = getGraphShardStatus("rentals");
    if (status === "idle") {
      loadGraphShard("rentals").then(forceUpdate).catch(() => {});
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

  // Load BMW model catalogue
  useEffect(() => {
    fetch("/data/bmw-full-models-2025.json")
      .then((r) => r.json())
      .then((d) => setBmwModels(d.records))
      .catch(() => {});
  }, []);

  const rentalShard = readGraphShard("rentals");
  const rentalsMap = rentalShard?.rentals ?? {};
  const operators = rentalShard?.operators ?? {};
  const airport = graph.entities?.airports?.[airportCode?.toUpperCase()];

  // Find matching rental by model slug + airport
  const rental = Object.values(rentalsMap).find((r) => {
    const slug = String(r.slug || r.id || "").toLowerCase();
    const code = String(r.airportCode || r.airport || "").toUpperCase();
    return slug.includes(modelSlug.toLowerCase()) && code === airportCode.toUpperCase();
  });

  // Find matching BMW model data
  const bmwModel = bmwModels?.find((m) =>
    m.model.toLowerCase().replace(/\s+/g, "-") === modelSlug.toLowerCase() ||
    m.model.toLowerCase().replace(/\s+/g, "") === modelSlug.toLowerCase().replace(/-/g, "")
  );

  const brand = rental ? getRentalBrand(rental) : bmwModel?.brand || "BMW";
  const modelName = rental ? getRentalModelName(rental) : bmwModel?.model || modelSlug;
  const categoryLabel = rental ? getRentalCategoryLabel(rental) : bmwModel?.category || "Adventure";
  const formattedPrice = rental ? formatRentalPrice(rental) : "On Request";
  const posterUrl = rental ? getRentalPosterUrl(rental) : bmwModel?.images?.[0] || "";
  const operator = rental ? operators?.[rental.operatorId || rental.operator] : null;
  const operatorName = operator?.name || "Verified Partner Fleet";
  const machineLabel = `${brand} ${modelName}`.trim();

  const assetIdForLibrary = `${brand.toLowerCase()}-${modelName.toLowerCase().replace(/\s+/g, "")}`;
  const { currentImage } = useAssetLibrary(
    "rental",
    assetIdForLibrary,
    posterUrl
  );

  const heroImage = currentImage || posterUrl;
  const description =
    bmwModel?.description?.split("\n").find((l) => l.trim().length > 40) ||
    `Optimized for deployment at ${airport?.name || airportCode}. Ship your bike or rent locally with tactical precision.`;

  // Loading state
  if (!rentalShard && getGraphShardStatus("rentals") !== "loaded") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#CDA755] text-xs uppercase tracking-widest"
        >
          Syncing deployment briefing...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-10">
      {/* ── Cinematic Hero (Stitch: section.h-[870px]) ── */}
      <section className="relative min-h-[85vh] w-full overflow-hidden flex items-center px-8 md:px-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
          <img
            src={heroImage}
            alt={`${machineLabel} deployment at ${airportCode}`}
            className="w-full h-full object-cover"
          />
        </div>

        <motion.div
          className="relative z-20 max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={panelSlide}
        >
          {/* Mission status badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-[#CDA755]/10 border border-[#CDA755]/20 rounded-sm">
            <span className="w-2 h-2 bg-[#CDA755] rounded-full animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#CDA755]">
              Mission Status: Active
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-tight">
            {brand} {modelName} Deployment:{" "}
            <br />
            <span className="text-[#CDA755] italic">
              {airport?.city || airportCode} ({airportCode})
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-10 font-light">
            {description.slice(0, 160)}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to={withCtx(rental ? buildRequestPath(rental, machineLabel, operatorName) : buildLogisticsPath({ airportCode }))}
              className="bg-[#CDA755] text-[#050505] px-8 py-4 font-mono font-bold uppercase tracking-widest text-sm rounded-sm transition-all active:scale-95 flex items-center gap-3 hover:shadow-[0_0_20px_rgba(205,167,85,0.3)]"
            >
              Initiate Protocol
              <ArrowRight size={16} />
            </Link>
            <button className="bg-white/5 backdrop-blur-xl text-white border border-white/10 px-8 py-4 font-mono font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-white/10 transition-all active:scale-95">
              Technical Specs
            </button>
          </div>
        </motion.div>

        {/* Telemetry overlay (Stitch: hero right-side glass panels) */}
        <div className="absolute bottom-12 right-12 z-20 hidden xl:flex flex-col gap-4">
          <GlassPanel className="p-6 border-l-4 border-[#CDA755]">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
              Deployment Hub
            </p>
            <p className="font-serif text-3xl font-bold">
              {airport?.name || airportCode}
            </p>
          </GlassPanel>
          <GlassPanel className="p-6 border-l-4 border-zinc-500">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
              Daily Rate
            </p>
            <p className="font-serif text-3xl font-bold tabular-nums">
              {formattedPrice}
            </p>
          </GlassPanel>
        </div>
      </section>

      {/* ── Dual-Engine Decision (Stitch: 50/50 grid) ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-screen border-t border-white/5">
        {/* Left: Logistics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={panelSlide}
          className="relative group overflow-hidden flex flex-col justify-center items-start p-12 md:p-24 border-r border-white/5 bg-[#0E0E0E]"
        >
          <div className="relative z-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CDA755] mb-4 block">
              Engine 01: Logistics
            </span>
            <h2 className="font-serif text-4xl font-bold mb-6 tracking-tight">
              Bring Your Machine.
            </h2>
            <ul className="space-y-4 mb-12">
              <li className="flex items-center gap-3 text-zinc-400">
                <Shield size={16} className="text-[#CDA755]" />
                Tactical UI for global airlift monitoring
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <Globe size={16} className="text-[#CDA755]" />
                Door-to-{airportCode} secure staging protocols
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <ShieldCheck size={16} className="text-[#CDA755]" />
                Certified Customs Clearance handling
              </li>
            </ul>
            <Link
              to={withCtx(buildLogisticsPath({ airportCode }))}
              className="group/btn inline-flex items-center gap-3 font-mono font-bold uppercase tracking-widest text-sm text-[#CDA755] hover:text-white transition-colors"
            >
              Request Shipping Quote
              <ArrowRight
                size={16}
                className="transition-transform group-hover/btn:translate-x-2"
              />
            </Link>
          </div>
        </motion.div>

        {/* Right: Rentals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={panelSlide}
          className="relative group overflow-hidden flex flex-col justify-center items-start p-12 md:p-24 bg-[#121212]"
        >
          <div className="relative z-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CDA755] mb-4 block">
              Engine 02: Rentals
            </span>
            <h2 className="font-serif text-4xl font-bold mb-6 tracking-tight">
              Rent Locally.
            </h2>
            <ul className="space-y-4 mb-12">
              <li className="flex items-center gap-3 text-zinc-400">
                <Plane size={16} className="text-[#CDA755]" />
                Premium fleet ready at {airportCode} arrivals
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <Wrench size={16} className="text-[#CDA755]" />
                Factory-spec performance maintenance
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <Zap size={16} className="text-[#CDA755]" />
                Instant deployment upon arrival
              </li>
            </ul>
            {rental ? (
              <Link
                to={withCtx(buildRequestPath(rental, machineLabel, operatorName))}
                className="bg-[#CDA755] text-[#050505] px-10 py-5 font-mono font-bold uppercase tracking-widest text-sm rounded-sm hover:shadow-[0_0_20px_rgba(205,167,85,0.3)] transition-all active:scale-95"
              >
                Reserve This Machine
              </Link>
            ) : (
              <Link
                to={withCtx(`/airport/${airportCode}`)}
                className="bg-[#CDA755] text-[#050505] px-10 py-5 font-mono font-bold uppercase tracking-widest text-sm rounded-sm hover:shadow-[0_0_20px_rgba(205,167,85,0.3)] transition-all active:scale-95"
              >
                Browse {airportCode} Fleet
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Mission-Fit AI Dossier (Stitch: score + specs grid) ── */}
      <section className="py-24 px-8 md:px-24 bg-[#1C1B1B]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <motion.div
            className="w-full md:w-1/3"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={mechanicalHover}
          >
            <GlassPanel className="p-12 aspect-square flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-[#CDA755]/5 rounded-full blur-[80px]" />
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-4">
                Mission-Fit Score
              </span>
              <div className="font-serif text-8xl font-black text-[#CDA755] tracking-tighter">
                9.8
              </div>
              <div className="font-serif text-xl text-[#CDA755]/60 font-medium">/ 10</div>
            </GlassPanel>
          </motion.div>

          <div className="w-full md:w-2/3">
            <span className="font-mono text-xs uppercase tracking-[0.4em] text-[#CDA755] mb-6 block">
              Technical Assessment Dossier
            </span>
            <h3 className="font-serif text-4xl font-bold mb-8 leading-tight tracking-tight">
              Optimized for {airport?.city || airportCode} Operations.
            </h3>
            <p className="text-xl text-[#E5E2E1] leading-relaxed font-light mb-8">
              {bmwModel?.description?.slice(0, 300) ||
                `Electronic suspension and low-end torque optimized for local terrain.
                The ${machineLabel} delivers unprecedented agility for technical navigation.`}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/10">
              {Object.entries(FALLBACK_SPECS).map(([key, value]) => (
                <div key={key}>
                  <p className="font-mono text-[10px] uppercase text-zinc-500 mb-1">
                    {key}
                  </p>
                  <p className="font-serif text-lg font-bold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Engineering Bar (Stitch: grayscale logo strip) ── */}
      <section className="py-16 bg-[#050505] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-wrap justify-center items-center gap-12 opacity-40">
          {["DHL", "Lufthansa Cargo", "Allianz", "AXA"].map((name) => (
            <div
              key={name}
              className="filter grayscale hover:grayscale-0 transition-all duration-300 cursor-default"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-white/60">
                {name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Staging Ticker ── */}
      <StagingTicker brand={brand} model={modelName} airportCode={airportCode} />
    </div>
  );
}
