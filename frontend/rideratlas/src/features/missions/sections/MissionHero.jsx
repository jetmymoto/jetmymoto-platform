import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";

export default function MissionHero({ mission, pageData }) {
  const { title, description, imageUrl, stats } = mission;

  return (
    <section className="relative h-[90vh] w-full overflow-hidden bg-[#050505] flex flex-col justify-end">
      {/* Background Image */}
      <SafeImage
        src={imageUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        showPlaceholder={true}
      />
      
      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
      
      <div className="relative z-10 px-6 pb-20 md:px-12 lg:px-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl"
        >
          <div className="mb-8 flex items-center gap-4">
            <span className="rounded-full border border-[#CDA755]/40 bg-[#CDA755]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#CDA755]">
              {mission.missionType === "a2a" ? "One-Way Logistics" : "Premium Expedition"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              {mission.cluster} Cluster
            </span>
          </div>
          
          <h1 className="font-headline text-5xl font-black leading-[0.9] tracking-tighter text-white md:text-8xl lg:text-[7rem] uppercase">
            {title}
          </h1>
          
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-xl font-light">
            {description}
          </p>
          
          <div className="mt-12 flex flex-wrap gap-4 sm:gap-6">
            <Link 
              to={`/airport/${mission.start_airport?.toLowerCase() || 'hub'}?mode=rent`}
              className="group flex items-center gap-3 border border-[#CDA755]/50 bg-[#CDA755]/10 px-10 py-5 text-[10px] uppercase tracking-[0.3em] text-white transition-all hover:bg-[#CDA755]/20 hover:border-[#CDA755]"
            >
              Explore Fleet
              <ArrowRight className="h-4 w-4 text-[#CDA755] transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link 
              to="/moto-airlift"
              className="group flex items-center gap-3 border border-white/10 bg-white/5 px-10 py-5 text-[10px] uppercase tracking-[0.3em] text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              Request Plan
              <ArrowRight className="h-4 w-4 text-zinc-500 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap gap-8 border-t border-white/10 pt-10">
            <StatItem label="Distance" value={stats?.distance_km ? `${stats.distance_km} KM` : "TBD"} />
            <StatItem label="Duration" value={stats?.days ? `${stats.days} Days` : "TBD"} />
            <StatItem label="Difficulty" value={stats?.difficulty || "Standard"} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-medium text-[#eac26d]">
        {value}
      </p>
    </div>
  );
}
