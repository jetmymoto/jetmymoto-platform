import React, { useEffect, useMemo, useReducer, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import {
  readGraphShard,
  getGraphShardStatus,
  loadGraphShard,
} from "@/core/network/networkGraph";
import RentalCard from "@/features/rentals/components/RentalCard";
import {
  getRentalCategoryLabel,
} from "@/features/rentals/utils/rentalFormatters";

// Force React re-render after async shard load completes.
function useForceUpdate() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return forceUpdate;
}

export default function RentalGrid({ airportCode, highlightedRentalId = null }) {
  const normalizedAirportCode = String(airportCode || "").toUpperCase();
  const forceUpdate = useForceUpdate();
  const scrollRef = React.useRef(null);

  const scrollGrid = (direction) => {
    if (scrollRef.current) {
      const amount = window.innerWidth > 1024 ? 1200 : window.innerWidth > 768 ? 800 : 350;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  // ── Intent Selection State ──
  const [selectedIntent, setSelectedIntent] = useState("all");
  const [selectedOperator, setSelectedOperator] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");

  // ── Shard-first + GRAPH fallback ──
  const rentalsShard = readGraphShard("rentals");
  const shardStatus = getGraphShardStatus("rentals");
  const isShardLoading = shardStatus === "idle" || shardStatus === "loading";

  const rentalsMap = rentalsShard?.rentals || {};
  const operators = rentalsShard?.operators || {};
  const rentalIndexes = rentalsShard?.rentalIndexes || {};
  const rentalsByAirport = rentalIndexes?.rentalsByAirport || {};

  // ── Idle-guard: trigger shard load → re-render when done ──
  useEffect(() => {
    if (getGraphShardStatus("rentals") === "idle") {
      loadGraphShard("rentals")
        .then(forceUpdate)
        .catch((error) => {
          if (import.meta.env.DEV) {
            console.warn("Rentals shard load failed:", error);
          }
        });
    } else if (getGraphShardStatus("rentals") === "loading") {
      const interval = setInterval(() => {
        if (getGraphShardStatus("rentals") === "loaded") {
          clearInterval(interval);
          forceUpdate();
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [forceUpdate]);

  // ── Fleet-level data ──
  const rentalIds = rentalsByAirport?.[normalizedAirportCode] || [];

  const rawRentals = useMemo(
    () => rentalIds.map((id) => rentalsMap?.[id]).filter(Boolean),
    [rentalsMap, rentalIds]
  );

  const totalMachines = rawRentals.length;

  const filterOptions = useMemo(() => {
    // Generate dynamic categories from the available fleet so we never show an empty filter
    const categories = new Set(rawRentals.map((rental) => {
      const label = getRentalCategoryLabel(rental);
      return label ? label.toLowerCase() : "other";
    }));
    
    // Convert to array and sort
    const mapped = Array.from(categories).sort();
    
    return ["all", ...mapped];
  }, [rawRentals]);

  
  const brandOptions = useMemo(() => {
    const brands = new Set(rawRentals.map((rental) => rental.brand || rental.make).filter(Boolean));
    return ["all", ...Array.from(brands).sort()];
  }, [rawRentals]);

  const operatorOptions = useMemo(() => {
    const ops = new Set(rawRentals.map((rental) => rental.operatorId || rental.operator).filter(Boolean));
    return ["all", ...Array.from(ops).sort()];
  }, [rawRentals]);

  const filteredRentals = useMemo(() => {
    let result = rawRentals;
    if (selectedIntent !== "all") {
      result = result.filter((rental) => {
        const category = getRentalCategoryLabel(rental)?.toLowerCase() || "other";
        return category === selectedIntent;
      });
    }
    if (selectedOperator !== "all") {
      result = result.filter((rental) => {
        const op = rental.operatorId || rental.operator;
        return op === selectedOperator;
      });
    }
    if (selectedBrand !== "all") {
      result = result.filter((rental) => {
        const b = rental.brand || rental.make;
        return b === selectedBrand;
      });
    }
    return result;
  }, [rawRentals, selectedIntent, selectedOperator, selectedBrand]);

  // ── Empty state (no rentals at all for this airport) ──
  if (!isShardLoading && totalMachines === 0) {
    return (
      <section className="border border-white/5 bg-[#050505] px-8 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#CDA755]/30 bg-[#CDA755]/10 text-[#CDA755]">
          <SlidersHorizontal size={20} />
        </div>
        <div className="mt-6 text-[11px] font-mono uppercase tracking-[0.28em] text-white/45">
          Fleet Sync Pending
        </div>
        <h3 className="mt-3 text-3xl font-headline font-bold uppercase tracking-[0.05em] text-white">
          No Verified Assets For {normalizedAirportCode}
        </h3>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60 font-mono">
          This hub does not currently expose a live rental showroom in the graph
          engine. The component is network-safe and will render inventory
          automatically as soon as rentals are indexed for this airport.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-8" id="fleet-showroom">
      {/* ── PHASE 1 & 2: INTENT SWITCH (Cinematic Filter) ── */}
      <div className="max-w-7xl mx-auto mb-16 pt-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#CDA755] mb-6 font-mono font-bold flex items-center gap-4">
            <div className="w-8 h-[1px] bg-[#CDA755]"></div>
            Asset Class Selection
            <div className="w-8 h-[1px] bg-[#CDA755]"></div>
          </div>
          
                    <div className="flex flex-wrap gap-4 justify-center">
            {filterOptions.map((intent) => {
              const isActive = selectedIntent === intent;
              const label = intent === "all" ? "All Machines" : intent;

              return (
                <button
                  key={intent}
                  onClick={() => setSelectedIntent(intent)}
                  className={`font-mono text-[11px] tracking-[0.2em] uppercase px-5 py-2.5 transition-all duration-300 border ${
                    isActive
                      ? "bg-[#CDA755] text-[#050505] border-[#CDA755] font-bold shadow-[0_0_20px_rgba(205,167,85,0.4)]"
                      : "border-[#CDA755]/20 text-white/50 hover:text-[#CDA755] hover:border-[#CDA755]/60"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          
          {/* Brand Selection */}
          {brandOptions.length > 2 && (
            <>
              <div className="text-[10px] tracking-[0.4em] uppercase text-white/30 mt-12 mb-6 font-mono font-bold flex items-center gap-4 justify-center">
                <div className="w-4 h-[1px] bg-white/20"></div>
                Manufacturer
                <div className="w-4 h-[1px] bg-white/20"></div>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                {brandOptions.map((brand) => {
                  const isActive = selectedBrand === brand;
                  const label = brand === "all" ? "All Brands" : brand;

                  return (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`font-mono text-[10px] tracking-[0.2em] uppercase px-4 py-2 transition-all duration-300 border ${
                        isActive
                          ? "bg-white/10 text-white border-white/20 font-bold"
                          : "border-white/5 text-white/30 hover:text-white hover:border-white/10 bg-[#050505]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Operator Selection */}
          {operatorOptions.length > 2 && (
            <>
              <div className="text-[10px] tracking-[0.4em] uppercase text-white/30 mt-12 mb-6 font-mono font-bold flex items-center gap-4">
                <div className="w-4 h-[1px] bg-white/20"></div>
                Operator Assignment
                <div className="w-4 h-[1px] bg-white/20"></div>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                {operatorOptions.map((opId) => {
                  const isActive = selectedOperator === opId;
                  const label = opId === "all" ? "All Operators" : operators?.[opId]?.name || opId;

                  return (
                    <button
                      key={opId}
                      onClick={() => setSelectedOperator(opId)}
                      className={`font-mono text-[10px] tracking-[0.2em] uppercase px-4 py-2 transition-all duration-300 border ${
                        isActive
                          ? "bg-white/10 text-white border-white/20 font-bold"
                          : "border-white/5 text-white/30 hover:text-white hover:border-white/10 bg-[#050505]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Cinematic Fleet Reveal ── */}
      <div className="relative max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between border-y border-white/5 px-5 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-[#CDA755] bg-[#050505] mb-8 lg:px-0">
          <div className="flex items-center gap-4">
            <span>{normalizedAirportCode} Asset Showroom</span>
            <span className="text-white/40 hidden md:inline"> // {filteredRentals.length} Machines Authorized</span>
          </div>
          {/* Scroll Controls */}
          {filteredRentals.length > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scrollGrid('left')} 
                className="p-2 border border-white/10 hover:border-[#CDA755] hover:text-[#CDA755] transition-colors text-white/50"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => scrollGrid('right')} 
                className="p-2 border border-white/10 hover:border-[#CDA755] hover:text-[#CDA755] transition-colors text-white/50"
                aria-label="Scroll Right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {filteredRentals.length === 0 && !isShardLoading ? (
           <div className="border border-white/5 bg-[#050505] px-8 py-20 text-center mx-5 lg:mx-0">
             <div className="text-[10px] font-mono uppercase tracking-widest text-[#CDA755]">
               Class Unavailable
             </div>
             <h3 className="mt-3 text-2xl font-headline font-bold uppercase text-white">
               No Assets Match This Selection
             </h3>
           </div>
        ) : (
          <motion.div 
            layout 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-8 px-5 lg:px-0 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <AnimatePresence mode="popLayout">
              {filteredRentals.map((rental) => (
                <motion.div
                  key={rental.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-none w-[85vw] sm:w-[360px] lg:w-[calc(33.333%-1rem)] xl:w-[400px] snap-start"
                >
                  <RentalCard
                    rental={rental}
                    isSelected={
                      rental?.id === highlightedRentalId || rental?.slug === highlightedRentalId
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
