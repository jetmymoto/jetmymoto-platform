import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Hotel,
  ArrowRight,
  ExternalLink,
  Activity,
  MapPin
} from "lucide-react";

const LINKS = {
  shipBikeQuote: () => "/moto-airlift#booking",
  shipGTQuote: () => "/moto-airlift#booking",
};
export function RecoverySection({ data }) {
  if (!data || (!data.premium?.name && !data.budget?.name)) return null;

  return (
    <section id="recovery" className="py-24 bg-[#050505] border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="mb-12">
          <div className="text-amber-500 font-mono text-[11px] font-black tracking-[0.5em] uppercase italic mb-4">
            ARRIVAL_RECOVERY_PROTOCOL
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-black italic uppercase text-white leading-none">
            The First Night <br />
            <span className="text-zinc-500 text-3xl md:text-4xl">
              Staging & Gear Check
            </span>
          </h2>
          <p className="text-zinc-400 italic mt-6 max-w-xl">
            Your first night isn't tourism—it's recovery. Sleep near the
            corridor. Don't burn day one in city transfers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {data.premium?.name && (
            <div className="group bg-gradient-to-br from-zinc-900 to-black border border-amber-500/20 p-8 rounded-[2rem] hover:border-amber-500/50 transition-all shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <Hotel className="text-amber-500" size={24} />
                </div>
                <div className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Official Stay Partner
                </div>
              </div>
              <h3 className="text-2xl font-black italic uppercase text-white mb-2">
                {data.premium.name}
              </h3>
              <div className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-6 italic">
                {data.premium.location}
              </div>
              <div className="space-y-3 mb-8">
                {data.premium.features?.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm italic text-zinc-300"
                  >
                    <CheckCircle2 size={14} className="text-amber-500" /> {f}
                  </div>
                ))}
              </div>
              <a
                href={data.premium.href}
                className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 text-black font-mono font-black uppercase italic tracking-widest text-xs rounded-xl hover:bg-amber-400 transition-all shadow-lg"
              >
                Reserve Preferred Rate <ArrowRight size={14} />
              </a>
            </div>
          )}

          {data.budget?.name && (
            <div className="group bg-zinc-950/50 border border-white/10 p-8 rounded-[2rem] hover:bg-zinc-900/50 transition-all">
              <div className="p-3 bg-zinc-800 rounded-2xl border border-white/10 mb-8 w-fit">
                <Hotel className="text-zinc-500" size={24} />
              </div>
              <h3 className="text-2xl font-black italic uppercase text-white mb-2">
                {data.budget.name}
              </h3>
              <div className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-6 italic">
                {data.budget.location}
              </div>
              <div className="space-y-3 mb-8">
                {data.budget.features?.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm italic text-zinc-400"
                  >
                    <CheckCircle2 size={14} className="text-zinc-600" /> {f}
                  </div>
                ))}
              </div>
              <a
                href={data.budget.href}
                className="w-full flex items-center justify-center gap-2 py-4 border border-white/20 text-white font-mono font-black uppercase italic tracking-widest text-xs rounded-xl hover:border-amber-500 transition-all"
              >
                Compare Smart Rates <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function UtilitySection({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <section id="utilities" className="py-24 bg-[#050505] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-amber-500 font-mono text-[10px] font-black tracking-[0.4em] uppercase italic mb-4">
            TACTICAL_SETUP_KIT
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-black italic uppercase text-white">
            Before You Land
          </h2>
          <p className="text-zinc-500 italic mt-4">
            Essential mission utilities. Think operationally.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {data.map((tool, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 bg-zinc-900/30 border border-white/5 rounded-[2rem] hover:border-amber-500/30 transition-all flex flex-col items-center text-center group"
            >
              <div className="mb-6 p-4 bg-white/5 rounded-2xl group-hover:bg-amber-500/10 transition-colors">
                <tool.icon
                  className="text-zinc-500 group-hover:text-amber-500 transition-colors"
                  size={28}
                />
              </div>
              <h3 className="text-xl font-black italic uppercase text-white">
                {tool.title}
              </h3>
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-500/60 mb-4">
                {tool.sub}
              </div>
              <p className="text-sm text-zinc-400 italic mb-8 flex-1 leading-relaxed">
                {tool.desc}
              </p>
              <a
                href={tool.href}
                className="w-full py-3 bg-zinc-950 border border-white/10 rounded-xl font-mono font-black uppercase italic tracking-widest text-[11px] hover:border-amber-500 hover:text-amber-500 transition-all"
              >
                {tool.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CityExtensionSection({ data }) {
  if (!data?.enabled) return null;

  return (
    <section
      id="extension"
      className="py-24 bg-[#050505] border-t border-white/5 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="mb-16">
          <div className="text-amber-500 font-mono text-[10px] font-black tracking-[0.5em] uppercase italic mb-4">
            MISSION_EXTENSION_NODE
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-black italic uppercase text-white leading-none mb-4">
            {data.headline}
          </h2>
          <p className="text-zinc-500 italic text-lg">{data.subline}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(data.items ?? []).map((item, i) => (
            <div
              key={i}
              className="group flex flex-col p-8 rounded-[2rem] border border-white/5 bg-zinc-950/40 hover:bg-zinc-900/40 hover:border-amber-500/30 transition-all duration-300"
            >
              <div className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-500/60 mb-6 bg-amber-500/5 px-3 py-1 rounded-full w-fit border border-amber-500/10">
                {item.category}
              </div>
              <h3 className="text-2xl font-black italic uppercase text-white mb-4 leading-tight group-hover:text-amber-100 transition-colors">
                {item.title}
              </h3>
              <p className="text-zinc-400 italic text-sm leading-relaxed mb-6">
                {item.description}
              </p>
              <div className="flex-1 border-t border-white/5 pt-6 mt-auto">
                <div className="flex items-center gap-2 mb-8">
                  <Activity size={12} className="text-amber-500" />
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500">
                    Performance Analysis
                  </span>
                </div>
                <p className="text-xs text-zinc-500 italic leading-relaxed mb-8">
                  {item.performanceAngle}
                </p>
                <a
                  href={item.ctaLink}
                  className="inline-flex items-center gap-3 text-amber-500 font-mono font-black uppercase italic tracking-[0.25em] text-[10px] group-hover:translate-x-2 transition-transform"
                >
                  {item.ctaLabel} <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RankingCards({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="grid gap-6">
      {(items ?? []).map((item) => (
        <motion.div
          key={item.rank}
          className={`rounded-3xl border p-6 md:p-8 bg-zinc-950/60 backdrop-blur-md transition-all group ${
            item.winner ? "border-amber-500/40 shadow-xl" : "border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex gap-6 items-start">
              <div
                className={`text-3xl font-black italic flex flex-col items-center justify-center w-12 shrink-0 ${
                  item.winner ? "text-amber-500" : "text-zinc-700"
                }`}
              >
                0{item.rank}
              </div>
              <div>
                <div className="text-xl font-black italic uppercase text-white group-hover:text-amber-100 transition-colors">
                  {item.title}
                </div>
                <div className="text-sm text-zinc-400 italic mt-2 max-w-2xl leading-relaxed">
                  {item.sub}
                </div>
                <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500 italic flex items-center gap-2">
                  <MapPin size={10} /> {item.access}
                </div>
              </div>
            </div>
            <div className="md:text-right flex md:flex-col items-center md:items-end justify-between gap-6 shrink-0">
              <div>
                <div className="text-amber-300 font-black italic text-2xl">
                  {item.price}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic mt-1">
                  {item.priceDetail}
                </div>
              </div>
              <a
                href={item.href}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-[11px] font-mono font-black italic uppercase tracking-widest transition-all ${
                  item.winner
                    ? "bg-amber-500 text-black border-transparent"
                    : "border-white/20 text-white"
                }`}
              >
                {item.cta} <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function PainPointsSection({ airport }) {
  const points = [
    {
      icon: Activity,
      t: "Shuttle Lag & Queues",
      d: "Off-site budget brands can add 45–90 mins. Terminal desks have peak season queues.",
    },
    {
      icon: CheckCircle2,
      t: "Insurance Pressure",
      d: "Desk agents are incentivized to upsell. Know your coverage before you land.",
    },
    {
      icon: Activity,
      t: "Scratch & Damage Risk",
      d: "Tight Riviera parking + chaotic traffic = high risk of minor damage disputes.",
    },
  ];
  return (
    <section
      id="reality"
      className="py-20 bg-[#070707] border-b border-white/5 relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="p-10 border border-white/10 bg-[#050505]/60 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-black italic uppercase text-white">
              The Reality of Renting at {airport}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {points.map((x, i) => (
              <div
                key={i}
                className="border border-white/10 bg-white/5 p-6 rounded-2xl group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <x.icon
                    size={20}
                    className="text-zinc-400 group-hover:text-amber-500 transition-colors"
                  />
                  <div className="text-lg font-black italic uppercase text-white group-hover:text-amber-100 transition-colors">
                    {x.t}
                  </div>
                </div>
                <div className="text-sm text-zinc-400 italic leading-relaxed">
                  {x.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PivotSection({ airport }) {
  return (
    <section
      id="pivot"
      className="py-24 bg-[#050505] border-t border-white/5 relative overflow-hidden text-center md:text-left"
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="rounded-[3rem] border border-amber-500/20 bg-gradient-to-br from-zinc-900/80 via-black/90 to-black p-10 md:p-20 backdrop-blur-2xl">
          <h2 className="text-4xl md:text-6xl font-serif font-black italic uppercase text-white leading-[0.9] mb-12">
            Enthusiast Mode: <br />{" "}
            <span className="text-amber-500">Bring Your Own.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <a
              href={LINKS.shipGTQuote()}
              className="group p-8 rounded-3xl border border-white/10 bg-white/5 hover:border-amber-500/40 transition-all text-left"
            >
              <Activity
                size={32}
                className="text-zinc-500 group-hover:text-amber-500 transition-colors mb-6"
              />
              <div className="text-2xl font-black italic uppercase text-white mb-3">
                Ship your GT
              </div>
              <p className="text-zinc-400 italic mb-8 text-sm leading-relaxed">
                Enclosed, insured transport. Arrive & drive. From €1200.
              </p>
              <div className="inline-flex items-center gap-3 text-amber-500 font-mono font-black uppercase italic tracking-[0.25em] text-xs group-hover:translate-x-2 transition-transform">
                Get quote <ArrowRight size={16} />
              </div>
            </a>
            <a
              href={LINKS.shipBikeQuote()}
              className="group p-8 rounded-3xl border border-white/10 bg-white/5 hover:border-amber-500/40 transition-all text-left"
            >
              <Activity
                size={32}
                className="text-zinc-500 group-hover:text-amber-500 transition-colors mb-6"
              />
              <div className="text-2xl font-black italic uppercase text-white mb-3">
                Ship your bike
              </div>
              <p className="text-zinc-400 italic mb-8 text-sm leading-relaxed">
                Fly-in, ride-out logistics. Your setup. From €850.
              </p>
              <div className="inline-flex items-center gap-3 text-amber-500 font-mono font-black uppercase italic tracking-[0.25em] text-xs group-hover:translate-x-2 transition-transform">
                Get quote <ArrowRight size={16} />
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

