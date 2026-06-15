import { useState, useEffect } from "react";
import { getRentalRailItemsByAirport } from "../services/rentalAdapter";
import RentalMissionCard from "./RentalMissionCard";
import RentalMissionCardSkeleton from "./RentalMissionCardSkeleton";

interface Props {
  airportCode: string;
}

export default function RentalMissionRail({ airportCode }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const items = getRentalRailItemsByAirport(airportCode);
  
  // DBV uses Compact Mode
  const isCompact = airportCode === 'DBV';
  
  // OSL is pricing blocked / hidden if no trusted pricing
  // The adapter/services should ideally handle this, but we reinforce here
  const readyItems = items.filter(i => i.hasTrustedPricing);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [airportCode]);

  if (readyItems.length === 0) return null;

  return (
    <section className="py-24 bg-[#0B0B0C] overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-8 mb-12">
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-12 bg-[#CDA755] opacity-50" />
          <h2 className="text-[#CDA755] text-xs font-black uppercase tracking-[0.4em]">
            Premium Deployment <span className="opacity-40 mx-2">/</span> {airportCode}
          </h2>
        </div>
        <h3 className="text-white text-4xl md:text-6xl font-bold mt-6 tracking-tighter max-w-2xl">
          Elite fleet machines ready for theater insertion.
        </h3>
      </div>

      <div className="relative group/rail">
        {/* Horizontal Scroll Container */}
        <div className="flex gap-8 overflow-x-auto px-8 pb-12 no-scrollbar scroll-smooth">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <RentalMissionCardSkeleton />
              </div>
            ))
          ) : (
            readyItems.map((item) => (
              <div key={item.id} className="flex-shrink-0">
                <RentalMissionCard item={item} isCompact={isCompact} />
              </div>
            ))
          )}
          
          {/* Subtle Spacer at end */}
          <div className="flex-shrink-0 w-12" />
        </div>

        {/* Cinematic Fade Overlays */}
        <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-[#0B0B0C] to-transparent pointer-events-none z-20" />
        <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-[#0B0B0C] to-transparent pointer-events-none z-20" />
      </div>
    </section>
  );
}
