import React from "react";
import { ArrowRight, Star } from "lucide-react";

/**
 * MissionHighlights - Showcases key technical or geographical highlights.
 */
export default function MissionHighlights({
  title = "Mission Highlights",
  highlights = [],
  theme = "dark",
}) {
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-[#121212]" : "bg-white";
  const borderColor = isDark ? "border-white/10" : "border-black/5";
  const textColor = isDark ? "text-white" : "text-[#1C1B18]";
  const accentColor = isDark ? "text-[#CDA755]" : "text-[#C9A14A]";
  const subTextColor = isDark ? "text-zinc-500" : "text-[#706F6C]";

  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="space-y-12">
      <div className="flex items-center gap-4">
        <div className="h-[1px] w-12 bg-[#CDA755]/50" />
        <h3 className={`text-xl font-headline font-bold uppercase tracking-[0.2em] ${textColor}`}>
          {title}
        </h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {highlights.map((h, i) => (
          <div
            key={i}
            className={`group relative flex flex-col gap-4 rounded-[24px] border p-8 transition-all hover:border-[#CDA755]/30 ${bgColor} ${borderColor}`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono uppercase tracking-widest font-black ${subTextColor}`}>
                {h.type || "Technical Sector"}
              </span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#CDA755]/30 bg-[#CDA755]/10 text-[10px] font-bold text-[#CDA755]">
                {i + 1}
              </div>
            </div>
            
            <h4 className={`text-xl font-black uppercase tracking-tight leading-tight ${textColor}`}>
              {h.name || h}
            </h4>
            
            {(h.reason || h.description) && (
              <p className={`text-sm leading-relaxed ${subTextColor}`}>
                {h.reason || h.description}
              </p>
            )}

            {h.stats && (
              <div className="mt-4 flex flex-wrap gap-2">
                {h.stats.map((s, idx) => (
                  <span key={idx} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
