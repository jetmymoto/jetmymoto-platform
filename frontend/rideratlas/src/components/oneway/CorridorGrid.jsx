import { useState, useMemo } from "react";
import { GRAPH } from "@/core/network/networkGraph";
import ContinentFilter from "./ContinentFilter";
import CorridorCard from "./CorridorCard";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the corridor's continent. Priority:
 *   1. mission.continent (set by Agent 2 candidates & enriched missions)
 *   2. Derive from insertion airport's continent via GRAPH.indexes.airportsByContinent
 */
function deriveMissionContinent(mission) {
  if (mission?.continent) return mission.continent.toLowerCase();

  // Fallback: scan airportsByContinent for the insertion code
  const insertionCode = mission?.insertion?.code || mission?.insertion_airport || "";
  if (!insertionCode) return "";

  for (const [continent, codes] of Object.entries(GRAPH.indexes.airportsByContinent ?? {})) {
    if (codes.includes(insertionCode)) return continent;
  }
  return "";
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * CorridorGrid
 *
 * Renders the hardware-validated corridor cards with:
 *   - Continent filter linked to GRAPH.indexes.missionsByContinent
 *   - Hardware gate (only slugs with ≥1 qualifying rental are shown)
 *   - Candidate "Launch Blitz" missions (from Agent 2, status: "candidate") surface first
 *   - Ghost Hub pivot when a continent filter yields 0 results
 *
 * Props:
 *   allMissionSlugs     {string[]}   from GRAPH.indexes.allMissionSlugs
 *   rentalsForCorridor  {object}     { [slug]: [rentalId, ...] } from a2a shard
 *   rentalsMap          {object}     { [id]: rental } from rentals shard
 *   corridorPriceRadar  {object}     { [extractionIATA]: [RadarEntry, ...] }
 */
export default function CorridorGrid({
  allMissionSlugs = [],
  rentalsForCorridor = {},
  rentalsMap = {},
  corridorPriceRadar = {},
  highlightedMissionSlug = "",
}) {
  const [selectedContinent, setSelectedContinent] = useState("all");

  // ── All hardware-validated slugs (hardware gate) ──
  const validatedSlugs = useMemo(
    () => allMissionSlugs.filter((slug) => (rentalsForCorridor[slug]?.length ?? 0) > 0),
    [allMissionSlugs, rentalsForCorridor]
  );

  // ── Derive available continents from validated missions ──
  const availableContinents = useMemo(() => {
    const seen = new Set();
    for (const slug of validatedSlugs) {
      const mission = GRAPH.missions?.[slug];
      const c = deriveMissionContinent(mission);
      if (c) seen.add(c);
    }
    return Array.from(seen).sort();
  }, [validatedSlugs]);

  // ── Per-continent counts (for ContinentFilter badges) ──
  const continentCounts = useMemo(() => {
    const counts = {};
    for (const slug of validatedSlugs) {
      const mission = GRAPH.missions?.[slug];
      const c = deriveMissionContinent(mission);
      if (c) counts[c] = (counts[c] ?? 0) + 1;
    }
    return counts;
  }, [validatedSlugs]);

  // ── Filtered slugs ──
  const filteredSlugs = useMemo(() => {
    if (selectedContinent === "all") return validatedSlugs;
    return validatedSlugs.filter((slug) => {
      const mission = GRAPH.missions?.[slug];
      return deriveMissionContinent(mission) === selectedContinent;
    });
  }, [validatedSlugs, selectedContinent]);

  // ── Sort: "active" missions first (have cinematic_pitch), then "candidates" ──
  const sortedSlugs = useMemo(() => {
    return [...filteredSlugs].sort((a, b) => {
      if (highlightedMissionSlug) {
        if (a === highlightedMissionSlug) return -1;
        if (b === highlightedMissionSlug) return 1;
      }

      const mA = GRAPH.missions?.[a];
      const mB = GRAPH.missions?.[b];
      const aIsActive = mA?.cinematic_pitch ? 0 : 1;
      const bIsActive = mB?.cinematic_pitch ? 0 : 1;
      return aIsActive - bIsActive;
    });
  }, [filteredSlugs, highlightedMissionSlug]);

  // ── Ghost Hub pivot when filtered result is empty ──
  const ghostEntries = useMemo(() => {
    if (filteredSlugs.length > 0) return [];
    if (selectedContinent === "all") return [];

    // Find extraction airports in this continent and check corridorPriceRadar
    const continentAirportCodes = GRAPH.indexes.airportsByContinent?.[selectedContinent] ?? [];
    const entries = [];
    const seen = new Set();

    for (const code of continentAirportCodes) {
      for (const entry of corridorPriceRadar[code] ?? []) {
        if (!seen.has(entry.missionSlug)) {
          seen.add(entry.missionSlug);
          entries.push(entry);
        }
      }
    }
    return entries;
  }, [filteredSlugs, selectedContinent, corridorPriceRadar]);

  // ── Empty state (no validated corridors at all yet) ──
  if (validatedSlugs.length === 0) {
    return (
      <div className="text-center py-20 border border-white/5 bg-[#1E1E1E]/50">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          Scanning corridor inventory...
        </p>
        <p className="mt-3 text-xs text-zinc-700 italic">
          Hardware-validated corridors load from the fleet shard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter bar */}
      {availableContinents.length > 0 && (
        <ContinentFilter
          continents={availableContinents}
          selected={selectedContinent}
          onChange={setSelectedContinent}
          counts={continentCounts}
        />
      )}

      {/* ── Regular corridor grid ── */}
      {sortedSlugs.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSlugs.map((slug) => {
            const mission = GRAPH.missions?.[slug];
            if (!mission) return null;
            return (
              <CorridorCard
                key={slug}
                mission={mission}
                qualifyingRentals={rentalsForCorridor[slug] ?? []}
                rentalsMap={rentalsMap}
              />
            );
          })}
        </div>
      )}

      {/* ── Ghost Hub pivot ── */}
      {ghostEntries.length > 0 && (
        <div className="space-y-6">
          {/* Pivot explanation banner */}
          <div className="flex items-center gap-4 py-4 px-6 border border-white/5 bg-[#1E1E1E]/60">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CDA755] animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#CDA755] font-black">
                Ghost Hub Pivot
              </span>
            </div>
            <span className="text-xs text-zinc-500 italic">
              No outbound corridors for this region — showing routes that arrive here from open-jaw hubs.
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ghostEntries.map((entry) => {
              const mission = GRAPH.missions?.[entry.missionSlug];
              if (!mission) return null;
              // Use the radar entry's qualifying rentals for the ghost card
              const relayRentals = rentalsForCorridor[entry.missionSlug] ?? [];
              return (
                <CorridorCard
                  key={entry.missionSlug}
                  mission={mission}
                  qualifyingRentals={relayRentals}
                  rentalsMap={rentalsMap}
                  isGhostPivot
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── True empty state after filtering ── */}
      {sortedSlugs.length === 0 && ghostEntries.length === 0 && selectedContinent !== "all" && (
        <div className="text-center py-16 border border-white/5 bg-[#1E1E1E]/30">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            No active corridors in this region yet
          </p>
          <button
            onClick={() => setSelectedContinent("all")}
            className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[#CDA755] hover:underline"
          >
            Show all corridors
          </button>
        </div>
      )}
    </div>
  );
}
