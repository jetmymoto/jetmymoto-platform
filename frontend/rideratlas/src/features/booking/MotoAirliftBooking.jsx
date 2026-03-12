// src/features/booking/MotoAirliftBooking.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom"; // <-- CORRECT HOOK
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

/**
 * JetMyMoto — Booking Page (Full)
 * - Hardened against render crashes by using useSearchParams and optional chaining.
 * - Corrected component name to match filename.
 */

const HERO_VIDEO_URL =
  "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_videos%2FCopy%20of%20H1%20booking%20background%200.3%20mun-28_02_2026%2C%2017_42.mp4?alt=media&token=fd0ed8a2-6399-44b2-99ed-8dcf88440967";

const NETWORK_VIDEO_URL =
  "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_videos%2FCinematic_Logistics_Warehouse_Video.mp4?alt=media&token=bb9855f8-1edd-4e95-b50e-a944d1d12934";

const HUBS = [
  { id: "MUC", name: "MUNICH (MUC)" },
  { id: "MXP", name: "MILAN (MXP)" },
  { id: "NCE", name: "NICE (NCE)" },
  { id: "GVA", name: "GENEVA (GVA)" },
  { id: "DBV", name: "DUBROVNIK (DBV)" },
  { id: "RJK", name: "RIJEKA (RJK)" },
  { id: "AGP", name: "MALAGA (AGP)" },
];

const PICKUP_LOCATIONS = {
  Germany: ["Munich", "Berlin", "Hamburg", "Frankfurt", "Stuttgart"],
  France: ["Nice", "Paris", "Lyon", "Marseille", "Toulouse"],
  Switzerland: ["Geneva", "Zurich", "Basel"],
  Spain: ["Barcelona", "Malaga", "Madrid", "Valencia"],
  Italy: ["Milan", "Rome", "Turin"],
  Austria: ["Vienna", "Salzburg"],
  Portugal: ["Lisbon", "Porto"],
};

const HUB_CONTEXT = {
  NCE: {
    heroTag: "CÔTE D’AZUR DEPLOYMENT NODE",
    frictionHook: "Landing in Nice means immediate access to Alpine passes and Riviera coastal runs.",
    bookingTag: "Optimized for Mediterranean corridor staging."
  },
  MUC: {
    heroTag: "ALPINE DEPLOYMENT CORRIDOR",
    frictionHook: "Munich arrivals unlock direct access to the Austrian and Italian high passes.",
    bookingTag: "Primary Alpine logistics entry node."
  },
  MXP: {
    heroTag: "ITALIAN LAKES CORRIDOR",
    frictionHook: "Milan staging gives you direct access to Stelvio, Como, and Swiss transitions.",
    bookingTag: "Northern Italy precision logistics corridor."
  }
};

const DEFAULT_CONTEXT = {
  heroTag: "MotoAirlift™",
  frictionHook: "Bypass the highway slog and the rental desk. We stage your motorcycle at the destination corridor.",
  bookingTag: "Initiate hub logistics to secure your transport plan."
};

const trackClick = (evt) => {
  console.log("[TELEMETRY]", { ...evt, ts: new Date().toISOString() });
};


// CORRECTED: Component name matches file name
export default function MotoAirliftBooking() {
  const [searchParams] = useSearchParams(); // <-- SAFE way to get search params

  const [submitted, setSubmitted] = useState(false);
  const [shareStatus, setShareStatus] = useState("idle");
  const [currentUrl, setCurrentUrl] = useState("");
  const [formData, setFormData] = useState({
    pickupCountry: "",
    pickupCity: "",
    hub: "",
    arrivalDate: "",
    bikeModel: "",
    quantity: 1,
    contact: "",
  });

  // SSR safe URL capture + hub injection from search params
  useEffect(() => {
    if (typeof window === "undefined") return;

    setCurrentUrl(window.location.href);

    const injectedHubParam = (searchParams.get("hub") || "").toUpperCase().trim();
    const isValidHub = HUBS.some((h) => h.id === injectedHubParam);

    if (isValidHub) {
      setFormData((prev) => ({ ...prev, hub: injectedHubParam }));
      trackClick({ type: "hub_injected", hub: injectedHubParam });
    }
  }, [searchParams]);

  const hubName = useMemo(() => {
    const found = HUBS.find((h) => h.id === formData.hub);
    return found?.name || "";
  }, [formData.hub]);

  // HARDENED: Safely access context
  const context = HUB_CONTEXT?.[formData.hub] || DEFAULT_CONTEXT;

  // HARDENED: Safely access pickup locations
  const pickupCities = useMemo(() => {
    return formData.pickupCountry ? PICKUP_LOCATIONS?.[formData.pickupCountry] || [] : [];
  }, [formData.pickupCountry]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    trackClick({ type: "quote_submit", mode: "bike", ...formData });
    setSubmitted(true);
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
                {hubName ? (
                  <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] italic text-amber-500 font-black">
                    DESTINATION NODE // {hubName}
                  </span>
                ) : null}
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
              <Globe size={14} /> EUROPEAN TRANSPORT NETWORK
            </div>

            <h2 className="text-4xl md:text-5xl font-serif font-black italic uppercase text-white mb-6 leading-none">
              Seamless logistics <br /> through certified partners.
            </h2>

            <p className="text-zinc-300 italic text-lg leading-relaxed mb-8">
              We orchestrate the logistics so you don't have to. Our platform connects you with trusted transport pros
              running specialized vans and trailers every week. We handle the coordination across our core European hubs
              so you can just fly in and ride.
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] tracking-widest text-zinc-400 uppercase font-black italic border-t border-white/20 pt-6">
              {HUBS.map((hub, i) => (
                <span key={hub.id} className="flex items-center gap-2">
                  <span className={i === 0 ? "hidden" : "text-zinc-700"}>//</span>
                  <span className="hover:text-amber-500 transition-colors">{hub.name}</span>
                </span>
              ))}
            </div>
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
      <section id="booking" className="py-32 bg-black border-t border-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-amber-500/60 to-transparent" />

        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-12 flex flex-col items-center">
            <div className="font-mono text-amber-500 text-[11px] tracking-[0.4em] uppercase mb-4 italic font-black">
              {context.bookingTag}
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-black italic uppercase text-white mb-6">
              Secure Your Transport Plan
            </h2>

            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                className="border border-white/20 bg-zinc-950/60 hover:border-amber-500/50 hover:bg-zinc-950 transition-all text-white px-6 py-3 rounded-sm font-mono text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2"
              >
                Send Link to a Friend <ArrowRight size={14} />
              </button>

              <a
                href={mailHref}
                className="text-zinc-400 hover:text-amber-500 transition-colors font-mono text-[10px] uppercase tracking-widest italic font-bold"
              >
                Email Instead
              </a>
            </div>
          </div>

          {/* Premium Trust Bar */}
          <div className="flex justify-center flex-wrap gap-6 md:gap-16 mb-12 text-zinc-400 font-mono text-[10px] uppercase tracking-[0.25em] italic font-bold">
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-amber-500/80" /> €5M Cargo Coverage
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-amber-500/80" /> GPS Tracked
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-amber-500/80" /> EU Border Cleared
            </span>
          </div>

          <motion.div
            whileHover={{ scale: 1.005 }}
            className="bg-gradient-to-b from-zinc-900/60 to-zinc-900/30 backdrop-blur-xl border border-amber-500/30 p-8 md:p-12 rounded-sm shadow-[0_30px_80px_rgba(0,0,0,0.6)] text-left"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="grid md:grid-cols-2 gap-8"
                >
                  {/* Pickup Country */}
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 italic ml-1 font-bold">
                      Pickup Country
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
                      <select
                        required
                        aria-label="Pickup Country"
                        value={formData.pickupCountry}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((p) => ({ ...p, pickupCountry: val, pickupCity: "" }));
                          trackClick({ type: "pickup_country_selected", value: val });
                        }}
                        className="w-full bg-zinc-950 border border-white/20 p-4 pl-12 font-mono text-xs uppercase tracking-widest text-white focus:border-amber-500 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select Country</option>
                        {Object.keys(PICKUP_LOCATIONS).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pickup City */}
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 italic ml-1 font-bold">
                      Pickup City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
                      <select
                        required
                        aria-label="Pickup City"
                        disabled={!formData.pickupCountry}
                        value={formData.pickupCity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((p) => ({ ...p, pickupCity: val }));
                          trackClick({ type: "pickup_city_selected", value: val });
                        }}
                        className={`w-full bg-zinc-950 border p-4 pl-12 font-mono text-xs uppercase tracking-widest outline-none appearance-none cursor-pointer
                          ${
                            !formData.pickupCountry
                              ? "border-white/5 text-zinc-600 cursor-not-allowed"
                              : "border-white/20 text-white focus:border-amber-500"
                          }`}
                      >
                        <option value="">
                          {formData.pickupCountry ? "Select City" : "Select Country First"}
                        </option>
                        {pickupCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-zinc-400">
                      <Info size={12} className="text-amber-500/70" />
                      <span className="font-mono text-[10px] uppercase tracking-widest italic">
                        No address required at this stage.
                      </span>
                    </div>
                  </div>

                  {/* Destination Hub */}
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 italic ml-1 font-bold">
                      Destination Hub
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
                      <select
                        required
                        aria-label="Destination Hub"
                        value={formData.hub}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((p) => ({ ...p, hub: val }));
                          trackClick({ type: "hub_selected", value: val });
                        }}
                        className="w-full bg-zinc-950 border border-white/20 p-4 pl-12 font-mono text-xs uppercase tracking-widest text-white focus:border-amber-500 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select Corridor</option>
                        {HUBS.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Arrival Date */}
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 italic ml-1 font-bold">
                      Arrival Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
                      <input
                        type="date"
                        required
                        aria-label="Arrival Date"
                        value={formData.arrivalDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((p) => ({ ...p, arrivalDate: val }));
                          trackClick({ type: "arrival_date_set", value: val });
                        }}
                        className="w-full bg-zinc-950 border border-white/20 p-4 pl-12 font-mono text-xs uppercase tracking-widest text-white focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Number of Motorcycles */}
                  <div className="space-y-3 md:col-span-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 italic ml-1 font-bold">
                      Number of Motorcycles
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map((q) => (
                        <button
                          type="button"
                          key={q}
                          onClick={() => {
                            setFormData((p) => ({ ...p, quantity: q }));
                            trackClick({ type: "quantity_selected", val: q });
                          }}
                          className={`py-4 border font-mono text-xs uppercase tracking-widest transition-all
                            ${
                              formData.quantity === q
                                ? "border-amber-500 bg-amber-500 text-black font-black"
                                : "border-white/10 bg-zinc-950 text-white hover:border-amber-500/40"
                            }
                          `}
                        >
                          {q === 5 ? "5+" : q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Motorcycle Model(s) */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 italic ml-1 font-bold">
                      Motorcycle Model(s)
                    </label>
                    <div className="relative">
                      <Bike className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
                      <input
                        type="text"
                        required
                        placeholder="E.G. DUCATI MULTISTRADA V4S"
                        value={formData.bikeModel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((p) => ({ ...p, bikeModel: val }));
                        }}
                        className="w-full bg-zinc-950 border border-white/20 p-4 pl-12 font-mono text-xs uppercase tracking-widest text-white placeholder:text-zinc-800 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Contact Intelligence */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 italic ml-1 font-bold">
                      Contact Intelligence
                    </label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
                      <input
                        type="text"
                        required
                        placeholder="OPERATOR EMAIL / PHONE"
                        value={formData.contact}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((p) => ({ ...p, contact: val }));
                        }}
                        className="w-full bg-zinc-950 border border-white/20 p-4 pl-12 font-mono text-xs uppercase tracking-widest text-white placeholder:text-zinc-800 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* MANIFEST SUMMARY BOX */}
                  <div className="md:col-span-2 p-5 border border-amber-500/40 bg-amber-500/5 rounded flex flex-wrap gap-6 justify-between items-center">
                    <div className="flex gap-8">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-black">
                          Inventory
                        </span>
                        <span className="text-[12px] font-mono text-white uppercase font-black tracking-widest italic">
                          {formData.quantity === 5 ? "5+" : formData.quantity}{" "}
                          {formData.quantity === 1 ? "Machine" : "Machines"}
                        </span>
                      </div>

                      <div className="flex flex-col border-l border-white/10 pl-6">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-black">
                          Origin
                        </span>
                        <span className="text-[12px] font-mono text-amber-500 uppercase font-black tracking-widest italic">
                          {formData.pickupCity || "---"}
                        </span>
                      </div>
                    </div>

                    {hubName ? (
                      <div className="flex flex-col md:text-right">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-black">
                          Destination Node
                        </span>
                        <span className="text-[11px] font-mono text-white uppercase font-black tracking-widest italic">
                          {hubName}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 italic text-center mb-4 font-bold">
                      No payment required. Quote confirmation only.
                    </p>

                    <button
                      type="submit"
                      className="w-full bg-amber-500 text-black py-6 font-mono font-black uppercase tracking-[0.3em] text-base hover:bg-amber-400 transition-all flex flex-col items-center justify-center gap-1 shadow-[0_10px_40px_rgba(245,158,11,0.2)]"
                    >
                      <span className="flex items-center gap-3">
                        Secure My Transport Plan <ArrowRight size={20} />
                      </span>

                      {formData.quantity > 1 && (
                        <span className="text-[10px] uppercase tracking-widest italic font-black">
                          Fleet consolidation pricing applied.
                        </span>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center space-y-6"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500 mb-4">
                    <CheckCircle2 size={40} className="text-amber-500" />
                  </div>
                  <h3 className="text-3xl font-serif italic uppercase text-white font-black">Manifest Received</h3>
                  <p className="text-amber-500 font-mono uppercase tracking-[0.3em] text-sm font-black">
                    Logistics Team Responds Within 12 Hours.
                  </p>
                  <p className="text-zinc-300 italic max-w-sm mx-auto">
                    A transport coordinator will reach out via the intelligence provided to finalize corridor logistics.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="mt-8 flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-zinc-500" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 italic font-bold">
              Encrypted Secure Uplink • Verified Logistics Provider
            </span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 bg-zinc-950 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="font-serif italic font-black uppercase text-xl text-white tracking-tighter">JetMyMoto</span>
            <span className="font-mono text-[9px] uppercase tracking-widest italic text-zinc-400">
              Precision Logistics for the Passionate Rider
            </span>
          </div>

          <div className="flex gap-12 font-mono text-[10px] uppercase tracking-widest italic text-zinc-400 font-bold">
            <a href="#" className="hover:text-amber-500 transition-colors">
              Privacy_Protocol
            </a>
            <a href="#" className="hover:text-amber-500 transition-colors">
              Tactical_Terms
            </a>
            <a href="#" className="hover:text-amber-500 transition-colors">
              Support_Ops
            </a>
          </div>

          <div className="text-[10px] font-mono uppercase italic tracking-widest text-zinc-500 font-bold">
            © 2025 JETMYMOTO LOGISTICS. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

      {/* SPACER FOR MOBILE STICKY NAV */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
