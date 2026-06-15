import { PlaneLanding, PlaneTakeoff, Map, Flag } from "lucide-react";

interface Props {
  mission: any;
}

export default function MissionLogistics({ mission }: Props) {
  const insertion = mission.insertion;
  const extraction = mission.extraction;

  const countries = Array.from(new Set([
    insertion.country?.toUpperCase(),
    extraction.country?.toUpperCase(),
    ...(mission.countries || [])
  ])).filter(Boolean).join(" / ");

  return (
    <section className="py-24 bg-[#0B0B0C] border-t border-white/5">
      <div className="container mx-auto px-8">
        <div className="flex flex-col gap-16">
          <div className="space-y-4">
            <h2 className="text-[#CDA755] text-xs font-black uppercase tracking-[0.4em]">Route Deployment</h2>
            <h3 className="text-white text-4xl font-bold tracking-tighter uppercase italic">Logistical Architecture</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Deploy Detail */}
            <div className="grid grid-cols-2 gap-6">
              <DeploymentStat 
                label="Launch Airport" 
                value={insertion.code} 
                sub={insertion.city} 
                icon={<PlaneLanding className="w-4 h-4 text-[#CDA755]" />} 
              />
              <DeploymentStat 
                label="Recovery Airport" 
                value={extraction.code} 
                sub={extraction.city} 
                icon={<PlaneTakeoff className="w-4 h-4 text-[#CDA755]" />} 
              />
              <DeploymentStat 
                label="Primary Countries" 
                value={countries} 
                sub={mission.continent} 
                icon={<Flag className="w-4 h-4 text-[#CDA755]" />} 
              />
              <DeploymentStat 
                label="Total Distance" 
                value={`${mission.distance_km} KM`} 
                sub="Staged Path" 
                icon={<Map className="w-4 h-4 text-[#CDA755]" />} 
              />
            </div>

            {/* Visual Summary */}
            <div className="p-10 bg-white/[0.02] border border-white/5 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Theater Connectivity</div>
                <div className="flex items-center gap-4">
                  <span className="text-white text-4xl font-bold">{insertion.code}</span>
                  <div className="h-[1px] w-12 bg-[#CDA755] relative">
                    <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-[#CDA755] animate-pulse" />
                  </div>
                  <span className="text-white text-4xl font-bold">{extraction.code}</span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                  Full one-way deployment. Fly into {insertion.name} and extract from {extraction.name}. 
                  Zero backtracking required.
                </p>
                <div className="flex flex-col gap-1">
                   <div className="text-[#CDA755] text-[10px] font-black uppercase tracking-[0.2em]">Primary Theater</div>
                   <div className="text-white text-lg font-bold uppercase tracking-tight">{mission.theater}</div>
                </div>
              </div>
              <div className="absolute -right-16 -bottom-16 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500 rotate-12">
                <Map className="w-64 h-64 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DeploymentStat({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: any }) {
  return (
    <div className="p-6 bg-white/[0.02] border border-white/5 space-y-4">
      <div className="p-2 bg-white/5 border border-white/10 w-fit rounded-sm">
        {icon}
      </div>
      <div className="space-y-1">
        <div className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em]">{label}</div>
        <div className="text-white text-xl font-bold tracking-tight uppercase">{value}</div>
        <div className="text-[#CDA755]/60 text-[9px] font-bold uppercase tracking-widest">{sub}</div>
      </div>
    </div>
  );
}
