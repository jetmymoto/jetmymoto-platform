import React from 'react';
import { Film, Map, Zap, Layers, ArrowRight } from 'lucide-react';

const MissionDossierIntro = () => {
  
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#0B1221] via-[#0f1629] to-[#0B1221] relative overflow-hidden shadow-2xl group">
        
        {/* Inner Glow/Gradient Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,185,60,0.05),transparent_70%)] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 py-12 px-6 md:px-12 grid grid-cols-1 md:grid-cols-[1.5fr,1fr] gap-12 items-center">
            
            {/* LEFT COLUMN: The Pitch */}
            <div className="space-y-8">
                <div>
                    <span className="inline-block text-[10px] font-bold tracking-[0.2em] text-amber-500 uppercase mb-4 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                        New // Mission Dossiers
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                        Every Mission Comes With Its Own <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Black Box</span>.
                    </h2>
                </div>
                
                <p className="text-lg text-slate-400 leading-relaxed max-w-xl font-light">
                    Select a route to unlock its full cinematic dossier—a complete briefing with day-by-day intel, downloadable GPX, and weather telemetry.
                </p>

                <ul className="space-y-4">
                    <li className="flex items-start gap-4 text-slate-300 text-sm">
                        <div className="mt-1 p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20"><Film className="w-4 h-4" /></div>
                        <div>
                            <strong className="text-white block text-base">Cinematic Briefing</strong>
                            <span className="text-slate-500">High-res reconnaissance of the route's key sectors.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4 text-slate-300 text-sm">
                        <div className="mt-1 p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20"><Map className="w-4 h-4" /></div>
                        <div>
                            <strong className="text-white block text-base">Tactical Map & GPX</strong>
                            <span className="text-slate-500">Downloadable flight path compatible with Garmin/TomTom.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4 text-slate-300 text-sm">
                        <div className="mt-1 p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20"><Zap className="w-4 h-4" /></div>
                        <div>
                            <strong className="text-white block text-base">Telemetry Ready</strong>
                            <span className="text-slate-500">Difficulty ratings, surface analysis, and elevation data.</span>
                        </div>
                    </li>
                </ul>

                <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                        onClick={() => scrollToSection('mission-catalog')}
                        className="bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full px-8 h-12 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 flex items-center gap-2"
                    >
                        Browse Dossiers <ArrowRight size={18} />
                    </button>
                    <button 
                        onClick={() => scrollToSection('protocol')}
                        className="text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 rounded-full px-6 h-12 transition-all"
                    >
                        How It Works
                    </button>
                </div>
            </div>

            {/* RIGHT COLUMN: The Preview Card */}
            <div className="relative w-full hidden md:block">
                <div className="bg-[#050505]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden group-hover:border-amber-500/30 transition-colors duration-500">
                    
                    {/* Fake Header UI */}
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                         <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-amber-500" />
                            <span className="font-mono text-xs text-amber-500 tracking-widest">DOSSIER_PREVIEW.JSX</span>
                         </div>
                         <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></div>
                         </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">Alpine Thunder // 2026</h3>
                    <p className="text-slate-500 text-sm mb-6">Briefing Package Download...</p>
                    
                    <div className="space-y-3">
                        {['Daily Itinerary', 'Weather Logistics', 'Hotel Manifest', 'Emergency Comms'].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                <span className="text-sm text-slate-300 font-medium">{item}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-emerald-500 font-mono">SECURE</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 text-center">
                        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                            Encrypted connection /// Ver 2.4
                        </p>
                    </div>
                </div>
                
                {/* Decorative Elements behind card */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-[60px] -z-10"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] -z-10"></div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default MissionDossierIntro;
