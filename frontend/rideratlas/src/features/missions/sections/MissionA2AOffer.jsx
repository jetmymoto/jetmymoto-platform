import { ShieldCheck } from "lucide-react";

export default function MissionA2AOffer({ offer }) {
  if (!offer) return null;

  return (
    <section className="bg-[#CDA755] py-16 px-6 md:px-12 lg:px-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-10 rounded-[3rem] bg-[#050505] p-10 md:flex-row md:p-16 shadow-2xl">
        <div className="flex-1 text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#CDA755] mb-2">
            One-Way Logistics
          </p>
          <h2 className="mt-4 font-headline text-4xl font-bold text-white md:text-6xl uppercase tracking-tighter">
            {offer.discount}
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            {offer.reason} — One-way fee waived for verified RiderAtlas members.
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <div className="flex items-center gap-4 rounded-full border border-white/20 bg-white/5 px-8 py-5 text-white">
            <ShieldCheck className="w-6 h-6 text-[#CDA755]" />
            <span className="text-xs font-black uppercase tracking-widest">Fee Recovery Applied</span>
          </div>
        </div>
      </div>
    </section>
  );
}
