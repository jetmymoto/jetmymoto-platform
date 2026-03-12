import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  BrainCircuit,
  Star,
  ShieldCheck,
  X,
  CheckCircle,
} from "lucide-react";

const arsenalItems = [
  {
    icon: Truck,
    title: "The Airlift",
    description:
      "Skip the highway grind. We collect your bike, transport it securely, and position it exactly where your journey begins.",
    modalContent: {
      title: "The Airlift",
      description:
        "Our signature fly-in, ride-out solution. You travel comfortably while your motorcycle moves safely and professionally across Europe.",
      features: [
        "Door-to-destination insured transport",
        "Professional handling & secure loading",
        "Live tracking throughout transit",
        "Arrival preparation before pickup",
      ],
    },
  },
  {
    icon: BrainCircuit,
    title: "Charters",
    description:
      "Private track days, corporate weekends, and collector rallies. We design and execute the full logistics architecture.",
    modalContent: {
      title: "Charter Logistics",
      description:
        "For brands, groups, and collectors who require precision coordination and on-site execution.",
      features: [
        "Multi-bike coordination",
        "On-site operational support",
        "Cross-border documentation",
        "Full itinerary management",
      ],
    },
  },
  {
    icon: Star,
    title: "The GP Circuit",
    description:
      "Follow the season without hauling between circuits. We position your bike paddock-ready for every race weekend.",
    modalContent: {
      title: "GP Circuit Service",
      description:
        "MotoGP and WSBK-focused logistics designed for enthusiasts attending multiple race events.",
      features: [
        "Scheduled circuit transfers",
        "Secure storage between events",
        "Paddock-ready preparation",
        "Season-based coordination",
      ],
    },
  },
  {
    icon: ShieldCheck,
    title: "Multi-Leg Travel",
    description:
      "Ride Europe your way. We reposition your bike between destinations while you explore freely.",
    modalContent: {
      title: "Multi-Leg Journeys",
      description:
        "Complex, multi-stop European adventures without backtracking or logistical stress.",
      features: [
        "Multi-destination routing",
        "Secure interim storage",
        "Regional repositioning",
        "Fully managed coordination",
      ],
    },
  },
];

export default function OurArsenal() {
  const [activeItem, setActiveItem] = useState(null);

  return (
    <section className="relative bg-[#060606] border-t border-white/5 py-24">
      <div className="container mx-auto max-w-7xl px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[1px] w-10 bg-amber-500/50" />
            <span className="text-amber-500 font-mono text-[10px] tracking-[0.4em] uppercase font-bold">
              Our Arsenal
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif text-white leading-[1.05] tracking-tight">
            Engineered logistics for serious riders.
          </h2>

          <p className="mt-5 text-white/55 leading-relaxed">
            Every service is built around one principle: you focus on the ride.
            We handle the movement.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {arsenalItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="border-t border-white/10 pt-8"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                  <item.icon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-white text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">
                    {item.description}
                  </p>

                  <button
                    onClick={() => setActiveItem(item)}
                    className="mt-4 text-amber-500 text-sm font-mono uppercase tracking-wider hover:text-amber-400 transition-colors"
                  >
                    Learn More →
                  </button>
                </div>
              </div>

              <div className="mt-8 h-[1px] bg-gradient-to-r from-amber-500/20 via-white/10 to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-10 max-w-xl w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition"
              >
                <X size={20} />
              </button>

              <h3 className="text-2xl font-serif text-white mb-4">
                {activeItem.modalContent.title}
              </h3>

              <p className="text-white/60 leading-relaxed mb-6">
                {activeItem.modalContent.description}
              </p>

              <ul className="space-y-3">
                {activeItem.modalContent.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white/70">
                    <CheckCircle className="text-amber-500 mt-1" size={16} />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}