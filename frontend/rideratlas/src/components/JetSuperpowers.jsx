import React from 'react';
import { Map, Plane, Gauge } from 'lucide-react';

const Card = ({ icon: Icon, title, subtitle, desc }) => (
  <div className="p-10 rounded-3xl border border-white/5 bg-[#080808] hover:border-amber-500/30 transition-all group">
    <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-8 text-amber-500 group-hover:scale-110 transition-transform"><Icon size={28} /></div>
    <div className="flex justify-between mb-4"><h3 className="text-2xl font-bold text-white">{title}</h3><span className="text-[10px] font-black text-amber-600 bg-amber-500/5 px-2 py-1 rounded uppercase">{subtitle}</span></div>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const JetSuperpowers = () => (
  <section className="py-32 bg-[#050505] text-center">
    <h2 className="text-4xl md:text-6xl font-black text-white mb-6">One Platform. <span className="text-amber-500">Three Superpowers.</span></h2>
    <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-20">Plan your route in Rider Atlas, ship your bike with JetMyMoto, and relive the ride with Telemetry.</p>
    <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
      <Card icon={Map} subtitle="AI ROUTE ENGINE" title="Plan in Rider Atlas" desc="Describe your riding style and let the AI stitch together airports, passes and stays into a cinematic mission." />
      <Card icon={Plane} subtitle="AIRLIFT SERVICE" title="Ship with JetMyMoto" desc="Skip the highway grind. We pick up your bike, fly it to the mission start, and you arrive fresh and ready to ride." />
      <Card icon={Gauge} subtitle="BLACK BOX TIER" title="Ride with Telemetry" desc="Capture lean angle, G-force and braking data, then watch your mission back with MotoGP-style overlays." />
    </div>
  </section>
);
export default JetSuperpowers;
