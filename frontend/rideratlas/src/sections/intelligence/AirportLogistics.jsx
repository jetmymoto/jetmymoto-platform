import React from "react";
import { ArrowRight, Plane, MapPin, LogOut } from "lucide-react";

/**
 * AirportLogistics - Displays high-level logistics nodes (Origin, Theater, Destination).
 */
export default function AirportLogistics({
  origin,
  destination,
  theater,
  distance,
  duration,
  theme = "dark",
}) {
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-[#121212]" : "bg-white";
  const borderColor = isDark ? "border-white/10" : "border-black/5";
  const textColor = isDark ? "text-white" : "text-[#1C1B18]";
  const accentColor = isDark ? "text-[#CDA755]" : "text-[#C9A14A]";
  const subTextColor = isDark ? "text-zinc-300" : "text-[#706F6C]";

  return (
    <div className={`rounded-[32px] border p-8 lg:p-12 shadow-2xl ${bgColor} ${borderColor}`}>
      <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {/* Origin */}
        <div className="text-center">
          <div className={`text-[10px] uppercase tracking-[0.32em] font-black ${accentColor}`}>
            Fly into
          </div>
          <div className={`mt-4 text-5xl font-black ${textColor}`}>
            {origin?.code || "---"}
          </div>
          <div className={`mt-2 text-sm font-bold ${subTextColor}`}>
            {origin?.city || "Origin"}
          </div>
        </div>

        {/* Transition 1 */}
        <div className="hidden md:flex flex-col items-center gap-2">
          <ArrowRight className="h-6 w-6 text-zinc-700" />
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${accentColor}`}>
            {distance ? `${distance} KM` : ""}
          </span>
        </div>

        {/* Theater */}
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-black">
            Execute
          </div>
          <div className={`mt-4 text-2xl font-black uppercase tracking-tight ${textColor}`}>
            {theater || "Corridor"}
          </div>
          <div className={`mt-2 text-sm ${subTextColor}`}>
            {duration ? `${duration} Days` : "Mission Active"}
          </div>
        </div>

        {/* Transition 2 */}
        <div className="hidden md:flex flex-col items-center gap-2">
          <ArrowRight className="h-6 w-6 text-zinc-700" />
        </div>

        {/* Destination */}
        <div className="text-center">
          <div className={`text-[10px] uppercase tracking-[0.32em] font-black ${accentColor}`}>
            Fly out of
          </div>
          <div className={`mt-4 text-5xl font-black ${textColor}`}>
            {destination?.code || origin?.code || "---"}
          </div>
          <div className={`mt-2 text-sm font-bold ${subTextColor}`}>
            {destination?.city || origin?.city || "Destination"}
          </div>
        </div>
      </div>
    </div>
  );
}
