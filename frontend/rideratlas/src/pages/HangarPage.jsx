import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, TrendingUp, GitBranch, Award, Plus, Gauge, Activity, Map, ChevronDown, ArrowUpRight, Timer, Zap, Globe, LayoutDashboard, ChevronLeft, ChevronRight, Lock, Radio, Crosshair, Cpu, Signal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



// --- 🚧 PLACEHOLDER COMPONENTS (To prevent crashes) 🚧 ---

const HeroHUD = () => (
  <div className="relative h-[60vh] bg-slate-950 flex items-center justify-center overflow-hidden border-b border-white/10">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
    <div className="text-center z-10 space-y-4 px-4">
      <Badge variant="outline" className="border-gold-accent text-gold-accent bg-gold-accent/10 px-4 py-1 text-xs tracking-widest">MEMBER ACCESS: GRANTED</Badge>
      <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-accent to-amber-600">Hangar</span></h1>
      <p className="text-slate-400 max-w-xl mx-auto">Central Command for Global Missions. Track your fleet, analyze telemetry, and connect with the network.</p>
    </div>
  </div>
);

const HangarSubnav = () => (
  <div className="sticky top-0 z-40 bg-[#0A192F]/80 backdrop-blur-md border-b border-white/5 py-4 overflow-x-auto">
    <div className="container mx-auto px-4 flex gap-8 min-w-max text-xs font-bold tracking-widest text-slate-400 uppercase">
      {['Overview', 'Fleet', 'Telemetry', 'Live Ops', 'Network', 'Black Box'].map(item => (
        <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-gold-accent transition-colors cursor-pointer">{item}</a>
      ))}
    </div>
  </div>
);

const PlaceholderSection = ({ title, icon: Icon, desc }) => (
  <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
      <Icon className="w-8 h-8 text-slate-500" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 max-w-md">{desc}</p>
  </div>
);

// --- FLEET DATA & LOGIC ---
const fleetData = [
  { id: 1, rider: '@alexRides', role: 'TRACK', model: 'Ducati Panigale V4S', year: 2023, seasonKm: 4120, missions: 12, health: 92, imageUrl: 'https://images.unsplash.com/photo-1629580145211-13c43715c0e7' },
  { id: 2, rider: '@alexRides', role: 'TOURING', model: 'BMW R1250GS Adventure', year: 2022, seasonKm: 8750, missions: 8, health: 85, imageUrl: 'https://images.unsplash.com/photo-1623563943668-548d0b9571e2' },
  { id: 3, rider: '@alexRides', role: 'DAILY', model: 'Triumph Scrambler 1200 XE', year: 2024, seasonKm: 2300, missions: 4, health: 98, imageUrl: 'https://images.unsplash.com/photo-1630154862886-f42289196b6e' },
  { id: 4, rider: '@alexRides', role: 'ADVENTURE', model: 'Honda Africa Twin', year: 2023, seasonKm: 11050, missions: 6, health: 78, imageUrl: 'https://images.unsplash.com/photo-1628189591452-44f23b726487' },
];

const StatCard = ({ icon, value, label }) => (
  <div className="bg-navy-deep/60 border border-gold-accent/30 rounded-lg shadow-lg p-6 flex flex-col items-center text-center backdrop-blur-sm">
    {React.cloneElement(icon, { className: "w-10 h-10 text-gold-accent mb-4" })}
    <span className="text-3xl font-bold text-gold-accent">{value}</span>
    <span className="text-sm text-slate-400 mt-2">{label}</span>
  </div>
);

const getHealthColor = (score) => {
  if (score >= 80) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-500";
};

const getRoleColor = (role) => {
  switch(role) {
    case 'TRACK': return "bg-red-900/50 text-red-200 border-red-700/50";
    case 'TOURING': return "bg-blue-900/50 text-blue-200 border-blue-700/50";
    case 'ADVENTURE': return "bg-amber-900/50 text-amber-200 border-amber-700/50";
    case 'DAILY': return "bg-slate-700/50 text-slate-200 border-slate-600/50";
    default: return "bg-slate-800 text-slate-300";
  }
};

const FleetCard = ({ bike, className }) => {
  // Mock navigate for visual only
  const handleClick = () => console.log("Navigating to garage detail");

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "group cursor-pointer rounded-2xl bg-slate-900/90 border border-amber-400/20 shadow-lg overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-amber-400/60 hover:shadow-amber-400/10 hover:shadow-2xl hover:-translate-y-2",
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        <img 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          src={bike.imageUrl} 
          alt={`${bike.model} - ${bike.role}`} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={cn("backdrop-blur-md border shadow-sm", getRoleColor(bike.role))}>
            {bike.role}
          </Badge>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4">
           <h3 className="text-lg font-bold text-white leading-tight group-hover:text-amber-400 transition-colors">{bike.model}</h3>
           <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-slate-400 font-medium">{bike.year}</span>
              <span className="text-xs text-gold-accent/80 font-mono">{bike.rider}</span>
           </div>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-slate-800 pt-4">
          <div className="flex flex-col items-center text-center">
            <Gauge className="w-4 h-4 text-slate-500 mb-1" />
            <span className="text-xs font-bold text-slate-200">{bike.seasonKm.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 uppercase">km</span>
          </div>
          <div className="flex flex-col items-center text-center border-l border-slate-800">
            <Map className="w-4 h-4 text-slate-500 mb-1" />
            <span className="text-xs font-bold text-slate-200">{bike.missions}</span>
            <span className="text-[10px] text-slate-500 uppercase">Missions</span>
          </div>
          <div className="flex flex-col items-center text-center border-l border-slate-800">
            <Activity className="w-4 h-4 text-slate-500 mb-1" />
            <span className={cn("text-xs font-bold", getHealthColor(bike.health))}>{bike.health}%</span>
            <span className="text-[10px] text-slate-500 uppercase">Health</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyFleetContent = () => {
  const { toast } = useToast();
  const scrollContainerRef = useRef(null);

  const handleAddBike = () => {
    toast({
      title: "Digital Garage",
      description: "Adding a new bike to your digital twin collection is coming in the next update! 🏍️",
    });
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll = direction === 'left' ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;
    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  return (
    <>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">My Fleet</h2>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAddBike}
                className="hidden md:flex bg-gold-accent/10 border-gold-accent/30 text-gold-accent hover:bg-gold-accent hover:text-navy-deep transition-all rounded-full h-8 px-3 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" /> Add a Bike
              </Button>
            </div>
            <p className="text-slate-300/80 max-w-2xl text-base md:text-lg">
              Your full motorcycle collection. Each bike has its own Digital Twin.
            </p>
          </div>
          
          <Button className="md:hidden w-full bg-gold-accent text-navy-deep font-bold" onClick={handleAddBike}>
            <Plus className="w-4 h-4 mr-2" /> Add New Bike
          </Button>

          <div className="hidden md:flex gap-2">
            <Button variant="outline" size="icon" onClick={() => scroll('left')} className="border-slate-700 bg-slate-900/50 text-slate-300 hover:border-gold-accent hover:text-gold-accent rounded-full">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll('right')} className="border-slate-700 bg-slate-900/50 text-slate-300 hover:border-gold-accent hover:text-gold-accent rounded-full">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {fleetData.map(bike => (
              <div key={bike.id} className="min-w-[85vw] md:min-w-[calc(50%-12px)] xl:min-w-[calc(33.333%-16px)] snap-center">
                <FleetCard bike={bike} className="h-full" />
              </div>
            ))}
          </div>
        </div>
    </>
  );
};

const TelemetryCard = ({ title, children, className, rightElement }) => (
  <div className={cn("bg-slate-900/60 border border-gold-accent/20 rounded-xl p-6 backdrop-blur-sm hover:border-gold-accent/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.05)] transition-all duration-300 flex flex-col h-full", className)}>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
        {title}
      </h3>
      {rightElement}
    </div>
    <div className="flex-grow">
      {children}
    </div>
  </div>
);

const TelemetryMetric = ({ label, value, unit, highlight = false }) => (
  <div className="flex flex-col p-3 rounded-lg bg-navy-deep/40 border border-white/5">
    <span className={cn("text-2xl md:text-3xl font-bold font-mono leading-none", highlight ? "text-gold-accent" : "text-white")}>
      {value} <span className="text-sm text-slate-500 font-normal ml-1">{unit}</span>
    </span>
    <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-2 font-semibold">{label}</span>
  </div>
);

const MyTelemetryContent = () => {
  const { toast } = useToast();
  const handleViewFull = (e) => {
    e.preventDefault();
    toast({
      title: "The Atlas",
      description: "Full telemetry replay mode is currently locked in this demo.",
    });
  };

  return (
    <>
      <div className="mb-12">
          <div className="inline-block mb-3 px-3 py-1 rounded-full border border-gold-accent/40 bg-gold-accent/5">
            <span className="text-[10px] font-bold text-gold-accent uppercase tracking-[0.2em]">Powered by Black Box</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">My Telemetry</h2>
          <p className="text-slate-300/80 text-lg max-w-2xl">Your riding data, distilled into one clean mission report.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 h-full">
          {/* Left Column: Session Overview */}
          <div className="lg:col-span-2 h-full">
              <TelemetryCard 
                title="Last Mission" 
                className="h-full"
                rightElement={
                    <div className="w-48">
                      <Select defaultValue="alpine">
                        <SelectTrigger className="h-8 border-slate-700 bg-slate-900/50 text-slate-300 text-xs focus:ring-gold-accent/50">
                          <SelectValue placeholder="Select Mission" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-300">
                          <SelectItem value="alpine">Alpine Thunder</SelectItem>
                          <SelectItem value="coastal">Coastal Run</SelectItem>
                          <SelectItem value="track">Mugello Trackday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                }
              >
                  <div className="flex flex-col h-full justify-between">
                      {/* Metadata */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 border-b border-slate-800 pb-6">
                          <div>
                              <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-1">Date</div>
                              <div className="text-sm font-medium text-slate-200">Oct 12, 2023</div>
                          </div>
                          <div>
                              <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-1">Route</div>
                              <div className="text-sm font-medium text-slate-200">Stelvio Pass</div>
                          </div>
                          <div>
                              <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-1">Duration</div>
                              <div className="text-sm font-medium text-slate-200">4h 12m</div>
                          </div>
                          <div>
                              <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-1">Distance</div>
                              <div className="text-sm font-medium text-slate-200">284 km</div>
                          </div>
                      </div>

                      {/* Telemetry Graph Placeholder */}
                      <div className="relative flex-grow min-h-[250px] bg-slate-950/50 rounded-lg border border-slate-800/50 p-4 mb-6 overflow-hidden group">
                            <div className="absolute inset-0 flex items-center justify-center z-0">
                                <svg viewBox="0 0 800 300" className="w-full h-full opacity-80" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"/>
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,75 L800,75 M0,150 L800,150 M0,225 L800,225" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                                    <path d="M0,250 C100,250 150,100 200,120 S300,200 400,150 S500,50 600,80 S700,180 800,160" fill="url(#graphGradient)" stroke="#f59e0b" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="absolute bottom-2 right-4 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
                                Mission timeline — speed & lean angle over time
                            </div>
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <p className="text-xs text-slate-500 italic">
                              Connect your Black Box device to unlock full telemetry replay.
                          </p>
                          <a href="#" onClick={handleViewFull} className="text-sm text-gold-accent hover:text-gold-accent/80 font-medium flex items-center gap-1 transition-colors">
                              Open full telemetry in The Atlas <ArrowUpRight className="w-3 h-3" />
                          </a>
                      </div>
                  </div>
              </TelemetryCard>
          </div>

          {/* Right Column: Stats Stack */}
          <div className="flex flex-col gap-6 h-full">
              <TelemetryCard title="Performance Snapshot" className="flex-1">
                  <div className="grid grid-cols-2 gap-4 h-full">
                      <TelemetryMetric label="Top Speed" value="241" unit="km/h" highlight />
                      <TelemetryMetric label="Max Lean" value="48" unit="°" highlight />
                      <TelemetryMetric label="Avg Corner Speed" value="103" unit="km/h" />
                      <TelemetryMetric label="Max G-Force" value="1.3" unit="g" />
                  </div>
              </TelemetryCard>

              <TelemetryCard title="Career Stats" className="flex-1">
                  <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded bg-navy-deep/40 border border-white/5">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-800 rounded text-slate-400"><Gauge className="w-4 h-4" /></div>
                              <span className="text-sm text-slate-300 font-medium">Total Distance</span>
                          </div>
                          <span className="text-lg font-bold text-white font-mono">47,821 <span className="text-xs text-slate-500">km</span></span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded bg-navy-deep/40 border border-white/5">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-800 rounded text-slate-400"><LayoutDashboard className="w-4 h-4" /></div>
                              <span className="text-sm text-slate-300 font-medium">Total Missions</span>
                          </div>
                          <span className="text-lg font-bold text-white font-mono">12</span>
                      </div>
                  </div>
              </TelemetryCard>
          </div>
      </div>
    </>
  );
};

// --- MAIN PAGE ---

const HangarPage = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogisticsClick = (e) => {
    e.preventDefault();
    toast({
      title: "Logistics Page",
      description: "Redirecting to global shipping...",
    });
  };

  return (
    <div className="min-h-screen bg-[#0A192F] text-slate-300 selection:bg-gold-accent/30 font-sans flex flex-col">
      <Helmet>
        <title>The Hangar Club | Jetmymoto</title>
        <meta name="description" content="Welcome to the Hangar Club. Your central command for global riding missions." />
      </Helmet>



      <main className="flex-grow pt-16">
        
        {/* 1. OVERVIEW / HERO */}
        <section id="overview" className="relative scroll-mt-24">
          <HeroHUD />
        </section>

        {/* STICKY SUBNAV */}
        <HangarSubnav />

        {/* 2. FLEET */}
        <section id="fleet" className="scroll-mt-32 py-16 md:py-24 bg-gradient-to-b from-black/40 to-[#061733]/80 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <MyFleetContent />
          </div>
        </section>

        {/* 3. TELEMETRY */}
        <section id="telemetry" className="scroll-mt-32 py-16 md:py-24 bg-[#0A192F] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             <MyTelemetryContent />
          </div>
        </section>
        
        {/* 4. LIVE OPS (Placeholder) */}
        <section id="live-ops" className="scroll-mt-32 py-16 md:py-24 bg-gradient-to-b from-[#061733]/80 to-black/40 border-y border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">Live Operations</h2>
              <p className="text-slate-300/80 text-lg max-w-2xl">Real-time global tracking of Hangar members and active missions.</p>
            </div>
            <PlaceholderSection title="Global Grid Map" icon={Globe} desc="A real-time WebGL visualization of all active riders, weather systems, and mission checkpoints." />
          </div>
        </section>
        
        {/* 5. NETWORK (Placeholder) */}
        <section id="network" className="scroll-mt-32 py-16 md:py-24 bg-[#0A192F]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <PlaceholderSection title="Pilot Network" icon={Crosshair} desc="Matchmaking deck to find wingmen for your next mission based on skill level and bike class." />
          </div>
        </section>
        
        {/* 6. ACHIEVEMENTS */}
        <section id="achievements" className="scroll-mt-32 py-16 md:py-24 bg-gradient-to-b from-black/40 to-[#061733]/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             {/* Stats CTA */}
             <div className="text-center">
                <h2 className="text-3xl font-serif font-bold text-white mb-4">Ride with Telemetrics</h2>
                <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-16">
                  Log your missions to the Hangar, unlock achievements, and compare your stats with other pilots.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  <StatCard icon={<ShieldCheck />} value="~1.1g" label="Peak cornering force" />
                  <StatCard icon={<TrendingUp />} value="~12,000 m" label="Total climb this mission" />
                  <StatCard icon={<GitBranch />} value="300+" label="High-intensity corners logged" />
                  <StatCard icon={<Award />} value="1,500" label="Points added to your profile" />
                </div>
             </div>
          </div>
        </section>

        {/* 7. BLACK BOX (Placeholder) */}
        <section id="black-box" className="scroll-mt-32 py-16 md:py-24 bg-gradient-to-b from-[#061733] to-black relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-16 text-center max-w-3xl mx-auto">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-900/10 mb-6">
                  <Lock className="w-3 h-3 text-red-500" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em]">Classified Hardware</span>
               </div>
               <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">The Black Box</h2>
               <p className="text-slate-300 text-lg">
                 Military-grade telemetry for your motorcycle. Syncs directly with The Hangar to visualize every lean angle, acceleration, and braking point.
               </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PlaceholderSection title="Hardware Upgrade" icon={Cpu} desc="Install the module to unlock real-time diagnostics and G-force tracking." />
              <PlaceholderSection title="Broadcast Mode" icon={Signal} desc="Live stream your telemetry to your support crew or social feed." />
            </div>
          </div>
        </section>

        {/* 9. FLIGHT CREW (Placeholder) */}
        <section id="flight-crew" className="scroll-mt-32 py-16 md:py-24 bg-[#0A192F]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Flight Crew</h2>
                <p className="text-slate-300/80 text-lg max-w-2xl mx-auto">
                  Expert support for every stage of your journey.
                </p>
             </div>
             
             <PlaceholderSection title="Crew Dispatch" icon={Radio} desc="24/7 access to logistics experts, route planners, and mechanical support." />
             
             <div className="mt-24 pt-12 border-t border-slate-800 text-center">
                <h3 className="text-2xl font-bold text-white mb-6">Ready to launch?</h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Button size="lg" className="w-full sm:w-auto text-lg font-bold text-navy-deep bg-gold-accent rounded-full shadow-lg shadow-gold-accent/20 transition-transform hover:scale-105 hover:bg-gold-accent/90">
                    <Link to="/atlas">Browse Missions</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg font-bold text-gold-accent border-gold-accent hover:bg-gold-accent hover:text-navy-deep rounded-full transition-transform hover:scale-105" onClick={handleLogisticsClick}>
                    Start with Logistics
                  </Button>
                </div>
             </div>
          </div>
        </section>

      </main>

    </div>
  );
};

export default HangarPage;