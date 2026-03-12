import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';

const LeadGate = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 p-4 z-50"
        >
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <div className="font-black uppercase tracking-tighter text-white">Mission Data Pack</div>
              <div className="text-[10px] text-amber-500 font-mono uppercase tracking-widest">
                GPX · PDF · 4K RECON VIDEO
              </div>
            </div>
            <button className="bg-amber-500 hover:bg-white text-black px-6 py-3 font-black uppercase text-xs tracking-tighter transition-colors flex items-center gap-2">
              <Download size={16} /> Download Intel
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeadGate;
