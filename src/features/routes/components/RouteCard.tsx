import type { Route } from "../../../core/graph/types";
import SmartImage from "../../../shared/media/SmartImage";

interface Props {
  route: Route;
}

export default function RouteCard({ route }: Props) {
  return (
    <div className="group relative w-[300px] h-[400px] bg-[#0B0B0C] border border-white/5 overflow-hidden">
      <div className="h-[60%] overflow-hidden bg-white/[0.02]">
        <SmartImage 
          src={route.image} 
          alt={route.title || "Route Image"} 
          aspectRatio="h-full w-full"
          className="group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="h-[40%] p-5 flex flex-col justify-between">
        <div>
          <p className="text-[#CDA755] text-[9px] font-bold uppercase tracking-widest mb-1">{route.kicker}</p>
          <h3 className="text-white text-lg font-bold leading-tight line-clamp-2">{route.title}</h3>
        </div>
        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#B6B6B6]">
          <span>{route.duration}</span>
          <span>{route.distance}</span>
        </div>
      </div>
    </div>
  );
}
