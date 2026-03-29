import React from "react";

export default function PriceGapBadge({ cheapest, airportCode }) {
  if (!cheapest?.rentalId) return null;

  const label = cheapest.isAlpineReady
    ? `Best Value at ${airportCode}`
    : `From ${new Intl.NumberFormat("en-IE", {
        style: "currency",
        currency: cheapest.currency || "EUR",
        maximumFractionDigits: 0,
      }).format(cheapest.pricePerDay)}/day`;

  return (
    <div className="flex items-center gap-2 rounded-full border border-[#CDA755]/30 bg-[#050505] px-3 py-1 shadow-[0_0_10px_rgba(205,167,85,0.2)]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#CDA755] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#CDA755]" />
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#CDA755] tabular-nums">
        {label}
      </span>
    </div>
  );
}
