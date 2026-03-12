import React, { useState } from 'react';
import { MapPin, Calendar, Play, Radio, Shield } from 'lucide-react';

const GLOBAL_FALLBACK_VIDEO = "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/raw_assets%2FCinematic_Drone_Intro_Code_Upgrade.mp4?alt=media";

const MissionCard = ({ mission, onClick, hasLiveFeed = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!mission) return null;

  // --- DATA MAPPING ---
  const title = mission.title || mission.meta?.title || "UNNAMED SECTOR";
  const subtitle = mission.region_id ? mission.region_id.replace(/_/g, ' ') : "CLASSIFIED";
  
  // Stats
  const days = mission.meta?.days || mission.intel?.stats?.duration || "?";
  const km = mission.meta?.distance_km || mission.intel?.stats?.distance || "???";
  const difficulty = (mission.meta?.difficulty || mission.intel?.stats?.difficulty || "STANDARD").toUpperCase();
  
  // Media
  const videoSrc = mission.media?.video_orbit || GLOBAL_FALLBACK_VIDEO;

  return (
    <div
      onClick={() => onClick(mission.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-[520px] w-full cursor-pointer overflow-hidden rounded-sm bg-[#0a0a0a] border border-white/10 hover:border-amber-500/50 transition-all duration-500"
    >
      {/* VIDEO LAYER */}
      <div className="absolute inset-0 h-3/4 overflow-hidden">
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className={`h-full w-full object-cover transition-all duration-1000 
            ${isHovered ? 'scale-110 opacity-60 grayscale-0' : 'scale-100 opacity-40 grayscale-[50%]'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
      </div>

      {/* BADGES */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-tight w-fit
          ${difficulty.includes('HARD') || difficulty.includes('EXTREME') ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'}`}>
          {difficulty}
        </span>

        {hasLiveFeed && (
          <span className="flex items-center gap-1 bg-red-600/90 backdrop-blur text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-tight animate-pulse w-fit border border-red-500/50">
            <Radio size={10} />
            LIVE SIGNAL
          </span>
        )}
      </div>

      {/* INFO LAYER */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="mb-4 transform transition-transform duration-500 group-hover:-translate-y-2">
          <h3 className="text-3xl font-black text-white uppercase leading-[0.85] tracking-tighter group-hover:text-amber-500 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-[1px] w-6 bg-amber-500/50" />
            <p className="text-[10px] text-white/60 uppercase tracking-[0.2em]">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
          <div>
            <span className="text-[9px] text-gray-500 font-mono block mb-1">DISTANCE</span>
            <div className="flex items-center gap-1.5 text-white font-bold font-mono text-sm">
              <MapPin size={12} className="text-amber-500" />
              {km} <span className="text-[10px] text-gray-500 font-normal">KM</span>
            </div>
          </div>
          <div>
            <span className="text-[9px] text-gray-500 font-mono block mb-1">DURATION</span>
            <div className="flex items-center gap-1.5 text-white font-bold font-mono text-sm">
              <Calendar size={12} className="text-amber-500" />
              {days} <span className="text-[10px] text-gray-500 font-normal">DAYS</span>
            </div>
          </div>
        </div>

        <button className="w-full h-12 bg-white/5 border border-white/10 hover:bg-amber-500 hover:border-amber-500 hover:text-black text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all duration-300">
          <span className="group-hover:hidden flex items-center gap-2">
            <Shield size={12} /> ACCESS DOSSIER
          </span>
          <span className="hidden group-hover:flex items-center gap-2">
            <Play size={12} fill="currentColor" /> INITIATE MISSION
          </span>
        </button>
      </div>
    </div>
  );
};

export default MissionCard;
