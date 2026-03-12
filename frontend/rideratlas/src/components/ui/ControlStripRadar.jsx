import React from "react";
import { motion } from "framer-motion";

const ControlStripRadar = () => (
  <motion.div
    className="absolute inset-0 pointer-events-none"
    initial={{ x: "-100%" }}
    animate={{ x: "100%" }}
    transition={{
      repeat: Infinity,
      duration: 6,
      ease: "linear"
    }}
  >
    <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent blur-sm" />
  </motion.div>
);

export default ControlStripRadar;
