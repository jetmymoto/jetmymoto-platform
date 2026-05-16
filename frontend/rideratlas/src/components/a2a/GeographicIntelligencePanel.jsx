import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Activity, 
  Compass, 
  Zap, 
  ShieldCheck, 
  Info,
  Maximize2,
  Wind,
  Layers,
  Locate
} from 'lucide-react';

/**
 * GeographicIntelligencePanel (v3.5 - Map-Aware Deterministic)
 * A deterministic, luxury-operational geographic intelligence component for A2A missions.
 * Uses mission-specific Mapbox route bases with refined SVG telemetry overlays.
 */
export default function GeographicIntelligencePanel({ 
  missionSlug, 
  missionData, 
  geoMedia 
}) {
  const {
    insertion_airport,
    extraction_airport,
    distance_km,
    elevation_gain_m,
    highlights = [],
    theater
  } = missionData || {};

  // Source of truth background priority:
  // 1. Mission-specific Mapbox route base (new pipeline)
  // 2. Verified Mapbox base from previous refinement
  // 3. Operational map/Primary map
  const mapBaseUrl = geoMedia?.mapboxRouteBase?.url16x9 || 
                    geoMedia?.mapboxRouteBase?.base16x9 || // Handle both naming conventions
                    (geoMedia?.terrainTelemetryV3?.basePath ? `https://storage.googleapis.com/factory1/${geoMedia.terrainTelemetryV3.basePath}` : null) ||
                    geoMedia?.operationalMap?.publicUrl || 
                    geoMedia?.primaryMap?.publicUrl;

  const geometry = geoMedia?.geometry || [];

  // Projection logic adjusted for 22% padding (consistent with Mapbox Static API parameters)
  const projectPoints = useMemo(() => {
    if (geometry.length < 2) return "";
    
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    geometry.forEach(([lng, lat]) => {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
    });

    const lngSpan = maxLng - minLng;
    const latSpan = maxLat - minLat;
    
    const paddingFactor = 0.22;
    const contentFactor = 1 - 2 * paddingFactor; // 0.56
    
    const viewLngMin = minLng - (lngSpan * paddingFactor / contentFactor);
    const viewLngMax = maxLng + (lngSpan * paddingFactor / contentFactor);
    const viewLatMin = minLat - (latSpan * paddingFactor / contentFactor);
    const viewLatMax = maxLat + (latSpan * paddingFactor / contentFactor);
    
    const viewLngSpan = viewLngMax - viewLngMin;
    const viewLatSpan = viewLatMax - viewLatMin;

    return geometry.map(([lng, lat]) => {
      const x = ((lng - viewLngMin) / viewLngSpan) * 100;
      const y = (1 - (lat - viewLatMin) / viewLatSpan) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  }, [geometry]);

  // Telemetry Callouts
  const callouts = useMemo(() => {
    if (geometry.length < 5) return [];
    
    const count = Math.min(3, highlights.length);
    const indices = Array.from({ length: count }, (_, i) => 
      Math.floor(geometry.length * (0.2 + (i * 0.3))) // Distribute callouts along the route
    );
    
    return indices.map((idx, i) => {
      const highlight = highlights[i] || "Technical Sector";
      const cleanHighlight = highlight.split('—')[0].trim();
      
      return {
        id: i,
        label: cleanHighlight,
        index: idx
      };
    });
  }, [geometry, highlights]);

  return (
    <div className="w-full bg-[#030303] border border-white/5 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)]">
      <div className="grid lg:grid-cols-[440px_1fr] min-h-[680px]">
        
        {/* Left: Operational Dossier */}
        <div className="p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between bg-[#080808] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(214,179,106,0.05)_0%,transparent_60%)] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="p-2.5 rounded-xl bg-[#D6B36A]/5 border border-[#D6B36A]/10 shadow-[0_0_20px_rgba(214,179,106,0.15)]">
                <Compass className="w-4 h-4 text-[#D6B36A]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D6B36A]">
                  Geographic Intel
                </span>
                <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-600 mt-1">
                  MISSION-AWARE SECTOR BRIEF
                </span>
              </div>
            </div>

            <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-10 font-headline italic leading-[0.85]">
              Terrain<br />Telemetry
            </h2>
            
            <p className="text-zinc-500 text-sm leading-relaxed mb-14 font-medium max-w-sm">
              Deterministic terrain synchronization for the <span className="text-zinc-300 font-bold uppercase tracking-widest">{missionSlug.replace(/-/g, ' ')}</span> corridor. 
              Real-world GPX geometry provides 100% navigational truth across technical sectors.
            </p>

            <div className="space-y-4">
              <IntelligenceItem 
                icon={Locate} 
                label="Mapping Protocol" 
                value="Route-Aware Frame Sync" 
              />
              <IntelligenceItem 
                icon={Activity} 
                label="Telemetry Status" 
                value="Active Nav Link" 
              />
              <IntelligenceItem 
                icon={ShieldCheck} 
                label="Vector Confidence" 
                value="Deterministic" 
              />
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between opacity-50 transition-all duration-700">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                   <Info size={12} className="text-zinc-500" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">System Trace</span>
                   <span className="text-[9px] font-bold text-zinc-700">RIDERATLAS GEO-ENGINE v3.5</span>
                </div>
             </div>
             <img src="/brand/moto-lockup-faded.png" alt="" className="h-4 opacity-10" />
          </div>
        </div>

        {/* Right: Cinematic Map Frame */}
        <div className="relative group overflow-hidden bg-[#050505] cursor-crosshair">
          
          {/* Layer 1: Map Base (Dark Satellite/Terrain) - Z-0 */}
          <div className="absolute inset-0 z-0">
            {mapBaseUrl ? (
              <img 
                src={mapBaseUrl} 
                alt="Deterministic Map Base" 
                className="w-full h-full object-cover opacity-70 transition-transform duration-[40s] ease-linear group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-[#050505] flex items-center justify-center border border-white/5">
                <div className="flex flex-col items-center gap-4">
                   <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center animate-pulse">
                      <Wind className="text-zinc-800" size={20} />
                   </div>
                   <span className="text-zinc-800 font-black text-[9px] uppercase tracking-[0.5em]">Syncing Global Terrian...</span>
                </div>
              </div>
            )}
            
            {/* Layer 2: Deterministic Atmospheric FX - Z-10 */}
            <div className="absolute inset-0 z-10 bg-black/35 pointer-events-none" />
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/40 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 z-10 shadow-[inset_0_0_120px_rgba(0,0,0,0.5)] pointer-events-none" />
            
            {/* Noise/Grain for high-fidelity analog depth */}
            <div className="absolute inset-0 z-10 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          </div>

          {/* Layer 3: SVG Intelligence Overlay - Z-20 */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="0.4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F5F1E8" stopOpacity="0" />
                  <stop offset="5%" stopColor="#F5F1E8" stopOpacity="0.8" />
                  <stop offset="95%" stopColor="#F5F1E8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#F5F1E8" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Route Shadow/Depth */}
              <motion.polyline
                points={projectPoints}
                fill="none"
                stroke="black"
                strokeWidth="1.0"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.4, filter: 'blur(3px)' }}
              />
              
              {/* Gold Outer Glow */}
              <motion.polyline
                points={projectPoints}
                fill="none"
                stroke="#D6B36A"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.15, filter: 'url(#routeGlow)' }}
              />

              {/* Main Technical Path (Ivory Core) */}
              <motion.polyline
                points={projectPoints}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.9 }}
                transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Navigation Pulse (Technical Light) */}
              <motion.polyline
                points={projectPoints}
                fill="none"
                stroke="#F5F1E8"
                strokeWidth="0.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.25 }}
                initial={{ pathLength: 0, pathOffset: 0 }}
                animate={{ pathLength: 0.06, pathOffset: 1 }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: 2
                }}
              />
            </svg>

            {/* UI Markers & Callouts - Z-30 */}
            <div className="absolute inset-0 z-30">
              {/* Terminal Anchors */}
              {geometry.length > 0 && (
                <>
                  <Marker 
                    lngLat={geometry[0]} 
                    label={insertion_airport || "Insertion"} 
                    type="origin" 
                    projection={projectPoints}
                  />
                  <Marker 
                    lngLat={geometry[geometry.length - 1]} 
                    label={extraction_airport || "Extraction"} 
                    type="destination" 
                    projection={projectPoints}
                  />
                </>
              )}

              {/* Technical Sector Callouts */}
              {callouts.map((callout) => (
                <Callout 
                  key={callout.id} 
                  callout={callout} 
                  projection={projectPoints} 
                />
              ))}
            </div>
          </div>

          {/* Layer 4: HUD HUD Metrics - Z-40 */}
          <div className="absolute bottom-10 left-10 right-10 z-40">
             <div className="flex flex-wrap items-center justify-between gap-10 p-8 rounded-[32px] bg-black/55 backdrop-blur-sm border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(214,179,106,0.08)_0%,transparent_50%)] pointer-events-none" />
                
                <Metric label="Total Route Range" value={`${distance_km?.toLocaleString() || "---"}`} unit="KM" />
                <div className="hidden md:block w-px h-12 bg-white/10" />
                <Metric label="Vertical Displacement" value={`${elevation_gain_m?.toLocaleString() || "---"}`} unit="M" />
                <div className="hidden md:block w-px h-12 bg-white/10" />
                <Metric label="Topographic Bias" value="Mountainous" subValue="78% Grade" />
                <div className="hidden md:block w-px h-12 bg-white/10" />
                <Metric label="Refuel Threshold" value="250 KM" subValue="Min Range" />
                
                <button className="hidden xl:flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-[#D6B36A] hover:bg-[#D6B36A]/15 hover:border-[#D6B36A]/30 transition-all text-[10px] font-black uppercase tracking-widest group">
                   <Maximize2 size={12} className="group-hover:scale-110 transition-transform" />
                   Expand Frame
                </button>
             </div>
          </div>

          {/* Layer 5: Metadata Strips - Z-50 */}
          <div className="absolute top-10 left-10 right-10 flex justify-between items-start pointer-events-none z-50">
             <div className="flex flex-col gap-2">
                <div className="px-4 py-1.5 rounded-lg bg-[#D6B36A]/10 border border-[#D6B36A]/20 backdrop-blur-xl">
                   <span className="text-[10px] font-black text-[#D6B36A] uppercase tracking-[0.4em]">Operational Theater: {theater?.name || "Global"}</span>
                </div>
                <div className="px-4 py-1 rounded-lg bg-black/40 border border-white/5 backdrop-blur-md w-fit">
                   <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">MAP MODE: DETERMINISTIC SATELLITE</span>
                </div>
             </div>
             <div className="text-right flex flex-col items-end gap-1">
                <div className="text-[11px] font-black text-white/25 uppercase tracking-[0.5em] font-mono">
                   FIX: {geometry[0]?.[1]?.toFixed(4)}N / {geometry[0]?.[0]?.toFixed(4)}E
                </div>
                <div className="w-32 h-0.5 bg-white/10 overflow-hidden">
                   <motion.div 
                      className="h-full bg-[#D6B36A]/40"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Internal Components ──────────────────────────────────────────────────────

function IntelligenceItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-5 p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] transition-all hover:bg-white/[0.03] hover:border-[#D6B36A]/25 group">
      <Icon className="w-4 h-4 text-[#D6B36A] mt-1 group-hover:rotate-12 transition-transform" />
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 mb-1.5 group-hover:text-zinc-400 transition-colors">
          {label}
        </div>
        <div className="text-[14px] font-bold text-zinc-300 tracking-wide uppercase font-mono">
          {value}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, unit, subValue }) {
  return (
    <div className="flex flex-col relative z-10">
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D6B36A]/70 mb-3">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-white tabular-nums leading-none tracking-tighter uppercase italic">{value}</span>
        {unit && <span className="text-zinc-600 text-[11px] font-black uppercase tracking-[0.2em]">{unit}</span>}
        {subValue && <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest ml-2 opacity-50">/ {subValue}</span>}
      </div>
    </div>
  );
}

function Marker({ label, type, projection }) {
  const points = projection.split(" ");
  if (points.length === 0) return null;
  
  const ptString = type === "origin" ? points[0] : points[points.length - 1];
  const [x, y] = ptString.split(",").map(parseFloat);

  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: type === "origin" ? 1.5 : 2, type: "spring", damping: 18 }}
      className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-40"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* Radiant Light Bloom */}
      <div className={`absolute w-24 h-24 rounded-full blur-3xl opacity-30 pointer-events-none animate-pulse ${type === 'origin' ? 'bg-[#D6B36A]' : 'bg-white'}`} />
      
      {/* Anchor Terminal */}
      <div className={`relative p-2 rounded-full border border-white/20 bg-black shadow-2xl overflow-hidden group scale-110`}>
        <div className={`absolute inset-0 opacity-25 ${type === 'origin' ? 'bg-[#D6B36A]' : 'bg-white'}`} />
        <div className={`relative w-2.5 h-2.5 rounded-full ${type === 'origin' ? 'bg-[#D6B36A] shadow-[0_0_20px_rgba(214,179,106,1)]' : 'bg-white shadow-[0_0_20px_rgba(255,255,255,1)]'}`} />
      </div>

      {/* Editorial Hub Label */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: type === "origin" ? 2.2 : 2.7 }}
        className="mt-5 px-4 py-1.5 rounded-xl bg-black/85 backdrop-blur-3xl border border-white/10 shadow-2xl"
      >
        <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">{label}</span>
      </motion.div>
    </motion.div>
  );
}

function Callout({ callout, projection }) {
  const points = projection.split(" ");
  const ptString = points[callout.index];
  if (!ptString) return null;
  const [x, y] = ptString.split(",").map(parseFloat);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 3.5 + callout.id * 0.5 }}
      className="absolute flex flex-col items-center pointer-events-auto group z-20"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="w-[1px] h-14 bg-gradient-to-t from-[#D6B36A]/50 to-transparent" />
      <div className="relative -mt-1.5">
        <div className="absolute inset-0 bg-[#D6B36A] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
        <div className="relative px-4 py-2.5 rounded-[20px] bg-black/70 backdrop-blur-2xl border border-white/5 group-hover:border-[#D6B36A]/40 transition-all flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D6B36A] animate-pulse shadow-[0_0_12px_rgba(214,179,106,0.8)]" />
          <span className="text-[10px] font-black text-zinc-400 group-hover:text-white uppercase tracking-[0.3em] whitespace-nowrap transition-colors">
            {callout.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
