import React from "react";
import { motion } from "framer-motion";
import { Building2, ChevronRight, Bike } from "lucide-react";

// ── Skeleton Placeholder (fixed dimensions — zero layout shift) ──
function OperatorCardSkeleton({ index }) {
  return (
    <div
      className="flex h-[156px] animate-pulse flex-col justify-between rounded-[24px] border border-white/5 bg-[#121212] p-5"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/5" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 rounded bg-white/5" />
          <div className="h-2.5 w-1/2 rounded bg-white/5" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-20 rounded bg-white/5" />
        <div className="h-8 w-24 rounded-full bg-white/5" />
      </div>
    </div>
  );
}

// ── Loaded Operator Card ──
function OperatorCard({ operator, fleetCount, onSelect, index }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(operator.id || operator.slug)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="group flex h-[156px] cursor-pointer flex-col justify-between rounded-[24px] border border-white/10 bg-[#121212] p-5 text-left transition-all duration-400 hover:-translate-y-1 hover:border-[#CDA755]/40 hover:shadow-[0_20px_60px_rgba(167,99,48,0.18)] focus:outline-none focus:ring-2 focus:ring-[#CDA755]/60"
      aria-label={`View fleet from ${operator.name}: ${fleetCount} machines`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#A76330]/30 bg-[#A76330]/10 text-[#CDA755]">
          <Building2 size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold uppercase tracking-[0.08em] text-white">
            {operator.name}
          </h3>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
            {operator.type === "global" ? "Global Partner" : "Local Specialist"}
            {operator.country ? ` · ${operator.country}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-white/45 tabular-nums">
          <Bike size={12} className="text-[#CDA755]" />
          {fleetCount} machine{fleetCount !== 1 ? "s" : ""}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A76330]/40 bg-[#A76330]/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#CDA755] transition-all group-hover:border-[#CDA755]/60 group-hover:bg-[#CDA755]/15">
          View Fleet
          <ChevronRight size={12} />
        </span>
      </div>
    </motion.button>
  );
}

// ── 3-State UI Model ──
// state: "skeleton" | "loaded" | "empty"
export default function OperatorSelector({
  airportCode,
  rentalIndexes,
  operators,
  onSelectOperator,
  isLoading,
}) {
  const normalizedCode = String(airportCode || "").toUpperCase();
  const operatorIds = rentalIndexes?.operatorsByAirport?.[normalizedCode] || [];

  // Derive state from props
  const state = isLoading
    ? "skeleton"
    : operatorIds.length === 0
      ? "empty"
      : "loaded";

  // ── STATE: SKELETON ──
  if (state === "skeleton") {
    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-label="Loading operators"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <OperatorCardSkeleton key={i} index={i} />
        ))}
        <span className="sr-only">Loading operator data…</span>
      </div>
    );
  }

  // ── STATE: EMPTY ──
  if (state === "empty") {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#121212_0%,#050505_100%)] px-8 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#A76330]/35 bg-[#A76330]/10 text-[#CDA755]">
          <Building2 size={20} />
        </div>
        <div className="mt-5 text-[11px] uppercase tracking-[0.28em] text-white/40">
          No Operators Indexed
        </div>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/50">
          This hub does not have verified rental operators in the graph yet.
          Inventory will appear automatically once operators are indexed.
        </p>
      </div>
    );
  }

  // ── STATE: LOADED ──
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-white/45">
        <Building2 size={14} className="text-[#CDA755]" />
        <span>Select an operator to reveal their fleet</span>
        <span className="tabular-nums">({operatorIds.length} available)</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {operatorIds.map((opId, index) => {
          const op = operators?.[opId];
          if (!op) return null;
          const fleetCount =
            rentalIndexes?.rentalsByOperatorByAirport?.[normalizedCode]?.[opId]?.length ?? 0;
          return (
            <OperatorCard
              key={opId}
              operator={op}
              fleetCount={fleetCount}
              onSelect={onSelectOperator}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}
