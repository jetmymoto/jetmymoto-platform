import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ShieldCheck, Bike, Info } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config/api";

export default function BookingSuccess({ bookingRef, email, quoteData }) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const navigate = useNavigate();

  const pricePerUnit = useMemo(() => {
    if (!quoteData?.estimatedPrice || !quoteData?.totalUnits) return 0;
    return Math.round(quoteData.estimatedPrice / quoteData.totalUnits);
  }, [quoteData]);

  const handleDeposit = async () => {
    if (!bookingRef || !email) return;
    setIsRedirecting(true);

    try {
      const res = await fetch(
        `${API_URL}/createCheckoutSession`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingRef,
            email,
          }),
        }
      );

      const data = await res.json();

      if (!data.url) throw new Error(data.error || "No checkout URL returned");

      window.location.href = data.url;

    } catch (err) {
      console.error("Stripe redirect error:", err);
      alert("Payment initialization failed");
      setIsRedirecting(false);
    }
  };

  const handleCreatePool = () => {
    if (!bookingRef) return;
    setIsCreatingPool(true);

    // 1. Generate mock poolId
    const poolId = `POOL-${Date.now()}`;

    // 2. Create mock pool data for immediate UX
    const mockPool = {
      poolId,
      bookingRef,
      pickupCity: quoteData?.pickupCity || "Unknown Origin",
      destinationCity: quoteData?.destinationCity || "Unknown Destination",
      estimatedPrice: quoteData?.estimatedPrice || 0,
      targetParticipants: 4,
      participantsPaid: 1, // Owner is already "in"
      requiredDepositPerPerson: 500,
      status: "OPEN",
      createdAt: { seconds: Math.floor(Date.now() / 1000) }, // Mock Firestore timestamp
      expiresAt: { seconds: Math.floor((Date.now() + 48 * 60 * 60 * 1000) / 1000) },
      shareUrl: `${window.location.origin}/pool/${poolId}`,
    };

    // 3. Store in localStorage for PoolPage fallback
    localStorage.setItem(`pool_${poolId}`, JSON.stringify(mockPool));

    // 4. Instant Redirect
    setTimeout(() => {
      navigate(`/pool/${poolId}`);
    }, 600);
  };

  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center text-white overflow-hidden rounded-sm">

      {/* 🎥 BACKGROUND GIF */}
      <img
        src="https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_images%2Fbooking%20video02.gif?alt=media&token=bc73f62f-2b12-4966-85e3-a84add0f958f"
        className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
        alt="network"
      />

      {/* 🌑 DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-none" />

      {/* 🔥 CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-20 text-center px-6 max-w-2xl py-12 flex flex-col items-center"
      >

        {/* A. Headline (hero) */}
        <motion.h1
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.15em" }}
          transition={{ duration: 1.2 }}
          className="text-3xl md:text-5xl font-bold uppercase tracking-widest font-serif italic"
        >
          Mission Ready
        </motion.h1>

        {/* B. Sub-headline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-zinc-100 text-lg md:text-xl leading-relaxed font-semibold"
        >
          Your route is prepared and awaiting confirmation.
        </motion.p>

        {/* C. Status block (system feel) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 mx-auto w-fit space-y-3 text-zinc-400 text-xs md:text-sm font-mono uppercase tracking-widest text-left"
        >
          <div className="flex items-center gap-3"><CheckCircle2 size={14} className="text-amber-500 shrink-0"/> Route analyzed</div>
          <div className="flex items-center gap-3"><CheckCircle2 size={14} className="text-amber-500 shrink-0"/> Fleet availability checked</div>
          <div className="flex items-center gap-3"><CheckCircle2 size={14} className="text-amber-500 shrink-0"/> Compliance requirements reviewed</div>
          <div className="flex items-center gap-3"><CheckCircle2 size={14} className="text-amber-500 shrink-0"/> Operations team on standby</div>
        </motion.div>

        {/* D. Booking Reference */}
        {bookingRef && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-10 inline-block px-6 py-3 border border-amber-500/30 bg-black/60 font-mono text-sm tracking-widest"
          >
            REFERENCE: <span className="text-amber-400">{bookingRef}</span>
          </motion.div>
        )}

        {/* D2. Quote Preview */}
        {quoteData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="mt-8 mx-auto w-full max-w-sm bg-black/50 border border-white/10 p-6 flex flex-col gap-4 text-left"
          >
            <div className="flex flex-col border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Mission Path</span>
              <span className="text-sm font-mono text-white tracking-widest uppercase">
                {quoteData.pickupCity} → {quoteData.destinationCity}
              </span>
            </div>
            
            <div className="flex flex-col gap-2 pt-2 border-b border-white/10 pb-4">
              <div className="flex justify-between items-end">
                 <span className="text-sm font-mono text-amber-500 uppercase tracking-widest font-black italic flex items-center gap-2">≈ €{pricePerUnit.toLocaleString()} per bike</span>
                 <span className="italic text-zinc-500 text-[9px]">Based on {quoteData.totalUnits} units</span>
              </div>
            </div>

            <div className="mt-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-black italic flex items-center gap-2">
                   <ShieldCheck size={12} /> Secure Your Slot
                 </span>
                 <span className="text-lg font-mono text-white tracking-widest uppercase font-black">€500 deposit</span>
               </div>
               <p className="text-[9px] font-mono text-amber-500/80 uppercase tracking-widest italic font-bold">
                 Secures your transport slot instantly once confirmed.<br/>
                 Fully applied to your final cost.
               </p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Total Mission Cost</span>
              <span className="text-sm font-mono text-zinc-400 tracking-widest uppercase">€{quoteData.estimatedPrice.toLocaleString()}</span>
            </div>

            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-2 italic leading-relaxed font-bold">
              Includes:<br/>
              • €5M cargo insurance<br/>
              • Customs clearance<br/>
              • End-to-end airlift handling
            </p>

            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-4 italic leading-relaxed font-bold text-center border-t border-white/5 pt-4">
              Trusted by riders, collectors, and manufacturers across EU corridors
            </p>
          </motion.div>
        )}

        {/* SUBTLE DIVIDER */}
        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 64 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="mt-12 h-[1px] bg-amber-500/30 mx-auto" 
        />

        {/* F. CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-8 flex flex-col items-center justify-center gap-4 w-full max-w-sm mx-auto"
        >
          <div className="flex flex-col items-center w-full">
            <p className="text-[10px] md:text-xs text-amber-500/80 font-mono uppercase tracking-[0.2em] font-bold mb-3 italic text-center">
              Limited capacity on this route.<br/>Your slot is held temporarily pending confirmation.
            </p>

            <button
              onClick={handleDeposit}
              disabled={isRedirecting || isCreatingPool}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-black font-mono text-xs font-black uppercase tracking-[0.2em] hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-[0_10px_40px_rgba(245,158,11,0.2)]"
            >
              {isRedirecting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Initializing Secure Uplink...
                </>
              ) : (
                "Secure Slot with €500 Deposit"
              )}
            </button>
          </div>
          
          <div className="flex flex-col items-center w-full mt-2">
            <button
              onClick={handleCreatePool}
              disabled={isCreatingPool || isRedirecting}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 border border-amber-500/50 text-amber-500 bg-black/50 font-mono text-xs font-black uppercase tracking-[0.2em] hover:bg-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isCreatingPool ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Pool...
                </>
              ) : (
                "Invite Riders & Pay Less"
              )}
            </button>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
