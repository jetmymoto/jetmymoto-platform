import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import PlannerMap from "../components/PlannerMap";
import { updateWaypoints, compileRoute } from "@/services/plannerService";
 
import { ArrowRight, Map as MapIcon, X, Layers, FileText, Download, Loader2, Box, Activity, CloudRain, Cpu, Truck, Radio } from "lucide-react";

function cx(...a) { return a.filter(Boolean).join(" "); }

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Reusable Placeholder Component
const GridSlot = ({ title, status, icon: Icon, color = "text-zinc-700" }) => (
  <div className="relative border-r border-b border-white/10 bg-zinc-900/50 flex flex-col items-center justify-center p-6 min-h-[250px]">
    <div className="border border-dashed border-zinc-800 w-full h-full rounded flex flex-col items-center justify-center gap-3 bg-[#050505]/20">
      <Icon className={color} size={32} />
      <div className="text-center">
        <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{title}</div>
        <div className="text-[10px] text-zinc-700 font-mono mt-1">{status}</div>
      </div>
    </div>
  </div>
);

export default function PlannerEnrichPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore();

  const [stops, setStops] = useState([]); 
  const [planStatus, setPlanStatus] = useState("DRAFT");
  const [exports, setExports] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  const [missionData, setMissionData] = useState(location.state?.mission || {
    missionName: "Loading Mission...",
    briefing: "Acquiring telemetry..."
  });

  // 1. REAL-TIME SUBSCRIPTION
  useEffect(() => {
    if (!planId) return;
    const unsub = onSnapshot(doc(db, "plans", planId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPlanStatus(data.status || "DRAFT");
        if (data.exports) setExports(data.exports);
        if (data.mission) setMissionData(prev => ({...prev, ...data.mission}));
        if (data.waypoints && data.waypoints.length !== stops.length && !isSaving) {
             // setStops(data.waypoints); 
        }
      }
    });
    return () => unsub();
  }, [planId]);

  // 2. AUTO-SAVE
  const saveToBackend = async (newStops) => {
    setIsSaving(true);
    try {
      await updateWaypoints(planId, newStops);
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  const debouncedSave = useCallback(debounce((newStops) => saveToBackend(newStops), 2000), [planId]);

  const handleAddStop = (poi) => {
    setStops(prev => {
      if (prev.find(p => p.id === poi.id)) return prev;
      const newStops = [...prev, poi];
      debouncedSave(newStops); 
      return newStops;
    });
  };

  const handleRemoveStop = (poiId) => {
    setStops(prev => {
      const newStops = prev.filter(p => p.id !== poiId);
      debouncedSave(newStops);
      return newStops;
    });
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      await compileRoute(planId);
    } catch (e) {
      console.error(e);
      setIsCompiling(false);
    }
  };

  const selectedIds = stops.map(s => s.id);

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden">


      {/* MAIN SCROLLABLE CONTAINER */}
      <div className="flex-1 overflow-y-auto border-t border-white/10">
        
        {/* COMMAND GRID: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-min min-h-full">
          
          {/* --- SLOT 1: TACTICAL MAP --- */}
          <div className="relative border-r border-b border-white/10 min-h-[400px]">
              <div className="absolute top-4 left-4 z-10 bg-[#050505]/80 backdrop-blur text-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase border border-white/10 flex items-center gap-2">
                <MapIcon size={12} /> Tactical View // Sector Alpha
                {isSaving && <span className="text-zinc-500 ml-2 animate-pulse">SAVING...</span>}
              </div>
              <div className="w-full h-full grayscale-[10%] contrast-[1.1]">
                <PlannerMap 
                  onMapLoad={() => {}} 
                  onAddStop={handleAddStop}
                  selectedIds={selectedIds}
                  routeWaypoints={stops}
                />
              </div>
          </div>

          {/* --- SLOT 2: MISSION STACK --- */}
          <div className="flex flex-col border-b border-white/10 bg-zinc-950 min-h-[400px]">
             {/* Brief */}
             <div className="p-6 border-b border-white/10 bg-zinc-900/30">
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <FileText size={14} className="text-emerald-500" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Mission Brief</span>
                   </div>
                   <div className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/10">{planStatus}</div>
                </div>
                <h2 className="text-xl font-black text-white leading-tight mb-2">{missionData.missionName}</h2>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{missionData.briefing}</p>
             </div>
             {/* List */}
             <div className="h-8 border-b border-white/10 flex items-center px-6 gap-2 bg-zinc-950 shrink-0">
                <Layers size={14} className="text-zinc-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Waypoints</span>
                <span className="ml-auto bg-white/10 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">{stops.length}</span>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-zinc-950 relative min-h-[150px]">
                  {stops.length === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
                          <MapIcon size={32} />
                          <span className="text-[10px] mt-2 font-mono uppercase">No Intel Selected</span>
                      </div>
                  )}
                  {stops.map((stop, i) => (
                     <div key={stop.id} className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 p-2 transition-all rounded-sm flex gap-3 items-center">
                        <div className="flex flex-col items-center">
                           <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-emerald-500 transition-colors"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono text-zinc-500">WP {String(i + 1).padStart(2, '0')}</span>
                              <button onClick={() => handleRemoveStop(stop.id)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                           </div>
                           <div className="text-xs font-bold text-white truncate">{stop.name}</div>
                        </div>
                     </div>
                  ))}
             </div>
             {/* Footer */}
             <div className="p-3 border-t border-white/10 bg-zinc-900">
                {planStatus === "READY" && exports?.gpx ? (
                   <a href={exports.gpx.url} target="_blank" rel="noopener noreferrer" className="w-full h-10 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-2">
                     <Download size={14} /> Download GPX
                   </a>
                ) : (
                   <button onClick={handleCompile} disabled={stops.length < 2 || isCompiling} className={cx("w-full h-10 text-[10px] font-black uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-2", stops.length < 2 ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-white text-black hover:bg-zinc-200")}>
                     {isCompiling ? <Loader2 className="animate-spin" size={14}/> : <ArrowRight size={14} />}
                     {isCompiling ? "Compiling..." : "Compile & Export"}
                   </button>
                )}
             </div>
          </div>

          {/* --- SLOT 3: ASSET PACK (H2) --- */}
          <GridSlot title="Asset Pack // H2" status="Ready for Import" icon={Box} />

          {/* --- SLOT 4: SYSTEM HEALTH (H3) --- */}
          <GridSlot title="System Health // H3" status="Awaiting Data" icon={Activity} />

          {/* --- SLOT 5: ATMOSPHERICS (H4) [NEW] --- */}
          <GridSlot title="Atmospherics // H4" status="Offline" icon={CloudRain} />

          {/* --- SLOT 6: TELEMETRY (H5) [NEW] --- */}
          <GridSlot title="Telemetry // H5" status="No Signal" icon={Cpu} />

          {/* --- SLOT 7: LOGISTICS (H6) [NEW] --- */}
          <GridSlot title="Logistics // H6" status="Standby" icon={Truck} />

          {/* --- SLOT 8: COMMS (H7) [NEW] --- */}
          <GridSlot title="Comms Array // H7" status="Searching..." icon={Radio} />

        </div>
      </div>
    </div>
  );
}