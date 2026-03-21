import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import LiveQuotePreview from "./LiveQuotePreview";

export default function JetHeroActionPanel() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  
  // Debounced states for delaying the preview render
  const [debouncedFrom, setDebouncedFrom] = useState("");
  const [debouncedTo, setDebouncedTo] = useState("");

  const popularDeployments = [
    { from: "Munich", to: "Alps" },
    { from: "Nice", to: "Dolomites" },
    { from: "Barcelona", to: "Pyrenees" },
  ];

  // Debounce the input values (400ms delay)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFrom(from);
      setDebouncedTo(to);
    }, 400);

    return () => clearTimeout(timeout);
  }, [from, to]);

  const handleSuggestionClick = (deployment) => {
    setFrom(deployment.from);
    setTo(deployment.to);
  };

  return (
    <div className="relative w-full max-w-2xl bg-black/60 backdrop-blur-xl border border-white/20 p-6 md:p-8 rounded-sm shadow-2xl mt-8">
      
      {/* Configuration Header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-4 w-[1px] bg-amber-500/50" />
        <span className="text-amber-500 font-mono text-[10px] tracking-[0.5em] uppercase font-bold">
          Live Routing Subsystem
        </span>
      </div>

      {/* Input Grid */}
      <div className="flex flex-col md:flex-row gap-4">
        
        <div className="flex-1">
          <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-2 block font-mono font-bold">
            Origin
          </label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="e.g. Munich"
            className="w-full bg-black/50 border border-white/10 px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/5 font-mono text-sm uppercase tracking-widest transition-all rounded-sm"
          />
        </div>

        <div className="flex-1">
          <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-2 block font-mono font-bold">
            Destination
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="e.g. Alps"
            className="w-full bg-black/50 border border-white/10 px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/5 font-mono text-sm uppercase tracking-widest transition-all rounded-sm"
          />
        </div>

        {/* Dummy Initiate Button for visual completeness */}
        <div className="flex items-end self-end w-full md:w-auto mt-4 md:mt-0">
          <button className="h-[54px] w-full md:w-auto px-8 bg-amber-500 text-black font-mono text-[10px] md:text-xs font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all flex flex-col justify-center items-center shadow-[0_5px_30px_rgba(245,158,11,0.2)] rounded-sm group">
            <span className="flex items-center gap-2">
              Route <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

      </div>

      {/* Popular Deployments */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.2em] mb-3">
          Popular Deployments:
        </div>
        <div className="flex flex-wrap gap-2">
          {popularDeployments.map((dep, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(dep)}
              className="text-[10px] font-mono bg-white/5 hover:bg-amber-500/10 text-zinc-400 hover:text-amber-500 px-3 py-2 border border-white/10 hover:border-amber-500/30 transition-all rounded-sm uppercase tracking-widest flex items-center gap-2 shadow-sm"
            >
              {dep.from} <span className="text-zinc-600 font-normal">→</span> {dep.to}
            </button>
          ))}
        </div>
      </div>

      {/* Live Quote Preview Module */}
      {debouncedFrom && debouncedTo && (
        <LiveQuotePreview from={debouncedFrom} to={debouncedTo} />
      )}
      
    </div>
  );
}
