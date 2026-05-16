import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Plane, Bike } from "lucide-react";

const DEFAULT_PATHS = {
  logistics: "/moto-airlift",
  rentals: "/rentals",
  routes: "/routes",
  booking: "/moto-airlift",
};

const DEFAULT_MEDIA = {
  heroVideo:
    "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_videos%2Fairporttemplatehero2.mp4?alt=media&token=41ca055e-bc4e-459b-a1ee-b64e82261933",
  heroPoster:
    "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_images%2Fimages%20for%20ai%20scan%2FIMG-20251019-WA0017.jpg?alt=media&token=c297ab60-a072-40cd-a51e-bdb9c36ced24",
  logisticsPoster:
    "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_images%2Fimages%20for%20ai%20scan%2FIMG-20251019-WA0017.jpg?alt=media&token=c297ab60-a072-40cd-a51e-bdb9c36ced24",
  rentalsPoster:
   "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_images%2Frent%20section.jpeg?alt=media&token=73c2ea22-5bce-4cdc-a734-626b27ea3c82",
};

function HeroTile({ title, label, body, ctaLabel, ctaTo, image, icon: Icon, align = "left" }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="relative flex-1 overflow-hidden group min-h-[340px] md:min-h-0 border border-[#CDA755]/20 hover:border-[#CDA755]/50 transition-colors"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/30" />
      <div className={`relative z-10 h-full flex flex-col justify-end p-10 ${align === "right" ? "text-right" : ""}`}>
        <div className={`flex items-center gap-3 ${align === "right" ? "justify-end" : ""}`}>
          {Icon && <Icon size={16} className="text-[#CDA755]" />}
          <span className="text-[#CDA755] text-[10px] tracking-[0.3em] uppercase font-mono font-bold">
            {label}
          </span>
        </div>
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
            className="inline-flex items-center gap-3 bg-[#CDA755] text-[#050505] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] shadow-[0_4px_20px_rgba(205,167,85,0.25)] hover:bg-[#F3E5C7] transition-all"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

function TrustDivider({ airportsCount, rentalsCount, rentalsLoading }) {
  return (
    <div className="py-8 text-center">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#CDA755]/25 to-transparent mb-6" />
      <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#CDA755]/60">
        {airportsCount}+ hubs · {rentalsLoading ? "loading fleet..." : `${rentalsCount}+ machines`} · Ride anywhere
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#CDA755]/25 to-transparent mt-6" />
    </div>
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

      <div className="relative w-full min-h-[92vh] overflow-visible">
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

        {/* LEFT-WEIGHTED overlay for text readability and visual balance */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.48) 32%, rgba(5,5,5,0.22) 60%, rgba(5,5,5,0.08) 100%)'
          }}
        />
        {/* Bottom cinematic fade preserved */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(5,5,5,0.3) 80%, rgba(5,5,5,0.7) 100%)'
          }}
        />

        {/* LEFT-ANCHORED CONTENT COLUMN */}
        <div className="relative z-10 w-full h-full min-h-[92vh] flex items-start justify-start px-6">
          <div className="max-w-[580px] ml-[4%] md:ml-[8%] mt-[12vh] md:mt-[15vh]">
            {/* label */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="text-[#CDA755] text-[10px] font-mono tracking-[0.38em] uppercase mb-5 text-left"
            >
              Motorcycle Logistics &amp; Fly-and-Ride
            </motion.p>

            {/* headline with controlled line breaks */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.22 }}
              className="font-serif text-left text-white text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-[-0.01em]"
            >
              Global Motorcycle<br />
              Transport<br />
              <span className="text-[#CDA755]">&amp; One-Way Rentals</span>
            </motion.h1>

            {/* subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.38 }}
              className="mt-6 text-white/85 text-left text-[0.95rem] leading-relaxed max-w-[460px]"
            >
              Secure transport for your machine, or hardware-validated rentals for a seamless fly-and-ride experience.
            </motion.p>

            {/* CTA GROUP - left aligned horizontal row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.54 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                to={safePaths.logistics}
                className="bg-[#CDA755] text-black px-8 py-4 text-[12px] font-bold uppercase tracking-[0.25em] shadow-[0_0_30px_rgba(205,167,85,0.25)] hover:bg-[#F3E5C7] hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(205,167,85,0.4)] transition-all duration-300"
              >
                Ship my bike
              </Link>
              <Link
                to={safePaths.rentals}
                className="border border-white/15 text-white/60 px-7 py-3 text-[11px] uppercase tracking-[0.25em] hover:border-white/30 hover:text-white/80 transition-all duration-300"
              >
                Find a bike
              </Link>
            </motion.div>

            {/* Metadata / Microcopy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.8 }}
              className="mt-6 text-left"
            >
              <p className="text-white/35 text-[10px] font-mono uppercase tracking-[0.2em]">
                {airportsCount}+ hubs · {rentalsLoading ? "loading fleet..." : `${rentalsCount}+ machines`} · Ride anywhere
              </p>
            </motion.div>

            {/* Subtle scroll direction cue */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 1.0 }}
              className="mt-8 text-left"
            >
              <p className="text-white/25 text-[9px] font-mono uppercase tracking-[0.3em] mb-2">
                Explore Platform
              </p>
              <div className="w-px h-6 bg-gradient-to-b from-white/15 to-transparent"></div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced bridge fade with stronger pull */}
        <div
          className="absolute bottom-[-120px] left-0 right-0 h-[160px] pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(5,5,5,0) 0%, rgba(5,5,5,0.6) 60%, rgba(5,5,5,1) 100%)'
          }}
        />
      </div>

      {/* Trust metadata now integrated into hero content */}

      <div className="w-full border-t border-white/5">
        <section className="h-[80vh] min-h-[600px] flex flex-col md:flex-row overflow-hidden border-y border-white/5">
          {/* LEFT: SHIP */}
          <Link
            to={safePaths.logistics}
            className="flex-1 relative group cursor-pointer overflow-hidden block bg-[#111111] hover:scale-[1.02] transition-all duration-300 ease-out"
            style={{
              background: 'radial-gradient(circle at top, rgba(205,167,85,0.08), transparent 70%), #111111'
            }}
          >
            {/* Background */}
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZA7f1r7imAVZyCuKgGk2rFca2LzrVwA_h3UbKZW1GcNQimGvXVKDmNOXR8xN2S4nFgP79ubqZjv3yjCBN3sBVc1-iSL0JToBkG_PRXS3gZRwsZ72fE8i2PyfoYhN9spK_8uyfhSa9zeZotnxFEOQTn6FcFDCLdvIpxfO1JPLLx41hH1fyIF_P3F4sD5Uda58Lr1SME2DjdF1TOAnf6BBB4w03XksxYoiz-rf8oACHpSbXaaMEYwcvN07kmYCcVJuWgY5Mk4b9-H8"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
              alt="Ship Your Bike"
            />

            {/* Overlay (Lighter + gradient) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent group-hover:from-black/30 transition-all duration-500"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end items-start text-left px-12 pb-20 md:pb-24">
              <span className="text-[10px] tracking-[0.4em] uppercase text-[#CDA755] mb-4 flex items-center gap-4 font-mono font-bold">
                <div className="w-8 h-[1px] bg-[#CDA755]"></div>
                Logistic Path A
              </span>
              <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-[0.05em] mb-8 uppercase leading-[0.9] text-white">
                SHIP YOUR<br/>BIKE
              </h2>
              <button className="border border-[#CDA755] px-8 py-4 text-[11px] tracking-widest uppercase transition-all duration-300 text-white group-hover:bg-[#CDA755] group-hover:text-black font-mono font-bold pointer-events-none">
                Initiate Transport
              </button>
            </div>
          </Link>

          {/* RIGHT: RENT */}
          <Link
            to={safePaths.rentals}
            className="flex-1 relative group cursor-pointer overflow-hidden block bg-[#111111] hover:scale-[1.02] transition-all duration-300 ease-out"
            style={{
              background: 'radial-gradient(circle at top, rgba(205,167,85,0.08), transparent 70%), #111111'
            }}
          >
            {/* Background */}
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsk2C-PP06ooSIFwakaibhulI-wDSMxm6916YIdmVWzJgnUbH8PLH95yNYm2pkw1k1aeu6uBTNCKRbkvDNLWl6FOs5hbGCiHzPjG3PvTJTDU1emX54b3WMTxLzYNpk9Ld3i8741vbcSjOm1iT9ghmqOifat-fO3ZtQv4h_9NOHJCUFQ2QsjMAQzPCUbn-rahIocBdxEKs0HIiw-_8W9HRIvtMhHgI4Pt1Rv4S6JqNUM1cHC3HCjZc151IVMiUyEOR3T4wJEvLbe9Q"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
              alt="Rent a Machine"
            />

            {/* Overlay (slightly warmer tone for variation) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent group-hover:from-black/25 transition-all duration-500"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end items-start text-left px-12 pb-20 md:pb-24">
              <span className="text-[10px] tracking-[0.4em] uppercase text-[#CDA755] mb-4 flex items-center gap-4 font-mono font-bold">
                <div className="w-8 h-[1px] bg-[#CDA755]"></div>
                Logistic Path B
              </span>
              <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-[0.05em] mb-8 uppercase leading-[0.9] text-white">
                RENT A<br/>MACHINE
              </h2>
              <button className="border border-transparent bg-[#CDA755] px-8 py-4 text-[11px] tracking-widest uppercase transition-all duration-300 text-black group-hover:brightness-110 font-mono font-bold pointer-events-none">
                View Hub Fleet
              </button>
            </div>
          </Link>
        </section>
      </div>
    </section>
  );
}

