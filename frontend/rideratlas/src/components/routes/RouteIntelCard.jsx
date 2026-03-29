import { ArrowUpRight, Map, Mountain, Layers } from 'lucide-react';

export default function RouteIntelCard({ route }) {

  const dest = route?.destination;
  const image = dest?.image || dest?.imageUrl || dest?.posterUrl || 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?auto=format&fit=crop&w=800&q=80';
  const terrainType = dest?.terrain_type || 'Unclassified';
  const difficultyRating = dest?.difficulty_rating || 'Unrated';
  const surfaceStats = dest?.surface_stats;
  const surfaceLabel = surfaceStats
    ? Object.entries(surfaceStats)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([k, v]) => `${k} ${v}%`)
        .join(' · ')
    : 'N/A';

  return (
    <div className="group border border-white/5 bg-zinc-950/50 hover:border-amber-500/30 transition-all duration-300 rounded-lg overflow-hidden flex flex-col h-full">
      
      {/* Image Section */}
      <div className="relative h-40 bg-zinc-900 overflow-hidden">
        <img 
          src={image} 
          alt={dest?.name} 
          className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        <div className="absolute top-3 right-3 p-2 bg-[#050505]/40 border border-white/10 rounded-md text-amber-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight size={14} />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <div className="flex-grow">
          <p className="text-[9px] font-mono text-amber-500 uppercase tracking-widest mb-1">
            From {route.airport?.code || route.originAirportCode || "TBD"}
          </p>
          <h4 className="text-lg font-bold uppercase italic text-white group-hover:text-amber-400 transition-colors">
            {dest?.name}
          </h4>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <Map size={14} className="mx-auto text-zinc-500" />
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Terrain</p>
            <p className="text-xs font-semibold text-white">{terrainType}</p>
          </div>
          <div className="space-y-1">
            <Mountain size={14} className="mx-auto text-zinc-500" />
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Difficulty</p>
            <p className="text-xs font-semibold text-white">{difficultyRating}</p>
          </div>
          <div className="space-y-1">
            <Layers size={14} className="mx-auto text-zinc-500" />
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Surface</p>
            <p className="text-xs font-semibold text-white">{surfaceLabel}</p>
          </div>
        </div>
        
        {/* CTA */}
        <div className="mt-6">
          <div className="w-full text-center py-3 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-300 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition-all">
            View Intel
          </div>
        </div>
      </div>
    </div>
  )
}
