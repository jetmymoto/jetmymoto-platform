import React from "react";
import { motion } from "framer-motion";
import { 
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  ArrowRight
} from "lucide-react";
import DeploymentCard from "@/components/airport/DeploymentCard";

// --- DATA: MOCK DEPLOYMENT SECTORS ---

const mockMissions = [
  {
    id: "alps-muc",
    airport_name: "Munich International",
    region_desc: "The Gateway to High Alpine Passes.",
    airport_code: "MUC",
    country_code: "DE",
    coords: { lat: "48.3537° N", long: "11.7750° E" },
    weather: { temp: "14°C", condition: "Crisp", Icon: CloudSnow },
    rental: { price: "189", class: "Premium Adventure" }
  },
  {
    id: "med-bcn",
    airport_name: "Barcelona–El Prat",
    region_desc: "Mediterranean Coast Meets Pyrenees.",
    airport_code: "BCN",
    country_code: "ES",
    coords: { lat: "41.2974° N", long: "2.0833° E" },
    weather: { temp: "22°C", condition: "High Sun", Icon: Sun },
    rental: { price: "169", class: "Sport-Touring" }
  },
  {
    id: "hills-flr",
    airport_name: "Florence Peretola",
    region_desc: "The Heart of Tuscan Strade Bianche.",
    airport_code: "FLR",
    country_code: "IT",
    coords: { lat: "43.8100° N", long: "11.2012° E" },
    weather: { temp: "19°C", condition: "Warm", Icon: Wind },
    rental: { price: "199", class: "Heritage / Scrambler" }
  },
  {
    id: "desert-agp",
    airport_name: "Málaga–Costa del Sol",
    region_desc: "Sun-Drenched Sierras & Arid Plains.",
    airport_code: "AGP",
    country_code: "ES",
    coords: { lat: "36.6749° N", long: "4.4991° W" },
    weather: { temp: "28°C", condition: "Arid", Icon: Sun },
    rental: { price: "179", class: "Heavy Cruiser" }
  },
  {
    id: "riviera-nce",
    airport_name: "Nice Côte d'Azur",
    region_desc: "Iconic Cliffs & Glamorous Coastal Runs.",
    airport_code: "NCE",
    country_code: "FR",
    coords: { lat: "43.6653° N", long: "7.2150° E" },
    weather: { temp: "21°C", condition: "Clear", Icon: Wind },
    rental: { price: "199", class: "Naked / Cafe Racer" }
  },
  {
    id: "highland-inv",
    airport_name: "Inverness Airport",
    region_desc: "Rugged Highlands & Isle of Skye Quests.",
    airport_code: "INV",
    country_code: "GB",
    coords: { lat: "57.5425° N", long: "4.0475° W" },
    weather: { temp: "11°C", condition: "Misty", Icon: CloudRain },
    rental: { price: "185", class: "All-Terrain Boxer" }
  }
];

// --- MAIN SECTION: DEPLOYMENT SECTORS ---

const JetSignatureJourneys = ({ missions = mockMissions, limit = 6 }) => {
  return (
    <section className="relative bg-[#050505] min-h-screen py-28 md:py-36 flex flex-col items-center justify-center">
      <div className="container mx-auto max-w-7xl px-6 md:px-12">
        
       {/* HEADER BLOCK */}
<div className="max-w-3xl mb-20">
  <div className="flex items-center gap-4 mb-8">
    <div className="h-[1px] w-12 bg-amber-500" />
    <span className="text-amber-500 font-mono text-[11px] tracking-[0.6em] uppercase font-semibold">
      Arrival Sectors
    </span>
  </div>

  <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.05] tracking-[-0.02em] font-semibold">
    Where your bike
    <br className="hidden md:block" />
    will be waiting.
  </h2>

  <p className="mt-8 text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl border-l border-white/10 pl-8">
    Each route is aligned with a major European airport.
    <br />
    You land. Your motorcycle is staged nearby. You ride.
  </p>
</div>

        {/* INTERACTIVE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-x-10 md:gap-y-16">
          {missions.slice(0, limit).map((mission) => (
            <DeploymentCard key={mission.id} mission={mission} />
          ))}
        </div>

        {/* FOOTER ACTION / PLACEHOLDER QUICKLINK */}
        <div className="mt-24 flex justify-center">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative px-12 py-5 bg-zinc-900/40 border border-white/5 hover:border-amber-500/40 transition-all duration-500"
          >
            <div className="flex items-center gap-6 text-[12px] font-mono font-black tracking-[0.4em] text-white/50 group-hover:text-amber-500 uppercase italic">
              Access_Global_Network
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
            </div>
            
            {/* Visual Frame Accents for the Button */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/0 group-hover:border-amber-500/40 transition-all" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500/0 group-hover:border-amber-500/40 transition-all" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

// --- MAIN ENTRY POINT ---

export default function App() {
  return (
    <main className="bg-[#050505] overflow-x-hidden selection:bg-amber-500/30">
      <JetSignatureJourneys />
    </main>
  );
}