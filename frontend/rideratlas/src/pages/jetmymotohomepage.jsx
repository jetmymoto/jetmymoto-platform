import React, { useReducer, useEffect } from "react";
import { motion } from "framer-motion";
import SeoHelmet from '../components/seo/SeoHelmet'; 

import JetMyMotoHero from "@/components/JetMyMotoHero";
import HowItWorksSection from "@/components/HowItWorksSection";
import ChooseHowYouShipSection from "@/components/ChooseHowYouShipSection";
import WhyRidersChoose from "@/components/WhyRidersChoose";
import RouteDiscoverySection from "@/components/RouteDiscoverySection";
import DynamicCinematicCTA from "@/components/home/DynamicCinematicCTA";
import TrustInfrastructure from "@/components/home/TrustInfrastructure";
import { getCanonicalPaths } from "@/utils/navigationTargets";
import {
  GRAPH,
  loadGraphShard,
  readGraphShard,
  getGraphShardStatus,
} from "@/core/network/networkGraph";

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

export default function JetMyMotoHomepage() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const status = getGraphShardStatus("rentals");
    if (status === "idle") {
      loadGraphShard("rentals").then(forceUpdate);
    } else if (status === "loading") {
      const id = setInterval(() => {
        if (getGraphShardStatus("rentals") === "loaded") {
          clearInterval(id);
          forceUpdate();
        }
      }, 200);
      return () => clearInterval(id);
    }
  }, []);

  const rentalShard = readGraphShard("rentals");
  const shardStatus = getGraphShardStatus("rentals");

  return (
    <>
      <SeoHelmet
          title="JetMyMoto | Global Motorcycle Expeditions & Rental Platform"
          description="JetMyMoto provides premier motorcycle air freight logistics and premium rentals for global expeditions. Ship your bike or rent locally."
          canonicalUrl="https://jetmymoto.com/"
      />
      <div className="bg-[#050505] selection:bg-amber-500/30">
        
        {/* HERO stands alone */}
        <JetMyMotoHero
          GRAPH={GRAPH}
          rentalShard={rentalShard}
          rentalsLoading={shardStatus === "loading" || shardStatus === "idle"}
          canonicalPaths={canonicalPaths}
        />

        {/* CONTENT SECTIONS */}
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <TrustInfrastructure layout="marquee" />

          <HowItWorksSection />
          <ChooseHowYouShipSection />
          <RouteDiscoverySection
            GRAPH={GRAPH}
            rentalShard={rentalShard}
            shardStatus={shardStatus}
          />
          <WhyRidersChoose />
          
          <DynamicCinematicCTA />
        </motion.div>
      </div>
    </>
  );
}
