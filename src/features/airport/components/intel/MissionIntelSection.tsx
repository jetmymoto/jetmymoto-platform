import { useGraph } from "../../../../core/graph/hooks/useGraph";
import { getRentalRailItemsByAirport } from "../../../rentals/services/rentalAdapter";
import { Activity, Database, GitBranch, Map } from "lucide-react";

interface Props {
  airportCode: string;
}

export default function MissionIntelSection({ airportCode }: Props) {
  const { graph } = useGraph();
  if (!graph) return null;

  const airport = graph.airports[airportCode];
  const routeSlugs = graph.routesByAirport[airportCode] || [];
  const rentalItems = getRentalRailItemsByAirport(airportCode);
  
  // Calculate real metrics
  const totalHubs = Object.keys(graph.airports).length;
  const routeCount = routeSlugs.length;
  const rentalAssetCount = rentalItems.length;
  const theater = airport?.theater || "Global Theater";
  const region = airport?.region || "Unknown Sector";

  const metrics = [
    {
      label: "Deployment Node",
      value: airportCode,
      sub: region,
      icon: <Activity className="w-4 h-4 text-[#CDA755]" />
    },
    {
      label: "Theater Jurisdiction",
      value: theater,
      sub: "Operational Sector",
      icon: <Map className="w-4 h-4 text-[#CDA755]" />
    },
    {
      label: "Network Connectivity",
      value: `${totalHubs} Hubs`,
      sub: "Connected Active Nodes",
      icon: <GitBranch className="w-4 h-4 text-[#CDA755]" />
    },
    {
      label: "Route Inventory",
      value: `${routeCount} Available`,
      sub: "Verified Mission Lines",
      icon: <Database className="w-4 h-4 text-[#CDA755]" />
    },
    {
      label: "Fleet Readiness",
      value: `${rentalAssetCount} Assets`,
      sub: "Verified Deployment Units",
      icon: <Activity className="w-4 h-4 text-[#CDA755]" />
    }
  ];

  return (
    <section className="py-24 bg-[#0B0B0C] border-t border-white/5">
      <div className="container mx-auto px-8">
        <div className="flex flex-col gap-12">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-[#CDA755] opacity-50" />
              <h2 className="text-[#CDA755] text-xs font-black uppercase tracking-[0.4em]">
                Mission Intelligence <span className="opacity-40 mx-2">/</span> {airportCode}
              </h2>
            </div>
            <h3 className="text-white text-4xl font-bold tracking-tighter">
              Real-time deployment metrics for the {theater} sector.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {metrics.map((metric, i) => (
              <div key={i} className="p-6 bg-white/[0.02] border border-white/5 flex flex-col gap-4 group hover:border-[#CDA755]/30 transition-all duration-500">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-white/5 border border-white/10 rounded-sm">
                    {metric.icon}
                  </div>
                  <div className="text-[10px] font-black text-white/20 tracking-widest uppercase">
                    0{i + 1}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">
                    {metric.label}
                  </div>
                  <div className="text-white text-xl font-bold tracking-tight">
                    {metric.value}
                  </div>
                  <div className="text-[#CDA755]/60 text-[9px] font-bold uppercase tracking-widest">
                    {metric.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-l-2 border-[#CDA755]/30 bg-[#CDA755]/5">
            <p className="text-white/60 text-xs font-medium leading-relaxed max-w-3xl">
              <span className="text-[#CDA755] font-bold">INTEL ADVISORY:</span> Data stream synchronized with core graph v2. 
              Deployment node {airportCode} currently authorized for {routeCount} active mission extractions into the {theater} theater. 
              {rentalAssetCount > 0 ? `Fleet availability confirmed with ${rentalAssetCount} units ready for immediate staging.` : 'Fleet logistics pending manual verification for this sector.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
