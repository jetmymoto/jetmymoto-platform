import { ArrowUpRight, Map, Clock, Zap, Mountain } from 'lucide-react';

export default function RouteIntelCard({ route }) {

  // --- Placeholder Data ---
  // The route object from the data layer currently lacks these details.
  // This data should be added to the `RIDE_DESTINATIONS` or a similar data source.
  const intel = {
    image: route.destination?.image || 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?auto=format&fit=crop&w=800&q=80',
    distance: route.destination?.distance || '450km',
    duration: route.destination?.duration || '7-9 hours',
    difficulty: route.destination?.difficulty || 'Technical',
    difficultyIcon: Mountain,
  };

  return (
    <div className="group border border-white/5 bg-zinc-950/50 hover:border-amber-500/30 transition-all duration-300 rounded-lg overflow-hidden flex flex-col h-full">
      
      {/* Image Section */}
      <div className="relative h-40 bg-zinc-900 overflow-hidden">
        <img 
          src={intel.image} 
          alt={route.destination?.name} 
          className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        <div className="absolute top-3 right-3 p-2 bg-black/40 border border-white/10 rounded-md text-amber-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight size={14} />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <div className="flex-grow">
          <p className="text-[9px] font-mono text-amber-500 uppercase tracking-widest mb-1">
            From {route.airport?.iata}
          </p>
          <h4 className="text-lg font-bold uppercase italic text-white group-hover:text-amber-400 transition-colors">
            {route.destination?.name}
          </h4>
        </div>

        {/* Stats */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <Map size={14} className="mx-auto text-zinc-500" />
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Distance</p>
            <p className="text-xs font-semibold text-white">{intel.distance}</p>
          </div>
          <div className="space-y-1">
            <Clock size={14} className="mx-auto text-zinc-500" />
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Duration</p>
            <p className="text-xs font-semibold text-white">{intel.duration}</p>
          </div>
          <div className="space-y-1">
            <intel.difficultyIcon size={14} className="mx-auto text-zinc-500" />
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Difficulty</p>
            <p className="text-xs font-semibold text-white">{intel.difficulty}</p>
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