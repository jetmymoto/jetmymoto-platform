import React from "react";
import SafeImage from "@/components/ui/SafeImage";

function MissionCard({ mission, onSelectMission }) {
  return (
    <div 
      className="group cursor-pointer"
      onClick={() => onSelectMission(mission)}
    >
      <div className="relative h-[450px] overflow-hidden mb-6">
        <SafeImage 
          src={mission.imageUrl} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {mission.isOneWay && (
          <div className="absolute top-6 right-6 bg-white/90 px-4 py-1.5 text-[9px] font-mono tracking-widest uppercase text-[#1C1B18]">
            One-Way Certified
          </div>
        )}
      </div>
      <div className="flex justify-between items-end mb-4">
        <h4 className="font-serif text-3xl text-[#1C1B18]">{mission.title}</h4>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#706F6C] font-medium">
          {mission.statLine || "Route Detail"}
        </span>
      </div>
      <p className="text-[#706F6C] font-light text-sm mb-6 line-clamp-2">
        {mission.description}
      </p>
      <div className="flex gap-6 text-[10px] font-mono text-[#C9A14A] uppercase font-bold">
        {mission.distance && <span>{mission.distance} KM</span>}
        {mission.duration && <span>{mission.duration} DAYS</span>}
        {mission.elevation && <span>ELEVATION: {mission.elevation}M</span>}
      </div>
    </div>
  );
}

export default function AirportCuratedMissions({
  airportName = "Milan",
  missions = [],
  onSelectMission,
  copy,
}) {
  if (!missions || missions.length === 0) return null;

  const displayMissions = missions.slice(0, 3);
  const tags = copy?.tags || ["The Alps", "Balkan Coast"];

  return (
    <section className="px-8 lg:px-32 py-24 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#706F6C] font-medium mb-2">
            Curated Journeys
          </div>
          <h2 className="font-serif text-6xl text-[#1C1B18]">{copy?.heading || "Routes from this Airport"}</h2>
        </div>
        <div className="flex gap-4">
          <span className="text-[10px] font-mono uppercase tracking-widest border-b-2 border-[#C9A14A] pb-1 cursor-pointer text-[#1C1B18]">All Destinations</span>
          {tags.map((tag) => (
            <span key={tag} className="text-[10px] font-mono uppercase tracking-widest text-[#706F6C] hover:text-black transition-all cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {displayMissions.map((mission, i) => (
          <MissionCard 
            key={mission.id || i} 
            mission={mission} 
            onSelectMission={onSelectMission} 
          />
        ))}
      </div>
    </section>
  );
}