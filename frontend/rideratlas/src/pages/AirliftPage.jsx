import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, MapPin, Truck, CheckCircle2, Package, Star, Plane, Play, Compass, Plus, ArrowRight, User, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AirliftClassSection from '@/components/AirliftClassSection';



// 🟢 🟢 🟢 VIDEO CONTROL CENTER 🟢 🟢 🟢
// PASTE YOUR NEW VIDEO LINKS HERE!
import { SITE_MEDIA } from "@/config/siteMedia";

const AIRLIFT_VIDEOS = {
  HERO: SITE_MEDIA.AIRLIFT_HERO,
  PREMIUM: SITE_MEDIA.AIRLIFT_HERO, // Change this later
  ECONOMY: SITE_MEDIA.AIRLIFT_HERO, // Change this later
  CONNECT: SITE_MEDIA.AIRLIFT_HERO, // Change this later
};

const WHATSAPP_NUMBER = "15550000000"; // Change this to your real number
// 🟢 🟢 🟢 END CONTROL CENTER 🟢 🟢 🟢


// --- DYNAMIC VIDEO PLAYER ---
const SimpleVideoModal = ({ videoUrl, onClose }) => {
  if (!videoUrl) return null;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=I%20watched%20the%20video%20and%20I%20am%20ready%20to%20book`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505]/95 flex items-center justify-center p-4">
      <button onClick={onClose} className="absolute top-8 right-8 text-white hover:text-gold-accent transition-colors z-50">
        <X className="w-10 h-10" />
      </button>

      <div className="relative w-full max-w-6xl aspect-video bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-2xl group">
        {/* The Key helps React know to reload the video tag when the URL changes */}
        <video key={videoUrl} controls autoPlay className="w-full h-full object-cover">
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* FLOATING WHATSAPP BUTTON */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center z-40 pointer-events-none">
          <Button 
            onClick={handleWhatsApp} 
            className="pointer-events-auto bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-8 py-6 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] transition-all transform hover:scale-105 flex items-center gap-3 text-lg"
          >
            <MessageCircle className="w-6 h-6" />
            Chat with Logistics
          </Button>
        </div>
      </div>
    </div>
  );
};

const AirliftPage = () => {
  // Instead of true/false, we store the URL of the video we want to play
  const [activeVideo, setActiveVideo] = useState(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 🎥 ACTION: Play a specific video from the list
  const playVideo = (url) => {
     setActiveVideo(url);
  };

import { getSiteConfig } from '@/utils/siteConfig';

...

  const handleJetMyMoto = () => {
    const site = getSiteConfig();
    window.open(`https://${site.domain}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-gold-accent selection:text-navy-deep flex flex-col">
      <Helmet>
        <title>Airlift | Rider Atlas</title>
      </Helmet>

      {/* --- VIDEO PLAYER (Passes the active URL) --- */}
      <SimpleVideoModal videoUrl={activeVideo} onClose={() => setActiveVideo(null)} />

      <style>{`
        @keyframes slowZoom { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .animate-slowZoom { animation: slowZoom 20s linear infinite; }
        .animate-pulseGlow { animation: pulseGlow 6s ease-in-out infinite; }
      `}</style>



      <main className="flex-grow">
        {/* --- HERO SECTION --- */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 z-0 overflow-hidden">
              <div className="absolute inset-0 bg-[#050505]/60 z-10" /> 
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
              <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 scale-105 animate-slowZoom transform-gpu">
                <source src={VIDEOS.HERO} type="video/mp4" />
              </video>
           </div>
           <div className="relative z-20 text-center max-w-5xl px-4 mt-16">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="cursor-default">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-accent/10 border border-gold-accent/30 text-gold-accent text-xs font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-md">
                   <div className="w-2 h-2 rounded-full bg-gold-accent animate-pulse" /> Mission Logistics
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase leading-none drop-shadow-2xl">Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-accent to-amber-600">Airlift</span></h1>
                <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-lg">Board your bike. Fly yourself. We collect your motorcycle, position it at the start of your mission, and bring it back while you fly.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  
                  {/* BUTTON 1: HERO VIDEO */}
                  <Button onClick={() => playVideo(VIDEOS.HERO)} className="h-14 px-8 text-lg font-bold bg-gold-accent text-black rounded-none skew-x-[-10deg] hover:shadow-[0_0_60px_rgba(199,154,59,0.6)]">
                    <span className="relative skew-x-[10deg]">INITIATE AIRLIFT</span>
                  </Button>
                  
                  <Button variant="outline" onClick={() => scrollToSection('how-it-works')} className="h-14 px-8 text-lg font-bold border-white/20 text-white rounded-none skew-x-[-10deg]">
                    <span className="flex items-center gap-2 skew-x-[10deg]"><Play className="w-4 h-4 fill-current" /> HOW IT WORKS</span>
                  </Button>
                </div>
              </motion.div>
           </div>
        </section>

        {/* --- 🧭 HUD NAV --- */}
        <div className="sticky top-20 z-40 flex justify-center w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl transition-all duration-500 hover:bg-[#050505]/90">
          <div className="flex items-center gap-8 py-4 overflow-x-auto px-4">
             <button onClick={() => scrollToSection('how-it-works')} className="text-xs font-bold tracking-widest text-slate-500 hover:text-white uppercase hover:tracking-[0.2em] transition-all">Process</button>
             <div className="w-px h-4 bg-white/20"></div>
             <button onClick={() => scrollToSection('connect-airlift')} className="text-xs font-bold tracking-widest text-gold-accent hover:text-white uppercase hover:tracking-[0.2em] transition-all">Connect</button>
             <div className="w-px h-4 bg-white/20"></div>
             <button onClick={() => scrollToSection('premium-tier')} className="text-xs font-bold tracking-widest text-slate-500 hover:text-white uppercase hover:tracking-[0.2em] transition-all">Premium</button>
             <div className="w-px h-4 bg-white/20"></div>
             <button onClick={() => scrollToSection('economy-tier')} className="text-xs font-bold tracking-widest text-slate-500 hover:text-white uppercase hover:tracking-[0.2em] transition-all">Economy</button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
          
          <section id="how-it-works" className="scroll-mt-32">
             <div className="text-center mb-16 max-w-4xl mx-auto">
               <h2 className="text-4xl md:text-5xl font-black text-white mb-6">How <span className="text-gold-accent">The Airlift</span> Works</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="relative bg-white/5 border border-white/10 p-8 rounded-2xl"><Truck className="w-12 h-12 text-gold-accent mb-6" /><h3 className="text-2xl font-bold text-white mb-4">Board Your Bike</h3><p className="text-slate-400">We collect your motorcycle at home or your chosen hub.</p></div>
               <div className="relative bg-white/5 border border-white/10 p-8 rounded-2xl"><Plane className="w-12 h-12 text-gold-accent mb-6" /><h3 className="text-2xl font-bold text-white mb-4">You Fly In Relaxed</h3><p className="text-slate-400">You fly like a normal passenger while your bike is transported.</p></div>
               <div className="relative bg-white/5 border border-white/10 p-8 rounded-2xl"><MapPin className="w-12 h-12 text-gold-accent mb-6" /><h3 className="text-2xl font-bold text-white mb-4">Start On The Good Roads</h3><p className="text-slate-400">Land, check in, and walk straight to your own bike.</p></div>
             </div>
             <div className="text-center mt-12">
               {/* BUTTON 3: JETMYMOTO */}
               <Button onClick={handleJetMyMoto} className="rounded-full px-8 py-6 text-lg font-bold bg-gold-accent text-black hover:bg-white shadow-[0_0_30px_rgba(199,154,59,0.3)]">
                 Get My Boarding Pass
               </Button>
             </div>
          </section>

          {/* --- CONNECT MISSION --- */}
          <section id="connect-airlift" className="relative py-28 border-y border-white/10 bg-gradient-to-b from-[#050505] via-[#070b12] to-[#050505] text-center">
            <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">Connect Any Mission</h2>
            <div className="mt-12">
               {/* BUTTON 5: CONNECT VIDEO */}
               <Button onClick={() => playVideo(VIDEOS.CONNECT)} className="px-12 py-4 bg-gold-accent text-black font-bold uppercase tracking-widest hover:bg-white">
                Add Airlift to Mission
              </Button>
            </div>
          </section>

          {/* --- PREMIUM SECTION --- */}
          <section id="premium-tier" className="scroll-mt-32">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6 border-l-4 border-gold-accent pl-6">
               <div>
                 <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">Premium Class</h2>
                 <p className="text-gold-accent font-mono text-sm tracking-widest">TIER 1 LOGISTICS // AIR FREIGHT // WHITE GLOVE</p>
               </div>
               <p className="text-slate-400 max-w-md text-right md:text-left">For high-value assets and time-critical missions. Your motorcycle never touches the pavement until destination.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Plane, title: "Air Bridge", desc: "Priority air transport. Oceans crossed in hours, not weeks." },
                { icon: Shield, title: "Armored Care", desc: "Full custom crating, fluid draining, and battery tendering." },
                { icon: MapPin, title: "Precise Drop", desc: "Delivered to your hotel lobby, villa, or pit garage." }
              ].map((item, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="group relative bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all duration-500 overflow-hidden shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] hover:shadow-[0_0_60px_rgba(199,154,59,0.15)]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-gold-accent/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <item.icon className="w-24 h-24 text-gold-accent" />
                  </div>
                  <item.icon className="w-10 h-10 text-gold-accent mb-6 relative z-10" />
                  <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed relative z-10">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center">
               {/* BUTTON 6: PREMIUM VIDEO */}
               <Button onClick={() => playVideo(VIDEOS.PREMIUM)} variant="outline" className="border-gold-accent text-gold-accent uppercase font-bold tracking-widest rounded-none">
                Request Premium Quote
              </Button>
            </div>
          </section>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* --- ECONOMY SECTION --- */}
          <section id="economy-tier" className="scroll-mt-32">
             <div className="text-center mb-16">
               <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Economy Class</h2>
               <p className="text-slate-400 font-mono tracking-widest">SMART ROUTING // GROUP CARRIER // HUB-TO-HUB</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#111] border border-white/10 p-10 flex flex-col justify-center shadow-lg">
                   <h3 className="text-2xl font-bold text-white mb-4">The Smart Move</h3>
                   <p className="text-slate-400 mb-8">Leverage our existing commercial routes. We combine shipments to lower costs significantly, perfect for missions where timing is flexible.</p>
                   <ul className="space-y-4">
                      {["Open Secure Trailer", "5-10 Day Windows", "Hub Drop-off (Lower Cost)"].map((li, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-slate-600" /> {li}</li>
                      ))}
                   </ul>
                </div>
                <div className="relative h-[400px] bg-slate-900 overflow-hidden group border border-white/5">
                   <img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop" alt="Motorcycles loaded" className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      {/* BUTTON 7: ECONOMY VIDEO */}
                      <Button onClick={() => playVideo(VIDEOS.ECONOMY)} variant="outline" className="border-white text-white hover:bg-white hover:text-black uppercase font-bold tracking-widest rounded-none">
                        Check Economy Rates
                      </Button>
                   </div>
                </div>
             </div>
          </section>

          {/* --- RESPONSIBILITY SPLIT --- */}
          <section className="relative py-24 overflow-hidden">
             <div className="relative z-10 max-w-6xl mx-auto px-6">
                <div className="mb-16 text-center">
                  <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">Operational <span className="text-gold-accent">Handoff</span></h2>
                  <p className="mt-4 text-slate-400 max-w-2xl mx-auto">Responsibilities are split cleanly between the logistics system and the rider. No overlap.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch relative">
                   <div className="relative bg-gradient-to-b from-[#0f131b] to-[#07090d] border border-gold-accent/40 p-10 md:p-12">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gold-accent" />
                     <h3 className="text-3xl font-black text-white mb-2">We Handle the <span className="text-gold-accent">Heavy Lifting</span></h3>
                     <ul className="space-y-4 mt-8">
                       {["Bike collection", "Transport & Insurance", "Straps & Loading", "Logistics Paperwork"].map((item, i) => (
                         <li key={i} className="flex items-start gap-4 text-slate-200"><CheckCircle2 className="w-4 h-4 text-gold-accent mt-1" /> {item}</li>
                       ))}
                     </ul>
                   </div>
                   <div className="relative bg-[#060606] border border-white/10 p-10 md:p-12">
                     <h3 className="text-3xl font-black text-slate-500 mb-2">You Handle <span className="text-white">The Riding</span></h3>
                     <ul className="space-y-4 mt-8">
                       {["Flights & Hotels", "Riding Gear", "Personal Docs", "Showing up ready"].map((item, i) => (
                         <li key={i} className="flex items-start gap-4 text-slate-400"><User className="w-4 h-4 text-slate-600 mt-1" /> {item}</li>
                       ))}
                     </ul>
                   </div>
                </div>
             </div>
          </section>

          {/* --- COMPARISON TABLE --- */}
          <AirliftClassSection />

          <section className="relative py-24 text-center">
             <h2 className="text-5xl md:text-7xl font-black text-white mb-8 uppercase italic">Don't Waste <br/><span className="text-gold-accent">The Weekend</span></h2>
             {/* BUTTON 8: HERO VIDEO (or a different one) */}
             <Button onClick={() => playVideo(VIDEOS.HERO)} className="h-16 px-12 text-xl font-bold bg-white text-black hover:bg-gold-accent shadow-[0_0_50px_rgba(255,255,255,0.2)]">
               BOOK YOUR AIRLIFT
             </Button>
          </section>
        </div>
      </main>

    </div>
  );
};

export default AirliftPage;
