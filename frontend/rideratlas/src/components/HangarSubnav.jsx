import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Lock, ChevronRight } from 'lucide-react';

const navItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'telemetry', label: 'Telemetry' },
  { id: 'live', label: 'Live Ops' },
  { id: 'network', label: 'Network' },
  { id: 'achievements', label: 'Rank' },
  { id: 'feed', label: 'Comms' },
  { id: 'black-box', label: 'Black Box' },
  { id: 'flight-crew', label: 'Crew' },
];

const HangarSubnav = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const navRef = useRef(null);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset calculation for sticky headers (Main Header ~80px + Subnav ~64px)
      const offset = 140; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Trigger when section is in the middle-ish of viewport
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-[4rem] md:top-[5rem] z-40 w-full bg-[#0A192F]/95 backdrop-blur-md border-b border-white/5 shadow-2xl shadow-black/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Scrollable Nav Items */}
          <div className="relative flex-1 min-w-0 mr-4">
            {/* Fade Edges for Scroll Indication */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0A192F] to-transparent z-10 pointer-events-none md:hidden"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0A192F] to-transparent z-10 pointer-events-none md:hidden"></div>
            
            <div 
              className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 mask-linear-fade"
              ref={navRef}
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                  className={cn(
                    "relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 border",
                    activeSection === item.id 
                      ? "bg-gold-accent text-navy-deep border-gold-accent font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]" 
                      : "bg-white/5 text-slate-400 border-transparent hover:bg-white/10 hover:text-slate-200"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0 pl-4 border-l border-white/10 hidden sm:block">
            <Button 
              size="sm" 
              onClick={() => scrollToSection('black-box')}
              className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/30 transition-all duration-300 font-bold tracking-tight"
            >
              <Lock className="w-3 h-3 mr-2" />
              Unlock Black Box
            </Button>
          </div>
          
          {/* Mobile Icon Only CTA */}
          <div className="flex-shrink-0 pl-2 border-l border-white/10 sm:hidden">
             <Button 
              size="icon"
              variant="ghost"
              onClick={() => scrollToSection('black-box')}
              className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
            >
              <Lock className="w-4 h-4" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HangarSubnav;