import React, { useEffect, useMemo, useState } from "react";
import {
  RENTAL_HERO_IMAGE_MAP,
  buildRentalHeroImageId,
} from "../../frontend/rideratlas/src/features/rentals/data/rentalHeroImageMap";

const INITIAL_VISIBLE = 6;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 896" preserveAspectRatio="none">
    <rect width="1280" height="896" fill="#171717"/>
  </svg>`,
)}`;

function titleize(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
}

function parseEngineCc(rental) {
  const direct = rental?.engine_cc ?? rental?.engineCc ?? rental?.specs?.engine_cc ?? rental?.spec?.engine_cc ?? null;
  if (direct !== null && direct !== undefined && String(direct).trim()) {
    return String(direct).replace(/[^0-9]/g, "") || String(direct);
  }
  const model = String(rental?.model || "");
  const ccMatch = model.match(/(\d{3,4})/);
  return ccMatch ? ccMatch[1] : "";
}

function resolveRentalHeroImage(brand, model) {
  const heroId = buildRentalHeroImageId(brand, model);
  const mappedUrl = heroId ? RENTAL_HERO_IMAGE_MAP[heroId] : null;
  return mappedUrl || FALLBACK_IMAGE_DATA_URI;
}

function normalizeRental(rental) {
  const brand = String(rental?.brand || rental?.make || "").trim();
  const model = String(rental?.model || rental?.model_name || "").trim();
  const bikeName = String(rental?.bikeName || "").trim();

  const title = String(rental?.name || rental?.display_name || "").trim() || bikeName || [brand, model].filter(Boolean).join(" ").trim() || "Unknown Machine";

  const categoryRaw = String(rental?.category || rental?.type || "mission-spec").trim();
  const category = titleize(categoryRaw) || "Mission Spec";
  const pricePerDay = rental?.price_per_day ?? rental?.pricing?.pricePerDay ?? rental?.price_day ?? rental?.price ?? null;

  const imageUrl = resolveRentalHeroImage(brand, model);

  return {
    id: rental?.id || rental?.slug,
    title,
    brand,
    category,
    engineCc: parseEngineCc(rental),
    pricePerDay,
    imageUrl,
    original: rental,
  };
}

export default function AirportFleetSection({
  rentals,
  selectedRentalId,
  setSelectedRentalId,
  city,
  airportCode,
  isLoading = false,
}) {
  const [showAll, setShowAll] = useState(false);

  const normalizedRentals = useMemo(() => {
    return (Array.isArray(rentals) ? rentals : [])
      .map(normalizeRental)
      .filter((rental) => Boolean(rental.id));
  }, [rentals]);

  const visibleRentals = useMemo(() => {
    if (showAll) return normalizedRentals;
    return normalizedRentals.slice(0, INITIAL_VISIBLE);
  }, [normalizedRentals, showAll]);

  if (isLoading && normalizedRentals.length === 0) {
    return (
      <section className="bg-white py-24 flex flex-col items-center justify-center min-h-[320px]">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#706F6C]">Synchronizing Fleet Registry...</div>
      </section>
    );
  }

  if (normalizedRentals.length === 0) {
    return (
      <section className="bg-white py-24 flex flex-col items-center justify-center min-h-[320px]">
        <div className="font-serif text-2xl text-[#1C1B18] opacity-80">Fleet not active at this hub yet.</div>
      </section>
    );
  }

  return (
    <section id="airport-fleet-section" className="py-32 px-8 lg:px-32 bg-white">
      <div className="flex justify-between items-end mb-20">
        <h2 className="font-serif text-5xl text-[#1C1B18]">Available Motorcycles</h2>
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#C9A14A] font-bold">
          {airportCode?.toUpperCase()} HUB CAPACITY: {normalizedRentals.length} READY
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {visibleRentals.map((rental) => (
          <div 
            key={rental.id}
            className={`flex flex-col lg:flex-row group border-b border-black/5 pb-12 transition-all ${
              selectedRentalId === rental.id ? "border-[#C9A14A]" : ""
            }`}
          >
            <div className="lg:w-1/2 overflow-hidden mb-8 lg:mb-0 aspect-[4/3] bg-[#F7F3EA]">
              <img 
                src={rental.imageUrl} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                alt={rental.title}
              />
            </div>
            <div className="lg:w-1/2 lg:pl-10 flex flex-col justify-center">
              <h3 className="font-serif text-3xl mb-1 text-[#1C1B18]">{rental.title}</h3>
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-6 text-[#C9A14A] font-bold">
                {rental.category}
              </div>
              <p className="text-[11px] text-[#706F6C] mb-8 leading-relaxed font-light">
                Premium motorcycle selected for this region. Professional logistics and support included.
              </p>
              <div className="flex gap-4 mb-8 flex-wrap">
                {rental.engineCc && (
                  <div className="px-3 py-1 border border-black/10 text-[9px] font-mono text-[#1C1B18] uppercase">
                    {rental.engineCc}CC ENGINE
                  </div>
                )}
                <div className="px-3 py-1 border border-black/10 text-[9px] font-mono text-[#1C1B18] uppercase">
                  ONE-WAY COMPATIBLE
                </div>
              </div>
              <button 
                onClick={() => setSelectedRentalId(rental.id)}
                className="text-[10px] font-mono font-bold uppercase tracking-widest border-b border-black pb-2 self-start hover:text-[#C9A14A] hover:border-[#C9A14A] transition-all text-[#1C1B18]"
              >
                Select This Machine
              </button>
            </div>
          </div>
        ))}
      </div>

      {normalizedRentals.length > INITIAL_VISIBLE && (
        <div className="mt-20 flex justify-center">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="font-mono text-[10px] uppercase tracking-widest border border-black/10 px-8 py-4 hover:bg-black hover:text-white transition-all"
          >
            {showAll ? "Show Fewer" : "Explore Full Fleet"}
          </button>
        </div>
      )}
    </section>
  );
}
