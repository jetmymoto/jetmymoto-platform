import React from "react";

export default function AirportConciergeForm({ airportName }) {
  return (
    <section className="py-32 px-8 lg:px-32 bg-[#111111] text-white flex flex-col lg:flex-row gap-24">
      <div className="lg:w-1/3">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-4 text-[#C9A14A] font-medium">Travel Concierge</div>
        <h2 className="font-serif text-6xl leading-[0.95] mb-8 italic">Start planning from {airportName}</h2>
        <p className="text-white/60 leading-relaxed font-light mb-12">
          Our specialists will craft a personalized logistics plan, including airport pickup timing and fleet availability, tailored to your riding style.
        </p>
        <div className="flex items-center gap-4">
          <div className="w-1 h-12 bg-[#C9A14A]"></div>
          <div>
            <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/40 mb-1">Response Latency</div>
            <div className="font-mono text-sm">Under 24 Hours</div>
          </div>
        </div>
      </div>
      <div className="lg:w-2/3 bg-white/5 p-12 backdrop-blur-sm border border-white/5">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">Travel Objective</label>
            <select className="w-full bg-transparent border-b border-white/20 py-4 font-mono text-xs outline-none focus:border-[#C9A14A] text-white">
              <option className="bg-[#111111]">One-Way Expedition</option>
              <option className="bg-[#111111]">Coastal Weekend</option>
              <option className="bg-[#111111]">Alpine Crossing</option>
              <option className="bg-[#111111]">Custom Tour</option>
            </select>
          </div>
          <div className="space-y-4">
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">Travel Style</label>
            <select className="w-full bg-transparent border-b border-white/20 py-4 font-mono text-xs outline-none focus:border-[#C9A14A] text-white">
              <option className="bg-[#111111]">Scenic & Leisure</option>
              <option className="bg-[#111111]">Technical & Aggressive</option>
              <option className="bg-[#111111]">Luxury Touring</option>
              <option className="bg-[#111111]">Mixed Terrain</option>
            </select>
          </div>
          <div className="space-y-4">
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">Fleet Strategy</label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="fleet" className="hidden peer" defaultChecked />
                <div className="py-4 border border-white/10 text-center font-mono text-[10px] peer-checked:bg-[#C9A14A] peer-checked:border-[#C9A14A] transition-all uppercase">RENT HUB FLEET</div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="fleet" className="hidden peer" />
                <div className="py-4 border border-white/10 text-center font-mono text-[10px] peer-checked:bg-[#C9A14A] peer-checked:border-[#C9A14A] transition-all uppercase">SHIP MY BIKE</div>
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">Travel Window</label>
            <input type="date" className="w-full bg-transparent border-b border-white/20 py-4 font-mono text-xs outline-none focus:border-[#C9A14A] text-white" />
          </div>
          <button 
            type="submit"
            onClick={(e) => e.preventDefault()}
            className="col-span-1 md:col-span-2 py-6 bg-[#C9A14A] text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-2xl"
          >
            Request Airport Ride Plan
          </button>
        </form>
      </div>
    </section>
  );
}
