import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Choose Your Corridor",
    body: "Browse routes where bikes need repositioning between cities. Every corridor is hardware-validated — real bikes, real availability.",
  },
  {
    num: "02",
    title: "Select Your Bike",
    body: "Pick from the one-way fleet at fleet-rebalancing rates. Cheaper than a round-trip rental because the bike needs to travel anyway.",
  },
  {
    num: "03",
    title: "Ride & Drop Off",
    body: "Arrive at the pickup city, ride the scenic route, leave the bike at the drop-off city. No returns, no double-back, no compromises.",
  },
];

export default function HowItWorksStrip() {
  return (
    <section className="bg-[#050505] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="font-mono text-[10px] font-black tracking-[0.5em] text-[#CDA755] uppercase mb-4">
            How It Works
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white">
            Three Steps to Your Corridor
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative flex items-start gap-0">
              {/* Card */}
              <div className="flex-1 bg-[#1E1E1E] border border-white/8 p-8 rounded-none">
                {/* Amber numeral */}
                <div className="font-mono text-5xl font-black text-[#CDA755] tabular-nums leading-none mb-6 select-none">
                  {step.num}
                </div>

                <h3 className="text-base font-black tracking-tight uppercase italic text-white mb-3">
                  {step.title}
                </h3>

                <p className="text-sm leading-7 text-zinc-400">
                  {step.body}
                </p>
              </div>

              {/* Connector arrow (not on last step) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex items-center justify-center w-6 shrink-0 mt-14 text-zinc-700">
                  <ArrowRight size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
