import { Shield, Zap, MapPin, TrendingDown } from "lucide-react";

// ── Value proposition data ────────────────────────────────────────────────────

const PROPS = [
  {
    icon: TrendingDown,
    eyebrow: "The Rebalancing Subsidy",
    title: "Fleet Operators Pay to Move Bikes",
    body: "When a rental company has surplus inventory at one airport and a shortage at another, they need the bike to travel. Rather than paying a truck, they discount the rental. You get a 35% below-market rate. They solve a logistics problem. Both sides win.",
    stat: "35%",
    statLabel: "avg below rack rate",
  },
  {
    icon: Shield,
    eyebrow: "Hardware Validation",
    title: "Every Corridor Is Machine-Confirmed",
    body: "The Price Radar only activates when a physically available, one-way-enabled motorcycle exists at the departure airport. No phantom inventory. No bait-and-switch. If you see a corridor live, a real bike is waiting for you there.",
    stat: "100%",
    statLabel: "hardware-validated",
  },
  {
    icon: MapPin,
    eyebrow: "Scenic Route by Design",
    title: "You Ride. You Don't Return.",
    body: "Standard rentals make you retrace every kilometre. One-way corridors are structured around the route — the bike needs to end up in the destination city. The scenic road between the two airports is the entire point of the product.",
    stat: "0",
    statLabel: "backtrack kilometres",
  },
  {
    icon: Zap,
    eyebrow: "Price Radar Active",
    title: "Transparent Market Comparison",
    body: "Every corridor card shows the one-way fleet rate alongside the standard round-trip market rate (rack rate). The strikethrough price is real — it's what the same bike costs on a return booking at the same airport. The Radar makes the subsidy visible.",
    stat: "×1.45",
    statLabel: "rack rate shown for comparison",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function WhyOneWay() {
  return (
    <section className="bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-24">

        {/* ── Section header ── */}
        <div className="mb-16 max-w-2xl">
          <div className="font-mono text-[10px] font-black tracking-[0.5em] text-[#CDA755] uppercase mb-4">
            Why One-Way
          </div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-tight">
            Fleet Rebalancing Has a <br className="hidden md:block" />
            <span className="text-[#CDA755]">Rider-Side Benefit</span>
          </h2>
          <p className="mt-5 text-sm leading-7 text-zinc-500 max-w-xl">
            Rental operators run constant repositioning logistics. One-way corridors turn that operational cost into a discounted ride for you.
          </p>
        </div>

        {/* ── 2×2 grid ── */}
        <div className="grid md:grid-cols-2 gap-px bg-white/5">
          {PROPS.map((prop) => {
            const Icon = prop.icon;
            return (
              <div
                key={prop.eyebrow}
                className="relative bg-[#050505] p-10 group hover:bg-[#1E1E1E]/60 transition-colors duration-200"
              >
                {/* Icon + stat row */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 border border-white/8 bg-[#1E1E1E] flex items-center justify-center">
                    <Icon size={16} className="text-[#CDA755]" />
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-3xl font-black tabular-nums text-white leading-none">
                      {prop.stat}
                    </div>
                    <div className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest mt-1">
                      {prop.statLabel}
                    </div>
                  </div>
                </div>

                {/* Copy */}
                <div className="font-mono text-[9px] font-black uppercase tracking-widest text-[#CDA755] mb-3">
                  {prop.eyebrow}
                </div>
                <h3 className="text-base font-black tracking-tight italic text-white mb-4 uppercase leading-tight">
                  {prop.title}
                </h3>
                <p className="text-sm leading-7 text-zinc-500">
                  {prop.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Trust rail ── */}
        <div className="mt-px bg-[#1E1E1E] border-y border-white/5 px-10 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest italic">
              Corridor inventory is recalculated every time a hardware validation event occurs in the rental graph. Pricing reflects live operator tariffs.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[9px] text-emerald-500 uppercase tracking-widest font-black">
                Price Radar Active
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
