import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import TrustInfrastructure from "./home/TrustInfrastructure";

const DEFAULT_PATHS = {
  logistics: "/moto-airlift",
  rentals: "/rentals",
  routes: "/routes",
  booking: "/moto-airlift",
};

const DEFAULT_MEDIA = {
  heroVideo:
    "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/raw_assets%2FCinematic_Drone_Intro_Code_Upgrade.mp4?alt=media&token=42b8b364-5aa0-423e-bc30-5be95cd71ea2",
  heroPoster:
    "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_images%2Fimages%20for%20ai%20scan%2FIMG-20251019-WA0017.jpg?alt=media&token=c297ab60-a072-40cd-a51e-bdb9c36ced24",
  logisticsPoster:
    "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_images%2Fimages%20for%20ai%20scan%2FIMG-20251019-WA0017.jpg?alt=media&token=c297ab60-a072-40cd-a51e-bdb9c36ced24",
  rentalsPoster:
   "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_images%2Frent%20section.jpeg?alt=media&token=73c2ea22-5bce-4cdc-a734-626b27ea3c82",
};

function HeroTile({ title, label, body, ctaLabel, ctaTo, image, align = "left" }) {
  return (
    <motion.div
      whileHover={{ scale: 1.025, y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="relative flex-1 overflow-hidden rounded-[28px] group min-h-[340px] md:min-h-0"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className={`relative z-10 h-full flex flex-col justify-end p-10 ${align === "right" ? "text-right" : ""}`}>
        <span className="text-[#CDA755] text-xs tracking-[0.3em] uppercase">
          {label}
        </span>
        <h2 className="font-serif text-4xl md:text-5xl text-white mt-4 leading-tight">
          {title}
        </h2>
        <p className={`text-white/70 mt-4 ${align === "right" ? "max-w-md ml-auto" : "max-w-md"}`}>
          {body}
        </p>
        <motion.div
          whileHover={{ x: align === "right" ? -6 : 6 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className="mt-8"
        >
          <Link
            to={ctaTo}
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white hover:text-[#CDA755]"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function JetMyMotoHero({
  GRAPH = {},
  rentalShard,
  rentalsLoading = false,
  canonicalPaths = DEFAULT_PATHS,
  siteMedia = DEFAULT_MEDIA,
}) {
  const safePaths = { ...DEFAULT_PATHS, ...(canonicalPaths || {}) };
  const safeMedia = { ...DEFAULT_MEDIA, ...(siteMedia || {}) };
  const airportsCount = Object.keys(GRAPH?.airports || {}).length;
  const rentalsCount = Object.keys(rentalShard?.rentals || {}).length;

  return (
    <section className="relative bg-[#050505] text-white overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-serif text-lg tracking-wide text-white">
            JetMyMoto
          </div>
          <div className="hidden md:flex gap-8 text-sm text-white/60">
            <Link to={safePaths.routes} className="hover:text-[#CDA755] transition-colors">
              Routes
            </Link>
            <Link to={safePaths.rentals} className="hover:text-[#CDA755] transition-colors">
              Fleet
            </Link>
            <Link to={safePaths.logistics} className="hover:text-[#CDA755] transition-colors">
              How it works
            </Link>
          </div>
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
            <Link
              to={safePaths.booking}
              className="bg-[#CDA755] text-[#050505] px-6 py-2 rounded-full text-xs uppercase tracking-[0.25em] shadow-[0_0_30px_rgba(205,167,85,0.3)]"
            >
              Book Now
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="relative w-full h-[85vh] min-h-[560px] overflow-visible">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={safeMedia.heroPoster}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={safeMedia.heroVideo} type="video/mp4" />
        </video>

        {/* subtle gold glow -> ties brand color into hero */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(205,167,85,0.15),transparent_40%)]" />

        {/* soft cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        {/* NEW vertical blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-[#030303]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <div className="text-[#CDA755] text-xs tracking-[0.3em] uppercase mb-6">
              Access Motorcycle Travel Anywhere
            </div>

            <h1 className="font-serif text-[clamp(2rem,4vw,3.75rem)] leading-[1.08] tracking-[-0.015em] max-w-2xl">
              Seamless Logistics and Premium Rides for Your Global Motorcycle Adventure
            </h1>
            <p className="mt-6 text-white/70 max-w-xl text-lg">
              Discover routes, ship your bike, or rent locally. Everything you need to ride anywhere in the world.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                to={safePaths.logistics}
                className="bg-[#CDA755] text-[#050505] px-6 py-3 text-xs uppercase tracking-[0.25em]"
              >
                Ship my bike
              </Link>

              <Link
                to={safePaths.rentals}
                className="border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.25em] hover:border-[#CDA755]"
              >
                Find a bike
              </Link>
            </div>
          </motion.div>
        </div>

        {/* THIS CREATES THE BRIDGE */}
        <div className="absolute bottom-[-120px] left-0 right-0 h-[160px] bg-gradient-to-b from-transparent to-[#030303] pointer-events-none z-20" />
      </div>

      <TrustInfrastructure layout="marquee" />

      <div className="pt-10 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-5 h-auto md:h-[78vh]">
          <HeroTile
            title="Ship your bike anywhere"
            label="Bring your own bike"
            body="Ride your own machine anywhere in the world. We handle the boring stuff so you can focus on the ride."
            ctaLabel="Start your trip"
            ctaTo={safePaths.logistics}
            image={safeMedia.logisticsPoster}
          />
          <HeroTile
            title="Rent a bike locally"
            label="Ride locally"
            body="Land, grab your bike, and go. No waiting, no hassle—just ride."
            ctaLabel="Find your bike"
            ctaTo={safePaths.rentals}
            image={safeMedia.rentalsPoster}
            align="right"
          />
        </div>

        <div className="mt-6 pb-10 text-center text-white/60 text-sm">
          {airportsCount}+ hubs · {rentalsLoading ? "loading fleet..." : `${rentalsCount}+ bikes`} · Ride anywhere
        </div>
      </div>
    </section>
  );
}

