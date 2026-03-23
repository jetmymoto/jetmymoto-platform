import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SITE_MEDIA } from "@/config/siteMedia";
import {
  Bike,
  Car,
  CheckCircle2,
  Zap,
  ChevronDown,
  Clock,
  MapPin,
  ArrowRight,
  Target,
  Map,
  PlaneLanding,
  PlaneTakeoff,
  Luggage,
  TrainFront,
  Navigation,
  ExternalLink,
  Globe,
  Hotel,
  Activity,
} from "lucide-react";

const LINKS = {
  shipBikeQuote: () => "/moto-airlift#booking",
  shipGTQuote: () => "/moto-airlift#booking",
};







function ActionRail({ airport, intent }) {
  return (
    <>
      <div
        className="hidden md:flex fixed top-20 z-[90] w-full h-16 items-center px-8 transition-all duration-300 bg-black/40 backdrop-blur-xl border-b border-white/5"
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
                href={LINKS.shipBikeQuote()}
                className="text-[10px] font-mono font-black tracking-[0.2em] text-amber-500 hover:text-white uppercase italic transition-colors"
              >
                Ship_My_Bike
              </a>
            ) : (
              <a
                href={LINKS.shipGTQuote()}
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
          href={intent === "moto" ? LINKS.shipBikeQuote() : LINKS.shipGTQuote()}
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

export default function ArrivalOS({ airport, intent, setIntent, airportRoutes, derivedRegions, derivedCountries, derivedTheater, rankingData }) {
  if (import.meta.env.DEV) {
    console.log("ArrivalOS airport payload:", airport);
  }
  const a = {
    ...airport,
    recovery: airport.recovery || {
      premium: { name: "", location: "", href: "#", features: [] },
      budget: { name: "", location: "", href: "#", features: [] }
    },
    utilities: Array.isArray(airport.utilities) ? airport.utilities : [],
    cityExtension: airport.cityExtension || { enabled: false, headline: "", subline: "", items: [] },
  };
  const moneyCTA = intent === "moto"
    ? { label: "Request Logistics Quote", href: LINKS.shipBikeQuote() }
    : { label: "Ship Your GT Quote", href: LINKS.shipGTQuote() };

  // Phase 3: HUB CONTEXT - Use airport metadata from GRAPH.airports[code]
  const arrivals = a?.arrivalOS?.arrivals ?? [];
  const departures = a?.arrivalOS?.departures ?? [];
  const baggage = a?.arrivalOS?.baggageClaim ?? [];
  const rideshare = a?.arrivalOS?.rideshare ?? [];
  const transport = a?.arrivalOS?.transport ?? [];

  return (
    <div className="relative">
      <ActionRail airport={a.code} intent={intent} />

      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={SITE_MEDIA.EUROPE_PAGE_H1}
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* BREADCRUMBS */}
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

            {/* STATUS PILLS */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                <MapPin size={14} className="text-amber-500" />
                <span className="text-[10px] font-mono font-black tracking-[0.35em] text-white/90 uppercase italic">
                  ARRIVAL HUB • {a.code}
                </span>
              </div>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                <Globe size={14} className="text-amber-500" />
                <span className="text-[10px] font-mono font-black tracking-[0.35em] text-white/90 uppercase italic">
                  PRIMARY THEATER • {derivedTheater}
                </span>
              </div>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                <Map size={14} className="text-amber-500" />
                <span className="text-[10px] font-mono font-black tracking-[0.35em] text-white/90 uppercase italic">
                  ROUTE ACCESS • {airportRoutes?.length || 0} ROUTES
                </span>
              </div>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                <Target size={14} className="text-amber-500" />
                <span className="text-[10px] font-mono font-black tracking-[0.35em] text-white/90 uppercase italic">
                  REGIONS • {derivedRegions?.length || 0}
                </span>
              </div>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                <Globe size={14} className="text-amber-500" />
                <span className="text-[10px] font-mono font-black tracking-[0.35em] text-white/90 uppercase italic">
                  COUNTRIES • {derivedCountries?.length || 0}
                </span>
              </div>
            </div>

            {/* HEADLINE */}
            <h1 className="text-6xl md:text-8xl font-serif font-black italic uppercase leading-[0.85] tracking-[-0.03em] text-white mb-6">
              {a.name} Arrival OS.
            </h1>

            <p className="text-xl text-zinc-200/90 italic max-w-xl leading-relaxed mb-10">
              {a.motto}
            </p>

            {/* INTENT */}
            <div className="mb-12">
              <IntentToggle intent={intent} setIntent={setIntent} />
            </div>

            {/* CTA */}
            <a
              href={moneyCTA.href}
              className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-amber-500 text-black font-mono font-black uppercase italic tracking-widest text-sm hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.4)] hover:-translate-y-1"
            >
              {moneyCTA.label}
              <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>
      </section>

      <SectionIndex />

      {/* ARRIVAL OPERATIONS GRID */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-lg font-mono font-black tracking-widest text-amber-500 uppercase italic mb-2">
            ARRIVAL OPERATIONS
          </h2>
          <div className="w-24 h-px bg-amber-500/50 mb-8" />

          <div className="grid md:grid-cols-5 gap-6">

            {arrivals.length > 0 && (
              <div>
                <h3 className="text-xs font-mono text-zinc-400 uppercase mb-3 flex items-center gap-2">
                  <PlaneLanding size={12} className="text-amber-500" /> Arrivals
                </h3>
                <div className="space-y-2">
                  {arrivals.map((item, i) => (
                    <div key={i} className="group flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/30 transition-all">
                      <span className="text-sm font-black italic uppercase text-zinc-300 group-hover:text-white">
                        {item.label || item}
                      </span>
                      {item.href && (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-zinc-600 group-hover:text-amber-500 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {departures.length > 0 && (
              <div>
                <h3 className="text-xs font-mono text-zinc-400 uppercase mb-3 flex items-center gap-2">
                  <PlaneTakeoff size={12} className="text-amber-500" /> Departures
                </h3>
                <div className="space-y-2">
                  {departures.map((item, i) => (
                    <div key={i} className="group flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/30 transition-all">
                      <span className="text-sm font-black italic uppercase text-zinc-300 group-hover:text-white">
                        {item.label || item}
                      </span>
                      {item.href && (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-zinc-600 group-hover:text-amber-500 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {baggage.length > 0 && (
              <div>
                <h3 className="text-xs font-mono text-zinc-400 uppercase mb-3 flex items-center gap-2">
                  <Luggage size={12} className="text-amber-500" /> Baggage
                </h3>
                <div className="space-y-2">
                  {baggage.map((item, i) => (
                    <div key={i} className="group flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/30 transition-all">
                      <span className="text-sm font-black italic uppercase text-zinc-300 group-hover:text-white">
                        {item.label || item}
                      </span>
                      {item.href && (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-zinc-600 group-hover:text-amber-500 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rideshare.length > 0 && (
              <div>
                <h3 className="text-xs font-mono text-zinc-400 uppercase mb-3 flex items-center gap-2">
                  <Navigation size={12} className="text-amber-500" /> Rideshare
                </h3>
                <div className="space-y-2">
                  {rideshare.map((item, i) => (
                    <div key={i} className="group flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/30 transition-all">
                      <span className="text-sm font-black italic uppercase text-zinc-300 group-hover:text-white">
                        {item.label || item}
                      </span>
                      {item.href && (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-zinc-600 group-hover:text-amber-500 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transport.length > 0 && (
              <div>
                <h3 className="text-xs font-mono text-zinc-400 uppercase mb-3 flex items-center gap-2">
                  <TrainFront size={12} className="text-amber-500" /> Transport
                </h3>
                <div className="space-y-2">
                  {transport.map((item, i) => (
                    <div key={i} className="group flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/30 transition-all">
                      <span className="text-sm font-black italic uppercase text-zinc-300 group-hover:text-white">
                        {item.label || item}
                      </span>
                      {item.href && (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-zinc-600 group-hover:text-amber-500 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </section>
    </div>
  );
}
