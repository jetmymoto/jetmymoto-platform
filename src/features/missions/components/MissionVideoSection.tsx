import { Play, Clock, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { resolveMissionHero } from "../../media/resolvers/missionMediaResolver";

interface Props {
  mission: any;
}

export default function MissionVideoSection({ mission }: Props) {
  const [poster, setPoster] = useState<string | null>(null);

  useEffect(() => {
    resolveMissionHero(mission).then(img => setPoster(img));
  }, [mission]);

  return (
    <section className="bg-[#0B0B0C] py-12">
      <div className="container mx-auto px-8">
        <div className="relative group cursor-pointer overflow-hidden rounded-sm border border-white/5 aspect-[21/9] bg-neutral-900">
          {/* Background Poster */}
          {poster && (
            <img 
              src={poster} 
              alt="Mission Trailer" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 grayscale-[0.5] group-hover:grayscale-0"
            />
          )}

          {/* Cinematic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

          {/* Play Interface */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
            <div className="w-24 h-24 rounded-full border border-white/20 bg-white/5 flex items-center justify-center backdrop-blur-md group-hover:scale-110 group-hover:border-[#CDA755]/50 transition-all duration-500">
              <Play className="w-8 h-8 text-white fill-white group-hover:text-[#CDA755] group-hover:fill-[#CDA755] transition-colors" />
            </div>
            <div className="text-center space-y-2">
              <div className="text-[#CDA755] text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Preview Transmission</div>
              <h4 className="text-white text-3xl font-bold tracking-tighter uppercase italic">Mission Cinematic</h4>
            </div>
          </div>

          {/* Metadata HUD */}
          <div className="absolute bottom-8 left-12 right-12 flex items-center justify-between z-10">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                 <Clock className="w-4 h-4 text-[#CDA755]" />
                 <span className="text-white text-xs font-bold tracking-widest uppercase">{mission.duration_days} Days</span>
              </div>
              <div className="flex items-center gap-3">
                 <MapPin className="w-4 h-4 text-[#CDA755]" />
                 <span className="text-white text-xs font-bold tracking-widest uppercase">{mission.theater}</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
               <div className="h-[1px] w-12 bg-white/10" />
               <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Movie Factory Ready</span>
            </div>
          </div>

          {/* Scanning Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
      </div>
    </section>
  );
}
