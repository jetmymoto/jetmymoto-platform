import React from 'react';
import { motion } from 'framer-motion';
import { PlaneTakeoff, Users } from 'lucide-react';

const ChooseHowYouShipSection = () => {
  return (
    <section className="py-24 bg-[#0a0a0a] text-white border-y border-white/5">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif uppercase tracking-tight mb-6">
            Choose How You Ship
          </h2>
          <p className="text-gray-400 text-lg">
            Flexible logistics solutions engineered for individual riders and global expeditions alike.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Direct Deployment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 border border-white/10 bg-[#050505] rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition-colors"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <PlaneTakeoff className="w-48 h-48" />
            </div>
            
            <PlaneTakeoff className="w-10 h-10 text-amber-500 mb-6" />
            <h3 className="text-3xl font-serif uppercase mb-4">Direct Deployment</h3>
            <p className="text-gray-400 mb-8 leading-relaxed max-w-sm">
              Dedicated freight logistics for individuals or private groups requiring specific dates and uncompromised control.
            </p>
            
            <ul className="space-y-3 mb-10 text-sm font-mono text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 bg-amber-500 rounded-full" />
                Custom Routing
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 bg-amber-500 rounded-full" />
                Priority Processing
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 bg-amber-500 rounded-full" />
                Individual or Private Group
              </li>
            </ul>

            <button className="text-xs uppercase tracking-[0.2em] font-bold border-b border-amber-500 pb-1 hover:text-amber-500 transition-colors">
              Configure Direct Booking
            </button>
          </motion.div>

          {/* Shared Deployment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 border border-white/10 bg-[#050505] rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition-colors"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="w-48 h-48" />
            </div>
            
            <Users className="w-10 h-10 text-amber-500 mb-6" />
            <h3 className="text-3xl font-serif uppercase mb-4">Shared Deployment</h3>
            <p className="text-gray-400 mb-8 leading-relaxed max-w-sm">
              Our transport pool system. Share logistics costs with other riders heading to the same global destination.
            </p>
            
            <ul className="space-y-3 mb-10 text-sm font-mono text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 bg-amber-500 rounded-full" />
                Cost-Optimized
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 bg-amber-500 rounded-full" />
                Shared Payment Division
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 bg-amber-500 rounded-full" />
                Community Logistics
              </li>
            </ul>

            <button className="text-xs uppercase tracking-[0.2em] font-bold border-b border-amber-500 pb-1 hover:text-amber-500 transition-colors">
              View Active Pools
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ChooseHowYouShipSection;
