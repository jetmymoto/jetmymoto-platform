import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SeoHelmet from '../components/seo/SeoHelmet'; 
import { GRAPH } from "@/core/network/networkGraph";
import TrustInfrastructure from '../components/home/TrustInfrastructure';
import DeploymentGrid from '@/components/home/DeploymentGrid';
import { getCanonicalPaths } from "@/utils/navigationTargets";

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const pageTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

const canonicalPaths = getCanonicalPaths();

// 1. Hero Section (The Inspiration Hook)
const CinematicHero = () => (
  <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
    {/* Background Video */}
    <video 
      autoPlay 
      loop 
      muted 
      playsInline 
      className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover opacity-60"
    >
      <source src="https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/raw_assets%2FRider_Atlas_Video_Hero.mp4?alt=media&token=04a13792-450d-4289-b1c6-3deb605f3c8e" type="video/mp4" />
    </video>
    
    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#050505] z-0" />

    <div className="relative z-10 text-center px-6">
      <motion.h1 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
        className="text-5xl md:text-8xl font-serif text-white font-black italic mb-6 tracking-wide drop-shadow-2xl"
      >
        Where Will You <br className="hidden md:block" /> Ride Next?
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
        className="text-lg md:text-2xl text-zinc-300 font-light mb-10 max-w-2xl mx-auto drop-shadow-md"
      >
        Discover the world's most epic motorcycle routes, curated for adventure.
      </motion.p>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
        <Link 
          to={canonicalPaths.route}
          className="inline-block bg-amber-600 hover:bg-amber-500 text-white px-10 py-5 rounded-sm font-mono text-sm uppercase tracking-[0.2em] transition-all shadow-[0_5px_20px_rgba(217,119,6,0.4)]"
        >
          Explore Routes
        </Link>
      </motion.div>
    </div>
  </section>
);

// 2. Riding Theaters (The Destination Showcase)
const RidingTheaters = () => {
  const regions = [
    { title: "The Alps", subtitle: "Europe", image: "https://images.unsplash.com/photo-1533240332313-0cb49ece37c5?auto=format&fit=crop&q=80&w=2000", desc: "High-altitude passes and endless switchbacks." },
    { title: "Norwegian Fjords", subtitle: "Scandinavia", image: "https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?auto=format&fit=crop&q=80&w=2000", desc: "Coastal roads and dramatic cliffs." },
    { title: "Pacific Coast", subtitle: "North America", image: "https://images.unsplash.com/photo-1440857314522-302306d152c1?auto=format&fit=crop&q=80&w=2000", desc: "Ocean views and sweeping curves." },
    { title: "The Dolomites", subtitle: "Italy", image: "https://images.unsplash.com/photo-1522855169974-bc5db0c6bfb9?auto=format&fit=crop&q=80&w=2000", desc: "Jagged peaks and legendary tarmac." }
  ];

  return (
    <section className="py-24 bg-black border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
         <div className="mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-serif text-white uppercase font-black italic mb-4">
              Iconic Theaters
            </h2>
            <p className="text-sm font-mono text-zinc-400 uppercase tracking-[0.2em]">
              The world's greatest destinations
            </p>
          </motion.div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {regions.map((region, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="relative h-[400px] md:h-[500px] overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0">
                <img src={region.image} alt={region.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="text-[10px] text-amber-500 font-mono tracking-[0.3em] uppercase font-bold mb-3">
                  {region.subtitle}
                </div>
                <h3 className="text-3xl font-black uppercase text-white mb-2 font-serif italic tracking-wide group-hover:text-amber-500 transition-colors">
                  {region.title}
                </h3>
                <p className="text-sm text-zinc-300 font-light max-w-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  {region.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. Featured Routes (The Content Layer)
const FeaturedRoutes = () => {
  const routes = Object.keys(GRAPH.routes || {})
    .slice(0, 3)
    .map((routeSlug) => GRAPH.routes?.[routeSlug])
    .filter(Boolean);
  
  if (routes.length === 0) return null;

  return (
    <section className="py-24 bg-[#050505] border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-serif text-white uppercase font-black italic mb-4">
              Featured Routes
            </h2>
            <p className="text-sm font-mono text-amber-500 uppercase tracking-[0.2em]">
              Epic journeys, meticulously mapped
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
             <Link to={canonicalPaths.airports} className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-[0.1em] border-b border-zinc-700 pb-1 transition-colors">
               Browse Airport Hubs
             </Link>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {routes.map((route, i) => (
             <motion.div 
               key={route.slug || i}
               initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
               className="border border-white/10 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors group flex flex-col h-full"
             >
               <div className="h-48 bg-zinc-800 relative overflow-hidden">
                 {/* Placeholder for route map/image */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/20 to-zinc-800/20" />
                 <div className="absolute bottom-4 left-4 flex gap-2">
                   {(route.distance_km || route.distance) && (
                     <span className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 text-[10px] font-mono uppercase border border-white/10">
                       {route.distance_km || route.distance} KM
                     </span>
                   )}
                   {route.difficulty && (
                     <span className="bg-amber-500/20 backdrop-blur-sm text-amber-500 px-2 py-1 text-[10px] font-mono uppercase border border-amber-500/20">
                       {route.difficulty}
                     </span>
                   )}
                 </div>
               </div>
               <div className="p-6 flex-1 flex flex-col">
                 <h3 className="text-xl font-bold text-white mb-2 font-serif group-hover:text-amber-500 transition-colors line-clamp-2">
                   {route.name}
                 </h3>
                 <p className="text-sm text-zinc-400 font-light line-clamp-3 mb-6 flex-1">
                   {route.description || "Explore this epic route through stunning landscapes and unforgettable terrain."}
                 </p>
                 <Link to={`/route/${route.slug}`} className="inline-block text-xs font-mono text-white uppercase tracking-widest border border-white/20 py-3 text-center hover:bg-white hover:text-black transition-colors w-full">
                   View Details
                 </Link>
               </div>
             </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 5. Contextual Bike Matching (The Commerce Tie-In)
const ContextualBikes = () => {
  const rentals = Object.values(GRAPH.rentals || {}).slice(0, 4);
  
  if (rentals.length === 0) return null;

  return (
    <section className="py-24 bg-black border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
         <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-serif text-white uppercase font-black italic mb-4">
              Best Bikes For The Mission
            </h2>
            <p className="text-sm font-mono text-zinc-400 uppercase tracking-[0.2em]">
              Premium partner fleets perfectly matched to the terrain
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rentals.map((rental, i) => (
             <motion.div 
               key={rental.id || i}
               initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
               className="border border-white/10 bg-zinc-900/40 p-6 text-center hover:border-amber-500/30 transition-colors"
             >
               <div className="h-32 flex items-center justify-center mb-4">
                 {/* Mock image container */}
                 <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                    <span className="text-zinc-500 font-mono text-xs">Moto</span>
                 </div>
               </div>
               <div className="text-[10px] text-amber-500 font-mono tracking-widest uppercase mb-2">
                 {rental.make}
               </div>
               <h3 className="text-lg font-bold text-white mb-2 font-serif">
                 {rental.model}
               </h3>
             </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 6. The "Handoff" Architecture (The Monetization Bridge)
const HandoffArchitecture = () => (
  <section className="py-32 bg-[#050505] relative border-t border-white/10">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      
      <div className="text-center mb-20">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl md:text-6xl font-serif text-white uppercase font-black italic mb-6">
            Ready to Ride This?
          </h2>
          <p className="text-sm md:text-base font-mono text-zinc-400 uppercase tracking-[0.2em] max-w-2xl mx-auto">
            Choose your deployment strategy. The unified mobility platform connects you to the world's best routes.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Logistics / Bring Bike */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
           className="border border-white/10 bg-zinc-900/40 p-10 md:p-14 flex flex-col items-start hover:border-amber-500/40 hover:bg-zinc-900/80 transition-all duration-500 group"
        >
          <div className="text-[10px] text-amber-500 font-mono tracking-[0.3em] uppercase font-bold mb-6 flex items-center gap-3">
             <span className="w-8 h-px bg-amber-500/50"></span>
             JetMyMoto Logistics
          </div>
          <h3 className="text-3xl font-black uppercase text-white mb-6 font-serif italic tracking-wide group-hover:text-amber-500 transition-colors">
            Ship Your Bike
          </h3>
          <p className="text-sm text-zinc-400 mb-10 leading-relaxed font-light flex-1">
            Global precision airlift and secure staging across Europe and North America corridors. Fly in, turn the key, and ride your own motorcycle seamlessly. We natively handle the crating, complex customs, and dangerous goods protocol logistics.
          </p>
          <Link to={canonicalPaths.logistics} className="w-full bg-white text-black py-5 font-mono text-[10px] md:text-xs font-black uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-black transition-all shadow-[0_5px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_5px_30px_rgba(245,158,11,0.3)] rounded-sm text-center">
            Request Shipping Quote
          </Link>
        </motion.div>

        {/* Rentals / Rent Bike */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
           className="border border-white/10 bg-zinc-900/40 p-10 md:p-14 flex flex-col items-start hover:border-amber-500/40 hover:bg-zinc-900/80 transition-all duration-500 group"
        >
          <div className="text-[10px] text-amber-500 font-mono tracking-[0.3em] uppercase font-bold mb-6 flex items-center gap-3">
             <span className="w-8 h-px bg-amber-500/50"></span>
             JetMyMoto Rentals
          </div>
          <h3 className="text-3xl font-black uppercase text-white mb-6 font-serif italic tracking-wide group-hover:text-amber-500 transition-colors">
            Rent a Bike
          </h3>
          <p className="text-sm text-zinc-400 mb-10 leading-relaxed font-light flex-1">
            Access our trusted network of premium verified partner fleets right at the hub. Turn-key late-model adventure and touring bikes, pre-configured specifically for the target terrain without the crating wait times.
          </p>
          <Link to={canonicalPaths.rentals} className="w-full bg-transparent border border-white/20 text-white py-5 font-mono text-[10px] md:text-xs font-black uppercase tracking-[0.2em] hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-500 transition-all rounded-sm text-center">
            Browse Available Bikes
          </Link>
        </motion.div>

      </div>
    </div>
  </section>
);


export default function RiderAtlasHomepage() {
  return (
    <>
      <SeoHelmet
          title="RiderAtlas | Discover the World's Greatest Motorcycle Routes"
          description="Explore epic motorcycle routes, legendary destinations, and premium rentals across the globe with RiderAtlas."
          canonicalUrl="https://rideratlas.com/"
      />
      <div className="bg-[#050505] selection:bg-amber-500/30 font-sans">
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <CinematicHero />
          <TrustInfrastructure layout="marquee" />
          <DeploymentGrid />
          <RidingTheaters />
          <FeaturedRoutes />
          <ContextualBikes />
          <HandoffArchitecture />
        </motion.div>
      </div>
    </>
  );
}
