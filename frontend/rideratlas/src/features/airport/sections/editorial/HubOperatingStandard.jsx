import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, Luggage, CloudSun, UserCheck } from "lucide-react";

export default function HubOperatingStandard({ standard, airportName }) {
  // If no manual metrics, we show a default high-standard protocol
  const metrics = standard || {
    avg_response_time: { value: "< 15 mins", confidence: "high" },
    bike_ready_timing: { value: "30m post-landing", confidence: "high" },
    luggage_handling: { value: "Curbside staging", confidence: "high" },
    weather_support: { value: "Live pass monitoring", confidence: "high" },
    handover_protocol: { value: "Personalized briefing", confidence: "high" },
  };

  const protocols = [
    {
      label: "Response Standard",
      value: metrics.avg_response_time.value,
      icon: Clock,
      desc: "Maximum latency for concierge support activation.",
    },
    {
      label: "Deployment Window",
      value: metrics.bike_ready_timing.value,
      icon: UserCheck,
      desc: "Machine ready for departure after terminal exit.",
    },
    {
      label: "Equipment Logistics",
      value: metrics.luggage_handling.value,
      icon: Luggage,
      desc: "Managed staging of gear and technical equipment.",
    },
    {
      label: "Mission Integrity",
      value: metrics.weather_support.value,
      icon: CloudSun,
      desc: "Real-time rerouting based on pass availability.",
    },
  ];

  return (
    <section className="bg-white py-24 px-6 md:px-12 text-[#1C1B18]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h3 className="text-[#C9A14A] font-medium tracking-[0.2em] uppercase text-xs mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Logistics Standard
            </h3>
            <h2 className="text-4xl md:text-5xl font-light leading-tight">
              {airportName} Hub <br />Operating Protocol
            </h2>
          </div>
          <div className="pb-2">
            <p className="text-[#1C1B18]/50 text-sm uppercase tracking-widest border-b border-[#C9A14A]/30 pb-4">
              Version 2.4 / Active Hub Enforcement
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#C9A14A]/10 border border-[#C9A14A]/10">
          {protocols.map((p, idx) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-white p-8 group hover:bg-[#FBF9F4] transition-colors"
            >
              <p.icon className="w-6 h-6 text-[#C9A14A] mb-8" />
              <div className="text-3xl font-light mb-2">{p.value}</div>
              <div className="text-xs uppercase tracking-widest font-medium mb-4 text-[#C9A14A]">
                {p.label}
              </div>
              <p className="text-sm text-[#1C1B18]/50 leading-relaxed font-light">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-[#FBF9F4] border-l-2 border-[#C9A14A] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#C9A14A]" />
            </div>
            <div>
              <h4 className="font-medium text-lg mb-1">Authenticated Hub Protocol</h4>
              <p className="text-[#1C1B18]/60 text-sm font-light">
                These standards are verified daily by JetMyMoto regional corridor leads.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-[#C9A14A]/60">
            [ HUB_VERIFIED_ENFORCEMENT_OP_04 ]
          </div>
        </div>
      </div>
    </section>
  );
}
