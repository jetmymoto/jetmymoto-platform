import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";

export default function MissionCTA({ mission }) {
  const isA2A = mission.missionType === "a2a";
  const startAirport = mission.start_airport || mission.insertion_airport || "hub";

  return (
    <section className="bg-[#050505] py-32 px-6 text-center md:px-12 border-t border-white/5">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-headline text-5xl font-black text-white md:text-7xl uppercase tracking-tighter leading-none">
          {isA2A ? "Plan Your One-Way Ride" : "Experience the Ride"}
        </h2>
        <p className="mt-10 text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          {isA2A 
            ? "Secure your machine for this corridor and let us handle the one-way logistics end-to-end."
            : "Request availability for our premium fleet and receive a complete route plan for this expedition."}
        </p>
        
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            to={`/airport/${startAirport.toLowerCase()}?mode=rent`}
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-4 rounded-full bg-[#CDA755] px-12 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-[#050505] transition-all hover:scale-105 hover:bg-white shadow-[0_0_40px_rgba(205,167,85,0.15)]"
          >
            {isA2A ? "Check Fleet Availability" : "Request Expedition Plan"}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link 
            to="/moto-airlift"
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-4 rounded-full bg-white/5 border border-white/10 px-12 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-white/10"
          >
            {isA2A ? "Request One-Way Plan" : "View Fleet Details"}
          </Link>
        </div>
        
        <div className="mt-16 flex items-center justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#CDA755]" />
            <span className="text-[10px] uppercase tracking-widest text-white font-bold">Secure Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#CDA755]" />
            <span className="text-[10px] uppercase tracking-widest text-white font-bold">Verified Operators</span>
          </div>
        </div>
      </div>
    </section>
  );
}
