import React from 'react';
import { motion } from 'framer-motion';
import { Map, Plane, Gauge } from 'lucide-react';

const SuperpowerCard = ({ icon: Icon, pill, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: delay }}
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gold-accent/20 bg-gradient-to-b from-slate-900/80 to-navy-deep/60 p-8 shadow-2xl"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,185,60,0.08),transparent_60%)]"></div>

      <div className="flex items-center justify-between">
        <div className="rounded-full bg-gold-accent/10 p-3 border border-gold-accent/20">
          <Icon className="h-6 w-6 text-gold-accent" />
        </div>
        <span className="rounded-full border border-gold-accent/15 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-accent">
          {pill}
        </span>
      </div>
      <h3 className="mt-6 text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 text-slate-400">{description}</p>
    </motion.div>
  );
};

const ThreeSuperpowers = () => {
  return (
    <section className="relative bg-navy-deep py-20 sm:py-28 px-4">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-50"></div>
      
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-white sm:text-5xl"
          >
            One Platform. <span className="text-gold-accent">Three Superpowers.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg text-slate-400"
          >
            Plan your route in Rider Atlas, ship your bike with JetMyMoto, and relive the ride with Telemetry.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <SuperpowerCard
            icon={Map}
            pill="AI Route Engine"
            title="Plan in Rider Atlas"
            description="Describe your riding style and let the AI stitch together airports, passes and stays into a cinematic mission."
            delay={0.1}
          />
          <SuperpowerCard
            icon={Plane}
            pill="Airlift Service"
            title="Ship with JetMyMoto"
            description="Skip the highway grind. We pick up your bike, fly it to the mission start, and you arrive fresh and ready to ride."
            delay={0.2}
          />
          <SuperpowerCard
            icon={Gauge}
            pill="Black Box Tier"
            title="Ride with Telemetry"
            description="Capture lean angle, G-force and braking data, then watch your mission back with MotoGP-style overlays in The Hangar."
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
};

export default ThreeSuperpowers;