import React from "react";
import { motion } from "framer-motion";
import { useRentalOffers } from "@/hooks/useRentalOffers";
import { Activity, ShieldCheck, Zap } from "lucide-react";

/**
 * LiveIntelligenceStrip - A high-conversion "ticker" showing live high-score deals.
 */
export default function LiveIntelligenceStrip({ 
  airportCode, 
  theme = "dark" 
}) {
  const isDark = theme === "dark";
  const { offers, loading } = useRentalOffers({ 
    airportCode, 
    onlyHeroDeals: true,
    limitCount: 5 
  });

  if (loading || offers.length === 0) return null;

  return (
    <section className={`py-4 border-y overflow-hidden ${isDark ? "bg-[#0A0A0A] border-white/5" : "bg-white border-black/5"}`}>
      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
        {[...offers, ...offers].map((offer, idx) => (
          <div key={idx} className="flex items-center gap-4 px-4">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-[#CDA755]" />
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                High Intelligence Deal
              </span>
            </div>
            <span className={`text-xs font-black uppercase ${isDark ? "text-white" : "text-black"}`}>
              {offer.bike_model}
            </span>
            <span className="text-[#CDA755] font-black text-xs">
              {offer.discount_percent}% BELOW MARKET
            </span>
            <div className={`h-1 w-1 rounded-full ${isDark ? "bg-white/20" : "bg-black/10"}`} />
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}} />
    </section>
  );
}
