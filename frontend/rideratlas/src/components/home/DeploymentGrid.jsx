import React from "react"
import { motion } from "framer-motion"
import { GRAPH, readGraphShard } from "@/core/network/networkGraph"
import DeploymentCard from "@/components/airport/DeploymentCard"
import { getCanonicalAirportPath } from "@/utils/navigationTargets"
import { AIRPORT_COORDS } from "@/features/airport/data/airportCoords"

const hubCodes = ["MXP", "LHR", "LAX", "YVR"]

export default function DeploymentGrid() {
  const rentalShard = readGraphShard("rentals");
  const rentalsMap = rentalShard?.rentals ?? {};
  const rentalsByAirport = rentalShard?.rentalIndexes?.rentalsByAirport ?? {};

  const hubs = hubCodes
    .map((code) => {
      const airport = GRAPH.airports?.[code]
      if (!airport) return null
      const routeCount = GRAPH.routesByAirport?.[airport.code]?.length || 0

      // Derive rental summary from loaded shard
      const airportRentals = (rentalsByAirport[code] || [])
        .map((id) => rentalsMap[id])
        .filter(Boolean);
      const cheapest = airportRentals.reduce(
        (min, r) => {
          const p = parseFloat(r?.pricePerDay ?? r?.price ?? Infinity);
          return p < min ? p : min;
        },
        Infinity
      );
      const fleetClass = airportRentals[0]?.category || airportRentals[0]?.class || null;

      return {
        to: getCanonicalAirportPath(airport.code),
        mission: {
          airport_slug: airport.slug || airport.code,
          airport_code: airport.code,
          airport_name: airport.name || `${airport.city || airport.code} Hub`,
          region_desc: airport.region || airport.city || "Premier Logistics Node",
          country_code: airport.country_code || airport.country || "US",
          coords: AIRPORT_COORDS[airport.code] || airport.coords || { lat: "--", long: "--" },
          rental: cheapest < Infinity ? { price: cheapest, class: fleetClass } : null,
          weather: {
            condition: `${routeCount} routes available`,
          },
          routeCount,
        },
      }
    })
    .filter(Boolean)

  return (
    <section className="py-16 md:py-24 bg-[#050505] border-b border-white/5 relative">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-sm:flex max-sm:overflow-x-auto max-sm:snap-x max-sm:snap-mandatory max-sm:gap-4 max-sm:-mx-6 max-sm:px-6 max-sm:pb-4">
          {hubs.map(({ mission, to }, index) => (
            <motion.div
              key={mission.airport_code || index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="relative max-sm:min-w-[280px] max-sm:snap-start max-sm:shrink-0"
            >
              <div className="absolute right-2 top-2 flex gap-1.5">
                <span className="px-2 py-1 text-[10px] font-mono uppercase tracking-wide bg-[#050505]/70 text-amber-300 border border-amber-500/30 rounded-md tabular-nums">
                  {GRAPH.routesByAirport?.[mission.airport_code]?.length || 0} routes
                </span>
                {(GRAPH.missionsByInsertion?.[mission.airport_code]?.length || 0) > 0 && (
                  <span className="px-2 py-1 text-[10px] font-mono uppercase tracking-wide bg-[#050505]/70 text-[#CDA755] border border-[#CDA755]/30 rounded-md tabular-nums">
                    {GRAPH.missionsByInsertion[mission.airport_code].length} A2A
                  </span>
                )}
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
