import React from "react";

export default function MissionBrief({ briefing }) {
  if (!briefing || briefing.length === 0) return null;

  return (
    <section className="bg-[#050505] py-24 px-6 md:px-12 lg:px-24 border-t border-white/5">
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-[#CDA755]">
          Route Sequence
        </p>
        <h2 className="mt-6 text-center font-headline text-4xl font-bold text-white md:text-5xl uppercase tracking-tighter">
          Day-by-Day Journey
        </h2>
        
        <div className="mt-20 space-y-16 relative">
          {/* Vertical line connecting days */}
          <div className="absolute left-[23px] top-8 bottom-8 w-[1px] bg-white/10 hidden md:block" />

          {briefing.map((step, idx) => (
            <div key={step.day || idx} className="relative flex gap-8 md:gap-16 items-start">
              <div className="flex-shrink-0 z-10">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#050505] border border-[#CDA755]/40 text-[#CDA755] font-mono text-lg font-black">
                  {String(step.day || idx + 1).padStart(2, "0")}
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-zinc-400 max-w-2xl">
                  {step.description}
                </p>
                {step.waypoints && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {step.waypoints.map(wp => (
                      <span key={wp} className="text-[9px] uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-1 text-zinc-500 rounded">
                        {wp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
