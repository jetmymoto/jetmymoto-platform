import { useState, useMemo } from "react";
import OperatorSelector from "@/features/rentals/components/OperatorSelector";
import RentalCard from "@/features/rentals/components/RentalCard";
import { ArrowLeft, Truck } from "lucide-react";

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
      <div className="rounded-[32px] border border-white/5 bg-[#121212] p-10 lg:p-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
          <Truck className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
          No Fleet Staged at {airportCode}
        </h3>
        <p className="mt-4 text-zinc-400 max-w-md mx-auto leading-relaxed">
          While local rental inventory is currently offline, our <span className="text-white font-bold italic">Airlift Service</span> can deploy your personal machine or a pre-booked fleet into this hub.
        </p>
        <div className="mt-10">
          <button className="px-8 py-4 rounded-full border border-[#CDA755]/30 bg-[#CDA755]/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#CDA755] hover:bg-[#CDA755]/20 transition-all">
            Request Custom Deployment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* ── STEP 1: Operator Selection ─────────────────────────────── */}
      {selectedOperator === null && (
        <div className="space-y-10">
          <div className="p-8 rounded-[32px] border border-white/5 bg-[#121212]/50">
            <p className="text-[10px] font-black text-[#CDA755] uppercase tracking-widest mb-2">Inventory Access</p>
            <p className="text-sm text-zinc-400 font-medium leading-relaxed">
              Select an authorized operator below to view real-time fleet availability for the {missionContext?.insertionCode} ▶ {missionContext?.extractionCode} corridor.
            </p>
          </div>
          <OperatorSelector
            airportCode={airportCode}
            selectedOperator={selectedOperator}
            onSelectOperator={setSelectedOperator}
            rentalIndexes={rentalIndexes}
            operators={GRAPH?.operators ?? {}}
          />
        </div>
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
