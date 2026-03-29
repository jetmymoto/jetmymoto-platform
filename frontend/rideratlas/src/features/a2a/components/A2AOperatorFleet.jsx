import { useState, useMemo } from "react";
import OperatorSelector from "@/features/rentals/components/OperatorSelector";
import RentalCard from "@/features/rentals/components/RentalCard";
import { ArrowLeft } from "lucide-react";

export default function A2AOperatorFleet({
  airportCode,
  rentalShard,
  GRAPH,
  missionContext, // { insertionCode, extractionCode, missionSlug }
}) {
  const [selectedOperator, setSelectedOperator] = useState(null);

  const rentalIndexes = rentalShard?.rentalIndexes ?? {};
  const rentalsMap = rentalShard?.rentals ?? {};

  // ── Step 1: Operators ───────────────────────────────────────────────
  const operatorIds =
    rentalIndexes?.operatorsByAirport?.[airportCode] ?? [];

  // ── Step 2: Fleet (bounded, O(1)) ───────────────────────────────────
  const rentalIds = selectedOperator
    ? rentalIndexes?.rentalsByOperatorByAirport?.[airportCode]?.[
        selectedOperator
      ] ?? []
    : [];

  const rentals = useMemo(() => {
    return rentalIds.map((id) => rentalsMap[id]);
  }, [rentalIds, rentalsMap]);

  // ── Empty hub guard ─────────────────────────────────────────────────
  if (!operatorIds.length) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#121212] p-6">
        <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          Standby
        </div>
        <h3 className="mt-3 text-xl font-semibold text-white">
          No operators indexed at {airportCode}
        </h3>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Use A2A logistics to deploy your own machine into this hub.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── STEP 1: Operator Selection ─────────────────────────────── */}
      {selectedOperator === null && (
        <OperatorSelector
          airportCode={airportCode}
          selectedOperator={selectedOperator}
          onSelectOperator={setSelectedOperator}
          rentalIndexes={rentalIndexes}
          operators={GRAPH?.operators ?? {}}
        />
      )}

      {/* ── STEP 2: Fleet View ─────────────────────────────────────── */}
      {selectedOperator !== null && (
        <div className="space-y-6">
          {/* Breadcrumb */}
          <button
            onClick={() => setSelectedOperator(null)}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All Operators
          </button>

          {/* Fleet Grid */}
          {rentals.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {rentals.map((rental, i) => {
                if (!rental) return null; // safety only (should not happen)

                const airport =
                  GRAPH?.airports?.[
                    rental.airportCode?.toUpperCase?.() ||
                      rental.airport?.toUpperCase?.()
                  ] || null;

                return (
                  <RentalCard
                    key={rental.id || rental.slug}
                    rental={rental}
                    airport={airport}
                    index={i}
                    missionContext={missionContext}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-white/10 bg-[#121212] p-6">
              <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Standby
              </div>
              <h3 className="mt-3 text-xl font-semibold text-white">
                No fleet available for this operator
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                This operator is indexed but currently has no active machines at{" "}
                {airportCode}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
