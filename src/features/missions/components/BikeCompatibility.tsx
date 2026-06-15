import { CheckCircle2, AlertCircle, XCircle, Bike } from "lucide-react";

interface Props {
  mission: any;
}

export default function BikeCompatibility({ mission }: Props) {
  const terrain = (mission.theaterData?.terrain_type || "").toLowerCase();
  const ridingStyle = (mission.riding_style || "").toLowerCase();

  const categories = [
    { name: "ADV", type: "adv" },
    { name: "Touring", type: "touring" },
    { name: "Sport Touring", type: "sport" },
    { name: "Enduro", type: "enduro" }
  ];

  const getStatus = (type: string) => {
    const isTechnical = terrain.includes("off-road") || terrain.includes("dirt") || terrain.includes("trail") || ridingStyle.includes("technical");
    const isPaved = terrain.includes("paved") || terrain.includes("asphalt") || terrain.includes("scenic");

    if (type === "adv") return { label: "Recommended", color: "text-green-500", icon: <CheckCircle2 className="w-4 h-4" /> };
    
    if (type === "enduro") {
      if (isTechnical) return { label: "Recommended", color: "text-green-500", icon: <CheckCircle2 className="w-4 h-4" /> };
      return { label: "Not Recommended", color: "text-red-500", icon: <XCircle className="w-4 h-4" /> };
    }

    if (type === "touring") {
      if (isTechnical) return { label: "Not Recommended", color: "text-red-500", icon: <XCircle className="w-4 h-4" /> };
      if (isPaved) return { label: "Recommended", color: "text-green-500", icon: <CheckCircle2 className="w-4 h-4" /> };
      return { label: "Possible", color: "text-[#CDA755]", icon: <AlertCircle className="w-4 h-4" /> };
    }

    if (type === "sport") {
      if (isTechnical) return { label: "Not Recommended", color: "text-red-500", icon: <XCircle className="w-4 h-4" /> };
      return { label: "Possible", color: "text-[#CDA755]", icon: <AlertCircle className="w-4 h-4" /> };
    }

    return { label: "Possible", color: "text-[#CDA755]", icon: <AlertCircle className="w-4 h-4" /> };
  };

  return (
    <section className="py-24 bg-[#0B0B0C] border-t border-white/5">
      <div className="container mx-auto px-8">
        <div className="flex flex-col gap-12">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-[#CDA755] opacity-50" />
            <h2 className="text-[#CDA755] text-xs font-black uppercase tracking-[0.4em]">Machine Compatibility</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const status = getStatus(cat.type);
              return (
                <div key={cat.name} className="p-8 bg-white/[0.02] border border-white/5 flex flex-col gap-8 group hover:border-white/20 transition-all duration-500">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-sm">
                      <Bike className="w-6 h-6 text-white/60" />
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Category</div>
                    <div className="text-white text-2xl font-bold tracking-tight uppercase italic">{cat.name}</div>
                  </div>

                  {/* Visual Capability Bar */}
                  <div className="space-y-2">
                     <div className="text-white/10 text-[9px] font-black uppercase tracking-widest">Terrain Capability</div>
                     <div className="h-[2px] w-full bg-white/5 relative">
                        <div 
                          className={`absolute inset-y-0 left-0 transition-all duration-1000 ${status.color.replace('text-', 'bg-')}`}
                          style={{ width: status.label === "Recommended" ? "100%" : status.label === "Possible" ? "50%" : "10%" }}
                        />
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
