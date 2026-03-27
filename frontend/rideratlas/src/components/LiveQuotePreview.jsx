import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRouteIntelligence } from "@/lib/routeIntelligence";
import { getBestOptionLive } from "@/lib/matchEngine";

export default function LiveQuotePreview({ from, to }) {
  const data = getRouteIntelligence(from, to);
  const [bestOption, setBestOption] = useState(null);

  useEffect(() => {
    if (!from || !to) return;

    let isMounted = true;
    const fetchMatch = async () => {
      // Show intermediate state if desired, but standard fetching is fast enough
      const result = await getBestOptionLive(from, to);
      if (isMounted) {
        setBestOption(result);
      }
    };

    fetchMatch();
    
    return () => { isMounted = false; };
  }, [from, to]);

  if (!data) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        className="absolute left-0 right-0 top-full mt-4 bg-[#050505]/95 backdrop-blur-xl border border-white/20 p-6 shadow-2xl z-50 rounded-sm text-left"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] text-amber-500 uppercase tracking-[0.3em] font-mono flex items-center gap-2 font-bold">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            Route Intelligence Active
          </div>
          <div className="text-[9px] text-zinc-500 tracking-widest italic font-normal hidden md:block">
            Optimized based on real-time route demand
          </div>
        </div>

        <div className="text-xl md:text-2xl text-white font-serif font-black uppercase italic mb-4">
          {from} <span className="text-amber-500 mx-2">→</span> {to}
        </div>

        {data.status === "active" && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/10">
              <div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Solo Transport</div>
                <div className="text-xl font-mono text-zinc-400 tracking-widest font-black uppercase line-through decoration-zinc-500/50">
                  €{data.soloPrice}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-amber-500 uppercase tracking-widest mb-1 font-bold">Shared Transport</div>
                <div className="text-2xl font-mono text-amber-500 tracking-widest font-black uppercase">
                  ≈ €{data.sharedPrice}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-2">
              <div className="text-[10px] md:text-xs text-zinc-300 font-mono tracking-widest uppercase flex items-center gap-2">
                Distance: {data.distance} km
              </div>

              {data.hasPool ? (
                <div className="text-[10px] md:text-xs text-[#25D366] font-mono tracking-[0.2em] font-black uppercase flex items-center gap-2">
                  🔥 {data.riders} riders already on this route
                </div>
              ) : (
                <div className="text-[10px] md:text-xs text-zinc-500 font-mono tracking-[0.2em] uppercase italic">
                  No active pool yet. Be the first.
                </div>
              )}
            </div>
          </>
        )}

        {data.status === "unknown" && (
          <div className="flex flex-col gap-4 mb-2">
            <div className="text-xl font-mono text-white tracking-widest font-black uppercase">
              Est. €{data.estimatedPrice} <span className="text-[10px] text-zinc-500 tracking-widest font-normal">base</span>
            </div>
          </div>
        )}

        {/* SYSTEM RECOMMENDATION BLOCK (Powered by LIVE BACKEND MATCH ENGINE) */}
        {bestOption && (
          <div className="mt-6 p-4 border border-white/10 bg-[#050505]/40 relative overflow-hidden">
            {bestOption.type === "join" && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#25D366]/20 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            )}
            
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-3 font-mono">
              Recommended
            </div>

            <div className="text-sm font-mono text-white mb-4 uppercase tracking-wider">
              {bestOption.message}
            </div>

            <button
              className={`w-full py-4 text-xs tracking-[0.2em] uppercase font-black transition-all shadow-lg border border-transparent hover:border-white/20 ${
                bestOption.type === "join"
                  ? "bg-[#25D366] hover:bg-[#20bd5a] text-black shadow-[#25D366]/20"
                  : bestOption.type === "create"
                  ? "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
                  : "bg-white hover:bg-gray-200 text-black shadow-white/20"
              }`}
            >
              {bestOption.cta}
            </button>
          </div>
        )}

        <div className="text-[9px] text-zinc-500 tracking-widest italic font-normal md:hidden mt-4 text-center">
          Optimized based on real-time route demand
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
