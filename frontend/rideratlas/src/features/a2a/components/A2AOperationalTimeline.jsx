import React from 'react';
import { 
  CalendarCheck, 
  Settings, 
  Plane, 
  Key, 
  Bike, 
  LogOut, 
  Truck 
} from 'lucide-react';

const steps = [
  {
    id: 1,
    label: "Reservation",
    title: "Mission Secured",
    description: "Slot confirmed. Logistics layer activated.",
    icon: CalendarCheck,
  },
  {
    id: 2,
    label: "Staging",
    title: "Machine Prep",
    description: "Technical inspection and staging at insertion hub.",
    icon: Settings,
  },
  {
    id: 3,
    label: "Insertion",
    title: "Rider Arrival",
    description: "Fly into terminal. Ground transport to hub.",
    icon: Plane,
  },
  {
    id: 4,
    label: "Acquisition",
    title: "Handover",
    description: "Final brief and machine acquisition.",
    icon: Key,
  },
  {
    id: 5,
    label: "Execution",
    title: "The Corridor",
    description: "Mission active. Multi-day technical riding.",
    icon: Bike,
  },
  {
    id: 6,
    label: "Extraction",
    title: "Rider Departure",
    description: "Arrive at extraction hub. Machine handover.",
    icon: LogOut,
  },
  {
    id: 7,
    label: "Recovery",
    title: "Fleet Reset",
    description: "Machine returned to base. Mission debrief.",
    icon: Truck,
  }
];

export default function A2AOperationalTimeline({ mission }) {
  return (
    <section className="py-24 border-t border-white/5 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center lg:text-left">
          <div className="text-[10px] uppercase tracking-[0.4em] text-[#CDA755] font-black">
            Operational Protocol
          </div>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-white lg:text-5xl uppercase">
            Mission Timeline
          </h2>
          <p className="mt-6 text-sm leading-7 text-zinc-500 lg:text-base max-w-2xl mx-auto lg:mx-0">
            From initial booking to final fleet recovery, our logistics engine ensures a seamless operational flow. 
            No wasted days, no technical friction.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="absolute top-10 left-0 w-full h-px bg-white/5 hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-y-16 gap-x-8 relative">
            {steps.map((step) => (
              <div key={step.id} className="relative group">
                {/* Icon Container */}
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#111] border border-white/5 group-hover:border-[#CDA755]/30 transition-all duration-500 mb-8 mx-auto lg:mx-0">
                  <step.icon className="h-8 w-8 text-[#CDA755]/80 group-hover:text-[#CDA755] transition-colors" />
                  
                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-xl bg-[#CDA755] flex items-center justify-center text-[11px] font-black text-black shadow-lg">
                    {step.id}
                  </div>
                </div>

                <div className="text-center lg:text-left">
                  <div className="text-[9px] uppercase tracking-[0.25em] text-[#CDA755] font-bold mb-2">
                    {step.label}
                  </div>
                  <h4 className="text-base font-black text-white uppercase tracking-tight mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
