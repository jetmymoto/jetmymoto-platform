import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Radar, Plane } from "lucide-react";

const items = [
  {
    Icon: ShieldCheck,
    title: "Solid Coverage",
    desc: "We treat your machine like it's our own. Proper European coverage with zero paperwork headaches.",
  },
  {
    Icon: Radar,
    title: "Live GPS Tracking",
    desc: "Watch your bike cross the map in real-time. You'll always know exactly where your ride is before you even board the flight.",
  },
  {
    Icon: Plane,
    title: "Land and Ride",
    desc: "Step off the plane, grab your keys, and go. Your bike will be parked and waiting for you exactly when you need it.",
  },
];

export default function WhyRidersChoose() {
  return (
    <section className="relative bg-[#070707] border-t border-white/5 overflow-hidden">
      {/* subtle separation from slider */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

      {/* MAP-LINE BACKDROP: HOME → AIRPORT → BASECAMP */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.svg
          className="absolute right-[-8%] top-[-12%] h-[140%] w-[85%] opacity-[0.20]"
          viewBox="0 0 1000 900"
          fill="none"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          aria-hidden="true"
        >
          <defs>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 0.55 0"
              />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="routeGrad" x1="120" y1="700" x2="920" y2="240">
              <stop offset="0" stopColor="rgba(245,158,11,0.00)" />
              <stop offset="0.45" stopColor="rgba(245,158,11,0.50)" />
              <stop offset="1" stopColor="rgba(245,158,11,0.00)" />
            </linearGradient>

            <linearGradient id="routeFaint" x1="120" y1="700" x2="920" y2="240">
              <stop offset="0" stopColor="rgba(255,255,255,0.00)" />
              <stop offset="0.35" stopColor="rgba(255,255,255,0.10)" />
              <stop offset="0.75" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.00)" />
            </linearGradient>
          </defs>

          {/* faint “air corridor” guides */}
          <path
            d="M120 650 C 280 520, 430 520, 560 560 C 720 610, 820 540, 920 420"
            stroke="url(#routeFaint)"
            strokeWidth="1"
          />
          <path
            d="M150 740 C 320 590, 520 560, 650 590 C 780 620, 860 560, 940 480"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />

          {/* main route line */}
          <motion.path
            d="M140 680 C 320 520, 520 520, 650 560 C 800 610, 860 520, 920 360"
            stroke="url(#routeGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#softGlow)"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              show: {
                pathLength: 1,
                opacity: 1,
                transition: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          />

          {/* nodes */}
          <RouteNode
            cx={140}
            cy={680}
            label="HOME"
            align="start"
            delay={0.15}
          />
          <RouteNode
            cx={560}
            cy={560}
            label="AIRPORT"
            align="middle"
            delay={0.35}
          />
          <RouteNode
            cx={920}
            cy={360}
            label="BASECAMP"
            align="end"
            delay={0.55}
          />
        </motion.svg>

        {/* vignette so it stays premium and behind everything */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-transparent to-[#070707]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070707] via-transparent to-[#070707]" />
      </div>

      <div className="container mx-auto max-w-7xl px-6 md:px-12 py-20 md:py-24 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[1px] w-10 bg-amber-500/50" />
            <span className="text-amber-500 font-mono text-[10px] tracking-[0.4em] uppercase font-bold">
              Why riders choose us
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif text-white tracking-[-0.02em] leading-[1.05]">
            No paperwork. No stress. Just ride.
          </h2>

          {/* underline reveal */}
          <div className="mt-5 h-[1px] w-full max-w-xl bg-white/10 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="h-full origin-left bg-gradient-to-r from-amber-500/50 via-amber-500/20 to-transparent"
            />
          </div>

          <p className="mt-5 text-base md:text-lg text-white/55 leading-relaxed">
            Shipping a motorcycle abroad shouldn’t feel like filing taxes. We built this around one rule:
            you ride — we handle everything else.
          </p>
        </motion.div>

        {/* 3-column strip */}
        <div className="mt-12 md:mt-16 grid gap-10 md:grid-cols-3">
          {items.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative border-t border-white/10 pt-8"
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-white text-lg font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm md:text-[15px] text-white/50 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>

              <div className="mt-8 h-[1px] w-full bg-gradient-to-r from-amber-500/20 via-white/10 to-transparent" />
            </motion.div>
          ))}
        </div>

        {/* Bottom confidence strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-t border-white/5 pt-10"
        >
          <p className="text-xs md:text-sm font-mono uppercase tracking-[0.22em] text-amber-500/80">
            Our motto: No paperwork.
          </p>

          <div className="flex flex-wrap gap-6 text-[11px] font-mono uppercase tracking-[0.2em] text-white/35">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500/70" />
              Clear communication
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500/70" />
              Rider-first handling
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500/70" />
              Airport precision
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function RouteNode({ cx, cy, label, align, delay }) {
  const anchor = align === "start" ? "start" : align === "end" ? "end" : "middle";
  const textX = align === "start" ? cx + 14 : align === "end" ? cx - 14 : cx;
  const textY = cy - 16;

  return (
    <g>
      {/* outer pulse */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="10"
        fill="rgba(245,158,11,0.10)"
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{
          opacity: 1,
          scale: [0.85, 1.05, 0.85],
          transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay },
        }}
        viewport={{ once: true, amount: 0.35 }}
      />

      {/* core dot */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="3.8"
        fill="rgba(245,158,11,0.75)"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{
          opacity: 1,
          scale: [0.95, 1.08, 0.95],
          transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay },
        }}
        viewport={{ once: true, amount: 0.35 }}
      />

      {/* label */}
      <motion.text
        x={textX}
        y={textY}
        textAnchor={anchor}
        fill="rgba(255,255,255,0.28)"
        fontSize="12"
        letterSpacing="3"
        style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
        initial={{ opacity: 0, y: 6 }}
        whileInView={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: delay + 0.2 },
        }}
        viewport={{ once: true, amount: 0.35 }}
      >
        {label}
      </motion.text>
    </g>
  );
}
