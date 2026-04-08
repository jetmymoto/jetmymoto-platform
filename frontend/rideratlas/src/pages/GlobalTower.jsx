import React, { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useParams } from "react-router-dom";
import SeoHelmet from '../components/seo/SeoHelmet'; // Import SeoHelmet
import { SITE_MEDIA } from "@/config/siteMedia";
import { continentIndex } from "@/features/airport/network/continentIndex";
import DeploymentCard from "@/components/airport/DeploymentCard";
import AdventureNetworkCard from "@/components/routes/AdventureNetworkCard";
import RouteIntelCard from "@/components/routes/RouteIntelCard";

import { GRAPH, readGraphShard } from "@/core/network/networkGraph";
import { withBrandContext } from "@/utils/navigationTargets";
import { AIRPORT_COORDS } from "@/features/airport/data/airportCoords";





import {
  Globe,
  Activity,
  MapPin,
  Clock,
  Shield,
  ArrowUpRight,
  ArrowRight,
  Crosshair,
  Compass, 
} from "lucide-react";


/* =========================================================
   HELPERS
========================================================= */

const COUNTRY_NAMES = {
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  DE: "Germany",
  CH: "Switzerland",
  AT: "Austria",
  PT: "Portugal",
  NL: "Netherlands",
  BE: "Belgium",
  CZ: "Czech Republic",
  PL: "Poland",
  GR: "Greece",
  HR: "Croatia",
  DK: "Denmark",
  SE: "Sweden",
  NO: "Norway",
  FI: "Finland",
  IE: "Ireland",
  GB: "United Kingdom",
  RO: "Romania",
  TR: "Turkey",
  US: "United States",
  CA: "Canada",
  MX: "Mexico",
};

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return "🏳️";
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
};

const CONTINENT_CONFIG = {
  europe: {
    title: "Motorcycle Shipping Europe",
    hero: "Ship Your Motorcycle Across Europe",
    description: "JetMyMoto connects Europe's major motorcycle logistics hubs.",
  },
  asia: {
    title: "Motorcycle Shipping Asia",
    hero: "Ship Your Motorcycle Across Asia",
    description: "JetMyMoto connects Asia's major motorcycle logistics hubs.",
  },
  "north-america": {
    title: "Motorcycle Shipping North America",
    hero: "Ship Your Motorcycle Across North America",
    description: "JetMyMoto connects North America's major motorcycle logistics hubs.",
  },
  "south-america": {
    title: "Motorcycle Shipping South America",
    hero: "Ship Your Motorcycle Across South America",
    description: "JetMyMoto connects South America's major motorcycle logistics hubs.",
  },
  oceania: {
    title: "Motorcycle Shipping Oceania",
    hero: "Ship Your Motorcycle Across Oceania",
    description: "JetMyMoto connects Oceania's major motorcycle logistics hubs.",
  },
};

const defaultContinentConfig = {
  title: "Global Motorcycle Arrival Network",
  hero: "Global Motorcycle Arrival Network",
  description:
    "Certified airport staging infrastructure across major motorcycle shipping hubs.",
};

const buildContinentData = () => {
  return (Object.entries(continentIndex || {})).map(([continentId, data]) => {
    const airports = (data?.airports || [])
      .map((slug) => GRAPH.airportsBySlug?.[slug])
      .filter(Boolean);

    return {
      id: continentId,
      label: continentId.replace("-", " ").toUpperCase(),
      status: "ACTIVE",
      nodeCount: airports.length,
      summary: `Certified airport staging infrastructure across ${continentId.replace(
        "-",
        " "
      )}.`,
      topHubs: airports.slice(0, 6).map((airport) => ({
        code: airport.code,
        name: airport.city,
        slug: airport.slug,
        country: airport.country,
      })),
      airports,
    };
  });
};

const NETWORK_DATA = buildContinentData();

/* =========================================================
   RADAR UI
========================================================= */

const ControlStripRadar = () => (
  <motion.div
    className="absolute inset-0 pointer-events-none z-0"
    initial={{ x: "-100%" }}
    animate={{ x: "100%" }}
    transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
    style={{
      background:
        "linear-gradient(90deg, transparent, rgba(245,158,11,0.12), transparent)",
    }}
  />
);

const RadarOverlay = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-40">
    <div className="absolute w-[800px] h-[800px] rounded-full border border-amber-500/10" />
    <div className="absolute w-[520px] h-[520px] rounded-full border border-amber-500/15" />
    <div className="absolute w-[260px] h-[260px] rounded-full border border-amber-500/20" />

    <motion.div
      className="absolute w-[420px] h-[420px]"
      style={{
        background:
          "conic-gradient(from 90deg at 50% 50%, rgba(245,158,11,0) 0deg, rgba(245,158,11,0.18) 90deg, rgba(245,158,11,0) 90deg)",
      }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
    />
  </div>
);

const RadarSectorOverlay = () => {
  const blips = useMemo(() => Array.from({ length: 10 }), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05),transparent_70%)]">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center opacity-[0.07]">
        <div className="w-[900px] h-[900px] border border-white rounded-full" />
        <div className="absolute w-[650px] h-[650px] border border-white rounded-full" />
        <div className="absolute w-[420px] h-[420px] border border-white rounded-full" />
      </div>

      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
      >
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[2px] bg-gradient-to-r from-amber-500/40 to-transparent origin-left blur-sm" />
      </motion.div>

      {blips.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.6, 1] }}
          transition={{
            repeat: Infinity,
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const GlobalTower = () => {
  const { continent } = useParams();
  const location = useLocation();
  const [activeContinent, setActiveContinent] = useState(continent || "europe");
  const withCtx = (path) => withBrandContext(path, location.search);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (continent) {
      setActiveContinent(continent);
    }
  }, [continent]);

  useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 1800);
    return () => clearTimeout(timer);
  }, [activeContinent]);

  const currentContinentId = continent || activeContinent;
  const canonicalPath = continent
    ? `/airport/continent/${currentContinentId}`
    : "/airport";
  const currentConfig =
    CONTINENT_CONFIG[currentContinentId] || defaultContinentConfig;

  const continentData = useMemo(() => {
    return (
      NETWORK_DATA.find((item) => item.id === currentContinentId) ||
      NETWORK_DATA[0] || {
        id: currentContinentId,
        label: currentContinentId?.toUpperCase?.() || "NETWORK",
        airports: [],
        nodeCount: 0,
        topHubs: [],
        summary: "",
      }
    );
  }, [currentContinentId]);

  const continentAirports = useMemo(() => {
    const codes = GRAPH.indexes.airportsByContinent?.[currentContinentId] || [];
    return codes.map(code => GRAPH.airports[code]).filter(Boolean);
  }, [currentContinentId]);

  const continentClusters = useMemo(() => {
    const seen = new Set();
    return continentAirports.flatMap(a => {
      const clusterIds = GRAPH.indexes.clusterByAirport?.[a.code] || [];
      return clusterIds
        .filter(id => !seen.has(id) && (seen.add(id), true))
        .map(id => GRAPH.clusters[id])
        .filter(Boolean);
    });
  }, [continentAirports]);

  const allContinentRoutes = useMemo(() => {
    return (continentClusters || []).flatMap(cluster => cluster.routes || []);
  }, [continentClusters]);

  const flattenedRoutes = useMemo(() => {
    return allContinentRoutes.slice(0,12);
  }, [allContinentRoutes]);

  const countries = useMemo(() => {
    return [...new Set(continentAirports.map((airport) => airport.country).filter(Boolean))];
  }, [continentAirports]);

  const regions = useMemo(() => {
    const allDestinations = (continentClusters || []).flatMap(c => (c.routes || []).map(r => r.destination));
    const uniqueRegions = new Map();
    allDestinations.forEach(dest => {
      if (dest && !uniqueRegions.has(dest.slug)) {
        uniqueRegions.set(dest.slug, dest);
      }
    });
    return Array.from(uniqueRegions.values());
  }, [continentClusters]);

  const rentalShard = readGraphShard("rentals");
  const rentalsMap = rentalShard?.rentals ?? {};
  const rentalsByAirport = rentalShard?.rentalIndexes?.rentalsByAirport ?? {};

  const sortedHubs = useMemo(() => {
    return [...continentAirports]
      .sort((a, b) => (GRAPH.routesByAirport?.[b.code]?.length || 0) - (GRAPH.routesByAirport?.[a.code]?.length || 0))
      .slice(0, 9);
  }, [continentAirports]);

  useEffect(() => {
    console.log("CONTINENT AIRPORTS:", continentAirports.length)
    console.log("CLUSTERS:", continentClusters.length)
    console.log("FLATTENED ROUTES:", flattenedRoutes.length)
  }, [continentAirports, continentClusters, flattenedRoutes]);

  const getStatusLabel = (status) => {
    switch (status) {
      case "ACTIVE":
        return "LIVE_INFRASTRUCTURE";
      case "VALIDATION":
        return "STRATEGIC_VALIDATION";
      case "PIPELINE":
        return "THEATER_PLANNING";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-black font-sans">
        <SeoHelmet
          title={`${currentConfig.title} | JetMyMoto`}
          description={currentConfig.description || "Explore the JetMyMoto global network of certified motorcycle logistics hubs and deployment sectors."}
          canonicalUrl={`https://jetmymoto.com${canonicalPath}`}
        />

        {/* HERO */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-30"
            >
              <source
                src={SITE_MEDIA.GLOBAL_TOWER_H1}
                type="video/mp4"
              />
            </video>
            <div className="absolute inset-0 bg-[#050505]/40" />
          </div>

          <div className="relative z-10 text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
            >
              <div className="font-mono text-[10px] font-black tracking-[0.5em] text-amber-500 uppercase mb-8 flex items-center justify-center gap-3">
                <Shield size={12} /> CERTIFIED_GLOBAL_INFRASTRUCTURE
              </div>

              <h1 className="text-4xl md:text-[6.2rem] font-bold tracking-tighter leading-[0.9] mb-8 uppercase italic max-w-6xl mx-auto text-white">
                {currentConfig.hero}
              </h1>

              <p className="text-zinc-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 italic font-light leading-relaxed">
                {currentConfig.description}
              </p>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center gap-x-12 gap-y-4 font-mono text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase border-t border-white/10 pt-8 max-w-4xl mx-auto italic flex-wrap">
                  <span className="flex items-center gap-2 text-amber-500/80 font-bold tracking-widest">
                    <Activity size={12} /> ACTIVE_NODES: {continentAirports.length}
                  </span>
                  <span className="flex items-center gap-2 font-bold tracking-widest">
                    <Globe size={12} /> COUNTRIES: {countries.length}
                  </span>
                  <span className="flex items-center gap-2 font-bold tracking-widest">
                    <MapPin size={12} /> REGIONS: {regions.length}
                  </span>
                  <span className="flex items-center gap-2 font-bold tracking-widest">
                    <Clock size={12} /> AVG_STAGING: &lt;24H
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CONTINENT STATISTICS BAR */}
        <section className="bg-amber-500 text-black py-4 border-b border-black">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-sm font-black uppercase tracking-widest italic">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#050505] rounded-full animate-pulse" />
              {currentConfig.title.replace('Motorcycle Shipping ', '')} Network
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-80">
              <div className="flex items-center gap-2">
                <span className="text-xl">{continentAirports.length}</span>
                <span className="text-[10px] mt-1">Airports</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{countries.length}</span>
                <span className="text-[10px] mt-1">Countries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{regions.length}</span>
                <span className="text-[10px] mt-1">Riding Regions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{allContinentRoutes.length}</span>
                <span className="text-[10px] mt-1">Routes</span>
              </div>
            </div>
          </div>
        </section>

        {/* CONTINENT COMMAND */}
        <nav className="sticky top-20 z-40 bg-[rgba(5,5,5,0.97)] border-b border-white/5 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
          <ControlStripRadar />

          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-between gap-4 overflow-x-auto no-scrollbar relative z-10">
              {(NETWORK_DATA || []).map((item) => (
                <Link
                  key={item.id}
                  to={withCtx(`/airport/continent/${item.id}`)}
                  onClick={() => setActiveContinent(item.id)}
                  className={`relative group flex flex-col items-start min-w-[220px] transition-all p-4 rounded border text-left overflow-hidden ${
                    currentContinentId === item.id
                      ? "border-amber-500/30 bg-amber-500/5 opacity-100"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  {currentContinentId === item.id && (
                    <motion.div
                      className="absolute inset-0 border border-amber-500/20 rounded pointer-events-none"
                      initial={{ opacity: 0.2 }}
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}

                  <div className="flex justify-between items-center w-full mb-2">
                    <span
                      className={`flex items-center gap-2 font-mono text-[8px] font-black uppercase tracking-widest italic ${
                        currentContinentId === item.id ? "text-amber-500" : "text-zinc-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          currentContinentId === item.id
                            ? "bg-amber-500 animate-pulse"
                            : "bg-zinc-700"
                        }`}
                      />
                      {getStatusLabel(item.status)}
                    </span>

                    <span className="font-mono text-[8px] text-zinc-500">
                      {item.nodeCount} NODES
                    </span>
                  </div>

                  <span className="text-xl font-bold tracking-tight uppercase italic group-hover:text-amber-500 transition-colors text-white">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* MAIN */}
        <main className="relative max-w-7xl mx-auto px-6 py-24 min-h-[60vh]">
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, ease: "linear" }}
                className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-transparent via-amber-500/5 to-transparent skew-x-12"
              />
            )}
          </AnimatePresence>

          <div className="space-y-24">

            {/* NETWORK OVERVIEW */}
            <section className="pt-16 border-t border-white/5 text-center">

              <h2 className="text-xl font-black tracking-tight uppercase italic text-white">
                Global Expedition Network
              </h2>

              <p className="text-zinc-400 italic max-w-xl mx-auto mt-4">
                JetMyMoto connects certified logistics hubs with the world's greatest riding destinations.
              </p>

            </section>

            {/* COUNTRY EXPLORER */}
            <section className="pt-10 border-t border-white/5 space-y-10">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="font-mono text-[10px] font-black tracking-[0.5em] text-zinc-700 uppercase italic px-4">
                  COUNTRIES
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(countries || []).map((countryCode) => (
                  <Link
                    key={countryCode}
                    to={withCtx(`/airport/country/${countryCode.toLowerCase()}`)}
                    className="group border border-white/5 bg-zinc-900/40 hover:border-amber-500/40 p-4 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-mono text-[10px] text-zinc-300 uppercase tracking-widest italic group-hover:text-amber-500">
                        <span className="text-base">{getFlagEmoji(countryCode)}</span>
                        {COUNTRY_NAMES[countryCode] || countryCode}
                      </span>

                      <ArrowUpRight
                        size={14}
                        className="text-zinc-600 group-hover:text-amber-500"
                      />
                    </div>

                    <div className="text-[9px] text-zinc-500 uppercase font-mono mt-2 tracking-widest">
                      Airports
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* DEPLOYMENT HUBS */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <Crosshair size={14} className="text-amber-500" />
                <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                  Deployment Hubs <span className="text-zinc-500 ml-2">(Where you land)</span>
                </h2>
              </div>

              <div className="relative p-8 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden">
                <RadarSectorOverlay />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {sortedHubs.map((airport) => {
                    const routeCount = GRAPH.routesByAirport?.[airport.code]?.length || 0;
                    const airportRentals = (rentalsByAirport[airport.code] || [])
                      .map((id) => rentalsMap[id])
                      .filter(Boolean);
                    const cheapest = airportRentals.reduce(
                      (min, r) => {
                        const p = parseFloat(r?.pricePerDay ?? r?.price ?? Infinity);
                        return p < min ? p : min;
                      },
                      Infinity
                    );
                    const fleetClass = airportRentals[0]?.category || airportRentals[0]?.class || null;

                    const mission = {
                      airport_slug: airport.slug || airport.code,
                      airport_code: airport.code,
                      airport_name: airport.name || `${airport.city || airport.code} Hub`,
                      region_desc: airport.region || airport.city || "Premier Logistics Node",
                      country_code: airport.country_code || airport.country,
                      coords: AIRPORT_COORDS[airport.code] || { lat: airport.coords?.lat ?? "--", long: airport.coords?.long ?? "--" },
                      rental: cheapest < Infinity ? { price: cheapest, class: fleetClass } : null,
                      weather: {
                        condition: `${routeCount} routes available`,
                      },
                      routeCount,
                    };

                    return <DeploymentCard key={airport.code} mission={mission} />;
                  })}
                </div>
              </div>
            </section>

            {/* RIDING THEATERS (NETWORK TOWER) */}
            <section className="relative pt-10 border-t border-white/5 space-y-10 overflow-hidden min-h-[500px] flex flex-col justify-center">
              <RadarOverlay />
              
              {/* Subtle Background Video Overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-15 overflow-hidden">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source
                    src={SITE_MEDIA.RIDING_REGIONS_BG} 
                    type="video/mp4"
                  />
                </video>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="font-mono text-[10px] font-black tracking-[0.5em] text-zinc-700 uppercase italic px-4">
                    RIDING THEATERS
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                <p className="text-zinc-400 italic max-w-2xl mx-auto text-center mb-12">
                  Once deployed, riders enter one of the world's legendary riding theaters.
                  Each network represents a gateway to iconic motorcycle expeditions.
                </p>

                {continentClusters.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(continentClusters || []).slice(0, 12).map((cluster) => (
                      <AdventureNetworkCard
                        key={cluster.id}
                        cluster={cluster}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 border border-white/5 bg-zinc-900/20 rounded-xl italic text-zinc-500">
                    Scanning for active theaters in this sector...
                  </div>
                )}
              </div>
            </section>

            {/* SECTION DIVIDER */}
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            </div>

            {/* EXPEDITION MISSIONS */}
            <section className="pt-10 border-t border-white/5 space-y-10">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="font-mono text-[10px] font-black tracking-[0.5em] text-zinc-700 uppercase italic px-4">
                  EXPEDITION MISSIONS
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <p className="text-zinc-400 italic max-w-2xl mx-auto text-center mb-12">
                From these logistics hubs, riders deploy directly into some of the most
                iconic motorcycle routes on earth.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(flattenedRoutes || []).length > 0 ? (
                  (flattenedRoutes || []).map(route => (
                    <Link
                      key={route.slug}
                      to={withCtx(`/route/${route.slug}`)}
                    >
                      <RouteIntelCard
                        route={route}
                      />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
                    No active missions detected in this sector.
                  </div>
                )}
              </div>
            </section>

            {/* CTA */}
            <section className="pt-10 border-t border-white/5 flex flex-col items-center text-center">
              <h3 className="text-3xl font-bold uppercase italic tracking-tighter mb-4 text-white">
                Not sure where to deploy?
              </h3>

              <p className="text-zinc-500 italic mb-12 max-w-xl">
                Our logistics officers align your machine with the ideal riding theater.
              </p>

              <Link to={withCtx("/moto-airlift")} className="px-12 py-5 bg-zinc-900 border border-white/10 hover:border-amber-500 transition-all font-mono text-xs font-black uppercase tracking-widest italic group flex items-center gap-6 text-white">
                Request Global Deployment Strategy
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </Link>
            </section>
          </div>
        </main>
      </div>
  );
};

export default GlobalTower;
