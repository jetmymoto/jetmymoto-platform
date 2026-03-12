import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
const Hero = () => {
  const {
    toast
  } = useToast();
  const handleDesignJourney = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };
  const handleViewProtocol = () => {
    const protocolSection = document.getElementById('protocol');
    if (protocolSection) {
      protocolSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-zinc-950 z-10" />
        <img className="w-full h-full object-cover" alt="Two motorcycles and a Jetmymoto van on a mountain road above the clouds at sunset" src="https://horizons-cdn.hostinger.com/429a20a3-ec22-4371-b80b-5baa15a456ff/854bb2803a76408ed4e564eaf0efe1ee.jpg" />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="text-center md:text-left">
            <motion.h1 initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 1,
            delay: 0.3
          }} className="font-serif text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
              Your Journey.<br />Perfected.
            </motion.h1>

            <motion.p initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 1,
            delay: 0.6
          }} className="text-xl md:text-2xl text-zinc-300 mb-12 font-light tracking-wide">
              The world's most epic roads. Your motorcycle. We handle the rest.
            </motion.p>

            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 1,
            delay: 0.9
          }} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
              <Button onClick={handleDesignJourney} size="lg" className="bg-amber-700 hover:bg-amber-600 text-white px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-105">
                Design Your Journey
              </Button>
              <Button onClick={handleViewProtocol} size="lg" variant="outline" className="border-2 border-zinc-400 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-300 px-8 py-6 text-lg font-medium transition-all duration-300">Get a Airlift Quote</Button>
            </motion.div>
          </div>

          {/* Hero visual placeholder */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 1,
          delay: 0.9
        }} className="relative h-64 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800/40 p-4 md:h-80 mx-auto w-full max-w-sm md:max-w-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),transparent_55%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-200/80">
                <span className="rounded-full bg-black/40 px-3 py-1">
                  Live Mission Preview
                </span>
                <span className="text-amber-300/90">Innsbruck ⟶ Rijeka</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300/90">
                  <span>Projected G-Force</span>
                  <span>1.8 g</span>
                </div>
                <div className="flex justify-between text-slate-300/90">
                  <span>Curves / 100 km</span>
                  <span>164</span>
                </div>
                <div className="flex justify-between text-slate-300/90">
                  <span>Riders booked</span>
                  <span>8 / 12</span>
                </div>
              </div>
              <div className="rounded-2xl bg-black/60 p-3 text-xs">
                <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  Telemetry Highlight
                </p>
                <p className="text-slate-100">
                  “Last run logged a new sector record on Vršič Pass. Ready to
                  write yours?”
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 1,
      delay: 1.5
    }} className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <motion.div animate={{
        y: [0, 10, 0]
      }} transition={{
        duration: 2,
        repeat: Infinity
      }} className="w-6 h-10 border-2 border-zinc-400 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-zinc-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>;
};
export default Hero;