import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // verify path to firebase.js
import { motion } from "framer-motion";
import { CheckCircle2, Users, MapPin, Bike, Clock } from "lucide-react";

export default function PoolPage() {
  const { poolId } = useParams();
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPool() {
      try {
        // 1. Try Firestore first
        const poolRef = doc(db, "pools", poolId);
        const poolSnap = await getDoc(poolRef);

        if (poolSnap.exists()) {
          setPool(poolSnap.data());
          return;
        }

        // 2. Fallback to localStorage (Mock UX)
        const localData = localStorage.getItem(`pool_${poolId}`);
        if (localData) {
          setPool(JSON.parse(localData));
          return;
        }

        setError("Pool not found");
      } catch (err) {
        console.error("Error fetching pool:", err);
        
        // Even if Firestore fails, try local fallback
        const localData = localStorage.getItem(`pool_${poolId}`);
        if (localData) {
          setPool(JSON.parse(localData));
        } else {
          setError("Failed to load pool details");
        }
      } finally {
        setLoading(false);
      }
    }

    if (poolId) {
      fetchPool();
    }
  }, [poolId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-[#574C43] transition-colors duration-700">
        <div className="animate-pulse font-mono text-sm tracking-widest text-amber-500">
          UPLINKING POOL DATA...
        </div>
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-[#574C43] transition-colors duration-700">
        <div className="font-mono text-sm tracking-widest text-red-500">
          {error || "SYSTEM ERROR"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#574C43] py-32 px-6 transition-colors duration-700">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 border border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px] font-mono uppercase tracking-[0.3em] font-black mb-6"
          >
            Status: {pool.status}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-serif italic font-black uppercase mb-4 text-[#574C43]"
          >
            Share This Transport
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-zinc-500 font-mono text-xs md:text-sm uppercase tracking-widest max-w-xl mx-auto leading-relaxed"
          >
            Invite riders to join this route and split the transport cost.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white shadow-sm border border-[#574C43]/10 p-6 md:p-10 rounded-sm relative overflow-hidden"
        >
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-10">
            
            {/* Left Column: Route Details */}
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MapPin size={12} className="text-amber-500" /> Route
                </h3>
                <div className="text-xl md:text-2xl font-black uppercase tracking-widest text-[#574C43] italic">
                  {pool.pickupCity} 
                  <span className="text-amber-500 mx-3">→</span> 
                  {pool.destinationCity}
                </div>
              </div>

              <div>
                 <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Total Transport Cost</h3>
                 <div className="flex flex-col gap-1">
                   <div className="text-2xl font-mono text-[#574C43] tracking-widest uppercase font-black">
                     €{pool.estimatedPrice?.toLocaleString()}
                   </div>
                   <div className="text-sm font-mono text-amber-500 tracking-widest uppercase mt-2">
                     Estimated Share Per Rider
                   </div>
                   <div className="text-lg font-mono text-amber-500 tracking-widest uppercase font-black">
                     ≈ €{pool.estimatedPrice && pool.targetParticipants ? Math.round(pool.estimatedPrice / pool.targetParticipants).toLocaleString() : 0} <span className="text-xs text-amber-500/80 italic font-bold">(if {pool.targetParticipants} riders)</span>
                   </div>
                 </div>
              </div>

              <div>
                <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock size={12} className="text-amber-500" /> Expiry
                </h3>
                <div className="text-sm font-mono tracking-widest text-[#574C43] uppercase bg-[#F8F8F8] inline-block px-3 py-2 border border-[#574C43]/10">
                  {pool.expiresAt ? `Pool expires in ${Math.max(0, Math.round((new Date(pool.expiresAt.seconds * 1000) - Date.now()) / 3600000))} hours` : "Pool expires in 48 hours"}
                </div>
                <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mt-2 italic font-bold">
                  Unconfirmed pools may be released
                </div>
              </div>
            </div>

            {/* Right Column: Pool Status */}
            <div className="bg-[#F8F8F8] border border-[#574C43]/10 p-6 space-y-6 rounded-sm">
              <div>
                <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Users size={12} className="text-amber-500" /> Participants
                </h3>
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-black italic text-amber-500 uppercase tracking-widest">{pool.participantsPaid} {pool.participantsPaid === 1 ? 'rider joined' : 'riders joined'}</span>
                  <span className="text-[10px] text-zinc-400 font-bold italic uppercase tracking-widest">{Math.max(0, pool.targetParticipants - pool.participantsPaid)} spots available</span>
                </div>
              </div>

              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (pool.participantsPaid / pool.targetParticipants) * 100)}%` }}
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                 <div className="text-[10px] text-amber-500 font-mono uppercase tracking-widest mb-1 font-black italic">
                   Secure Your Spot
                 </div>
                 <div className="text-xl font-mono text-[#574C43] tracking-widest uppercase font-black">
                   €{pool.requiredDepositPerPerson?.toLocaleString()} deposit
                 </div>
                 <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-2 italic font-bold">
                   Each rider pays individually.<br/>
                   Deposit is applied to final transport cost.
                 </div>
              </div>

            </div>

          </div>

        </motion.div>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
           className="mt-12 text-center max-w-lg mx-auto"
        >
          <h2 className="text-xl font-serif italic font-black uppercase mb-2">Invite Riders</h2>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-6">
            Share this link with friends or riding groups:
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-white border border-[#574C43]/10 p-2 pr-4 rounded-sm w-full overflow-hidden shadow-sm">
               <div className="bg-[#F8F8F8] px-4 py-3 font-mono text-xs text-[#A76330] truncate select-all flex-1 text-left">
                 {pool.shareUrl || `${window.location.origin}/pool/${poolId}`}
               </div>
               <button 
                 onClick={() => navigator.clipboard.writeText(pool.shareUrl || `${window.location.origin}/pool/${poolId}`)}
                 className="text-[10px] font-mono uppercase tracking-widest text-[#574C43] hover:text-[#CDA755] transition-colors whitespace-nowrap"
               >
                 Copy Link
               </button>
            </div>
            
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`Join my motorcycle transport pool:\n${pool.pickupCity} → ${pool.destinationCity}\n\nSave money by sharing transport:\n${pool.shareUrl || `${window.location.origin}/pool/${poolId}`}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] text-black font-mono text-xs font-black uppercase tracking-[0.2em] hover:bg-[#20bd5a] transition shadow-[0_10px_40px_rgba(37,211,102,0.2)]"
            >
              Share via WhatsApp
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
