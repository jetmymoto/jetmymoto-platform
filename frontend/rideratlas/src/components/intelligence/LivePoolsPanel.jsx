import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function LivePoolsPanel({ pools, loading, error }) {
  if (error) {
    return (
      <div className="w-full bg-red-950/20 border border-red-500/20 rounded-xl p-6 mb-8 text-center flex flex-col items-center">
        <AlertTriangle className="text-red-500 mb-2" size={24} />
        <p className="text-red-400 font-mono text-sm uppercase tracking-widest">
          Intelligence Link Offline
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-zinc-900/40 border border-white/5 rounded-xl p-8 mb-8 flex flex-col items-center justify-center min-h-[200px]">
        <div className="animate-spin text-amber-500 mb-4">
          <Zap size={24} />
        </div>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">
          Syncing Live Logistics...
        </p>
      </div>
    );
  }

  const topPools = pools.slice(0, 5);

  if (topPools.length === 0) {
    return (
      <div className="w-full bg-zinc-900/20 border border-white/5 rounded-xl p-8 mb-8 text-center">
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
          No Active Pools Detected. Be the first to deploy.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mb-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-[2px] bg-amber-500" />
          <h3 className="text-amber-500 font-mono text-xs tracking-[0.2em] uppercase font-bold">
            Live Node Intelligence
          </h3>
        </div>
        <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
          {pools.length} Active {pools.length === 1 ? 'Route' : 'Routes'}
        </div>
      </div>

      <div className="grid gap-3">
        <AnimatePresence>
          {topPools.map((pool, idx) => {
            const scorePercent = Math.round((pool.matchScore || 0) * 100);
            
            return (
              <motion.div
                key={pool.id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="bg-black/40 backdrop-blur-md border border-white/10 hover:border-amber-500/50 rounded-xl p-4 md:p-5 transition-colors group flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Score & Meta */}
                <div className="flex items-center gap-4 min-w-[120px]">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-zinc-900 border border-white/5 group-hover:border-amber-500/30">
                    <span className="text-amber-500 font-mono text-sm font-bold">
                      {scorePercent}
                    </span>
                    <span className="text-zinc-600 font-mono text-[8px] uppercase">
                      Match
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-mono text-sm tracking-wide flex items-center gap-2">
                      <Users size={12} className="text-amber-500" />
                      {pool.seatsAvailable} Seats
                    </span>
                    <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                      {pool.status || "OPEN"}
                    </span>
                  </div>
                </div>

                {/* Route Info */}
                <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full">
                  <div className="flex-1 truncate">
                    <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest block mb-1">
                      Origin
                    </span>
                    <span className="text-white font-serif italic text-lg truncate block">
                      {pool.origin?.label || "Unknown"}
                    </span>
                  </div>
                  <ArrowRight className="hidden md:block text-zinc-700 mx-2" size={16} />
                  <div className="flex-1 truncate">
                    <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest block mb-1">
                      Destination
                    </span>
                    <span className="text-white font-serif italic text-lg truncate block">
                      {pool.destination?.label || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Actions & Confidence */}
                <div className="w-full md:w-auto flex flex-col md:items-end justify-center gap-2">
                  <div className="flex items-center gap-1.5 self-end md:self-auto mb-1 md:mb-0">
                    {(() => {
                      if (pool.intelligenceStatus === "pending") {
                        return (
                          <span className="flex items-center gap-1 text-[8px] font-mono tracking-widest uppercase text-amber-500 animate-pulse">
                            <Zap size={8} />
                            Computing Optimal Matches...
                          </span>
                        );
                      }

                      const hasFreshIntel =
                        !!pool.intelligenceUpdatedAt &&
                        pool.matchScore > 0 &&
                        typeof pool.origin?.lat === "number" &&
                        typeof pool.destination?.lat === "number";

                      return hasFreshIntel ? (
                        <span className="flex items-center gap-1 text-[8px] font-mono tracking-widest uppercase text-emerald-500/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                          High Confidence
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[8px] font-mono tracking-widest uppercase text-amber-500/60">
                          <AlertTriangle size={8} />
                          Legacy Intel
                        </span>
                      );
                    })()}
                  </div>
                  <Link 
                    to={`/pool/${pool.id}`}
                    className="w-full md:w-auto px-6 py-2.5 bg-white/5 hover:bg-amber-500 hover:text-black text-white rounded-lg font-mono text-xs uppercase tracking-widest transition-all text-center"
                  >
                    View Intel
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
