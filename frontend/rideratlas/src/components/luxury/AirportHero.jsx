import { motion } from "framer-motion";
import { MapPin, Activity } from "lucide-react";

export default function AirportHero({ airport, asset }) {
  const heroImage = asset?.hero || asset?.currentImage || airport?.hero?.posterUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop";

  // Mock coordinates for the HUD if real ones aren't available
  const lat = airport.latitude ? airport.latitude.toFixed(4) : "45.6300";
  const lon = airport.longitude ? airport.longitude.toFixed(4) : "08.7231";

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden border-b border-white/5">
      
      {/* Background with slow cinematic zoom */}
      <motion.img
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        src={heroImage}
        alt={airport.name}
        className="absolute inset-0 w-full h-full object-cover contrast-[1.15] saturate-[.85] brightness-[0.6]"
      />

      {/* Deep gradient for text legibility and cinematic fade at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
      
      {/* Content Container - Bottom Left Anchored */}
      <div className="relative z-10 h-full flex flex-col justify-end items-start text-left px-6 md:px-12 pb-16 md:pb-24 max-w-7xl mx-auto w-full">
        
        {/* Top HUD Line */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 md:gap-8 mb-6 text-[9px] md:text-[10px] font-mono tracking-[0.3em] uppercase text-[#CDA755]"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-[#CDA755]"></div>
            <span>Deployment Node</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/50">
            <MapPin size={12} /> {lat}°N // {lon}°E
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/50">
            <Activity size={12} /> STATUS: SECURE
          </div>
        </motion.div>

        {/* Brutalist Title (Oswald / font-headline) */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-headline text-6xl md:text-[7rem] lg:text-[9rem] font-bold tracking-[0.02em] text-white uppercase leading-[0.85] mb-6 drop-shadow-2xl"
        >
          {airport.code} <span className="text-white/20">//</span><br />
          {airport.city || airport.name}
        </motion.h1>

        {/* Tactical Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-white/60 max-w-xl font-mono text-xs md:text-sm uppercase tracking-[0.2em] leading-relaxed border-l border-[#CDA755]/30 pl-4 ml-1"
        >
          Primary logistics staging and premium fleet access for {airport.region || airport.continent || "global"} expeditions.
          <br/>
          <span className="text-[#CDA755] mt-2 block">Airlift operations standing by.</span>
        </motion.p>

      </div>
    </section>
  );
}
