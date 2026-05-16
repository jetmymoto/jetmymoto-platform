import React from "react";
import { ShieldCheck, ArrowRight, FileText } from "lucide-react";

/**
 * DossierCTA - High-conversion lead capture section.
 */
export default function DossierCTA({
  hubName = "Mission Hub",
  theme = "dark",
}) {
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-[#0A0A0A]" : "bg-[#F7F3EA]";
  const borderColor = isDark ? "border-white/10" : "border-black/5";
  const textColor = isDark ? "text-white" : "text-[#1C1B18]";
  const accentColor = isDark ? "text-[#CDA755]" : "text-[#C9A14A]";

  return (
    <section className={`rounded-[40px] border p-8 lg:p-16 overflow-hidden relative ${bgColor} ${borderColor}`}>
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <FileText size={200} className={accentColor} />
      </div>

      <div className="relative z-10 max-w-4xl">
        <div className={`font-mono text-[10px] uppercase tracking-[0.4em] font-bold mb-6 flex items-center gap-4 ${accentColor}`}>
          <div className="w-8 h-[1px] bg-[#CDA755]"></div>
          Intelligence Request
        </div>

        <h2 className={`text-4xl lg:text-6xl font-headline font-bold uppercase tracking-tight mb-8 ${textColor}`}>
          Access the {hubName} <span className="italic text-[#CDA755]">Full Dossier</span>
        </h2>

        <p className={`text-lg mb-12 max-w-2xl leading-relaxed ${isDark ? "text-zinc-400" : "text-[#706F6C]"}`}>
          Receive verified GPX files, technical sector briefings, and real-time fleet availability for the {hubName} network directly to your terminal.
        </p>

        <form className="flex flex-col sm:flex-row gap-4 max-w-lg" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="RIDER@TERMINAL.COM" 
            className={`flex-1 bg-transparent border ${borderColor} px-6 py-4 font-mono text-sm focus:outline-none focus:border-[#CDA755] ${textColor}`}
          />
          <button className={`px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${isDark ? "bg-[#CDA755] text-[#050505] hover:bg-white" : "bg-[#1C1B18] text-white hover:bg-[#C9A14A]"}`}>
            REQUEST DOSSIER
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-8 flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
          <ShieldCheck size={12} className="text-[#CDA755]" />
          Verified encrypted transmission // No marketing spam
        </div>
      </div>
    </section>
  );
}
