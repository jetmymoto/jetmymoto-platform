import React from "react";
import { motion } from "framer-motion";
import SeoHelmet from '../components/seo/SeoHelmet'; 

import JetHero from "@/components/JetHero";
import HowItWorksSection from "@/components/HowItWorksSection";
import ChooseHowYouShipSection from "@/components/ChooseHowYouShipSection";
import WhyRidersChoose from "@/components/WhyRidersChoose";
import FinalCTA from "@/components/FinalCTA";
import TrustInfrastructure from "@/components/home/TrustInfrastructure";
import { Link } from "react-router-dom";
import { getCanonicalPaths } from "@/utils/navigationTargets";

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const pageTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

const canonicalPaths = getCanonicalPaths();


const DualDeploymentStrategy = () => (
  <section className="py-32 bg-[#050505] border-b border-white/5 relative">
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      
      <div className="text-center mb-20">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl md:text-5xl font-serif text-white uppercase font-black italic mb-6">
            Choose Your Deployment Strategy
          </h2>
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-[0.2em]">
            The unified mobility access platform. Ship it or rent it.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        
        {/* Logistics / Bring Bike */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
           className="border border-white/10 bg-zinc-900/40 p-10 md:p-14 flex flex-col items-start hover:border-amber-500/40 hover:bg-zinc-900/80 transition-all duration-500 group"
        >
          <div className="text-[10px] text-amber-500 font-mono tracking-[0.3em] uppercase font-bold mb-6">
            JetMyMoto Logistics
          </div>
          <h3 className="text-3xl font-black uppercase text-white mb-6 font-serif italic tracking-wide group-hover:text-amber-500 transition-colors">
            Bring Your Own Machine
          </h3>
          <p className="text-sm text-zinc-400 mb-10 leading-relaxed font-light flex-1">
            Global precision airlift and secure staging across Europe and North America corridors. Fly in, turn the key, and ride your own motorcycle seamlessly. We natively handle the crating, complex customs, and dangerous goods protocol logistics.
          </p>
          <Link to={canonicalPaths.logistics} className="w-full bg-white text-black py-5 font-mono text-[10px] md:text-xs font-black uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-black transition-all shadow-[0_5px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_5px_30px_rgba(245,158,11,0.3)] rounded-sm text-center">
            Request Shipping Quote
          </Link>
        </motion.div>

        {/* Rentals / Rent Bike */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
           className="border border-white/10 bg-zinc-900/40 p-10 md:p-14 flex flex-col items-start hover:border-amber-500/40 hover:bg-zinc-900/80 transition-all duration-500 group"
        >
          <div className="text-[10px] text-amber-500 font-mono tracking-[0.3em] uppercase font-bold mb-6">
            JetMyMoto Rentals
          </div>
          <h3 className="text-3xl font-black uppercase text-white mb-6 font-serif italic tracking-wide group-hover:text-amber-500 transition-colors">
            Ride Immediately on Arrival
          </h3>
          <p className="text-sm text-zinc-400 mb-10 leading-relaxed font-light flex-1">
            Access our trusted network of premium verified partner fleets right at the hub. Turn-key late-model adventure and touring bikes, pre-configured specifically for the target terrain without the crating waittimes.
          </p>
          <Link to={canonicalPaths.rentals} className="w-full bg-transparent border border-white/20 text-white py-5 font-mono text-[10px] md:text-xs font-black uppercase tracking-[0.2em] hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-500 transition-all rounded-sm text-center">
            Browse Available Bikes
          </Link>
        </motion.div>

      </div>
    </div>
  </section>
);

export default function JetMyMotoHomepage() {
  return (
    <>
      <SeoHelmet
          title="JetMyMoto | Global Motorcycle Expeditions & Rental Platform"
          description="JetMyMoto provides premier motorcycle air freight logistics and premium rentals for global expeditions. Ship your bike or rent locally."
          canonicalUrl="https://jetmymoto.com/"
      />
      <div className="bg-[#050505] selection:bg-amber-500/30">
        
        {/* HERO stands alone */}
        <JetHero variant="conversion" />

        {/* CONTENT SECTIONS */}
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <TrustInfrastructure layout="marquee" />

          {/* Core Dual Deployment UX Pattern */}
          <DualDeploymentStrategy />

          {/* Secondary Educational Logic */}
          <HowItWorksSection />
          <ChooseHowYouShipSection />
          <WhyRidersChoose />
          
          <FinalCTA />
        </motion.div>
      </div>
    </>
  );
}
