import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';
import { 
  ArrowUpRight, 
  MapPin,
  Target,
  Globe,
  ChevronRight,
  ShieldCheck,
  Navigation,
  CloudLightning,
  BarChartHorizontal
} from 'lucide-react';

// --- Sub-components for Animation & Detail ---

const AnimatedMetric = ({ value }) => {
  const nodeRef = useCountUp(value || 0, 2);
  return <span ref={nodeRef}>{value || 0}</span>;
};

const NetworkStrength = ({ routeCount }) => {
  const level = Math.min(Math.floor((routeCount || 0) / 8) + 1, 5);
  return (
    <div className="flex items-end gap-1" title={`${routeCount} routes`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 transition-colors duration-300 rounded-sm ${i < level ? 'bg-amber-400 shadow-[0_0_3px_rgba(251,191,36,0.7)]' : 'bg-zinc-700/50'}`}
          style={{ height: `${6 + i * 4}px` }}
        />
      ))}
    </div>
  );
};

const SignalDot = ({ top, left, delay }) => (
  <div
    className="absolute w-0.5 h-0.5 bg-amber-400 rounded-full shadow-[0_0_4px_rgba(251,191,36,0.8)]"
    style={{
      top: `${top}%`,
      left: `${left}%`,
      animation: `blip 3s infinite`,
      animationDelay: `${delay}s`,
    }}
  />
);

const AdventureNetworkCard = ({ cluster }) => {

  console.log("CLUSTER DATA:", cluster)

  // --- Dynamic Data Calculation ---
  const routeCount = cluster.routeCount || 0;
  const countryCount = cluster.countryCount || 0;
  const regionCount = cluster.regionCount || 0;
  const glowOpacity = Math.min(0.1 + (routeCount || 0) / 100, 0.5);
  const status = 'Operational';

  const signalDots = useMemo(() => Array.from({ length: 7 }).map(() => ({
    top: 10 + Math.random() * 80,
    left: 10 + Math.random() * 80,
    delay: Math.random() * 5,
  })), []);
  
  // --- Media Handling ---
  const defaultImage = 'https://images.unsplash.com/photo-1581242398579-6e33ad753d33?auto=format&fit=crop&w=800&q=80';
  const backgroundVideo = cluster.airport.video;
  const backgroundImage = cluster.airport.image || defaultImage;

  const airportUrl = `/airport/${cluster.airport.slug || cluster.airport.code?.toLowerCase()}-motorcycle-shipping`;

  return (
    <>
      <style>{`
        @keyframes blip {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
      <Link to={airportUrl} className="group block relative rounded-sm overflow-hidden shadow-2xl isolate">
        
        {/* --- Background Effects --- */}
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(circle at center, rgba(245, 158, 11, ${glowOpacity}) 0%, transparent 70%)` }}/>
        <div className="absolute inset-0 z-[-1]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}/>
        <div className="absolute inset-0 w-full h-full animate-ping rounded-sm border border-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 w-full h-full animate-ping delay-500 rounded-sm border border-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative bg-zinc-900/60 backdrop-blur-xl border border-white/5 group-hover:border-amber-500/40 transition-all duration-700">
          
          <div className="absolute -top-4 -right-4 text-[110px] font-black text-white/[0.02] select-none group-hover:text-amber-500/[0.04] transition-all duration-1000 pointer-events-none">
            {cluster.airport.iata}
          </div>

          {/* --- Visual Surface --- */}
          <div className="relative h-56 overflow-hidden">
            {signalDots.map((dot, i) => <SignalDot key={i} {...dot} />)}
            {backgroundVideo ? (
              <video src={backgroundVideo} autoPlay loop muted playsInline className="w-full h-full object-cover grayscale opacity-20 group-hover:opacity-50 transition-all duration-1000" />
            ) : (
              <img src={backgroundImage} alt={cluster.airport.city} className="w-full h-full object-cover grayscale opacity-20 group-hover:opacity-50 transition-all duration-1000" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
            
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
              <div className="flex items-center gap-3 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="text-[9px] font-mono font-black text-white tracking-[0.2em] uppercase">{status}</span>
              </div>
              <div className="p-2 bg-amber-500 rounded-sm text-black opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div className="absolute bottom-6 left-8">
               <div className="flex items-center gap-2 mb-1">
                 <MapPin size={10} className="text-amber-500" />
                 <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">{cluster.airport.iata} NETWORK</span>
               </div>
               <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-amber-400 transition-colors">{cluster.airport.city}</h3>
            </div>
          </div>

          {/* --- Metadata & Actions --- */}
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5 text-center">
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Routes</p>
                <p className="text-2xl font-mono font-bold text-zinc-200"><AnimatedMetric value={routeCount} /></p>
              </div>
              <div className="space-y-1.5 text-center">
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Countries</p>
                <p className="text-2xl font-mono font-bold text-zinc-200"><AnimatedMetric value={countryCount} /></p>
              </div>
              <div className="space-y-1.5 text-center">
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Regions</p>
                <p className="text-2xl font-mono font-bold text-zinc-200"><AnimatedMetric value={regionCount} /></p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <NetworkStrength routeCount={cluster.routeCount} />
                <span className="text-[9px] font-mono text-zinc-600">Signal</span>
              </div>
              <div className="group/btn text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-amber-500 transition-all flex items-center gap-3">
                Engage Network <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* --- Animated Scanline --- */}
          <motion.div 
            className="absolute bottom-0 left-0 w-full h-[2px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.8), transparent)' }}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          />
        </div>
      </Link>
    </>
  );
};

export default AdventureNetworkCard;