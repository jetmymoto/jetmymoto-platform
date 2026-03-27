import React from 'react';
import { Zap, Database, ArrowRight } from 'lucide-react';

const JoinTheCorps = () => {
  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden">
      
      {/* Tech Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Amber Glow Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mb-8 border border-amber-500/20">
          <Zap className="w-8 h-8 animate-pulse" />
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
          JOIN THE <span className="text-amber-500">CORPS</span>
        </h2>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Get weekly mission briefings, GPX drops, and gear intel delivered to your encrypted inbox. No spam. Only visuals.
        </p>

        {/* Input Field */}
        <div className="max-w-md mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-lg blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
          <form className="relative flex items-center bg-[#050505] rounded-lg p-2 border border-white/10" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="ENTER CALLSIGN (EMAIL)" 
              className="w-full bg-transparent text-white px-4 py-3 outline-none placeholder:text-slate-600 font-mono text-sm"
            />
            <button className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-md flex items-center gap-2 transition-all">
              JOIN <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="mt-12 flex items-center justify-center gap-6 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3 text-emerald-500" /> SECURE DATABASE
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 12,408 AGENTS ACTIVE
          </div>
        </div>

      </div>
    </section>
  );
};

export default JoinTheCorps;
