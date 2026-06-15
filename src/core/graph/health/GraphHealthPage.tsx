import { useGraph } from "../hooks/useGraph";

export default function GraphHealthPage() {
  const { graph, loading, error } = useGraph();

  if (loading) {
    return <div className="p-8 bg-[#0B0B0C] min-h-screen text-[#CDA755]">Loading graph...</div>;
  }

  if (error || !graph) {
    return <div className="p-8 bg-[#0B0B0C] min-h-screen text-red-500">Failed to load graph</div>;
  }

  const airportsCount = Object.keys(graph.airports || {}).length;
  const routesCount = Object.keys(graph.routes || {}).length;

  return (
    <div className="p-8 bg-[#0B0B0C] min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 text-[#CDA755]">Graph Readiness Matrix</h1>
      
      <div className="grid grid-cols-2 gap-4 max-w-lg mb-8">
        <div className="p-4 border border-[#CDA755]/20 bg-white/5">
          <div className="text-[10px] uppercase text-white/50 tracking-widest">Source</div>
          <div className={`font-bold ${graph.source === "REAL_SHARDS" ? "text-green-500" : "text-red-500"}`}>
            {graph.source}
          </div>
        </div>

        <div className="p-4 border border-[#CDA755]/20 bg-white/5">
          <div className="text-[10px] uppercase text-white/50 tracking-widest">Airports</div>
          <div className={`font-bold ${airportsCount === 94 ? "text-green-500" : "text-yellow-500"}`}>
            {airportsCount}
          </div>
        </div>

        <div className="p-4 border border-[#CDA755]/20 bg-white/5">
          <div className="text-[10px] uppercase text-white/50 tracking-widest">Routes</div>
          <div className={`font-bold ${routesCount === 244 ? "text-green-500" : "text-yellow-500"}`}>
            {routesCount}
          </div>
        </div>
      </div>
    </div>
  );
}
