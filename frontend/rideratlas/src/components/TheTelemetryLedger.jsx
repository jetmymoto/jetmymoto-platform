import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Mountain, CornerDownRight, Crosshair } from 'lucide-react';

/* ──────────────────────────────────────────────────────────
   TheTelemetryLedger.jsx — "Project Tactile Hardware"
   Route / Rental display: military-grade field ledger
   ────────────────────────────────────────────────────────── */

const AMBER = '#CDA755';
const MATTE = '#1E1E1E';
const OBSIDIAN = '#050505';
const CHALK = '#F8F8F8';

// ─── Heavy Spring Physics Config ────────────────────────
const heavySpring = { type: 'spring', stiffness: 400, damping: 30 };
const depressSpring = { type: 'spring', stiffness: 600, damping: 25 };

// ─── Skeleton (Zero Layout Shift) ───────────────────────
const LedgerSkeleton = () => (
  <section className="w-full max-w-6xl mx-auto p-6">
    {/* Header skeleton */}
    <div className="flex items-center gap-3 mb-6">
      <div className="w-3 h-3 rounded-full bg-[#1E1E1E] animate-pulse" />
      <div className="h-4 w-48 rounded bg-[#1E1E1E] animate-pulse" />
    </div>
    {/* Grid skeleton — exact same 3-column layout */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-sm overflow-hidden border border-white/5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-[420px] bg-[#0C0C0C] border-r border-white/5 last:border-r-0 animate-pulse">
          <div className="h-8 bg-[#1E1E1E] border-b border-white/5" />
          <div className="p-6 flex flex-col gap-4">
            <div className="h-40 rounded bg-[#141414]" />
            <div className="h-3 w-3/4 rounded bg-[#141414]" />
            <div className="h-3 w-1/2 rounded bg-[#141414]" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ─── E-ink Map Tile ─────────────────────────────────────
const EinkMapTile = () => (
  <div className="relative h-full flex flex-col">
    {/* Tile header — machined tab */}
    <div className="h-8 bg-[#141414] border-b border-white/[0.06] flex items-center px-4
                    shadow-[inset_0_-1px_0px_rgba(0,0,0,0.5)]">
      <div className="w-1.5 h-1.5 rounded-full bg-[#CDA755]/50 shadow-[0_0_4px_rgba(205,167,85,0.3)] mr-2" />
      <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/30 font-bold">
        Route Vector
      </span>
    </div>

    {/* E-ink style route map */}
    <div className="flex-1 relative bg-[#0C0C0C] overflow-hidden">
      {/* Grid underlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(${AMBER}40 1px, transparent 1px),
            linear-gradient(90deg, ${AMBER}40 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Abstract route line — SVG e-ink style */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 360" fill="none" aria-hidden="true">
        {/* Route path */}
        <motion.path
          d="M 60 320 C 80 260, 100 220, 120 200 S 160 140, 180 120 S 220 80, 240 60"
          stroke={CHALK}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 4"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
        />
        {/* Waypoints */}
        {[
          { cx: 60, cy: 320 },
          { cx: 120, cy: 200 },
          { cx: 180, cy: 120 },
          { cx: 240, cy: 60 },
        ].map((pt, i) => (
          <motion.g key={i}>
            <circle cx={pt.cx} cy={pt.cy} r="4" fill={OBSIDIAN} stroke={CHALK} strokeWidth="1" opacity="0.5" />
            <motion.circle
              cx={pt.cx}
              cy={pt.cy}
              r="6"
              fill="none"
              stroke={AMBER}
              strokeWidth="0.5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, delay: i * 0.6, repeat: Infinity, repeatDelay: 3 }}
            />
          </motion.g>
        ))}
      </svg>

      {/* Route label overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-[0.2em] text-white/20 uppercase">MXP → Stelvio</span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-white/20 uppercase">IT-36</span>
        </div>
      </div>
    </div>
  </div>
);

// ─── Telemetry Display Tile ─────────────────────────────
const TelemetryTile = () => {
  const [pingActive, setPingActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPingActive(true);
      const t = setTimeout(() => setPingActive(false), 1200);
      return () => clearTimeout(t);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const telemetryData = [
    { label: 'DISTANCE', value: '347', unit: 'KM', icon: MapPin },
    { label: 'ALTITUDE Δ', value: '2,757', unit: 'M', icon: Mountain },
    { label: 'HAIRPINS', value: '48', unit: 'CT', icon: CornerDownRight },
    { label: 'AVG GRADE', value: '7.2', unit: '%', icon: null },
    { label: 'EST. TIME', value: '06:42', unit: 'HRS', icon: null },
    { label: 'FUEL STOPS', value: '03', unit: 'REQ', icon: null },
  ];

  return (
    <div className="relative h-full flex flex-col">
      {/* Tile header */}
      <div className="h-8 bg-[#141414] border-b border-white/[0.06] flex items-center justify-between px-4
                      shadow-[inset_0_-1px_0px_rgba(0,0,0,0.5)]">
        <div className="flex items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#CDA755]/50 shadow-[0_0_4px_rgba(205,167,85,0.3)] mr-2" />
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/30 font-bold">
            Mission Telemetry
          </span>
        </div>
        {/* Radar ping */}
        <div className="relative">
          <Crosshair className="w-3 h-3 text-white/20" />
          <AnimatePresence>
            {pingActive && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border border-[#CDA755]/40"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Telemetry readout grid */}
      <div className="flex-1 bg-[#0C0C0C] p-4">
        <div className="grid grid-cols-2 gap-0 h-full">
          {telemetryData.map((item, idx) => (
            <div
              key={item.label}
              className={`flex flex-col justify-center px-4 py-3
                         border-white/[0.04]
                         ${idx % 2 === 0 ? 'border-r' : ''}
                         ${idx < telemetryData.length - 2 ? 'border-b' : ''}`}
            >
              <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/20 mb-1">
                {item.label}
              </span>
              <div className="flex items-baseline gap-1.5">
                <motion.span
                  className="font-mono text-2xl font-bold tabular-nums"
                  style={{
                    color: AMBER,
                    textShadow: `0 0 12px rgba(205,167,85,0.3), 0 0 4px rgba(205,167,85,0.15)`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                >
                  {item.value}
                </motion.span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-white/20 uppercase">
                  {item.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Mission Hardware Match Tile ────────────────────────
const HardwareMatchTile = () => {
  const [deployed, setDeployed] = useState(false);

  return (
    <div className="relative h-full flex flex-col">
      {/* Tile header */}
      <div className="h-8 bg-[#141414] border-b border-white/[0.06] flex items-center px-4
                      shadow-[inset_0_-1px_0px_rgba(0,0,0,0.5)]">
        <div className="w-1.5 h-1.5 rounded-full bg-[#CDA755]/50 shadow-[0_0_4px_rgba(205,167,85,0.3)] mr-2" />
        <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/30 font-bold">
          Hardware Match
        </span>
      </div>

      {/* Machine showcase */}
      <div className="flex-1 bg-[#0C0C0C] flex flex-col">
        {/* High-contrast machine render area */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(205,167,85,0.03)_0%,transparent_70%)]" />

          {/* Machine silhouette placeholder — production would use real image */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, ...heavySpring }}
              className="w-52 h-32 relative"
            >
              {/* Stylized motorcycle silhouette via CSS shapes */}
              <svg viewBox="0 0 220 120" fill="none" className="w-full h-full" aria-hidden="true">
                {/* Rear wheel */}
                <circle cx="45" cy="90" r="25" stroke={CHALK} strokeWidth="1.5" opacity="0.4" />
                <circle cx="45" cy="90" r="18" stroke={CHALK} strokeWidth="0.5" opacity="0.2" />
                {/* Front wheel */}
                <circle cx="175" cy="90" r="25" stroke={CHALK} strokeWidth="1.5" opacity="0.4" />
                <circle cx="175" cy="90" r="18" stroke={CHALK} strokeWidth="0.5" opacity="0.2" />
                {/* Frame */}
                <path d="M 45 85 L 80 45 L 140 40 L 175 85" stroke={CHALK} strokeWidth="1" opacity="0.3" />
                {/* Tank + seat */}
                <path d="M 80 45 Q 100 30, 120 35 L 140 40 L 130 50 L 85 50 Z" fill={CHALK} opacity="0.08" stroke={CHALK} strokeWidth="0.5" />
                {/* Forks */}
                <line x1="155" y1="55" x2="175" y2="65" stroke={CHALK} strokeWidth="1" opacity="0.3" />
                {/* Handlebar */}
                <line x1="145" y1="38" x2="160" y2="32" stroke={AMBER} strokeWidth="1" opacity="0.5" />
                {/* Exhaust glow */}
                <motion.ellipse
                  cx="30" cy="78" rx="8" ry="3"
                  fill={AMBER}
                  opacity="0.15"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Machine info bar */}
        <div className="px-4 py-3 border-t border-white/[0.04]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#CDA755]/70 uppercase font-bold">
              BMW R 1300 GS
            </span>
            <span className="font-mono text-[9px] tracking-[0.15em] text-white/20 uppercase">
              EagleRider MXP
            </span>
          </div>
          <div className="flex gap-4 mb-3">
            {[
              { k: 'CLASS', v: 'ADV' },
              { k: 'POWER', v: '145HP' },
              { k: 'RATE', v: '€189/D' },
            ].map((s) => (
              <div key={s.k} className="flex items-baseline gap-1">
                <span className="font-mono text-[8px] tracking-[0.2em] text-white/15 uppercase">{s.k}</span>
                <span className="font-mono text-[11px] tabular-nums text-white/50 font-bold">{s.v}</span>
              </div>
            ))}
          </div>

          {/* INITIATE DEPLOYMENT CTA */}
          <motion.button
            whileTap={{ scale: 0.95, y: 2 }}
            whileHover={{ scale: 1.01 }}
            transition={depressSpring}
            onClick={() => setDeployed((d) => !d)}
            className="relative w-full h-12 rounded-sm overflow-hidden cursor-pointer
                       bg-gradient-to-b from-[#1E1E1E] to-[#141414]
                       border border-[#CDA755]/20
                       shadow-[inset_0_1px_0px_rgba(255,255,255,0.04),inset_0_-2px_4px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.5)]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CDA755]/50
                       active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]
                       group"
          >
            {/* Knurled texture */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, #fff 2px, #fff 3px)`,
              }}
            />

            {/* Amber fill on deploy */}
            <motion.div
              animate={{ scaleX: deployed ? 1 : 0 }}
              transition={heavySpring}
              className="absolute inset-0 bg-[#CDA755]/10 origin-left"
            />

            <span className="relative font-mono text-[10px] tracking-[0.4em] uppercase font-bold
                             text-[#CDA755] group-active:text-[#CDA755]/80">
              {deployed ? '■ DEPLOYMENT INITIATED' : '▸ INITIATE DEPLOYMENT'}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────
const TheTelemetryLedger = ({ isLoading = false }) => {
  if (isLoading) return <LedgerSkeleton />;

  return (
    <section className="w-full max-w-6xl mx-auto p-6 bg-[#050505]">
      {/* Section header — field ledger stamp */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#CDA755]/40 shadow-[0_0_8px_rgba(205,167,85,0.3)]" />
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/25 font-bold">
          Mission Dossier — Stelvio Assault
        </span>
        <div className="flex-1 h-px bg-white/[0.03]" />
        <span className="font-mono text-[9px] tabular-nums text-white/15">MXP-STEL-2026</span>
      </motion.div>

      {/* Pelican-case insert grid — 3 tiles with machined dividers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ...heavySpring }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-sm overflow-hidden
                   border border-white/[0.06]
                   shadow-[inset_0_0_0_1px_rgba(0,0,0,0.8),0_8px_32px_rgba(0,0,0,0.5)]
                   bg-[#0A0A0A]"
      >
        {/* Tile 1: E-ink Route Map */}
        <div className="h-[420px] border-r border-white/[0.04] lg:border-r">
          <EinkMapTile />
        </div>

        {/* Tile 2: Tactical Telemetry */}
        <div className="h-[420px] border-r border-white/[0.04] lg:border-r">
          <TelemetryTile />
        </div>

        {/* Tile 3: Mission Hardware Match */}
        <div className="h-[420px]">
          <HardwareMatchTile />
        </div>
      </motion.div>

      {/* Bottom edge — industrial designation strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-3 flex items-center justify-between px-2"
      >
        <span className="font-mono text-[8px] tracking-[0.3em] text-white/10 uppercase">
          Rider Atlas / JetMyMoto Tactical
        </span>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-green-500/40 shadow-[0_0_4px_rgba(34,197,94,0.3)]" />
          <span className="font-mono text-[8px] tracking-[0.2em] text-white/10 uppercase tabular-nums">
            SYS NOMINAL — 2026.03.27
          </span>
        </div>
      </motion.div>
    </section>
  );
};

export default TheTelemetryLedger;
