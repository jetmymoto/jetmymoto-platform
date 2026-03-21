import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Bike,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  MapPin,
  ChevronRight,
  ArrowRight,
  Clock,
  Zap,
  Info,
  Globe,
  Share2,
} from "lucide-react";
import { GRAPH } from "@/core/network/networkGraph";
import LocationInput from "@/components/ui/LocationInput";
import BookingSuccess from "@/components/ui/BookingSuccess";
import MotoAirliftBookingForm from "@/features/booking/MotoAirliftBookingForm";

/**
 * JetMyMoto — Booking Page (Full)
 * - Hardened against render crashes by using useSearchParams and optional chaining.
 * - Corrected component name to match filename.
 */

const HERO_VIDEO_URL =
  "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_videos%2FCopy%20of%20H1%20booking%20background%200.3%20mun-28_02_2026%2C%2017_42.mp4?alt=media&token=fd0ed8a2-6399-44b2-99ed-8dcf88440967";

const NETWORK_VIDEO_URL =
  "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_videos%2FCinematic_Logistics_Warehouse_Video.mp4?alt=media&token=bb9855f8-1edd-4e95-b50e-a944d1d12934";

const trackClick = (evt) => {
  if (import.meta.env.DEV) {
    console.log("[TELEMETRY]", { ...evt, ts: new Date().toISOString() });
  }
};

// CORRECTED: Component name matches file name
export default function MotoAirliftBooking() {
  const [searchParams] = useSearchParams();

  const [shareStatus, setShareStatus] = useState("idle");
  const [currentUrl, setCurrentUrl] = useState("");

  // SSR safe URL capture
  useEffect(() => {
    if (typeof window === "undefined") return;

    setCurrentUrl(window.location.href);
  }, [searchParams]);

  // Phase 3: Generic Context (backend will resolve hub)
  const context = {
    heroTag: "MotoAirlift™",
    frictionHook: "Bypass the highway slog and the rental desk. We stage your motorcycle at the destination corridor.",
    bookingTag: "Initiate hub logistics to secure your transport plan."
  };

  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(heroScroll, [0, 1], [1.0, 1.15]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });
  const step1Opacity = useTransform(scrollYProgress, [0, 0.33], [1, 0]);
  const step2Opacity = useTransform(scrollYProgress, [0.33, 0.66], [0, 1]);
  const step3Opacity = useTransform(scrollYProgress, [0.66, 1], [0, 1]);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    const url = currentUrl || window.location.href;
    trackClick({ type: "share_click", url });

    try {
      if (navigator.share) {
        await navigator.share({
          title: "JetMyMoto — MotoAirlift Quote",
          text: "Use this page to request a motorcycle airlift quote.",
          url,
        });
        setShareStatus("shared");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
        return;
      }

      setShareStatus("error");
    } catch {
      setShareStatus("error");
    } finally {
      setTimeout(() => setShareStatus("idle"), 2500);
    }
  };

  const mailHref = useMemo(() => {
    const url = currentUrl || "JetMyMoto.com";
    const subject = "JetMyMoto — MotoAirlift Quote";
    const body = `Use this link to request a quote: ${url}`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [currentUrl]);

  return (
    <div className="bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* STICKY ACTION RAIL */}
      <nav className="fixed bottom-0 left-0 w-full z-[100] md:top-0 md:bottom-auto h-20 bg-black/80 backdrop-blur-xl border-t md:border-b border-white/5 flex items-center px-6 md:px-12">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="hidden md:flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase italic text-zinc-300">
              LOGISTICS_NODE_ACTIVE
            </span>
          </div>

          <div className="flex-1 md:flex-none flex justify-end items-center gap-4">
            <button
              onClick={handleShare}
              className="hidden sm:flex border border-white/10 bg-zinc-900/50 hover:border-amber-500/30 transition-all text-white px-5 py-2 rounded-sm font-mono text-[9px] font-black uppercase tracking-widest italic items-center gap-2"
            >
              Share <Share2 size={12} />
            </button>

            <div className="hidden lg:flex flex-col text-right">
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 italic text-right">
                Starting from
              </span>
              <span className="font-mono text-sm font-black text-white italic tracking-tight">
                €850 — EU CORRIDOR
              </span>
            </div>

            <a
              href="#booking"
              className="w-full md:w-auto bg-amber-500 text-black px-8 py-3 rounded-sm font-mono text-[11px] font-black uppercase tracking-widest italic hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-[0_20px_rgba(245,158,11,0.2)]"
            >
              Ship Your Bike <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </nav>

      {/* SHARE TOAST */}
      <AnimatePresence>
        {shareStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-black/90 border border-white/10 px-6 py-4 rounded-sm backdrop-blur-xl shadow-2xl"
          >
            <div className="font-mono text-[10px] uppercase tracking-widest italic text-amber-500 font-black">
              {shareStatus === "copied" && "System // Link copied to clipboard."}
              {shareStatus === "shared" && "System // Protocol shared."}
              {shareStatus === "error" && "Error // Manual copy required."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. CINEMATIC HERO SECTION */}
      <section
        ref={heroRef}
        className="relative h-[95vh] flex items-center overflow-hidden border-b border-white/5"
      >
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 z-0">
          <video
            src={HERO_VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover grayscale opacity-40 contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-zinc-950/80" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            style={{ opacity: heroOpacity }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="font-sans font-bold uppercase text-amber-500 text-xs mb-6 tracking-[0.3em] opacity-80">
              {context.heroTag}
            </div>

            <h1 className="font-sans font-bold text-4xl md:text-7xl lg:text-8xl tracking-tighter leading-[1.1] mb-8 max-w-4xl">
              Fly In. Ride Out. <br />
              <span className="text-zinc-500">Your Machine Awaits.</span>
            </h1>

            <p className="text-zinc-300 text-lg md:text-2xl max-w-2xl mb-12 leading-relaxed font-sans font-medium italic">
              {context.frictionHook}
            </p>

            <div className="flex flex-col md:flex-row items-start gap-8">
              <a
                href="#booking"
                onClick={() => trackClick({ type: "hero_cta_click" })}
                className="bg-amber-500 text-black px-10 py-5 font-mono font-black uppercase tracking-[0.2em] text-xs hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] group flex items-center gap-3"
              >
                Request Logistics Quote{" "}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>

              <div className="flex flex-col border-l border-white/20 pl-6 py-1">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.3em] italic">
                  Operational Entry
                </span>
                <span className="font-mono text-lg text-white font-black italic uppercase tracking-tighter">
                  From €850 • EU Corridor
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. THE ANTI-RENTAL AGITATION */}
      <section className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="font-mono text-amber-500 text-[10px] tracking-[0.4em] uppercase mb-6 italic font-black">
                THE_RENTAL_FRICTION
              </div>

              <h2 className="text-4xl md:text-5xl font-serif font-black italic uppercase text-white mb-8 leading-none">
                Why compromise on a machine that isn't yours?
              </h2>

              {context.frictionHook && (
                <p className="text-amber-500 font-mono text-xs uppercase tracking-widest italic mb-6">
                  {context.frictionHook}
                </p>
              )}

              <p className="text-zinc-300 text-lg leading-relaxed mb-8 italic">
                Airport rentals are the logistics of uncertainty. Unknown service history, wrong ergonomics, and the
                constant anxiety of €2000+ deposit locks.
              </p>

              <div className="p-6 border border-amber-500/30 bg-amber-500/5 rounded-sm">
                <span className="font-mono text-xs font-black uppercase italic tracking-widest text-amber-500 flex items-center gap-2 mb-2">
                  <Zap size={14} /> The Break-Even Winner
                </span>
                <p className="text-sm text-zinc-200 italic">
                  For routes of 4+ days, MotoAirlift beats premium rental costs while delivering a 100% familiar setup.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {[
                {
                  t: "Zero Damage Anxiety",
                  d: "No predatory rental scratch disputes. It's your bike.",
                  icon: ShieldCheck,
                },
                {
                  t: "Your Setup",
                  d: "Your custom saddle. Your GPS. Your luggage system.",
                  icon: Bike,
                },
                {
                  t: "No Deposit Locks",
                  d: "Bypass the €2500 credit card holds at airport desks.",
                  icon: ShieldCheck,
                },
                {
                  t: "Immediate Insertion",
                  d: "10 mins from gate to gear. No queues. No upsells.",
                  icon: Clock,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-8 border border-white/10 bg-zinc-900/30 rounded-sm hover:border-amber-500/30 transition-colors group"
                >
                  <item.icon
                    className="text-amber-500 mb-6 group-hover:scale-110 transition-transform"
                    size={24}
                  />
                  <h3 className="font-mono text-[11px] font-black uppercase tracking-widest italic text-white mb-2">
                    {item.t}
                  </h3>
                  <p className="text-xs text-zinc-400 italic leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE: EUROPEAN TRANSPORT NETWORK */}
      <motion.section
        onViewportEnter={() => trackClick({ type: "corridor_section_view" })}
        className="py-24 bg-zinc-950 border-y border-white/5 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="font-mono text-amber-500 text-[10px] tracking-[0.5em] uppercase mb-4 italic flex items-center gap-3 font-black">
              <Globe size={14} /> GLOBAL TRANSPORT NETWORK
            </div>

            <h2 className="text-4xl md:text-5xl font-serif font-black italic uppercase text-white mb-6 leading-none">
              Seamless logistics <br /> through certified partners.
            </h2>

            <p className="text-zinc-300 italic text-lg leading-relaxed mb-8">
              We orchestrate the logistics so you don't have to. Our platform connects you with trusted transport pros
              running specialized vans and trailers every week. We handle the coordination across our core hubs
              so you can just fly in and ride.
            </p>
          </div>

          <div className="relative aspect-video bg-zinc-900/20 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl group">
            <video
              src={NETWORK_VIDEO_URL}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover grayscale opacity-50 contrast-[1.1] transition-transform duration-[2s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />

            <div className="absolute bottom-8 right-8 text-[9px] font-mono text-zinc-300 uppercase tracking-widest italic font-black opacity-80">
              LOGISTICS_OPERATIONS_v5.2
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          </div>
        </div>
      </motion.section>

      {/* 3. THE INSERTION PROCESS (SCROLL-PINNED) */}
      <section ref={scrollRef} className="relative h-[300vh] bg-zinc-950">
        <div className="sticky top-0 relative h-screen w-full flex flex-col md:flex-row overflow-hidden">
          <div className="md:w-1/2 relative h-full flex flex-col justify-center px-12 md:px-24">
            <motion.div style={{ opacity: step1Opacity }} className="absolute inset-x-0 px-12 md:px-24 space-y-6">
              <span className="font-mono text-amber-500 text-[11px] tracking-[0.4em] uppercase italic font-black">
                [ PHASE_01: HUB LOGISTICS ]
              </span>
              <h3 className="text-5xl font-serif font-black italic uppercase text-white leading-none">
                Depot <br /> Drop-off
              </h3>
              <p className="text-zinc-300 text-lg italic leading-relaxed max-w-md">
                Drop your machine at your local hub. We perform a 50-point digital condition report and load it into our
                enclosed, race-spec transporters.
              </p>
            </motion.div>

            <motion.div style={{ opacity: step2Opacity }} className="absolute inset-x-0 px-12 md:px-24 space-y-6">
              <span className="font-mono text-amber-500 text-[11px] tracking-[0.4em] uppercase italic font-black">
                [ PHASE_02: SECURE_TRANSIT ]
              </span>
              <h3 className="text-5xl font-serif font-black italic uppercase text-white leading-none">
                Insured <br /> Transit
              </h3>
              <p className="text-zinc-300 text-lg italic leading-relaxed max-w-md">
                Fully tracked, climate-controlled movement across borders. Your bike is high-value cargo, monitored 24/7
                via GPS till it reaches the staging node.
              </p>
            </motion.div>

            <motion.div style={{ opacity: step3Opacity }} className="absolute inset-x-0 px-12 md:px-24 space-y-6">
              <span className="font-mono text-amber-500 text-[11px] tracking-[0.4em] uppercase italic font-black">
                [ PHASE_03: ARRIVAL_HANDOVER ]
              </span>
              <h3 className="text-5xl font-serif font-black italic uppercase text-white leading-none">
                Airport <br /> Handover
              </h3>
              <p className="text-zinc-300 text-lg italic leading-relaxed max-w-md">
                You land. A 10-minute transfer takes you to our corridor node. Your bike is prepped, clean, and waiting.
                Ride directly onto the route.
              </p>
            </motion.div>
          </div>

          <div className="hidden md:block md:w-1/2 relative h-full bg-zinc-900">
            <img
              src="https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=2000"
              className="w-full h-full object-cover grayscale brightness-50"
              alt="Logistics Operations"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-zinc-950/20 to-zinc-950" />
            <div className="absolute bottom-12 left-12 flex items-center gap-4 text-zinc-400">
              <div className="w-12 h-px bg-zinc-600" />
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] italic font-black">
                LOGISTICS_GRID_v5.0
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE BOOKING / QUOTE FORM */}
      <section id="booking">
        <MotoAirliftBookingForm />
      </section>
    </div>
  );
}
