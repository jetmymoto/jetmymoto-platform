import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  MapPin,
  MoveUpRight,
  Tag,
  Bike,
  Crosshair,
  Compass
} from "lucide-react"
import { CINEMATIC_BACKGROUNDS } from "@/utils/cinematicBackgrounds";

const DeploymentGraphic = ({ code, country, coords }) => {

  return (
    <div className="relative w-full h-full bg-[#080808] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${CINEMATIC_BACKGROUNDS.bridgeLogistics})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.52)_0%,rgba(8,8,8,0.78)_46%,rgba(8,8,8,0.94)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(205,167,85,0.14),transparent_34%)]" />

      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        className="text-[130px] font-black tracking-[-0.05em] italic absolute"
        style={{ color: "rgba(255,255,255,0.14)" }}
      >
        {code}
      </motion.div>

      <div className="relative z-10 flex flex-col items-center">

        <div className="w-16 h-16 rounded-full border border-white/20 p-1 bg-zinc-900 mb-4 overflow-hidden">
          <img
            src={`https://flagcdn.com/w160/${country?.toLowerCase()}.png`}
            alt={country}
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div className="flex flex-col items-center gap-1">

          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-300">
            <Crosshair size={10} className="text-amber-500"/>
            LAT: {coords?.lat}
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-300">
            <Compass size={10} className="text-amber-500"/>
            LNG: {coords?.long}
          </div>

        </div>

      </div>

    </div>
  )
}


export default function DeploymentCard({ mission }) {

  const { airport_slug, airport_code, airport_name, region_desc, country_code, coords, rental, weather } = mission

  return (
    <Link to={`/airport/${airport_code?.toLowerCase()}`} className="group">

      <motion.div
        initial={{ opacity:0, y:20 }}
        whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true }}
        className="flex flex-col h-full overflow-hidden border border-white/5 bg-[#0a0a0a] transition-all hover:border-amber-500/30"
      >

        {/* header */}

        <div className="flex items-center justify-between px-5 py-4 bg-[#050505] border-b border-white/5">

          <div className="flex items-center gap-3">

            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"/>

            <span className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase italic">
              Sector Locked
            </span>

          </div>

          <span className="text-[11px] font-mono text-zinc-500 font-black tracking-widest">
            {airport_code}
          </span>

        </div>

        {/* center */}

        <div className="aspect-[16/10]">

          <DeploymentGraphic
            code={airport_code}
            country={country_code}
            coords={coords}
          />

        </div>

        {/* body */}

        <div className="p-6 flex flex-col flex-grow">

          <h4 className="text-2xl text-white font-black uppercase group-hover:text-amber-500">
            {airport_name}
          </h4>

          <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-400 uppercase">
            <MapPin size={10}/>
            {region_desc}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-px bg-white/5 border border-white/5">

            <div className="bg-[#0c0c0c] p-3">

              <div className="text-[8px] text-zinc-700 font-mono uppercase mb-2">
                Rental_Start
              </div>

              <div className="text-[10px] text-zinc-300 flex items-center gap-2">
                <Tag size={10}/>
                €{rental?.price}
              </div>

            </div>

            <div className="bg-[#0c0c0c] p-3">

              <div className="text-[8px] text-zinc-700 font-mono uppercase mb-2">
                Fleet_Class
              </div>

              <div className="text-[10px] text-zinc-300 flex items-center gap-2">
                <Bike size={10}/>
                {rental?.class}
              </div>

            </div>

          </div>

          <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/5">

            <span className="text-[9px] font-mono text-zinc-600">
              Deployment: {weather?.condition}
            </span>

            <div className="flex items-center gap-2 text-amber-500">
              Initialize
              <MoveUpRight size={14}/>
            </div>

          </div>

        </div>

      </motion.div>

    </Link>
  )
}
