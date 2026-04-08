import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Plane } from "lucide-react";

const HERO_MEDIA = {
  poster:
    "https://images.unsplash.com/photo-1436491865332-7a61a109db05?auto=format&fit=crop&w=1920&q=80",
};

export default function TheAviationHero() {
  return (
    <section className="relative w-full min-h-[85vh] overflow-hidden bg-[#050505]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_MEDIA.poster})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          <div className="flex items-center gap-2 text-[#CDA755] text-xs tracking-[0.3em] uppercase mb-6">
            <Plane className="w-4 h-4" />
            Aviation logistics
          </div>

          <h1 className="font-serif text-[clamp(2.8rem,6vw,6rem)] leading-[0.9] max-w-3xl text-white">
            Your bike, airborne worldwide
          </h1>

          <p className="mt-6 text-white/70 max-w-xl text-lg">
            End-to-end motorcycle airlift powered by global cargo networks. From pick-up to tarmac delivery, tracked in real time.
          </p>

          <div className="mt-8">
            <Link
              to="/moto-airlift"
              className="inline-flex items-center gap-2 bg-[#CDA755] text-[#050505] px-6 py-3 text-xs uppercase tracking-[0.25em] hover:shadow-[0_0_30px_rgba(205,167,85,0.3)] transition-shadow"
            >
              Start airlift
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
