import React from 'react';
import { Truck, BrainCircuit, Star, ShieldCheck } from 'lucide-react';

const items = [
  { icon: Truck, title: 'The Airlift', desc: 'The smart way to your dream ride. Skip the boring highway and save your tires.' },
  { icon: BrainCircuit, title: 'Charters', desc: 'Private track days, corporate race weekends, or multi-day collector rallies.' },
  { icon: Star, title: 'The GP Circuit', desc: 'Your Moto GP Logistics. We move your bike. You fly. Focus on apexes, not Autobahn.' },
  { icon: ShieldCheck, title: 'Multi-leg travel', desc: 'Safe, insured transfer between your departure and arrival airports.' },
];

const JetArsenal = () => (
  <section className="py-24 bg-[#0A0A0A]">
    <div className="container mx-auto px-6 grid md:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <div key={i} className="bg-[#050505] border border-white/5 p-8 rounded-3xl hover:border-amber-500/30 transition-all group">
          <div className="bg-zinc-900/50 w-12 h-12 rounded-xl flex items-center justify-center mb-6"><item.icon className="text-amber-500" size={24} /></div>
          <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
          <p className="text-gray-500 text-sm mb-6">{item.desc}</p>
          <button className="text-amber-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">Learn More →</button>
        </div>
      ))}
    </div>
  </section>
);
export default JetArsenal;
