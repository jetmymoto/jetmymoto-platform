import React, { useRef } from "react";
import RentalGrid from "@/features/rentals/components/RentalGrid";

export default function RentEnginePanel({
  a,
  rentalShard,
  selectedRentalId,
  setSelectedRentalId,
  preselectedRental,
  routePreview,
  queryRouteSlug,
  RentalGridLoadingSkeleton,
  preselectedCtaRef,
}) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12" id="airport-rental-section">
      {!rentalShard ? (
        <RentalGridLoadingSkeleton airportCode={a.code} />
      ) : (
        <>
          {preselectedRental ? (
            <div className="mb-8 rounded-[24px] border border-border bg-surface p-5 shadow-sm">
              <div className="text-xs uppercase tracking-[0.24em] text-[#CDA755]">Journey Match: Recommended for this route</div>
              <div className="mt-2 text-lg font-black text-zinc-900">{preselectedRental?.brand || preselectedRental?.name || "Recommended Rental"}</div>
              <div className="mt-1 text-sm text-zinc-600">Selected from route {routePreview?.name || routePreview?.title || queryRouteSlug}</div>
              <button
                ref={preselectedCtaRef}
                type="button"
                onClick={() => setSelectedRentalId(preselectedRental?.id)}
                className="mt-3 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              >
                Scroll to recommended bike
              </button>
            </div>
          ) : null}
          <RentalGrid airportCode={a.code} highlightedRentalId={selectedRentalId} />
        </>
      )}
    </div>
  );
}
