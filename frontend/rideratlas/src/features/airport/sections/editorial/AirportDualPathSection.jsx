import React from "react";
import { Plane, Truck, ArrowRightLeft } from "lucide-react";

export default function AirportDualPathSection({
  rideMode,
  setRideMode,
  onScrollToEngine,
}) {
  const handleSelectPath = (pathKey) => {
    setRideMode(pathKey);
    setTimeout(() => {
      onScrollToEngine?.();
    }, 100);
  };

  const options = [
    {
      key: "rent",
      icon: <Plane className="h-10 w-10" />,
      title: "Fly & Ride",
      desc: "Land in the airport hub and find your motorcycle awaiting you at our terminal concierge. No transfers, no delays.",
      cta: "Browse Rental Fleet",
      active: rideMode === "rent",
    },
    {
      key: "bring",
      icon: <Truck className="h-10 w-10" />,
      title: "Ship Your Own",
      desc: "We handle the white-glove transport of your personal motorcycle directly to your arrival airport terminal.",
      cta: "Request Transport Plan",
      active: rideMode === "bring",
    },
    {
      key: "oneway",
      icon: <ArrowRightLeft className="h-10 w-10" />,
      title: "One-Way Journey",
      desc: "Embark from this hub and conclude your journey at any node in our European network. We recover your fleet.",
      cta: "Plan One-Way Route",
      active: false, // One-way is usually a sub-option or route feature
    },
  ];

  return (
    <section className="p-8 lg:p-32 bg-[#FBF7EF]">
      <div className="text-center mb-20">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#706F6C] font-medium mb-4">
          Travel Options
        </div>
        <h2 className="font-serif text-5xl text-[#1C1B18]">Tailored Pickup Logistics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {options.map((option) => (
          <div 
            key={option.key}
            className={`bg-white border border-black/5 p-12 transition-all hover:shadow-2xl flex flex-col items-center text-center ${
              option.active ? "ring-1 ring-[#C9A14A]" : ""
            }`}
          >
            <div className="text-[#C9A14A] mb-8">
              {option.icon}
            </div>
            <h3 className="font-serif text-3xl mb-4 text-[#1C1B18]">{option.title}</h3>
            <p className="text-[#706F6C] mb-10 flex-grow leading-relaxed font-light">
              {option.desc}
            </p>
            <button 
              onClick={() => option.key !== "oneway" && handleSelectPath(option.key)}
              className="w-full py-4 border border-black/10 font-mono text-[10px] uppercase tracking-widest hover:bg-[#1C1B18] hover:text-white transition-all"
            >
              {option.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}