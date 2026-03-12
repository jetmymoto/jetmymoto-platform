import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bike,
  Car,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ChevronDown,
  Shield,
  Clock,
  MapPin,
  ArrowRight,
  Hotel,
  Target,
  PlaneTakeoff,
  PlaneLanding,
  Map,
  PhoneCall,
  Luggage,
  TrainFront,
  Navigation,
  Activity,
} from "lucide-react";

const LINKS = {
  shipBikeQuote: (airportCode) => `/moto-airlift/${airportCode.toLowerCase()}`,
  shipGTQuote: (airportCode) => `/moto-airlift/${airportCode.toLowerCase()}`,
  rentalGuide: (airport) => `/guides/rental-tips-${airport.toLowerCase()}`,
};



/** -----------------------------
 * UI COMPONENTS
 * ----------------------------- */

function ActionRail({ airport, intent }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      <div
        className={`hidden md:flex fixed top-0 z-[100] w-full h-16 items-center px-8 transition-all duration-300 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-mono font-black tracking-[0.3em] text-white/70 uppercase italic">
              {airport}_INTERCEPT_ACTIVE
            </span>
          </div>
          <div className="flex gap-6 items-center">
            {intent === "moto" ? (
              <a
                href={LINKS.shipBikeQuote(airport)}
                className="text-[10px] font-mono font-black tracking-[0.2em] text-amber-500 hover:text-white uppercase italic transition-colors"
              >
                Ship_My_Bike
              </a>
            ) : (
              <a
                href={LINKS.shipGTQuote(airport)}
                className="text-[10px] font-mono font-black tracking-[0.2em] text-amber-500 hover:text-white uppercase italic transition-colors"
              >
                Ship_My_GT
              </a>
            )}
            <a
              href="#recovery"
              className="text-[10px] font-mono font-black tracking-[0.2em] text-zinc-400 hover:text-white uppercase italic transition-colors"
            >
              Recovery
            </a>
            <a
              href="#utilities"
              className="text-[10px] font-mono font-black tracking-[0.2em] text-zinc-400 hover:text-white uppercase italic transition-colors"
            >
              Tactical
            </a>
            <div className="h-4 w-px bg-white/10 mx-2"></div>
            <a
              href="#ranking"
              className="text-[10px] font-mono font-black tracking-[0.2em] text-zinc-400 hover:text-white uppercase italic transition-colors"
            >
              Rankings
            </a>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex justify-between gap-2 safe-area-bottom">
        <a
          href="#ranking"
          className="flex-1 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-[9px] font-mono font-black uppercase italic tracking-widest text-white text-center flex flex-col items-center justify-center gap-1"
        >
          <Car size={14} /> Rankings
        </a>
        <a
          href={intent === "moto" ? LINKS.shipBikeQuote(airport) : LINKS.shipGTQuote(airport)}
          className="flex-1 py-3 bg-amber-500 rounded-xl text-[9px] font-mono font-black uppercase italic tracking-widest text-black text-center flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
        >
          <Zap size={14} /> Request Quote
        </a>
        <a
          href="#utilities"
          className="flex-1 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-[9px] font-mono font-black uppercase italic tracking-widest text-white text-center flex flex-col items-center justify-center gap-1"
        >
          <Target size={14} /> Tactical
        </a>
      </div>
    </>
  );
}

function SectionIndex() {
  const sections = [
    { name: "Control", id: "control" },
    { name: "Ranking", id: "ranking" },
    { name: "Reality", id: "reality" },
    { name: "Pivot", id: "pivot" },
    { name: "Recovery", id: "recovery" },
    { name: "Utilities", id: "utilities" },
    { name: "Extension", id: "extension" },
  ];
  return (
    <div className="max-w-7xl mx-auto px-6 hidden md:block border-b border-white/5">
      <div className="flex gap-8 py-4 overflow-x-auto no-scrollbar">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-amber-500 transition-colors whitespace-nowrap italic"
          >
            / {s.name}
          </a>
        ))}
      </div>
    </div>
  );
}

import ControlPanel from "./sections/ControlPanel";

function RecoverySection({ data }) {
  return (
    <section id="recovery" className="py-24 bg-black border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="mb-12">
          <div className="text-amber-500 font-mono text-[11px] font-black tracking-[0.5em] uppercase italic mb-4">
            ARRIVAL_RECOVERY_PROTOCOL
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-black italic uppercase text-white leading-none">
            The First Night <br />
            <span className="text-zinc-500 text-3xl md:text-4xl">
              Staging & Gear Check
            </span>
          </h2>
          <p className="text-zinc-400 italic mt-6 max-w-xl">
            Your first night isn't tourism—it's recovery. Sleep near the
            corridor. Don't burn day one in city transfers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="group bg-gradient-to-br from-zinc-900 to-black border border-amber-500/20 p-8 rounded-[2rem] hover:border-amber-500/50 transition-all shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <Hotel className="text-amber-500" size={24} />
              </div>
              <div className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Official Stay Partner
              </div>
            </div>
            <h3 className="text-2xl font-black italic uppercase text-white mb-2">
              {data.premium.name}
            </h3>
            <div className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-6 italic">
              {data.premium.location}
            </div>
            <div className="space-y-3 mb-8">
              {data.premium.features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm italic text-zinc-300"
                >
                  <CheckCircle2 size={14} className="text-amber-500" /> {f}
                </div>
              ))}
            </div>
            <a
              href={data.premium.href}
              className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 text-black font-mono font-black uppercase italic tracking-widest text-xs rounded-xl hover:bg-amber-400 transition-all shadow-lg"
            >
              Reserve Preferred Rate <ArrowRight size={14} />
            </a>
          </div>

          <div className="group bg-zinc-950/50 border border-white/10 p-8 rounded-[2rem] hover:bg-zinc-900/50 transition-all">
            <div className="p-3 bg-zinc-800 rounded-2xl border border-white/10 mb-8 w-fit">
              <Hotel className="text-zinc-500" size={24} />
            </div>
            <h3 className="text-2xl font-black italic uppercase text-white mb-2">
              {data.budget.name}
            </h3>
            <div className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-6 italic">
              {data.budget.location}
            </div>
            <div className="space-y-3 mb-8">
              {data.budget.features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm italic text-zinc-400"
                >
                  <CheckCircle2 size={14} className="text-zinc-600" /> {f}
                </div>
              ))}
            </div>
            <a
              href={data.budget.href}
              className="w-full flex items-center justify-center gap-2 py-4 border border-white/20 text-white font-mono font-black uppercase italic tracking-widest text-xs rounded-xl hover:border-amber-500 transition-all"
            >
              Compare Smart Rates <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function UtilitySection({ data }) {
  return (
    <section id="utilities" className="py-24 bg-[#050505] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-amber-500 font-mono text-[10px] font-black tracking-[0.4em] uppercase italic mb-4">
            TACTICAL_SETUP_KIT
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-black italic uppercase text-white">
            Before You Land
          </h2>
          <p className="text-zinc-500 italic mt-4">
            Essential mission utilities. Think operationally.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(data ?? []).map((tool, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 bg-zinc-900/30 border border-white/5 rounded-[2rem] hover:border-amber-500/30 transition-all flex flex-col items-center text-center group"
            >
              <div className="mb-6 p-4 bg-white/5 rounded-2xl group-hover:bg-amber-500/10 transition-colors">
                <tool.icon
                  className="text-zinc-500 group-hover:text-amber-500 transition-colors"
                  size={28}
                />
              </div>
              <h3 className="text-xl font-black italic uppercase text-white">
                {tool.title}
              </h3>
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-500/60 mb-4">
                {tool.sub}
              </div>
              <p className="text-sm text-zinc-400 italic mb-8 flex-1 leading-relaxed">
                {tool.desc}
              </p>
              <a
                href={tool.href}
                className="w-full py-3 bg-zinc-950 border border-white/10 rounded-xl font-mono font-black uppercase italic tracking-widest text-[11px] hover:border-amber-500 hover:text-amber-500 transition-all"
              >
                {tool.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CityExtensionSection({ data }) {
  if (!data?.enabled) return null;

  return (
    <section
      id="extension"
      className="py-24 bg-black border-t border-white/5 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="mb-16">
          <div className="text-amber-500 font-mono text-[10px] font-black tracking-[0.5em] uppercase italic mb-4">
            MISSION_EXTENSION_NODE
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-black italic uppercase text-white leading-none mb-4">
            {data.headline}
          </h2>
          <p className="text-zinc-500 italic text-lg">{data.subline}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {data.items.map((item, i) => (
            <div
              key={i}
              className="group flex flex-col p-8 rounded-[2rem] border border-white/5 bg-zinc-950/40 hover:bg-zinc-900/40 hover:border-amber-500/30 transition-all duration-300"
            >
              <div className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-500/60 mb-6 bg-amber-500/5 px-3 py-1 rounded-full w-fit border border-amber-500/10">
                {item.category}
              </div>
              <h3 className="text-2xl font-black italic uppercase text-white mb-4 leading-tight group-hover:text-amber-100 transition-colors">
                {item.title}
              </h3>
              <p className="text-zinc-400 italic text-sm leading-relaxed mb-6">
                {item.description}
              </p>
              <div className="flex-1 border-t border-white/5 pt-6 mt-auto">
                <div className="flex items-center gap-2 mb-8">
                  <Activity size={12} className="text-amber-500" />
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500">
                    Performance Analysis
                  </span>
                </div>
                <p className="text-xs text-zinc-500 italic leading-relaxed mb-8">
                  {item.performanceAngle}
                </p>
                <a
                  href={item.ctaLink}
                  className="inline-flex items-center gap-3 text-amber-500 font-mono font-black uppercase italic tracking-[0.25em] text-[10px] group-hover:translate-x-2 transition-transform"
                >
                  {item.ctaLabel} <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntentToggle({ intent, setIntent }) {
  return (
    <div className="inline-flex p-1 bg-zinc-950/80 border border-white/10 rounded-2xl backdrop-blur-md shadow-inner">
      <button
        onClick={() => setIntent("moto")}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-xs font-black uppercase italic tracking-widest relative overflow-hidden ${
          intent === "moto"
            ? "bg-amber-500 text-black shadow-md"
            : "text-zinc-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <Bike size={16} /> Motorcycle
      </button>
      <button
        onClick={() => setIntent("car")}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-xs font-black uppercase italic tracking-widest relative overflow-hidden ${
          intent === "car"
            ? "bg-amber-500 text-black shadow-md"
            : "text-zinc-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <Car size={16} /> Car
      </button>
    </div>
  );
}

function VerdictCard({ intent, rankingData }) {
  const isMoto = intent === "moto";
  const data = isMoto ? rankingData.moto?.[0] : rankingData.car?.[0];
  if (!data) return null;

  return (
    <motion.div
      layout
      className="bg-gradient-to-br from-zinc-900/90 via-black/80 to-black/90 border border-amber-500/30 p-8 rounded-3xl relative overflow-hidden shadow-2xl backdrop-blur-xl group"
    >
      <div className="relative z-10">
        <div className="text-amber-500 font-mono text-[10px] font-black tracking-[0.4em] uppercase mb-5 italic flex items-center gap-2">
          <Zap size={14} className="animate-pulse" /> Editor’s Verdict
        </div>
        <h3 className="text-3xl md:text-4xl font-serif text-white font-black italic uppercase leading-none mb-5">
          {data.title}
        </h3>
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-5xl font-black text-white italic tracking-tighter">
            {data.price}
          </span>
          <span className="text-sm font-mono text-zinc-400 uppercase tracking-widest">
            {data.priceDetail}
          </span>
        </div>
        <div className="text-[10px] font-mono text-zinc-500 uppercase italic mb-6">
          {data.access}
        </div>
        <ul className="space-y-3 text-sm text-zinc-300 italic mb-8">
          {(data.features || []).map((x, i) => (
            <li key={i} className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-amber-500 shrink-0" /> {x}
            </li>
          ))}
        </ul>
        <a
          href={data.href}
          className="w-full block text-center py-4 bg-amber-500 text-black font-mono font-black tracking-[0.2em] uppercase italic text-xs hover:bg-amber-400 transition-all rounded-xl shadow-lg"
        >
          {data.cta}
        </a>
      </div>
    </motion.div>
  );
}

function RankingCards({ items }) {
  return (
    <div className="grid gap-6">
      {items.map((item) => (
        <motion.div
          key={item.rank}
          className={`rounded-3xl border p-6 md:p-8 bg-zinc-950/60 backdrop-blur-md transition-all group ${
            item.winner ? "border-amber-500/40 shadow-xl" : "border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex gap-6 items-start">
              <div
                className={`text-3xl font-black italic flex flex-col items-center justify-center w-12 shrink-0 ${
                  item.winner ? "text-amber-500" : "text-zinc-700"
                }`}
              >
                0{item.rank}
              </div>
              <div>
                <div className="text-xl font-black italic uppercase text-white group-hover:text-amber-100 transition-colors">
                  {item.title}
                </div>
                <div className="text-sm text-zinc-400 italic mt-2 max-w-2xl leading-relaxed">
                  {item.sub}
                </div>
                <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500 italic flex items-center gap-2">
                  <MapPin size={10} /> {item.access}
                </div>
              </div>
            </div>
            <div className="md:text-right flex md:flex-col items-center md:items-end justify-between gap-6 shrink-0">
              <div>
                <div className="text-amber-300 font-black italic text-2xl">
                  {item.price}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic mt-1">
                  {item.priceDetail}
                </div>
              </div>
              <a
                href={item.href}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-[11px] font-mono font-black italic uppercase tracking-widest transition-all ${
                  item.winner
                    ? "bg-amber-500 text-black border-transparent"
                    : "border-white/20 text-white"
                }`}
              >
                {item.cta} <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PainPointsSection({ airport }) {
  const points = [
    {
      icon: Clock,
      t: "Shuttle Lag & Queues",
      d: "Off-site budget brands can add 45–90 mins. Terminal desks have peak season queues.",
    },
    {
      icon: Shield,
      t: "Insurance Pressure",
      d: "Desk agents are incentivized to upsell. Know your coverage before you land.",
    },
    {
      icon: AlertTriangle,
      t: "Scratch & Damage Risk",
      d: "Tight Riviera parking + chaotic traffic = high risk of minor damage disputes.",
    },
  ];
  return (
    <section
      id="reality"
      className="py-20 bg-[#070707] border-b border-white/5 relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="p-10 border border-white/10 bg-black/60 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-black italic uppercase text-white">
              The Reality of Renting at {airport}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {points.map((x, i) => (
              <div
                key={i}
                className="border border-white/10 bg-white/5 p-6 rounded-2xl group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <x.icon
                    size={20}
                    className="text-zinc-400 group-hover:text-amber-500 transition-colors"
                  />
                  <div className="text-lg font-black italic uppercase text-white group-hover:text-amber-100 transition-colors">
                    {x.t}
                  </div>
                </div>
                <div className="text-sm text-zinc-400 italic leading-relaxed">
                  {x.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PivotSection({ airport }) {
  return (
    <section
      id="pivot"
      className="py-24 bg-black border-t border-white/5 relative overflow-hidden text-center md:text-left"
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="rounded-[3rem] border border-amber-500/20 bg-gradient-to-br from-zinc-900/80 via-black/90 to-black p-10 md:p-20 backdrop-blur-2xl">
          <h2 className="text-4xl md:text-6xl font-serif font-black italic uppercase text-white leading-[0.9] mb-12">
            Enthusiast Mode: <br />{" "}
            <span className="text-amber-500">Bring Your Own.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <a
              href={LINKS.shipGTQuote(airport)}
              className="group p-8 rounded-3xl border border-white/10 bg-white/5 hover:border-amber-500/40 transition-all text-left"
            >
              <Car
                size={32}
                className="text-zinc-500 group-hover:text-amber-500 transition-colors mb-6"
              />
              <div className="text-2xl font-black italic uppercase text-white mb-3">
                Ship your GT
              </div>
              <p className="text-zinc-400 italic mb-8 text-sm leading-relaxed">
                Enclosed, insured transport. Arrive & drive. From €1200.
              </p>
              <div className="inline-flex items-center gap-3 text-amber-500 font-mono font-black uppercase italic tracking-[0.25em] text-xs group-hover:translate-x-2 transition-transform">
                Get quote <ArrowRight size={16} />
              </div>
            </a>
            <a
              href={LINKS.shipBikeQuote(airport)}
              className="group p-8 rounded-3xl border border-white/10 bg-white/5 hover:border-amber-500/40 transition-all text-left"
            >
              <Bike
                size={32}
                className="text-zinc-500 group-hover:text-amber-500 transition-colors mb-6"
              />
              <div className="text-2xl font-black italic uppercase text-white mb-3">
                Ship your bike
              </div>
              <p className="text-zinc-400 italic mb-8 text-sm leading-relaxed">
                Fly-in, ride-out logistics. Your setup. From €850.
              </p>
              <div className="inline-flex items-center gap-3 text-amber-500 font-mono font-black uppercase italic tracking-[0.25em] text-xs group-hover:translate-x-2 transition-transform">
                Get quote <ArrowRight size={16} />
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** -----------------------------
 * MAIN COMPONENT
 * ----------------------------- */

export default function AirportTemplate({
  airport,
  keywords,
  routes,
  hotels,
  intent,
  setIntent
}) {
  // ✅ hard safety to prevent white screen
  if (!airport) {
    return <div className="p-20 text-white">Loading airport...</div>;
  }

  // ✅ normalize + default all nested fields used by UI
  const a = {
    code: airport.code ?? "UNK",
    name: airport.name ?? "Unknown Airport",
    city: airport.city ?? "",
    country: airport.country ?? "",
    region: airport.region ?? "",
    staging: airport.staging ?? "",
    motto: airport.motto ?? "",

    seasonality: {
      peak: airport.seasonality?.peak ?? "",
      risk: airport.seasonality?.risk ?? "",
      status: airport.seasonality?.status ?? "",
    },

    hero: {
      videoUrl: airport.hero?.videoUrl ?? "",
      posterUrl: airport.hero?.posterUrl ?? "",
    },

    controlPanel: Array.isArray(airport.controlPanel)
      ? airport.controlPanel
      : [],

    recovery: {
      premium: {
        name: airport.recovery?.premium?.name ?? "",
        location: airport.recovery?.premium?.location ?? "",
        href: airport.recovery?.premium?.href ?? "#",
        features: Array.isArray(airport.recovery?.premium?.features)
          ? airport.recovery.premium.features
          : [],
      },
      budget: {
        name: airport.recovery?.budget?.name ?? "",
        location: airport.recovery?.budget?.location ?? "",
        href: airport.recovery?.budget?.href ?? "#",
        features: Array.isArray(airport.recovery?.budget?.features)
          ? airport.recovery.budget.features
          : [],
      },
    },

    utilities: Array.isArray(airport.utilities)
      ? airport.utilities
      : [],

    cityExtension: airport.cityExtension?.enabled
      ? airport.cityExtension
      : {
          enabled: false,
          headline: "",
          subline: "",
          items: [],
        },

    rankings: airport.rankings ?? null,
  };



  useEffect(() => {
    console.log("AIRPORT:", a);
    console.log("RAW airport:", airport);
    console.log("NORMALIZED a:", a);
    console.log("CONTROL PANEL:", a.controlPanel);
    console.log("UTILITIES:", a.utilities);
    console.log("CITY EXT:", a.cityExtension);
  }, [airport, a]);



  // allow future override via a.rankings; fallback to defaults
  const defaultRankingData = useMemo(
    () => ({
      moto: [
        {
          rank: "1",
          winner: true,
          title: "JetMyMoto MotoAirlift",
          price: "From €850",
          priceDetail: "round trip",
          bestFor: "Passionate Missions (4+ days)",
          sub: "Your own bike, received, prepped, and staged at our Riviera depot. Fly in, ride out.",
          access: "Handover corridor: 12 min",
          type: "internal",
          href: LINKS.shipBikeQuote(a.code),
          cta: "Request Logistics Quote",
          features: ["Your own bike", "No deposit lock", "Prepped & ready"],
        },
        {
          rank: "2",
          winner: false,
          title: "Premium Motorcycle Rental",
          price: "€190",
          priceDetail: "/ day (avg)",
          bestFor: "Premium Comfort (2–3 days)",
          sub: "Late model GS / Multistrada. High daily rates + significant deposit locks.",
          access: "Terminal desk: 5 min",
          type: "internal",
          href: "#",
          cta: "Notify When Live",
          features: ["Recent models", "Airport pickup", "High deposit"],
        },
      ],
      car: [
        {
          rank: "1",
          winner: true,
          title: "Sixt Premium (T1 & T2)",
          price: "From €115",
          priceDetail: "/ day (avg)",
          bestFor: "Premium comfort & speed",
          sub: "Most consistent premium fleet at Terminal 1 & 2 (BMW/Audi). Fast track available.",
          access: "Terminal desk: 3 min",
          type: "affiliate",
          href: "https://www.sixt.com/car-rental/france/nice/nice-cote-dazur-airport/",
          cta: "Check Sixt deals",
          features: ["Terminal desk", "Premium fleet", "Fast check-in"],
        },
        {
          rank: "2",
          winner: false,
          title: "Europcar / Hertz",
          price: "€85",
          priceDetail: "/ day (avg)",
          bestFor: "Reliable mid-range",
          sub: "Large inventory. Expect queues in peak season. Standard fleet specs.",
          access: "Terminal desk: 15 min queue risk",
          type: "internal",
          href: "#",
          cta: "Request Partner Quote",
          features: ["Large fleet", "Terminal desk", "Peak queues"],
        },
      ],
    }),
    [a.code]
  );

  const rankingData = a.rankings || defaultRankingData;

  const items = useMemo(() => rankingData[intent] || [], [rankingData, intent]);

  const moneyCTA = useMemo(() => {
    return intent === "moto"
      ? { label: "Request Logistics Quote", href: LINKS.shipBikeQuote(a.code) }
      : { label: "Ship Your GT Quote", href: LINKS.shipGTQuote(a.code) };
  }, [intent, a.code]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500 selection:text-black font-sans overflow-x-hidden pb-24 md:pb-0">
      <ActionRail airport={a.code} intent={intent} />

      {/* --- HERO --- */}
      <section className="relative min-h-[95vh] flex flex-col border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            className="absolute inset-0 w-full h-full object-cover scale-105"
            autoPlay
            muted
            loop
            playsInline
            poster={a.hero.posterUrl || undefined}
            style={{ filter: "brightness(0.5) contrast(1.1)" }}
          >
            {a.hero.videoUrl ? <source src={a.hero.videoUrl} type="video/mp4" /> : null}
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        </div>

        <div className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto px-6 pt-32 pb-20 grid lg:grid-cols-[1.4fr_1fr] gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <nav className="text-xs text-zinc-500 mb-6 font-mono uppercase tracking-widest">
              <Link to="/airports" className="hover:text-white transition-colors">Airports</Link>
              {" / "}
              <Link to={`/airports/${a.continent}`} className="hover:text-white transition-colors">
                {a.continent}
              </Link>
              {" / "}
              <Link to={`/airports/country/${a.country?.toLowerCase()}`} className="hover:text-white transition-colors">
                {a.country}
              </Link>
              {" / "}
              <span className="text-white">{a.code}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                <MapPin size={14} className="text-amber-500" />
                <span className="text-[10px] font-mono font-black tracking-[0.35em] text-white/90 uppercase italic">
                  AIRPORT INTERCEPTOR • {a.code}
                </span>
              </div>

              {(a.seasonality.peak || a.seasonality.risk) && (
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full backdrop-blur-md">
                  <Clock size={14} className="text-amber-500" />
                  <span className="text-[10px] font-mono font-black tracking-[0.2em] text-amber-500 uppercase italic">
                    Peak: {a.seasonality.peak} {a.seasonality.risk ? `/ ${a.seasonality.risk}` : ""}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-6xl md:text-8xl font-serif font-black italic uppercase leading-[0.85] tracking-[-0.03em] text-white mb-6">
              {a.name} Arrival OS.
            </h1>
            <p className="text-xl text-zinc-200/90 italic max-w-xl leading-relaxed mb-10">
              {a.motto}
            </p>

            <div className="mb-12">
              <IntentToggle intent={intent} setIntent={setIntent} />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <a
                href={moneyCTA.href}
                className="px-10 py-5 rounded-2xl bg-amber-500 text-black font-mono font-black uppercase italic tracking-widest text-sm hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.4)] hover:-translate-y-1"
              >
                {moneyCTA.label} <ArrowRight size={18} className="inline ml-2" />
              </a>
              <a
                href="#ranking"
                className="px-8 py-5 rounded-2xl border-2 border-white/10 bg-black/30 font-mono font-black uppercase italic tracking-widest text-xs hover:border-white/30 transition-all backdrop-blur-md"
              >
                View Ranking <ChevronDown size={16} className="inline ml-2" />
              </a>
            </div>
          </motion.div>

          <div className="lg:sticky lg:top-32">
            <VerdictCard intent={intent} rankingData={rankingData} />
          </div>
        </div>

        <SectionIndex />
      </section>

      {/* --- CONTROL PANEL --- */}
      <ControlPanel data={a.controlPanel} airportName={a.name} />

      {/* --- RANKING --- */}
      <section id="ranking" className="py-24 bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-5xl md:text-7xl font-serif font-black italic uppercase leading-[0.9] text-white">
              Top Options Ranked
            </h2>
          </div>
          <RankingCards items={items} />
        </div>
      </section>

      <PainPointsSection airport={a.code} />
      <PivotSection airport={a.code} />
      <RecoverySection data={a.recovery} />
      <UtilitySection data={a.utilities} />
      <CityExtensionSection data={a.cityExtension} />

      {/* --- FOOTER --- */}
      <footer className="py-20 bg-black border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-amber-500 font-mono text-[10px] font-black tracking-[0.4em] uppercase mb-8 italic flex items-center justify-center gap-2 underline">
            <MapPin size={12} /> Regional Nodes: GVA | NCE | MRS | BCN | MUC
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-600 text-[10px] font-mono italic uppercase tracking-widest">
            <div>© 2025 JetMyMoto Ops. Precision Handover Infrastructure.</div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Tactical_Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact_Command
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}