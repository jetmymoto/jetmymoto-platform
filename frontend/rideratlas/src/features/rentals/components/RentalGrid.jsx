import React, { useMemo, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { GRAPH } from "@/core/network/networkGraph";
import RentalCard, {
  getRentalBrand,
  getRentalCategoryLabel,
  getRentalPrice,
} from "@/features/rentals/components/RentalCard";

const FILTER_SELECT_CLASS =
  "h-12 min-w-[190px] rounded-full border border-white/10 bg-[#121212] px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white outline-none transition-colors hover:border-[#CDA755]/45 focus:border-[#CDA755]";

export default function RentalGrid({ airportCode }) {
  const normalizedAirportCode = String(airportCode || "").toUpperCase();
  const rentalIds = GRAPH.rentalsByAirport?.[normalizedAirportCode] || [];
  const rawRentals = useMemo(
    () => rentalIds.map((id) => GRAPH.rentals?.[id]).filter(Boolean),
    [rentalIds]
  );

  const [filterType, setFilterType] = useState("ALL");
  const [filterBrand, setFilterBrand] = useState("ALL");
  const [sortPrice, setSortPrice] = useState("RECOMMENDED");

  const filterOptions = useMemo(() => {
    const brands = Array.from(
      new Set(rawRentals.map((rental) => getRentalBrand(rental)))
    ).sort((a, b) => a.localeCompare(b));

    const categories = Array.from(
      new Set(rawRentals.map((rental) => getRentalCategoryLabel(rental)))
    ).sort((a, b) => a.localeCompare(b));

    return {
      brands: ["ALL", ...brands],
      categories: ["ALL", ...categories],
    };
  }, [rawRentals]);

  const filteredRentals = useMemo(() => {
    const next = rawRentals.filter((rental) => {
      const brandMatches =
        filterBrand === "ALL" || getRentalBrand(rental) === filterBrand;
      const typeMatches =
        filterType === "ALL" ||
        getRentalCategoryLabel(rental) === filterType;

      return brandMatches && typeMatches;
    });

    if (sortPrice === "LOW_TO_HIGH") {
      next.sort((a, b) => getRentalPrice(a) - getRentalPrice(b));
    } else if (sortPrice === "HIGH_TO_LOW") {
      next.sort((a, b) => getRentalPrice(b) - getRentalPrice(a));
    }

    return next;
  }, [rawRentals, filterBrand, filterType, sortPrice]);

  if (rawRentals.length === 0) {
    return (
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#121212_0%,#050606_100%)] px-8 py-20 text-center shadow-[0_30px_80px_rgba(0,0,0,0.22)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#A76330]/35 bg-[#A76330]/10 text-[#CDA755]">
          <SlidersHorizontal size={20} />
        </div>
        <div className="mt-6 text-[11px] uppercase tracking-[0.28em] text-white/45">
          Fleet Sync Pending
        </div>
        <h3 className="mt-3 text-3xl font-black uppercase tracking-[-0.03em] text-white">
          No Verified Rentals For {normalizedAirportCode}
        </h3>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/58">
          This hub does not currently expose a live rental showroom in the graph
          engine. The component is network-safe and will render inventory
          automatically as soon as rentals are indexed for this airport.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="sticky top-[92px] z-30 overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,18,18,0.96)_0%,rgba(5,6,6,0.96)_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(205,167,85,0.14),transparent_30%),linear-gradient(90deg,rgba(167,99,48,0.08),transparent_35%)]" />

        <div className="relative flex flex-col gap-6 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.26em] text-[#CDA755]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#A76330]/35 bg-[#A76330]/10">
                <Filter size={14} />
              </div>
              Mobility Access Showroom
            </div>
            <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.03em] text-white md:text-3xl">
              {normalizedAirportCode} Rental Fleet
            </h2>
            <p className="mt-2 text-sm text-white/56">
              Refine by brand, machine type, and daily rate without leaving the
              current airport hub.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterBrand}
              onChange={(event) => setFilterBrand(event.target.value)}
              className={FILTER_SELECT_CLASS}
              aria-label="Filter rentals by brand"
            >
              {filterOptions.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === "ALL" ? "Brand: All" : `Brand: ${brand}`}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              className={FILTER_SELECT_CLASS}
              aria-label="Filter rentals by type"
            >
              {filterOptions.categories.map((category) => (
                <option key={category} value={category}>
                  {category === "ALL" ? "Type: All" : `Type: ${category}`}
                </option>
              ))}
            </select>

            <select
              value={sortPrice}
              onChange={(event) => setSortPrice(event.target.value)}
              className={FILTER_SELECT_CLASS}
              aria-label="Sort rentals by price"
            >
              <option value="RECOMMENDED">Price: Recommended</option>
              <option value="LOW_TO_HIGH">Price: Low to High</option>
              <option value="HIGH_TO_LOW">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/10 px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-white/45 lg:px-7">
          <span>{rawRentals.length} Machines Indexed</span>
          <span className="tabular-nums">{filteredRentals.length} Visible</span>
        </div>
      </div>

      {filteredRentals.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#121212_0%,#050606_100%)] px-8 py-20 text-center">
          <div className="text-[11px] uppercase tracking-[0.26em] text-[#CDA755]">
            No Match
          </div>
          <h3 className="mt-3 text-2xl font-black uppercase text-white">
            No Fleet Matches This Filter Stack
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/56">
            Adjust brand or type filters to reopen the showroom. The component is
            still rendering from the indexed airport fleet only.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredRentals.map((rental) => (
            <RentalCard key={rental.id} rental={rental} />
          ))}
        </div>
      )}
    </section>
  );
}
