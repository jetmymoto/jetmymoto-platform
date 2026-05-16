import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Hotel,
  ArrowRight,
  ExternalLink,
  Activity,
  MapPin,
} from "lucide-react";

const LINKS = {
  shipBikeQuote: () => "/moto-airlift#booking",
  shipGTQuote: () => "/moto-airlift#booking",
};

/* ── Recovery Section ─────────────────────────────────────────────────── */
export function RecoverySection({ data }) {
  if (!data || (!data.premium?.name && !data.budget?.name)) return null;

  return (
    <section id="recovery" className="py-20 bg-[#F7F6F3]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14">
          <p className="text-xs tracking-wide uppercase text-[#CDA755] mb-2">
            Where to Stay
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 leading-snug">
            Your First Night
          </h2>
          <p className="text-zinc-500 mt-4 max-w-xl text-sm leading-relaxed">
            Rest close to the hub. Skip the city transfer and recover
            properly before your first ride day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {data.premium?.name && (
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-8 border border-zinc-100">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[#CDA755]/10 rounded-xl">
                  <Hotel className="text-[#CDA755]" size={22} />
                </div>
                <span className="text-[10px] tracking-wide uppercase text-[#CDA755] bg-[#CDA755]/10 px-3 py-1.5 rounded-full font-medium">
                  Recommended
                </span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-1">
                {data.premium.name}
              </h3>
              <p className="text-xs text-zinc-400 tracking-wide mb-6">
                {data.premium.location}
              </p>
              <div className="space-y-3 mb-8">
                {data.premium.features?.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-zinc-600"
                  >
                    <CheckCircle2 size={14} className="text-[#CDA755] shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <a
                href={data.premium.href}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#CDA755] text-white font-semibold text-sm rounded-xl hover:bg-[#b8933e] transition-colors shadow-sm"
              >
                Reserve Preferred Rate <ArrowRight size={14} />
              </a>
            </div>
          )}

          {data.budget?.name && (
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-8 border border-zinc-100">
              <div className="p-3 bg-zinc-50 rounded-xl mb-6 w-fit">
                <Hotel className="text-zinc-400" size={22} />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-1">
                {data.budget.name}
              </h3>
              <p className="text-xs text-zinc-400 tracking-wide mb-6">
                {data.budget.location}
              </p>
              <div className="space-y-3 mb-8">
                {data.budget.features?.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-zinc-500"
                  >
                    <CheckCircle2 size={14} className="text-zinc-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <a
                href={data.budget.href}
                className="w-full flex items-center justify-center gap-2 py-3.5 border border-zinc-200 text-zinc-700 font-semibold text-sm rounded-xl hover:border-[#CDA755] hover:text-[#CDA755] transition-colors"
              >
                Compare Rates <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Utility Section ──────────────────────────────────────────────────── */
export function UtilitySection({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <section id="utilities" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs tracking-wide uppercase text-[#CDA755] mb-2">
            Essentials
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900">
            Before You Land
          </h2>
          <p className="text-zinc-500 mt-4 text-sm">
            Essential tools and services for a smooth arrival.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {data.map((tool, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="bg-[#F7F6F3] rounded-2xl p-8 flex flex-col items-center text-center group hover:bg-white hover:shadow-md border border-transparent hover:border-zinc-100 transition-all duration-300"
            >
              <div className="mb-5 p-4 bg-white rounded-xl shadow-sm group-hover:bg-[#CDA755]/10 transition-colors">
                <tool.icon
                  className="text-zinc-500 group-hover:text-[#CDA755] transition-colors"
                  size={26}
                />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                {tool.title}
              </h3>
              <p className="text-xs text-zinc-400 tracking-wide mb-4">
                {tool.sub}
              </p>
              <p className="text-sm text-zinc-500 mb-8 flex-1 leading-relaxed">
                {tool.desc}
              </p>
              <a
                href={tool.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#CDA755] hover:text-zinc-900 transition-colors"
              >
                {tool.cta} <ArrowRight size={14} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── City Extension Section ───────────────────────────────────────────── */
export function CityExtensionSection({ data }) {
  if (!data?.enabled) return null;

  return (
    <section id="extension" className="py-20 bg-[#F7F6F3]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14">
          <p className="text-xs tracking-wide uppercase text-[#CDA755] mb-2">
            Explore Nearby
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 leading-snug mb-3">
            {data.headline}
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xl">
            {data.subline}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(data.items ?? []).map((item, i) => (
            <div
              key={i}
              className="group flex flex-col bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-zinc-100 transition-all duration-300"
            >
              <span className="text-[10px] uppercase tracking-wide text-[#CDA755] bg-[#CDA755]/10 px-3 py-1 rounded-full w-fit mb-5 font-medium">
                {item.category}
              </span>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3 leading-tight group-hover:text-[#CDA755] transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                {item.description}
              </p>
              <div className="flex-1 border-t border-zinc-100 pt-5 mt-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={12} className="text-[#CDA755]" />
                  <span className="text-xs text-zinc-400 tracking-wide">
                    Ride Profile
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                  {item.performanceAngle}
                </p>
                <a
                  href={item.ctaLink}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#CDA755] hover:text-zinc-900 group-hover:translate-x-1 transition-all"
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

/* ── Ranking Cards ────────────────────────────────────────────────────── */
export function RankingCards({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="grid gap-5">
      {(items ?? []).map((item) => (
        <motion.div
          key={item.rank}
          whileHover={{ y: -2 }}
          className={`rounded-2xl p-6 md:p-8 bg-white shadow-sm hover:shadow-md transition-all duration-300 border ${
            item.winner ? "border-[#CDA755]/40" : "border-zinc-100"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex gap-5 items-start">
              <div
                className={`text-2xl font-bold flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
                  item.winner
                    ? "bg-[#CDA755]/10 text-[#CDA755]"
                    : "bg-zinc-50 text-zinc-400"
                }`}
              >
                {item.rank}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500 mt-1 max-w-2xl leading-relaxed">
                  {item.sub}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                  <MapPin size={10} /> {item.access}
                </div>
              </div>
            </div>
            <div className="md:text-right flex md:flex-col items-center md:items-end justify-between gap-4 shrink-0">
              <div>
                <div className="text-[#CDA755] font-bold text-xl">
                  {item.price}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {item.priceDetail}
                </div>
              </div>
              <a
                href={item.href}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  item.winner
                    ? "bg-[#CDA755] text-white hover:bg-[#b8933e] shadow-sm"
                    : "border border-zinc-200 text-zinc-700 hover:border-[#CDA755] hover:text-[#CDA755]"
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

/* ── Pain Points Section ──────────────────────────────────────────────── */
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
      d: "Tight parking + chaotic traffic = high risk of minor damage disputes.",
    },
  ];

  return (
    <section id="reality" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-[#F7F6F3] rounded-2xl p-8 md:p-12">
          <div className="mb-10">
            <p className="text-xs tracking-wide uppercase text-[#CDA755] mb-2">
              Good to Know
            </p>
            <h2 className="text-2xl font-serif font-bold text-zinc-900">
              The Reality of Renting at {airport}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {points.map((x, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-zinc-100 group shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-zinc-50 group-hover:bg-[#CDA755]/10 transition-colors">
                    <x.icon
                      size={18}
                      className="text-zinc-400 group-hover:text-[#CDA755] transition-colors"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    {x.t}
                  </h3>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Pivot Section (Logistics / Ship Your Bike) ───────────────────────── */
export function PivotSection({ airport }) {
  return (
    <section id="pivot" className="py-20 bg-[#F7F6F3]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs tracking-wide uppercase text-[#CDA755] mb-2">
            JetMyMoto Logistics
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900">
            Bring Your Own Machine
          </h2>
          <p className="text-zinc-500 mt-4 text-sm max-w-lg mx-auto">
            Skip the rental desk. Ship your own bike or GT
            and ride from the moment you land.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <a
            href={LINKS.shipGTQuote()}
            className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-zinc-100 transition-all duration-300 text-left"
          >
            <div className="p-3 rounded-xl bg-zinc-50 group-hover:bg-[#CDA755]/10 w-fit mb-6 transition-colors">
              <Activity
                size={28}
                className="text-zinc-400 group-hover:text-[#CDA755] transition-colors"
              />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              Ship Your GT
            </h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              Enclosed, insured transport. Arrive and drive. Door-to-door service.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[#CDA755] font-bold text-lg">From €1,200</span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#CDA755] group-hover:translate-x-1 transition-transform">
                Get quote <ArrowRight size={14} />
              </span>
            </div>
          </a>

          <a
            href={LINKS.shipBikeQuote()}
            className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-zinc-100 transition-all duration-300 text-left"
          >
            <div className="p-3 rounded-xl bg-zinc-50 group-hover:bg-[#CDA755]/10 w-fit mb-6 transition-colors">
              <Activity
                size={28}
                className="text-zinc-400 group-hover:text-[#CDA755] transition-colors"
              />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              Ship Your Bike
            </h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              Fly in, ride out. Your setup, your machine. Full logistics handled.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[#CDA755] font-bold text-lg">From €850</span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#CDA755] group-hover:translate-x-1 transition-transform">
                Get quote <ArrowRight size={14} />
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
