import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';

const JetHero = () => {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-[#050505] selection:bg-amber-500/30">
      {/* Background Layer: Cinematic Luxury Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.video 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover opacity-50 brightness-[0.7]"
        >
          <source 
            src="https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/raw_assets%2FCinematic_Drone_Intro_Code_Upgrade.mp4?alt=media" 
            type="video/mp4" 
          />
        </motion.video>
        
        {/* Luxury Vignette & Masking */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-4xl">
          {/* Brand Pre-Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span className="text-amber-500 font-mono text-[10px] tracking-[0.5em] uppercase font-bold">
              Global Logistics Infrastructure
            </span>
          </motion.div>

          {/* Massive Stacked Headline: FLY. RIDE. REPEAT. */}
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[14vw] md:text-[9rem] font-serif text-white leading-[0.8] tracking-tighter uppercase mb-10"
          >
            <span className="block">FLY.</span>
            <span className="block text-white/90">RIDE.</span>
            <span className="block text-white/40 italic">REPEAT.</span>
          </motion.h1>

          {/* Controlled Sub-Caption */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="max-w-md border-l border-white/10 pl-8 mb-12"
          >
            <p className="text-xl md:text-2xl text-gray-300 font-light leading-snug tracking-tight mb-2">
              Global motorcycle transport and premium rentals.
            </p>
            <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">
              Engineered for riders who move differently.
            </p>
          </motion.div>

          {/* Elite CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-6 items-start sm:items-center"
          >
            <button className="group relative bg-white text-black px-12 py-5 rounded-full font-bold text-xs tracking-[0.2em] uppercase transition-all hover:bg-amber-500 hover:text-white flex items-center gap-3">
              Design Your Journey 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="group text-white/60 hover:text-white px-8 py-5 rounded-full font-bold text-xs tracking-[0.2em] uppercase transition-all flex items-center gap-2">
              Ship Your Machine
              <div className="w-0 group-hover:w-4 h-[1px] bg-amber-500 transition-all duration-300" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Subtle Side Navigation Hint (Luxury Aesthetic) */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-8 items-center">
        <div className="h-24 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <span className="text-[10px] font-mono text-white/20 rotate-90 tracking-[0.5em] uppercase whitespace-nowrap">
          Scroll to explore
        </span>
        <div className="h-24 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>

      {/* Minimal Hub Indicator */}
      <div className="absolute bottom-12 left-12 hidden md:flex items-center gap-4 text-white/20 font-mono text-[9px] tracking-[0.3em] uppercase">
        <div className="w-2 h-2 rounded-full border border-amber-500/40 flex items-center justify-center">
          <div className="w-0.5 h-0.5 bg-amber-500 rounded-full animate-pulse" />
        </div>
        Active IATA Hubs: MUC | MXP | LAX | NRT | ZRH
      </div>
    </section>
  );
};

export default JetHero;