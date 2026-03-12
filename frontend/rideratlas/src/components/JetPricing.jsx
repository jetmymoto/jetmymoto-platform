import React from 'react';
import { Check } from 'lucide-react';

const PriceCard = ({ title, sub, features, price, btn, highlight }) => (
  <div className={`p-10 rounded-3xl border flex flex-col ${highlight ? 'border-amber-500 bg-[#0F0F0F]' : 'border-white/10 bg-[#050505]'}`}>
    <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
    <p className="text-amber-500 text-xs font-black tracking-widest uppercase mb-8">{sub}</p>
    <div className="space-y-4 mb-8 flex-grow">
      {features.map((f, i) => <div key={i} className="flex gap-3"><Check size={16} className={highlight ? "text-black bg-amber-500 rounded-full p-0.5" : "text-gray-400"} /> <span className="text-gray-300 text-sm">{f}</span></div>)}
    </div>
    <div className="text-gray-500 text-xs mb-4">{price}</div>
    <button className={`w-full py-4 rounded-xl font-bold uppercase ${highlight ? 'bg-amber-500 text-black' : 'border border-white/20 text-white'}`}>{btn}</button>
  </div>
);

const JetPricing = () => (
  <section className="py-32 bg-[#050505]">
    <div className="container mx-auto px-6 text-center mb-16"><h2 className="text-4xl font-black text-white">Choose Your <span className="text-amber-500">Airlift Class</span></h2></div>
    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8 max-w-5xl">
      <PriceCard title="Airlift Economy" sub="Group Transport" features={["Open trailers", "Hub delivery", "Fixed schedule"]} price="From €399" btn="View Economy" highlight={false} />
      <PriceCard title="Airlift Premium" sub="Door-to-Door" features={["Enclosed vans", "Direct delivery", "Flexible dates"]} price="From €999" btn="Explore Premium" highlight={true} />
    </div>
  </section>
);
export default JetPricing;
