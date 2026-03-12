import React from "react";
import { motion } from "framer-motion";
import SeoHelmet from '../components/seo/SeoHelmet'; // Import SeoHelmet

import JetHero from "@/components/JetHero";
import ServicesSlider from "@/components/ServicesSlider";
import WhyRidersChoose from "@/components/WhyRidersChoose";
import OurArsenal from "@/components/OurArsenal";
import JetSignatureJourneys from "@/components/JetSignatureJourneys";
import AirliftClassSection from "@/components/AirliftClassSection";
import ThreeSuperpowers from "@/components/ThreeSuperpowers";
import FinalCTA from "@/components/FinalCTA";

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const pageTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

export default function HomePage_JetMyMoto() {
  return (
    <>
      <SeoHelmet
          title="JetMyMoto | Global Motorcycle Expeditions & Air Freight"
          description="JetMyMoto provides premier motorcycle air freight and logistics for global expeditions. Ship your bike anywhere, ride the world."
          canonicalUrl="https://jetmymoto.com/"
      />
      <div className="pt-20 bg-[#050505]">
        {/* HERO stands alone */}
        <JetHero />

        {/* CONTENT SECTIONS */}
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {/* 1. HOW IT WORKS */}
          <ServicesSlider />

          {/* 2. TRUST STRIP */}
          <WhyRidersChoose />

          {/* 3. SERVICE DEPTH */}
          <div className="py-24">
            <OurArsenal />
          </div>

          {/* 4. ASPIRATIONAL CONTENT */}
          <JetSignatureJourneys />

          {/* 5. PRODUCT TIERS */}
          <AirliftClassSection />

          {/* 6. ECOSYSTEM POSITIONING (moved lower intentionally) */}
          <ThreeSuperpowers />

          {/* 7. FINAL CLOSE */}
          <FinalCTA />
        </motion.div>


      </div>
    </>
  );
}