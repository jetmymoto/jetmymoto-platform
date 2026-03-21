import React from 'react';
import { motion } from 'framer-motion';
import { Map, Settings, Shield, Plane } from 'lucide-react';

const steps = [
  {
    icon: <Map className="w-8 h-8 text-amber-500" />,
    title: "Select Region or Route",
    description: "Choose your destination from our global logistics network."
  },
  {
    icon: <Settings className="w-8 h-8 text-amber-500" />,
    title: "Activate Logistics Options",
    description: "Configure your freight needs, dates, and documentation requirements."
  },
  {
    icon: <Shield className="w-8 h-8 text-amber-500" />,
    title: "Secure Slot or Join Pool",
    description: "Lock in your dedicated transport or join a shared logistics pool."
  },
  {
    icon: <Plane className="w-8 h-8 text-amber-500" />,
    title: "Deploy & Ride",
    description: "We handle the infrastructure. You arrive and ride."
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-[#050505] text-white">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span className="text-amber-500 font-mono text-[10px] tracking-[0.5em] uppercase font-bold">
              Infrastructure Workflow
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif uppercase tracking-tight">
            How It Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative p-6 border border-white/5 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              <div className="mb-6">{step.icon}</div>
              <div className="text-white/10 font-mono text-4xl font-bold absolute top-6 right-6">
                0{idx + 1}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
