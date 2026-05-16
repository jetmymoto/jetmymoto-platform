import React from 'react';
import { Plane, Bike, Route, LogOut, Clock, Truck, ArrowRight } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "Fly to Origin",
    rider: "You fly into the insertion airport (e.g., MXP).",
    jetmymoto: "We ensure your machine is prepped and staged at our hub.",
    icon: Plane,
  },
  {
    id: 2,
    title: "Pickup & Deployment",
    rider: "Pick up your bike at our airport-adjacent facility.",
    jetmymoto: "Technical handover and luggage storage management.",
    icon: Bike,
  },
  {
    id: 3,
    title: "Ride One-Way",
    rider: "Execute your route across the geographical corridor.",
    jetmymoto: "Digital route intelligence and 24/7 concierge support.",
    icon: Route,
  },
  {
    id: 4,
    title: "Destination Handover",
    rider: "Finish at the destination airport hub (e.g., MUC).",
    jetmymoto: "Immediate post-ride inspection and recovery.",
    icon: LogOut,
  },
  {
    id: 5,
    title: "Fly Out Directly",
    rider: "Fly home from the destination—no riding back.",
    jetmymoto: "Time saved: Avoid 1-2 days of highway backtracking.",
    icon: Clock,
  },
  {
    id: 6,
    title: "Return Logistics",
    rider: "Mission complete. You head to your next destination.",
    jetmymoto: "We handle all return transport and fleet rebalancing.",
    icon: Truck,
  }
];

export default function HowA2AWorks() {
  return (
    <section className="relative py-64 overflow-hidden bg-[#050505]">
      {/* 1. Atmospheric Luminance & Tonal Elevation */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Upper Cold Haze (Row 1) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(28,45,72,0.12)_0%,transparent_60%)] blur-[100px]" />
        
        {/* Lower Warmer Horizon (Row 2) */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#CDA755]/[0.02] to-transparent" />
        
        {/* Localized Glows */}
        <div className="absolute top-1/2 left-1/4 w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,rgba(205,167,85,0.04)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] bg-[radial-gradient(circle_at_center,rgba(28,45,72,0.1)_0%,transparent_70%)] blur-[60px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-12 z-10">
        <div className="max-w-4xl mb-40 relative">
          {/* 3. Title Luminosity / Suspended Effect */}
          <div className="absolute -inset-10 bg-[#CDA755]/[0.03] blur-[60px] rounded-full pointer-events-none" />
          
          <div className="relative">
            <div className="flex items-center gap-6 mb-12">
              <div className="h-[1px] w-16 bg-[#CDA755]/30" />
              <div className="text-[11px] uppercase tracking-[0.6em] text-[#CDA755] font-black opacity-80">Logistics Engine</div>
            </div>
            <h3 className="text-6xl md:text-[5.5rem] font-black text-white tracking-tighter uppercase leading-[0.85] italic drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              The One-Way <br /> A2A Protocol
            </h3>
            <p className="mt-14 text-2xl md:text-3xl text-zinc-500 font-light leading-relaxed max-w-3xl">
              Maximize your technical riding time. Our Fly-and-Ride system eliminates the need for highway backtracking, allowing point-to-point execution while we manage the machine recovery.
            </p>
          </div>
        </div>

        {/* 4. Increased "Air" (Wider Gaps) */}
        <div className="relative grid gap-y-32 gap-x-16 md:grid-cols-2 lg:grid-cols-3">
          
          {/* 5. Atmospheric Route Line (Environmental Integration) */}
          <div className="absolute top-44 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#CDA755]/[0.08] to-transparent hidden lg:block pointer-events-none opacity-40 mix-blend-screen" />

          {steps.map((step, idx) => (
            <div key={step.id} className="relative group flex flex-col">
              {/* Floating Step Number */}
              <div className="absolute -top-16 left-0 text-[10px] font-black text-white/[0.07] uppercase tracking-[0.4em] group-hover:text-[#CDA755]/20 transition-colors duration-700">
                Phase 0{step.id}
              </div>

              <div className="relative">
                {/* Localized Icon Glow */}
                <div className="absolute inset-0 bg-[#CDA755]/[0.01] blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative mb-12 p-5 w-fit rounded-full bg-white/[0.03] border border-white/[0.05] transition-all duration-700 group-hover:bg-[#CDA755]/[0.08] group-hover:border-[#CDA755]/20 shadow-2xl">
                  <step.icon className="w-7 h-7 text-zinc-500 group-hover:text-[#CDA755] transition-colors duration-500" />
                </div>

                <h4 className="text-2xl font-black text-white/90 mb-10 uppercase tracking-tight group-hover:text-white transition-colors duration-500 leading-none">
                  {step.title}
                </h4>
                
                <div className="space-y-8 max-w-[260px]">
                  <div className="flex gap-5">
                    <div className="text-[9px] font-black text-[#CDA755]/70 uppercase mt-1 shrink-0 tracking-[0.2em]">Rider</div>
                    <p className="text-[15px] leading-relaxed text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors duration-500">{step.rider}</p>
                  </div>
                  <div className="flex gap-5 pt-8 border-t border-white/[0.03]">
                    <div className="text-[9px] font-black text-zinc-600 uppercase mt-1 shrink-0 tracking-[0.2em]">JMM</div>
                    <p className="text-[15px] leading-relaxed text-zinc-500 italic font-light group-hover:text-zinc-400 transition-colors duration-500">{step.jetmymoto}</p>
                  </div>
                </div>

                {/* Atmospheric Directional Indicator */}
                {idx < steps.length - 1 && (
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hidden lg:flex items-center transition-all duration-700 translate-x-2 group-hover:translate-x-4">
                    <ArrowRight className="w-5 h-5 text-[#CDA755]/20 mix-blend-screen" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
