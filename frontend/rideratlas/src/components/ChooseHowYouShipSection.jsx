import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlaneTakeoff, Users } from "lucide-react";

const ChooseHowYouShipSection = () => {
  const [active, setActive] = useState(null);

  return (
    <section className="relative py-28 bg-[#0a0a0a] text-white border-y border-white/5 overflow-hidden">
      
      {/* 🔥 ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(205,167,85,0.08),transparent_40%)]" />

      {/* 🎬 dynamic background swap */}
      <div className="absolute inset-0 transition-opacity duration-700 pointer-events-none">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
            active === "direct" ? "opacity-20" : "opacity-0"
          }`}
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1517846693594-1567da72af75?auto=format&fit=crop&w=1600&q=80)",
          }}
        />
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
            active === "shared" ? "opacity-20" : "opacity-0"
          }`}
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=80)",
          }}
        />
      </div>

      <div className="relative container mx-auto px-6 md:px-12">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <p className="text-white/40 text-sm mb-6">
            Once you choose your route, decide how you want to ride it:
          </p>

          <h2 className="text-4xl md:text-5xl font-serif tracking-tight mb-6">
            How Do You Want to Ride This Trip?
          </h2>

          <p className="text-white/60 text-lg">
            Ship your own bike or ride a local one. We handle everything behind the scenes.
          </p>
        </motion.div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          
          {/* LEFT — DIRECT */}
          <motion.div
            onMouseEnter={() => setActive("direct")}
            onMouseLeave={() => setActive(null)}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative p-10 rounded-[28px] border border-white/10 bg-white/[0.03] transition-all duration-500 hover:border-[#CDA755]/40 hover:bg-white/[0.06] hover:scale-[1.02]"
          >
            {/* glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(205,167,85,0.12),transparent_60%)] pointer-events-none" />

            {/* icon bg */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <PlaneTakeoff className="w-48 h-48" />
            </div>

            <PlaneTakeoff className="w-10 h-10 text-[#CDA755] mb-6" />

            <h3 className="text-2xl md:text-3xl font-serif mb-4">
              Bring Your Own Bike
            </h3>

            <p className="text-white/60 mb-8 leading-relaxed max-w-sm">
              Ride the machine you trust. We handle shipping, customs, and delivery so it’s ready when you land.
            </p>

            <ul className="space-y-3 mb-10 text-sm font-mono text-white/70">
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 bg-[#CDA755] rounded-full" />
                Custom Routing
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 bg-[#CDA755] rounded-full" />
                Priority Handling
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 bg-[#CDA755] rounded-full" />
                Private or Group Shipping
              </li>
            </ul>

            <button className="text-xs uppercase tracking-[0.2em] font-bold border-b border-[#CDA755] pb-1 hover:text-[#CDA755] transition-colors">
              Start Shipping
            </button>
          </motion.div>

          {/* RIGHT — SHARED */}
          <motion.div
            onMouseEnter={() => setActive("shared")}
            onMouseLeave={() => setActive(null)}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative p-10 rounded-[28px] border border-[#CDA755]/30 bg-gradient-to-br from-[#CDA755]/10 to-transparent transition-all duration-500 hover:scale-[1.02]"
          >
            {/* MOST FLEXIBLE TAG */}
            <span className="absolute top-5 right-5 text-[10px] tracking-[0.3em] uppercase text-[#CDA755] font-mono">
              Most Flexible
            </span>

            {/* glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(205,167,85,0.12),transparent_60%)] pointer-events-none" />

            {/* icon bg */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="w-48 h-48" />
            </div>

            <Users className="w-10 h-10 text-[#CDA755] mb-6" />

            <h3 className="text-2xl md:text-3xl font-serif mb-4">
              Ride Local
            </h3>

            <p className="text-white/60 mb-8 leading-relaxed max-w-sm">
              Fly in, pick up a premium bike, and start riding. No logistics, no waiting.
            </p>

            <ul className="space-y-3 mb-10 text-sm font-mono text-white/70">
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 bg-[#CDA755] rounded-full" />
                Ready on Arrival
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 bg-[#CDA755] rounded-full" />
                No Shipping Needed
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 bg-[#CDA755] rounded-full" />
                Premium Fleet Access
              </li>
            </ul>

            <button className="text-xs uppercase tracking-[0.2em] font-bold border-b border-[#CDA755] pb-1 hover:text-[#CDA755] transition-colors">
              Find a Bike
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ChooseHowYouShipSection;
