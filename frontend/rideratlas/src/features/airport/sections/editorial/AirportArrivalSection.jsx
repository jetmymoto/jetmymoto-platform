import React from "react";

export default function AirportArrivalSection({ copy }) {
  const steps = [
    {
      number: "01",
      title: "Plan Your Ride",
      desc: "Select your route and preferred motorcycle online."
    },
    {
      number: "02",
      title: "Arrive at Hub",
      desc: "Fly into the international terminal. Our concierge meets you at arrivals."
    },
    {
      number: "03",
      title: "Collection",
      desc: "Your machine is prepped and luggage is secured at the hub."
    },
    {
      number: "04",
      title: "Departure",
      desc: "Begin your journey. Leave the airport behind and hit the open road."
    }
  ];

  return (
    <section className="py-32 px-8 lg:px-32 bg-[#F7F3EA] text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#706F6C] font-medium mb-20">
        Logistics Transparency
      </div>
      <h2 className="font-serif text-5xl mb-24 text-[#1C1B18]">{copy?.heading || "How airport pickup works"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative max-w-6xl mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="text-2xl font-serif italic text-[#C9A14A] mb-4">{step.number}</div>
            <h4 className="font-mono text-xs font-bold uppercase mb-4 text-[#1C1B18]">{step.title}</h4>
            <p className="text-[11px] text-[#706F6C] leading-relaxed max-w-[200px]">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
