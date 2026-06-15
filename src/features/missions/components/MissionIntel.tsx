import { 
  Trophy, 
  Fuel, 
  Globe, 
  Route as RouteIcon, 
  Calendar, 
  AlertTriangle 
} from "lucide-react";

interface Props {
  mission: any;
}

export default function MissionIntel({ mission }: Props) {
  const difficulty = mission.theaterData?.difficulty_rating || "Advanced";
  const fuelRange = mission.fuel_range_requirement || "150km minimum";
  const borders = (mission.border_crossings || []).length > 0 
    ? `${mission.border_crossings.length} Crossings` 
    : "No Crossings";
  const roadTypes = mission.theaterData?.terrain_type || "Mixed Surface";
  const season = mission.weather_window || mission.theaterData?.best_season || "Check Window";
  const weatherRisk = mission.theaterData?.weather_risk || "Mountain Exposure";

  const intelCards = [
    { label: "Difficulty", value: difficulty, icon: <Trophy className="w-5 h-5 text-[#CDA755]" /> },
    { label: "Fuel Range", value: fuelRange, icon: <Fuel className="w-5 h-5 text-[#CDA755]" /> },
    { label: "Border Crossings", value: borders, icon: <Globe className="w-5 h-5 text-[#CDA755]" /> },
    { label: "Road Types", value: roadTypes, icon: <RouteIcon className="w-5 h-5 text-[#CDA755]" /> },
    { label: "Best Season", value: season, icon: <Calendar className="w-5 h-5 text-[#CDA755]" /> },
    { label: "Weather Risk", value: weatherRisk, icon: <AlertTriangle className="w-5 h-5 text-[#CDA755]" /> }
  ];

  return (
    <section className="py-24 bg-[#0B0B0C] border-t border-white/5">
      <div className="container mx-auto px-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-[1px] w-12 bg-[#CDA755] opacity-50" />
          <h2 className="text-[#CDA755] text-xs font-black uppercase tracking-[0.4em]">Tactical Intelligence</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {intelCards.map((card, i) => (
            <div key={i} className="p-8 bg-white/[0.02] border border-white/5 flex flex-col gap-6 group hover:border-[#CDA755]/30 transition-all duration-500">
              <div className="p-3 bg-white/5 border border-white/10 rounded-sm w-fit group-hover:border-[#CDA755]/50 transition-colors duration-500">
                {card.icon}
              </div>
              
              <div className="space-y-1">
                <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
                  {card.label}
                </div>
                <div className="text-white text-xl font-bold tracking-tight">
                  {card.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
