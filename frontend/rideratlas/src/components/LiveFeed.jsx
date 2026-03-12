import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, ShieldCheck, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { db } from '../firebase';
import { ytThumbs } from "../lib/media";

/* --- HELPERS --- */

const ytEmbed = (videoId) => videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&modestbranding=1` : null;
export default function LiveFeed() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, 'live_feed'), 
          orderBy('curation.priority', 'asc'), 
          limit(12)
        );
        const snap = await getDocs(q);
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { 
        console.error('LiveFeed Uplink Error:', e); 
      } finally { 
        setLoading(false); 
      }
    }
    load();
  }, []);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center bg-black font-mono text-amber-500 animate-pulse uppercase tracking-[0.4em] text-xs">
      Intercepting Satellite Feeds...
    </div>
  );

  // ✅ Added Firestore Empty State
  if (!loading && items.length === 0) {
    return (
      <div className="py-24 text-center text-gray-600 font-mono text-[10px] uppercase tracking-[0.2em] bg-[#050505] border-t border-white/5">
        No live intelligence signals detected in this sector.
      </div>
    );
  }

  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6 mb-12 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Live Uplink Established</span>
          </div>
          <h3 className="text-4xl font-black uppercase tracking-tighter text-white italic">
            Field <span className="text-amber-500">Intelligence</span>
          </h3>
        </div>

        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-3 border border-white/10 rounded-full hover:bg-white/5 transition text-white group">
            <ChevronLeft size={20} className="group-hover:text-amber-500 transition-colors" />
          </button>
          <button onClick={() => scroll('right')} className="p-3 border border-white/10 rounded-full hover:bg-white/5 transition text-white group">
            <ChevronRight size={20} className="group-hover:text-amber-500 transition-colors" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-6 md:px-[10vw] no-scrollbar snap-x snap-mandatory pb-8"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveItem(item)}
            className="flex-none w-[85vw] md:w-[30vw] aspect-[16/10] relative group cursor-pointer snap-center rounded-sm overflow-hidden border border-white/5 bg-zinc-950"
          >
            <img 
              src={ytThumb(item.video_id)} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-all duration-700 grayscale group-hover:grayscale-0 scale-105 group-hover:scale-100"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
              <div className="flex justify-between items-start">
                <span className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-amber-500 uppercase tracking-widest">
                  {item.verified ? 'Verified Mission' : 'Live Signal'}
                </span>
                <Eye size={16} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-amber-500 transition-colors uppercase italic">
                  {item.mission_id?.replace(/-/g, ' ')}
                </h4>
                <p className="text-gray-400 text-[11px] line-clamp-2 font-mono uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {item.notebooklm?.summary_1line || "Manual verification complete."}
                </p>
              </div>
            </div>

            {/* Cinematic Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,118,0.03))] bg-[length:100%_2px,3px_100%] z-10 opacity-20" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeItem && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
          >
             <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 bg-zinc-950 border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)]"
             >
                <div className="lg:col-span-2 aspect-video bg-black relative group">
                  <button onClick={() => setActiveItem(null)} className="absolute top-4 left-4 z-50 p-2 bg-black/60 hover:bg-white text-white hover:text-black rounded-full transition-all">
                    <X size={20} />
                  </button>
                  {/* ✅ Added Defensive Iframe Attributes */}
                  <iframe 
                    src={ytEmbed(activeItem.video_id)} 
                    className="w-full h-full" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    title="Field Intelligence Video"
                  />
                </div>

                <div className="p-8 flex flex-col justify-between border-l border-white/10 bg-[#080808]">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={14} className="text-amber-500" />
                      <span className="text-[10px] font-mono text-amber-500 uppercase tracking-[0.3em]">Operational Intel</span>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase italic mt-2 mb-6 border-b border-white/5 pb-4">
                      {activeItem.mission_id?.replace(/-/g, ' ')}
                    </h2>
                    
                    <div className="space-y-4">
                      {activeItem.notebooklm?.summary_bullets?.slice(0, 3).map((b, i) => (
                        <div key={i} className="flex gap-3 text-xs text-gray-400 font-mono uppercase leading-relaxed">
                          <span className="text-amber-500 shrink-0">[{i+1}]</span>
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-12 space-y-3">
                    <button 
                      onClick={() => {
                        setActiveItem(null);
                        navigate(`/mission/${activeItem.mission_id}`);
                      }}
                      className="w-full py-4 bg-amber-500 hover:bg-white text-black font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                      Access Full Dossier
                    </button>
                    <button onClick={() => setActiveItem(null)} className="w-full py-4 bg-transparent border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all">
                      Close Uplink
                    </button>
                  </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
