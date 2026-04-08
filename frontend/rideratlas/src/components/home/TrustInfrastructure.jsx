import React from 'react';

const PARTNER_DATA = {
  "Airlift & Cargo": [
    { name: "DHL", color: "text-[#D40511]", font: "font-serif italic" },
    { name: "Lufthansa Cargo", color: "text-amber-500", font: "font-serif italic" },
    { name: "DB Schenker", color: "text-[#005c6e]", font: "font-serif font-black" }
  ],
  "Platform Protection": [
    { name: "Allianz", color: "text-[#003781]", font: "font-serif italic whitespace-nowrap" },
    { name: "AXA", color: "text-[#00008F]", font: "font-serif italic" },
    { name: "Zurich", color: "text-[#213b73]", font: "font-bold" }
  ],
  "Global Fleet Partners": [
    { name: "Hertz Ride", color: "text-[#ffcc00]", font: "font-serif italic whitespace-nowrap" },
    { name: "EagleRider", color: "text-[#d13239]", font: "font-black" },
    { name: "BMW Rent", color: "text-[#0066b1]", font: "font-bold whitespace-nowrap" }
  ]
};

const ALL_PARTNERS = Object.values(PARTNER_DATA).flat();

const PartnerLogo = ({ partner }) => (
  <div className={`text-xl md:text-2xl uppercase tracking-widest cursor-default opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 hover:scale-105 ${partner.font} ${partner.color} px-8`}>
    {partner.name}
  </div>
);

export default function TrustInfrastructure({ layout = "marquee" }) {
  return (
    <section className="py-16 bg-[#030303] border-b border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="text-center">
          <span className="text-[10px] text-[#CDA755] font-mono uppercase tracking-[0.3em] font-bold">
            Trusted Global Infrastructure
          </span>
        </div>
      </div>

      {layout === "grid" ? (
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {Object.entries(PARTNER_DATA).map(([category, partners]) => (
            <div key={category} className="flex flex-col items-center border border-white/5 bg-white/[0.02] p-10 rounded-sm hover:border-amber-500/20 transition-colors duration-500">
              <h4 className="text-[10px] text-amber-500 font-mono uppercase tracking-[0.3em] mb-10 font-bold">{category}</h4>
              <div className="flex flex-col gap-10 items-center justify-center flex-1">
                {partners.map(p => <PartnerLogo key={p.name} partner={p} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative w-full flex items-center overflow-hidden py-4">
          {/* Aesthetic Fading edges block */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#030303] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#030303] to-transparent z-10 pointer-events-none" />
          
          <style>{`
            @keyframes infinite-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-infinite-marquee {
              display: flex;
              width: max-content;
              animation: infinite-marquee 40s linear infinite;
            }
            .animate-infinite-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>
          
          <div className="animate-infinite-marquee">
            {/* Render 2 uniform sets to make it infinitely scroll seamlessly */}
            <div className="flex items-center justify-around w-max px-4">
              {ALL_PARTNERS.map(p => <PartnerLogo key={`1-${p.name}`} partner={p} />)}
            </div>
            <div className="flex items-center justify-around w-max px-4">
              {ALL_PARTNERS.map(p => <PartnerLogo key={`2-${p.name}`} partner={p} />)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
