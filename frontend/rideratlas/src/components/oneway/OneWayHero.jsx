import { motion } from "framer-motion";
import { SITE_MEDIA } from "@/config/siteMedia";
import { ArrowRight } from "lucide-react";

/**
 * OneWayHero
 *
 * Full-bleed cinematic hero for the /one-way-rentals landing page.
 *
 * Visual layers (bottom to top):
 *   1. Video — looping atmospheric background, opacity 25%
 *   2. Dark floor gradient — #050505 → transparent (90 % opacity)
 *   3. Analog noise texture — ::after pseudo via inline style, mix-blend-mode overlay, 5 % opacity
 *   4. Content — headline, sub-copy, stat ticker, CTA
 *
 * Props:
 *   corridorCount  {number}  Live count from GRAPH.indexes.allMissionSlugs.length
 *   onExplore      {fn}      Called when the explore CTA is clicked (optional: scroll)
 */
export default function OneWayHero({ corridorCount = 0, onExplore }) {
  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden border-b border-white/5">

      {/* ── Layer 1: Background video ── */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-25"
        >
          <source src={SITE_MEDIA.GLOBAL_TOWER_H1} type="video/mp4" />
        </video>
        {/* Dark floor — covers 90 % of the frame so text is always legible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.90) 50%, #050505 100%)",
          }}
        />
        {/* Analog noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
            mixBlendMode: "overlay",
            opacity: 0.05,
          }}
        />
      </div>

      {/* ── Layer 4: Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {/* Eyebrow */}
          <div className="font-mono text-[10px] font-black tracking-[0.5em] text-[#CDA755] uppercase mb-8 flex items-center justify-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CDA755] animate-pulse" />
            ONE-WAY MOTORCYCLE RENTALS
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-[6rem] font-black tracking-tighter leading-[0.88] mb-8 uppercase italic max-w-6xl mx-auto text-white">
            Ride It There.
            <br />
            <span className="text-[#CDA755]">Leave It There.</span>
          </h1>

          {/* Sub-copy */}
          <p className="text-zinc-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            Bikes that need to travel between cities.{" "}
            <span className="text-zinc-200 italic">You ride the scenic route.</span>
            {" "}Pick up in one city, drop off in another — no returns, no compromises.
          </p>

          {/* Stat ticker row */}
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 font-mono text-[10px] font-black tracking-[0.24em] text-zinc-500 uppercase border-t border-white/10 pt-8 max-w-3xl mx-auto mb-12">
            <span className="flex items-center gap-2 text-[#CDA755]/80 font-bold">
              <span className="tabular-nums text-base text-[#CDA755]">
                {corridorCount > 0 ? corridorCount : "—"}
              </span>
              Active Corridors
            </span>
            <span className="flex items-center gap-2">
              Open-Jaw Routes
            </span>
            <span className="flex items-center gap-2">
              No Return Required
            </span>
            <span className="flex items-center gap-2">
              Fleet-Rate Pricing
            </span>
          </div>

          {/* CTA */}
          <motion.button
            onClick={onExplore}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-4 px-12 py-5 bg-[#CDA755] text-black font-mono text-xs font-black uppercase tracking-widest italic hover:bg-[#e0bc6e] transition-colors"
          >
            Browse Live Corridors
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom fade into page body */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
    </section>
  );
}
