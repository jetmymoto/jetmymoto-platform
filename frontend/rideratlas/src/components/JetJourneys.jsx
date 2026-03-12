import React from 'react';
import { ArrowRight, Clock, Zap } from 'lucide-react';

const Card = ({ title, route, days, tags, img }) => (
  <div className="group relative h-[450px] rounded-2xl overflow-hidden border border-white/10 shrink-0 w-80 md:w-96 cursor-pointer">
    <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60" alt={title} />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
    <div className="absolute top-4 left-4 flex gap-2">{tags.map((tag, i) => <span key={i} className="px-2 py-1 bg-amber-500 text-black text-[10px] font-black uppercase rounded-sm">{tag}</span>)}</div>
    <div className="absolute bottom-0 left-0 w-full p-6">
      <h3 className="text-2xl font-black text-white uppercase mb-1">{title}</h3>
      <p className="text-gray-400 text-xs font-mono mb-4">{route}</p>
      <div className="flex items-center gap-4 text-xs font-bold text-white mb-6 border-t border-white/10 pt-4"><span className="flex items-center gap-1"><Clock size={14} className="text-amber-500"/> {days} DAYS</span><span className="flex items-center gap-1"><Zap size={14} className="text-amber-500"/> HIGH TEMPO</span></div>
      <button className="w-full py-3 border border-white/20 hover:bg-amber-500 hover:text-black transition-all text-xs font-bold uppercase flex items-center justify-center gap-2 rounded">View Mission <ArrowRight size={14} /></button>
    </div>
  </div>
);

const JetJourneys = () => (
  <section className="py-32 bg-[#050505] text-center border-t border-white/5">
    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Signature <span className="text-amber-500">Journeys</span></h2>
    <p className="text-gray-400 text-lg mb-12">Hand-picked from the JetMyMoto classified vault.</p>
    <div className="flex gap-6 overflow-x-auto pb-8 px-6 justify-start md:justify-center no-scrollbar">
      <Card title="The Alpine Apex" route="Zurich to Munich via Stelvio" days="7" tags={["Classic", "Signature"]} img="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" />
      <Card title="The Riviera Run" route="Nice to Genoa Coastal Route" days="5" tags={["Luxury", "Guided"]} img="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2066&auto=format&fit=crop" />
      <Card title="Black Forest Intrigue" route="Stuttgart Loop via B500" days="4" tags={["Technical", "Creator"]} img="https://images.unsplash.com/photo-1519336367661-eba9c1dfa5e9?q=80&w=2070&auto=format&fit=crop" />
    </div>
  </section>
);
export default JetJourneys;
