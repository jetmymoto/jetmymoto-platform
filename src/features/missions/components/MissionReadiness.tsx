import { Shield, ShieldAlert, ShieldCheck, Activity } from "lucide-react";

interface Props {
  mission: any;
}

export default function MissionReadiness({ mission }: Props) {
  const difficulty = mission.theaterData?.difficulty_rating || "Advanced";
  const elevation = mission.elevation_gain_m || 0;
  const borders = (mission.border_crossings || []).length;
  
  // Logic for readiness state
  let status = "Deployment Ready";
  let color = "text-green-500";
  let bgColor = "bg-green-500/5";
  let borderColor = "border-green-500/20";
  let icon = <ShieldCheck className="w-8 h-8 text-green-500" />;
  let description = "Standard tactical preparation required. All systems green for deployment.";

  if (difficulty === "Expert" || elevation > 5000 || borders > 2) {
    status = "Advanced Riders Only";
    color = "text-red-500";
    bgColor = "bg-red-500/5";
    borderColor = "border-red-500/20";
    icon = <ShieldAlert className="w-8 h-8 text-red-500" />;
    description = "High technicality and logistical complexity. Extensive off-road experience and elite fitness required.";
  } else if (difficulty === "Advanced" || elevation > 2000 || borders > 0) {
    status = "Preparation Required";
    color = "text-[#CDA755]";
    bgColor = "bg-[#CDA755]/5";
    borderColor = "border-[#CDA755]/20";
    icon = <Shield className="w-8 h-8 text-[#CDA755]" />;
    description = "Moderate to high complexity. Ensure physical conditioning and gear checklists are finalized.";
  }

  const metrics = [
    { label: "Technicality", value: difficulty },
    { label: "Verticality", value: `+${elevation}m` },
    { label: "Complexity", value: borders > 0 ? `${borders} Borders` : "Single Nation" },
    { label: "Weather", value: mission.weather_window || "Check Daily" }
  ];

  return (
    <section className="py-12 bg-[#0B0B0C]">
      <div className="container mx-auto px-8">
        <div className={`p-10 ${bgColor} border ${borderColor} relative overflow-hidden group`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-12">
            {/* Status Icon & Label */}
            <div className="flex items-center gap-8 lg:border-r lg:border-white/10 lg:pr-12">
              <div className={`p-5 rounded-full bg-white/5 border border-white/10`}>
                {icon}
              </div>
              <div className="space-y-1">
                <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">Readiness Rating</div>
                <div className={`text-3xl font-bold uppercase italic tracking-tighter ${color}`}>
                  {status}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-white/40" />
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Tactical Briefing</span>
              </div>
              <p className="text-white/70 text-lg font-medium leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>

            {/* Micro Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-col gap-6 lg:gap-4 lg:min-w-[180px]">
              {metrics.map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">{m.label}</div>
                  <div className="text-white text-sm font-bold uppercase">{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Luxury Corner Accent */}
          <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rotate-45 border-b ${borderColor} bg-white/5`} />
        </div>
      </div>
    </section>
  );
}
