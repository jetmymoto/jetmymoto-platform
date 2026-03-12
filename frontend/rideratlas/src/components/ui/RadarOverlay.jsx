import React from "react";
import { motion } from "framer-motion";

const RadarOverlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">

      {/* Radar Circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[700px] h-[700px] border border-white/5 rounded-full" />
        <div className="absolute w-[500px] h-[500px] border border-white/5 rounded-full" />
        <div className="absolute w-[300px] h-[300px] border border-white/5 rounded-full" />
      </div>

      {/* Sweep Beam */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 12,
          ease: "linear"
        }}
      >
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[2px] bg-gradient-to-r from-amber-500/60 to-transparent origin-left" />
      </motion.div>

    </div>
  );
};

export default RadarOverlay;
