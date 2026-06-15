import { useState, useEffect } from "react";
import { resolveMissionHero } from "../../media/resolvers/missionMediaResolver";
import { motion } from "framer-motion";
import SmartImage from "../../../shared/media/SmartImage";
import { logHeroLoad } from "../../../shared/media/mediaPreload";

interface Props {
  mission: any;
}

export default function MissionHero({ mission }: Props) {
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    resolveMissionHero(mission).then(img => {
      if (mounted) {
        setHeroImage(img);
        logHeroLoad();
      }
    });
    return () => { mounted = false; };
  }, [mission]);

  const difficulty = mission.theaterData?.difficulty_rating || "Advanced";

  return (
    <section className="relative h-[90vh] min-h-[700px] flex items-center bg-[#0B0B0C] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <SmartImage 
          src={heroImage} 
          alt={mission.title}
          priority={true}
          aspectRatio="h-full w-full"
          className="grayscale-[0.2]"
        />
      </div>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-[#0B0B0C]/40 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0C]/80 via-[#0B0B0C]/20 to-transparent z-10" />
      
      <div className="container mx-auto px-8 relative z-20">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-[#CDA755]" />
            <span className="text-[#CDA755] text-xs font-black uppercase tracking-[0.4em]">
              Premium Mission Dossier
            </span>
          </div>

          <h1 className="text-white text-7xl md:text-9xl font-bold tracking-tighter leading-[0.85] uppercase italic">
            {mission.title}
          </h1>

          <div className="flex flex-wrap gap-12 pt-8 border-t border-white/10">
            <Stat block="Theater" value={mission.theater} />
            <Stat block="Range" value={`${mission.distance_km} KM`} />
            <Stat block="Duration" value={`${mission.duration_days} Days`} />
            <Stat block="Difficulty" value={difficulty} highlight />
          </div>

          <p className="text-white/60 text-xl md:text-2xl font-medium leading-relaxed max-w-2xl font-serif italic pt-4">
            "{mission.cinematic_pitch}"
          </p>
        </motion.div>
      </div>

      {/* Side HUD */}
      <div className="absolute right-12 bottom-12 z-20 hidden lg:block">
        <div className="flex flex-col gap-8 text-right">
          <div className="space-y-1">
            <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Vertical Theater</div>
            <div className="text-white text-xl font-bold tracking-tighter">+{mission.elevation_gain_m}M</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Riding Profile</div>
            <div className="text-white text-sm font-bold uppercase tracking-widest">{mission.riding_style}</div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Staging Status</div>
            <div className="text-green-500 text-xs font-bold uppercase tracking-widest flex items-center justify-end gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Active Deployment
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </section>
  );
}

function Stat({ block, value, highlight = false }: { block: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{block}</span>
      <span className={`text-2xl font-bold tracking-tighter uppercase ${highlight ? 'text-[#CDA755]' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
