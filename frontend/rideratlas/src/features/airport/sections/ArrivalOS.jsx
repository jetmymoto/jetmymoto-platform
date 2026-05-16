import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { SITE_MEDIA } from "@/config/siteMedia";
import { withBrandContext } from "@/utils/navigationTargets";
import { useAssetLibrary } from "@/hooks/useAssetLibrary";
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

function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─── Sticky Nav Rail ─────────────────────────────────────────────────── */
function ActionRail({ airport, intent, withCtx }) {
  return (
    <>
      <div className="hidden md:flex fixed top-20 z-[90] w-full h-14 items-center px-8 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-[#CDA755]" />
            <span className="text-xs text-zinc-500 tracking-wide">{airport} Hub</span>
          </div>
          <div className="flex gap-6 items-center">
            {intent === "moto" ? (
              <Link to={withCtx(LINKS.shipBikeQuote())} className="text-xs font-semibold text-[#CDA755] hover:text-zinc-900 transition-colors">Ship My Bike</Link>
            ) : (
              <Link to={withCtx(LINKS.shipGTQuote())} className="text-xs font-semibold text-[#CDA755] hover:text-zinc-900 transition-colors">Ship My GT</Link>
            )}
            <button type="button" onClick={() => scrollToSection("recovery")} className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Stay</button>
            <button type="button" onClick={() => scrollToSection("utilities")} className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Essentials</button>
            <div className="h-4 w-px bg-zinc-200 mx-1" />
            <button type="button" onClick={() => scrollToSection("ranking")} className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Compare</button>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-zinc-100 px-4 py-3 flex justify-between gap-2 safe-area-bottom">
        <button type="button" onClick={() => scrollToSection("ranking")} className="flex-1 py-3 bg-white border border-zinc-100 rounded-2xl text-xs text-zinc-600 text-center flex flex-col items-center justify-center gap-1 shadow-sm">
          <Car size={14} /> Compare
        </button>
        <Link to={withCtx(intent === "moto" ? LINKS.shipBikeQuote() : LINKS.shipGTQuote())} className="flex-1 py-3 bg-[#CDA755] rounded-2xl text-xs font-semibold text-white text-center flex flex-col items-center justify-center gap-1 shadow-sm">
          <Zap size={14} /> Get Quote
        </Link>
        <button type="button" onClick={() => scrollToSection("utilities")} className="flex-1 py-3 bg-white border border-zinc-100 rounded-2xl text-xs text-zinc-600 text-center flex flex-col items-center justify-center gap-1 shadow-sm">
          <Target size={14} /> Essentials
        </button>
      </div>
    </>
  );
}

/* ─── Section Navigation ──────────────────────────────────────────────── */
function SectionIndex() {
  const sections = [
    { name: "Hub Info", id: "control" },
    { name: "Compare", id: "ranking" },
    { name: "Consider", id: "reality" },
    { name: "Your Bike", id: "pivot" },
    { name: "Stay", id: "recovery" },
    { name: "Essentials", id: "utilities" },
    { name: "Explore", id: "extension" },
  ];
  return (
    <div className="max-w-7xl mx-auto px-6 hidden md:block border-b border-zinc-100">
      <div className="flex gap-8 py-4 overflow-x-auto no-scrollbar">
        {sections.map((s) => (
          <button key={s.id} type="button" onClick={() => scrollToSection(s.id)} className="text-sm text-zinc-400 hover:text-zinc-800 transition-colors whitespace-nowrap">
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Intent Toggle ───────────────────────────────────────────────────── */
function IntentToggle({ intent, setIntent }) {
  return (
    <div className="inline-flex p-1 bg-white/80 border border-zinc-200 rounded-full backdrop-blur-md shadow-sm">
      <button
        onClick={() => setIntent("moto")}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all text-sm font-medium ${intent === "moto" ? "bg-[#CDA755] text-white shadow-md" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"}`}
      >
        <Bike size={16} /> Motorcycle
      </button>
      <button
        onClick={() => setIntent("car")}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all text-sm font-medium ${intent === "car" ? "bg-[#CDA755] text-white shadow-md" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"}`}
      >
        <Car size={16} /> Car
      </button>
    </div>
  );
}

/* ─── Arrival Operations Card ─────────────────────────────────────────── */
function OpCard({ icon: Icon, label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
      <h3 className="text-xs tracking-wide uppercase text-zinc-400 mb-3 flex items-center gap-2">
        <Icon size={13} className="text-[#CDA755]" /> {label}
      </h3>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="group flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#F7F6F3] transition-colors">
            <span className="text-sm text-zinc-700 group-hover:text-zinc-900">{item.label || item}</span>
            {item.href && (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-zinc-300 group-hover:text-[#CDA755] transition-colors">
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═════════════════════════════════════════════════════════════════════════ */
export default function ArrivalOS({ 
  airport, 
  experience,
  intent, 
  setIntent, 
  airportRoutes, 
  derivedRegions, 
  derivedCountries, 
  derivedTheater, 
  rankingData 
}) {
  const location = useLocation();
  const withCtx = (path) => withBrandContext(path, location.search);

  const { currentImage, caption: assetCaption } = useAssetLibrary("airport", airport.id || airport.code, airport.hero?.posterUrl || SITE_MEDIA.EUROPE_PAGE_H1);
  const finalHeroImage = currentImage;
  const finalMotto = assetCaption || airport.motto;

  if (import.meta.env.DEV) {
    console.log("ArrivalOS airport payload:", airport);
  }

  const a = {
    ...airport,
    name: airport.name || experience?.airport?.name || airport.city,
    recovery: airport.recovery || { premium: { name: "", location: "", href: "#", features: [] }, budget: { name: "", location: "", href: "#", features: [] } },
    utilities: Array.isArray(airport.utilities) ? airport.utilities : [],
    cityExtension: airport.cityExtension || { enabled: false, headline: "", subline: "", items: [] },
  };

  const moneyCTA = intent === "moto"
    ? { label: "Request Quote", href: LINKS.shipBikeQuote() }
    : { label: "Ship Your GT", href: LINKS.shipGTQuote() };

  const arrivals = a?.arrivalOS?.arrivals ?? [];
  const departures = a?.arrivalOS?.departures ?? [];
  const baggage = a?.arrivalOS?.baggageClaim ?? [];
  const rideshare = a?.arrivalOS?.rideshare ?? [];
  const transport = a?.arrivalOS?.transport ?? [];

  return (
    <div className="relative">
      <ActionRail airport={a.code} intent={intent} withCtx={withCtx} />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-end overflow-hidden bg-[#F7F6F3]">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" poster={finalHeroImage} src={a.hero?.videoUrl || SITE_MEDIA.EUROPE_PAGE_H1} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F6F3] via-[#F7F6F3]/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 pt-40 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            {/* Breadcrumbs */}
            <nav className="text-xs text-zinc-500 mb-6 flex items-center gap-1.5">
              <Link to={withCtx("/airport")} className="hover:text-zinc-800 transition-colors">Airports</Link>
              <span className="text-zinc-300">/</span>
              <Link to={withCtx(`/airport/continent/${a.continent}`)} className="hover:text-zinc-800 transition-colors capitalize">{a.continent}</Link>
              <span className="text-zinc-300">/</span>
              <Link to={withCtx(`/airport/country/${a.country?.toLowerCase()}`)} className="hover:text-zinc-800 transition-colors">{a.country}</Link>
              <span className="text-zinc-300">/</span>
              <span className="text-zinc-800 font-medium">{a.code}</span>
            </nav>

            {/* Label */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="text-xs tracking-wide uppercase text-zinc-400">{a.code}</span>
              <span className="text-zinc-300">&middot;</span>
              <span className="text-xs text-zinc-500">{a.name} Hub</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[1.05] tracking-tight text-zinc-900 mb-6">
              Premium Motorcycle Rentals &amp; Transport in {a.city || a.name} ({a.code})
            </h1>

            <p className="text-lg text-zinc-500 max-w-lg leading-relaxed mb-8">
              {finalMotto || `Fly in. Recover. Explore ${derivedTheater || "the region"} on two wheels.`}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-zinc-100">
                <Target size={13} className="text-[#CDA755]" />
                <span className="text-xs text-zinc-600">{experience?.ride_local?.mission_count || 0} missions active</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-zinc-100">
                <Map size={13} className="text-[#CDA755]" />
                <span className="text-xs text-zinc-600">{airportRoutes?.length || 0} routes</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-zinc-100">
                <Globe size={13} className="text-[#CDA755]" />
                <span className="text-xs text-zinc-600">{derivedCountries?.length || 0} countries</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-zinc-100">
                <MapPin size={13} className="text-[#CDA755]" />
                <span className="text-xs text-zinc-600">{derivedRegions?.length || 0} regions</span>
              </div>
            </div>

            {/* Intent + CTA */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <IntentToggle intent={intent} setIntent={setIntent} />
              <a href={moneyCTA.href} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#CDA755] text-white font-medium text-sm hover:bg-[#b8943f] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                {moneyCTA.label} <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>


      <SectionIndex />

      {/* ── ARRIVAL OPS ──────────────────────────────────────────────── */}
      {(arrivals.length > 0 || departures.length > 0 || baggage.length > 0 || rideshare.length > 0 || transport.length > 0) && (
        <section className="py-16 bg-[#F7F6F3]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10">
              <p className="text-xs tracking-wide uppercase text-[#CDA755] mb-2">Arrival Information</p>
              <h2 className="text-2xl font-serif font-bold text-zinc-900">Getting started at {a.city || a.code}</h2>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              <OpCard icon={PlaneLanding} label="Arrivals" items={arrivals} />
              <OpCard icon={PlaneTakeoff} label="Departures" items={departures} />
              <OpCard icon={Luggage} label="Baggage" items={baggage} />
              <OpCard icon={Navigation} label="Rideshare" items={rideshare} />
              <OpCard icon={TrainFront} label="Transport" items={transport} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
