import React from "react";
import { motion } from "framer-motion";
import { Map, Settings, Shield, Plane } from "lucide-react";

const steps = [
  {
    icon: <Map className="w-8 h-8 text-[#CDA755]" />,
    title: "Pick Your Route",
    description:
      "Choose where you want to ride. We’ll handle what it takes to get there.",
  },
  {
    icon: <Settings className="w-8 h-8 text-[#CDA755]" />,
    title: "Plan the Move",
    description:
      "Set your dates, shipping preferences, and documents. We guide you through it.",
  },
  {
    icon: <Shield className="w-8 h-8 text-[#CDA755]" />,
    title: "Lock Your Spot",
    description:
      "Secure your transport or join a shared shipment with other riders.",
  },
  {
    icon: <Plane className="w-8 h-8 text-[#CDA755]" />,
    title: "Land & Ride",
    description:
      "Your bike is ready when you arrive. Or your rental is waiting. Just ride.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 140, damping: 20 },
  },
};

const HowItWorksSection = () => {
  return (
    <section className="relative py-28 bg-[#050505] text-white overflow-hidden">
      
      {/* 🔥 ambient glow (ties with hero) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(205,167,85,0.08),transparent_40%)]" />

      <div className="relative container mx-auto px-6 md:px-12">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-[#CDA755]/50" />
            <span className="text-[#CDA755] font-mono text-[10px] tracking-[0.5em] uppercase font-bold">
              Ride Flow
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif tracking-tight">
            How It Works
          </h2>
        </motion.div>

        {/* STEPS */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className={`group relative p-7 rounded-[24px] border transition-all duration-500 
              ${
                idx === 3
                  ? "border-[#CDA755]/30 bg-gradient-to-br from-[#CDA755]/10 to-transparent"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#CDA755]/40"
              }`}
            >
              {/* STEP NUMBER */}
              <span className="absolute top-5 right-5 text-white/10 text-4xl font-bold transition-all duration-500 group-hover:text-[#CDA755]/20">
                0{idx + 1}
              </span>

              {/* ICON */}
              <div className="mb-6">{step.icon}</div>

              {/* TITLE */}
              <h3 className="text-xl font-semibold mb-3">
                {step.title}
              </h3>

              {/* DESC */}
              <p className="text-white/60 text-sm leading-relaxed">
                {step.description}
              </p>

              {/* 🔗 FLOW CONNECTOR (desktop only) */}
              {idx !== steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-[-20px] w-10 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
