import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

// CORE COMPONENTS
import Header from '../components/Header';
import Footer from '../components/Footer';
import AtlasHero from '../components/AtlasHero'; 
import MissionDossierIntro from '../components/MissionDossierIntro';
import SignatureJourneys from '../components/SignatureJourneys';
import GlobalMissionHUD from '../components/GlobalMissionHUD';

// NARRATIVE SECTIONS (Restoring from previous version)
import TheProtocol from '../components/TheProtocol';
import GhostRun from '../components/GhostRun';
import CinematicCta from '../components/CinematicCta';
import JoinTheCorps from '../components/JoinTheCorps';

// DATA HOOK
import { useMissions } from '../hooks/useMissions';

const HomePage = () => {
  const navigate = useNavigate();
  const { missions, loading } = useMissions();

  const [filters, setFilters] = useState({
    continent: 'Europe',
    region: 'All', 
    duration: 'any',
    difficulty: 'any'
  });

  const [visibleCount, setVisibleCount] = useState(9);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setVisibleCount(9); 
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30 overflow-x-hidden">
      <Header />
      
      {/* 1. HERO PHASE */}
      <AtlasHero />
      
      {/* 2. HUD PHASE (Negative margin to overlap Hero) */}
      <div id="mission-control" className="relative z-30 -mt-10 pb-12">
        <GlobalMissionHUD 
          filters={filters} 
          setFilters={handleFilterChange} 
          totalResults={missions?.length || 0} 
        />
      </div>

      {/* 3. THE BRIEFING */}
      <MissionDossierIntro />
      
      {/* 4. THE EXTRACTION GRID */}
      <section id="mission-catalog" className="relative z-10 bg-[#0b0c10] pt-12 pb-24 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic">
              Active <span className="text-amber-500">Missions</span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-20 font-mono text-amber-500 animate-pulse tracking-[0.3em]">
              SCANNING SECTORS...
            </div>
          ) : (
            <SignatureJourneys 
              missions={missions}
              filters={filters}
              limit={visibleCount}
              onMissionSelect={(id) => navigate(`/mission/${id}`)}
            />
          )}

          {!loading && missions?.length > visibleCount && (
            <div className="mt-20 flex justify-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 9)}
                className="group relative px-10 py-4 border border-amber-500/30 transition-all hover:border-amber-500 bg-amber-500/5"
              >
                <span className="relative z-10 text-[10px] font-mono text-amber-500 tracking-[0.4em] uppercase flex items-center gap-3 group-hover:text-white">
                  Load More Intel <Plus size={12} />
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. THE PROTOCOL (Narrative/Instructional) */}
      <div id="protocol" className="relative z-10 bg-black">
        <TheProtocol />
      </div>

      {/* 6. ATMOSPHERIC SECTIONS */}
      <GhostRun />
      
      <div className="relative">
        <div className="absolute inset-0 bg-amber-500/5 blur-[150px] pointer-events-none" />
        <CinematicCta />
      </div>

      <JoinTheCorps />
      
      <Footer />
    </div>
  );
};

export default HomePage;
