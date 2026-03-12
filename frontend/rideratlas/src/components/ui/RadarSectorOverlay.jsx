import React from "react";
import { motion } from "framer-motion";

const RadarSectorOverlay = () => {
  const blips = Array.from({ length: 18 });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">

      {/* Radar grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "80px 80px"
        }}
      />

      {/* Radar circles */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <div className="w-[900px] h-[900px] border border-white rounded-full" />
        <div className="absolute w-[650px] h-[650px] border border-white rounded-full" />
        <div className="absolute w-[420px] h-[420px] border border-white rounded-full" />
      </div>

      {/* Radar sweep */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
      >
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[2px] bg-gradient-to-r from-amber-500/40 to-transparent origin-left blur-sm" />
      </motion.div>

      {/* Aircraft blips */}
      {blips.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-amber-500 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.6, 1] }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );
};

export default RadarSectorOverlay;
