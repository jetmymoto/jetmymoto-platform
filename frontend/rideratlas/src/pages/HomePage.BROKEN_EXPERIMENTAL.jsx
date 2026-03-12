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

// NARRATIVE SECTIONS
import TheProtocol from '../components/TheProtocol';
import GhostRun from '../components/GhostRun';
import CinematicCta from '../components/CinematicCta';
import JoinTheCorps from '../components/JoinTheCorps';

// DATA HOOK
import { useMissions } from '../hooks/useMissions';

const HomePage = () => {
  const navigate = useNavigate();
  const { missions, loading } = useMissions();

  // 1. HUD FILTERS STATE
  const [filters, setFilters] = useState({
    continent: 'ALL',
    region: 'All', 
    duration: 'any',
    difficulty: 'any'
  });

  const [visibleCount, setVisibleCount] = useState(9);

  // 2. STATE UPDATER
  const handleFilterChange = (newFilters) => {
    console.log("📡 HUD UPDATE RECEIVED:", newFilters);
    setFilters(newFilters);
    setVisibleCount(9); // Reset scroll on filter change
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30 overflow-x-hidden">
      <Header />
      <AtlasHero />
      
      {/* HUD PHASE: Passing both state and updater */}
      <div id="mission-control" className="relative z-30 -mt-10 pb-12">
        <GlobalMissionHUD 
          filters={filters} 
          setFilters={handleFilterChange} 
          totalResults={missions?.length || 0}
          missions={missions} 
        />
      </div>

      <MissionDossierIntro />
      
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
            /* GRID PHASE: Passing the filters state here is critical for the logic to work */
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

      <TheProtocol />
      <GhostRun />
      <CinematicCta />
      <JoinTheCorps />
      <Footer />
    </div>
  );
};

export default HomePage;
