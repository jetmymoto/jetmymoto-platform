import React, { useState } from 'react';
import MissionHero from './MissionHero';
import IntelGrid from './IntelGrid';
import CinemaCarousel from './CinemaCarousel';
import LogisticsHub from './LogisticsHub';
import LeadGate from './LeadGate';

// Main Assembly
const MissionDossier = ({ mission }) => {
  const [isGateOpen, setGateOpen] = useState(false);

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans selection:bg-amber-500 selection:text-black">
      
      {/* 1. THE HOOK */}
      <MissionHero 
        title={mission.meta.title} 
        subtitle={mission.meta.subtitle} 
        video={mission.media.hero_loop}
        poster={mission.media.poster}
      />

      {/* 2. THE DASHBOARD */}
      <IntelGrid 
        stats={mission.stats} 
        story={mission.intel.story}
        weather={mission.intel.weather} 
      />

      {/* 3. THE RECON (Hide if no POIs exist yet) */}
      {mission.pois && mission.pois.length > 0 && (
        <CinemaCarousel pois={mission.pois} />
      )}

      {/* 4. THE MONEY LAYER */}
      <LogisticsHub upsell={mission.upsell} />

      {/* 5. THE CTA FOOTER */}
      <div className="py-24 text-center bg-black">
        <button 
          onClick={() => setGateOpen(true)}
          className="bg-white text-black px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
        >
          Download Mission Pack
        </button>
        <p className="mt-4 text-xs text-gray-600 uppercase tracking-widest">
          Secure Access: PDF // GPX // Radar Warnings
        </p>
      </div>

      {/* 6. THE GATE */}
      <LeadGate isOpen={isGateOpen} onClose={() => setGateOpen(false)} />
    </div>
  );
};

export default MissionDossier;
