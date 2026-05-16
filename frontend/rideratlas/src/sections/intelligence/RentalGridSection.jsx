import React, { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRentalOffers } from "@/hooks/useRentalOffers";
import RentalCard from "@/features/rentals/components/RentalCard";
import { getRentalCategoryLabel } from "@/features/rentals/utils/rentalFormatters";

/**
 * RentalGridSection - Firestore-driven rental discovery section.
 */
export default function RentalGridSection({
  airportCode,
  title,
  eyebrow,
  description,
  theme = "dark", // "light" | "dark"
  limitCount = 20,
  initialCategory = "all",
  initialBrand = "all",
}) {
  const isDark = theme === "dark";
  const scrollRef = useRef(null);

  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState(initialBrand);

  const { offers, loading, loadMore, hasMore } = useRentalOffers({
    airportCode,
    category: category !== "all" ? category : null,
    brand: brand !== "all" ? brand : null,
    limitCount,
  });

  const scrollGrid = (direction) => {
    if (scrollRef.current) {
      const amount = window.innerWidth > 1024 ? 1200 : window.innerWidth > 768 ? 800 : 350;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -amount : amount, 
        behavior: 'smooth' 
      });
    }
  };

  const bgColor = isDark ? "bg-[#050505]" : "bg-[#F7F3EA]";
  const textColor = isDark ? "text-white" : "text-[#1C1B18]";
  const labelColor = isDark ? "text-zinc-500" : "text-[#706F6C]";
  const accentColor = isDark ? "text-[#CDA755]" : "text-[#C9A14A]";
  const borderColor = isDark ? "border-white/10" : "border-black/5";

  return (
    <section className={`space-y-12 py-16 ${bgColor}`} id="rental-discovery">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            {eyebrow && (
              <div className={`font-mono text-[10px] uppercase tracking-[0.3em] font-bold mb-4 ${accentColor}`}>
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className={`text-3xl lg:text-5xl font-headline font-bold uppercase tracking-tight mb-4 ${textColor}`}>
                {title}
              </h2>
            )}
            {description && (
              <p className={`text-lg leading-relaxed font-light ${labelColor}`}>
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className={`text-[10px] font-mono uppercase tracking-widest ${labelColor}`}>
              Filter Results
            </div>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`bg-transparent border ${borderColor} ${textColor} text-[10px] font-mono uppercase px-4 py-2 rounded-none focus:outline-none focus:border-[#CDA755]`}
            >
              <option value="all">All Categories</option>
              <option value="adventure">Adventure</option>
              <option value="touring">Touring</option>
              <option value="classic">Classic</option>
              <option value="cruiser">Cruiser</option>
              <option value="sport-touring">Sport Touring</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Reveal */}
      <div className="relative max-w-[1400px] mx-auto">
        <div className={`flex items-center justify-between border-y ${borderColor} px-5 py-4 text-[10px] font-mono font-bold uppercase tracking-widest ${accentColor} ${isDark ? "bg-[#0A0A0A]" : "bg-white/50"} mb-8 lg:px-0`}>
          <div className="flex items-center gap-4">
            <span>{airportCode} Live Fleet Intelligence</span>
            <span className={`${labelColor} hidden md:inline`}> // {offers.length}+ Assets Verified</span>
          </div>
          {offers.length > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scrollGrid('left')} 
                className={`p-2 border ${borderColor} hover:border-[#CDA755] hover:text-[#CDA755] transition-colors ${labelColor}`}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => scrollGrid('right')} 
                className={`p-2 border ${borderColor} hover:border-[#CDA755] hover:text-[#CDA755] transition-colors ${labelColor}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {loading && offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className={`h-8 w-8 animate-spin ${accentColor}`} />
            <div className={`font-mono text-[10px] uppercase tracking-widest ${labelColor}`}>Synchronizing Fleet Data...</div>
          </div>
        ) : offers.length === 0 ? (
          <div className={`border ${borderColor} py-32 text-center mx-5 lg:mx-0 ${isDark ? "bg-[#0A0A0A]" : "bg-white"}`}>
            <div className={`text-[10px] font-mono uppercase tracking-widest ${accentColor} mb-4`}>
              No Matches
            </div>
            <h3 className={`text-2xl font-headline font-bold uppercase ${textColor}`}>
              No Assets Authorized for this selection
            </h3>
          </div>
        ) : (
          <motion.div 
            layout 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-8 px-5 lg:px-0 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <AnimatePresence mode="popLayout">
              {offers.map((offer) => (
                <motion.div
                  key={offer.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-none w-[85vw] sm:w-[360px] lg:w-[calc(33.333%-1rem)] xl:w-[400px] snap-start"
                >
                  <RentalCard
                    rental={offer}
                  />
                </motion.div>
              ))}
              {hasMore && (
                <div className="flex-none flex items-center justify-center w-64 snap-start">
                  <button 
                    onClick={loadMore}
                    disabled={loading}
                    className={`font-mono text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-4 border ${borderColor} ${textColor} hover:border-[#CDA755] transition-all`}
                  >
                    {loading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
