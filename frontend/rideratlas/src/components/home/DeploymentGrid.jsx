import React from "react"
import { motion } from "framer-motion"
import { GRAPH } from "@/core/network/networkGraph"
import DeploymentCard from "@/components/airport/DeploymentCard"
import { getCanonicalAirportPath } from "@/utils/navigationTargets"

const hubCodes = ["MXP", "LHR", "LAX", "YVR"]

export default function DeploymentGrid() {
  const hubs = hubCodes
    .map((code) => {
      const airport = GRAPH.airports?.[code]
      if (!airport) return null
      const routeCount = GRAPH.routesByAirport?.[airport.code]?.length || 0

      return {
        to: getCanonicalAirportPath(airport.code),
        mission: {
          airport_slug: airport.slug || airport.code,
          airport_code: airport.code,
          airport_name: airport.name || `${airport.city || airport.code} Hub`,
          region_desc: airport.region || airport.city || "Premier Logistics Node",
          country_code: airport.country_code || airport.country || "US",
          coords: airport.coords || { lat: "--", long: "--" },
          weather: {
            condition: `${routeCount} routes available`,
          },
          routeCount,
        },
      }
    })
    .filter(Boolean)

  return (
    <section className="py-24 bg-[#050505] border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-serif text-white uppercase font-black italic mb-4">
              Global Deployment Hubs
            </h2>
            <p className="text-sm md:text-base font-mono text-amber-500 uppercase tracking-widest">
              Select a certified logistics node
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hubs.map(({ mission, to }, index) => (
            <motion.div
              key={mission.airport_code || index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="relative"
            >
              <div className="absolute right-2 top-2 px-2 py-1 text-[10px] font-mono uppercase tracking-wide bg-[#050505]/70 text-amber-300 border border-amber-500/30 rounded-md tabular-nums">
                {GRAPH.routesByAirport?.[mission.airport_code]?.length || 0} routes
              </div>
              <DeploymentCard mission={mission} to={to} />
            </motion.div>
          ))}

          {hubs.length === 0 && (
            <div className="col-span-full text-center text-zinc-400 font-mono text-sm py-10">
              Loading Deployment Hub Data...
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
