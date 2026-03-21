import React, { useState, useMemo } from "react";
import { GRAPH } from "@/core/network/networkGraph";
import { SlidersHorizontal, Image as ImageIcon } from "lucide-react";

// Mocking some dynamic tactical presentation logic natively strictly for UI purposes
const getPrice = (rental) => {
  if (rental.price) return rental.price;
  if (rental.category === 'adventure') return 185;
  if (rental.category === 'touring') return 210;
  if (rental.category === 'cruiser') return 165;
  return 150;
};

const getBrand = (rental) => {
  return rental.slug.split('-')[0].toUpperCase();
};

const formatModelName = (slug) => {
  const parts = slug.split('-');
  return parts.slice(0, Math.min(3, parts.length)).join(' ').toUpperCase();
};

export default function RentalGrid({ airportCode }) {
  const rentalIds = GRAPH.rentalsByAirport?.[airportCode?.toUpperCase()] || [];
  const rawRentals = useMemo(() => rentalIds.map(id => GRAPH.rentals[id]).filter(Boolean), [rentalIds, airportCode]);

  const [filterType, setFilterType] = useState("ALL");
  const [filterBrand, setFilterBrand] = useState("ALL");
  const [sortPrice, setSortPrice] = useState("DEFAULT"); 

  // Derived taxonomy
  const allCategories = ["ALL", ...new Set(rawRentals.map(r => r.category.toUpperCase()))];
  const allBrands = ["ALL", ...new Set(rawRentals.map(getBrand))];

  // Filtering Logic Engine
  const filteredRentals = useMemo(() => {
    let result = [...rawRentals];
    
    if (filterType !== "ALL") {
      result = result.filter(r => r.category.toUpperCase() === filterType);
    }
    
    if (filterBrand !== "ALL") {
      result = result.filter(r => getBrand(r) === filterBrand);
    }

    if (sortPrice === "LOW_TO_HIGH") {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortPrice === "HIGH_TO_LOW") {
      result.sort((a, b) => getPrice(b) - getPrice(a));
    }

    return result;
  }, [rawRentals, filterType, filterBrand, sortPrice]);

  if (rawRentals.length === 0) {
    return (
      <div className="py-24 w-full flex flex-col items-center justify-center border border-white/5 bg-zinc-900/30">
        <SlidersHorizontal className="text-zinc-600 mb-4" size={32} />
        <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest text-center">
          No premium fleet inventory registered for the {airportCode} HUB.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col text-left">
      {/* TACTICAL FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 pb-6 border-b border-white/10 bg-[#050505] sticky top-[80px] z-40 p-4 shadow-2xl">
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500 w-full md:w-auto">
          <SlidersHorizontal size={14} className="text-amber-500" />
          <span>Fleet Filters</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Brand Filter */}
          <select 
            value={filterBrand} 
            onChange={e => setFilterBrand(e.target.value)}
            className="bg-black border border-white/20 text-white text-[10px] font-mono uppercase tracking-[0.2em] p-3 pt-3.5 outline-none hover:border-amber-500 transition-colors appearance-none pr-8 relative cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
          >
            {allBrands.map(b => <option key={b} value={b}>Brand: {b}</option>)}
          </select>

          {/* Type Filter */}
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="bg-black border border-white/20 text-white text-[10px] font-mono uppercase tracking-[0.2em] p-3 pt-3.5 outline-none hover:border-amber-500 transition-colors appearance-none pr-8 cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
          >
            {allCategories.map(c => <option key={c} value={c}>Type: {c}</option>)}
          </select>

          {/* Price Filter */}
          <select 
            value={sortPrice} 
            onChange={e => setSortPrice(e.target.value)}
            className="bg-black border border-white/20 text-white text-[10px] font-mono uppercase tracking-[0.2em] p-3 pt-3.5 outline-none hover:border-amber-500 transition-colors appearance-none pr-8 cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
          >
            <option value="DEFAULT">Sort: Recommended</option>
            <option value="LOW_TO_HIGH">Price: Low to High</option>
            <option value="HIGH_TO_LOW">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* SHOWROOM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRentals.map(rental => {
           const brand = getBrand(rental);
           const modelName = formatModelName(rental.slug);
           const price = getPrice(rental);
           
           return (
             <div key={rental.id} className="group bg-zinc-900 overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-500 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
               
               {/* Cinematic Bike Image Placeholder */}
               <div className="h-56 bg-zinc-950 relative overflow-hidden flex items-center justify-center border-b border-white/5 group-hover:bg-black transition-colors">
                 {/* Internal Gradient Masking */}
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
                 
                 <ImageIcon size={64} className="text-zinc-800 absolute z-0 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                 
                 {/* Overlaid Tags */}
                 <div className="absolute top-4 left-4 z-20">
                   <span className="bg-amber-500 text-black px-3 py-1 text-[9px] font-mono tracking-[0.2em] uppercase font-black">
                     {rental.category}
                   </span>
                 </div>
                 <div className="absolute top-4 right-4 z-20">
                   <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white px-3 py-1 text-[9px] font-mono tracking-widest uppercase">
                     {GRAPH.operators?.[rental.operator]?.name || rental.operator}
                   </span>
                 </div>
               </div>

               {/* Card Body */}
               <div className="p-8 flex flex-col flex-1">
                 
                 <div className="mb-6 flex-1">
                   <div className="text-[10px] text-zinc-500 font-mono tracking-[0.25em] uppercase mb-2">
                     {brand}
                   </div>
                   <h3 className="text-2xl font-serif text-white uppercase font-black mb-3 group-hover:text-amber-500 transition-colors italic leading-none">
                     {modelName}
                   </h3>
                 </div>

                 {/* SMART LAYER: Contextual Fit */}
                 <div className="bg-black/80 px-4 py-5 border border-white/5 mb-2 rounded-sm relative overflow-hidden group-hover:border-amber-500/30 transition-colors">
                   <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                   <div className="text-[9px] text-amber-500 uppercase tracking-[0.25em] mb-4 font-bold flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" /> 
                     Best For:
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {rental.compatible_destinations.map(dest => (
                       <span key={dest} className="text-[9px] text-zinc-300 bg-white/5 border border-white/10 px-2 py-1 uppercase tracking-widest font-mono">
                         {dest.replace(/-/g, ' ')}
                       </span>
                     ))}
                   </div>
                 </div>

               </div>

               {/* Card Footer */}
               <div className="bg-[#020202] p-6 pt-5 flex items-center justify-between border-t border-white/10">
                 <div>
                   <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1 font-mono italic">Daily Rate</div>
                   <div className="text-2xl font-mono text-white tracking-widest font-black leading-none flex items-end">
                     €{price}
                     <span className="text-[10px] text-zinc-500 font-normal pb-1 ml-1 leading-none italic uppercase">/day</span>
                   </div>
                 </div>
                 
                 <button className="bg-white text-black text-[10px] font-mono font-black tracking-[0.2em] uppercase px-5 py-3.5 hover:bg-amber-500 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                   Request
                 </button>
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}
