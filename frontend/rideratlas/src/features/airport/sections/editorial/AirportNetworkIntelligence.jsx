import React from "react";
import { motion } from "framer-motion";
import { Activity, MapPin, FastForward, Navigation2 } from "lucide-react";

export default function AirportNetworkIntelligence({ intel, airportCode }) {
  if (!intel) return null;

  const {
    most_common_finish,
    fastest_access,
    killer_metric,
    mission_density,
  } = intel;

  const stats = [
    {
      label: "Popular One-Way Finish",
      value: most_common_finish.value || "TBD",
      icon: MapPin,
      show: most_common_finish.confidence !== "low",
    },
    {
      label: "Fastest Regional Access",
      value: fastest_access.value || "TBD",
      icon: FastForward,
      show: fastest_access.confidence !== "low",
    },
    {
      label: "Mission Density",
      value: String(mission_density.value).toUpperCase(),
      icon: Activity,
      show: true,
    },
  ].filter((s) => s.show);

  return (
    <section className="bg-[#1C1B18] py-20 px-6 md:px-12 text-white overflow-hidden relative">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A14A]/5 rounded-full blur-3xl -mr-48 -mt-48" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Killer Metric / Strategic Summary */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-[#C9A14A] font-medium tracking-widest uppercase text-sm mb-6 flex items-center gap-2">
                <Navigation2 className="w-4 h-4" />
                Network Intelligence / {airportCode}
              </h3>
              
              <h2 className="text-3xl md:text-5xl font-light leading-tight mb-8">
                {killer_metric.value || `Strategic logistics node for ${airportCode} corridor operations.`}
              </h2>
              
              <p className="text-white/60 text-lg max-w-2xl font-light leading-relaxed">
                JetMyMoto maintains living route infrastructure from this hub, 
                monitoring variable pass conditions and machine availability 
                to ensure sustained mission fidelity.
              </p>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 p-6 rounded-sm backdrop-blur-sm"
              >
                <stat.icon className="w-5 h-5 text-[#C9A14A] mb-4" />
                <div className="text-white/40 text-xs uppercase tracking-widest mb-1">
                  {stat.label}
                </div>
                <div className="text-2xl font-light text-white">
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
