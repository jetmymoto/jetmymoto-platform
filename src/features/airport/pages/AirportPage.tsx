import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import GatewayShell from "../shell/GatewayShell";
import { resolveAirportHero } from "../../media/resolvers/airport";
import type { HeroPack } from "../../media/resolvers/airport";
import { preloadMedia } from "../../../shared/media/mediaPreload";
import { useGraph } from "../../../core/graph/hooks/useGraph";

export default function AirportPage() {
  const { code } = useParams<{ code: string }>();
  const airportCode = code?.toUpperCase() || "";
  
  const [heroPack, setHeroPack] = useState<HeroPack | null>(null);
  const { graph, loading, error } = useGraph();

  useEffect(() => {
    let mounted = true;
    resolveAirportHero(airportCode).then(pack => {
      if (mounted) {
        setHeroPack(pack);
        preloadMedia(pack.images);
      }
    });
    return () => { mounted = false; };
  }, [airportCode]);

  if (loading) {
    return (
      <div className="bg-[#0B0B0C] min-h-screen flex items-center justify-center text-[#CDA755] uppercase tracking-widest text-xs animate-pulse">
        Initializing Graph Runtime...
      </div>
    );
  }
  
  if (error || !graph) {
    return (
      <div className="bg-[#0B0B0C] min-h-screen flex items-center justify-center text-red-500 uppercase tracking-widest text-xs">
        Failed to load graph data
      </div>
    );
  }

  const airport = graph.airports[airportCode];
  const routeSlugs = graph.routesByAirport[airportCode] || [];
  const routes = routeSlugs.map((slug: string) => graph.routes[slug]).filter(Boolean);

  if (!airport) {
    return (
      <div className="bg-[#0B0B0C] min-h-screen flex items-center justify-center text-[#CDA755] uppercase tracking-widest text-xs">
        Airport {airportCode} not found in Graph
      </div>
    );
  }
  
  if (!heroPack) {
    return (
      <div className="bg-[#0B0B0C] min-h-screen flex items-center justify-center text-[#CDA755] uppercase tracking-widest text-xs animate-pulse">
        Resolving Media Assets...
      </div>
    );
  }

  return (
    <GatewayShell 
      airport={airport} 
      routes={routes} 
      heroPack={heroPack} 
    />
  );
}
