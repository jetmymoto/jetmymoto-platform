import { useParams } from "react-router-dom";
import { useGraph } from "../../../core/graph/hooks/useGraph";
import MissionHero from "../components/MissionHero";
import MissionVideoSection from "../components/MissionVideoSection";
import MissionIntel from "../components/MissionIntel";
import MissionReadiness from "../components/MissionReadiness";
import MissionHighlights from "../components/MissionHighlights";
import MissionLogistics from "../components/MissionLogistics";
import BikeCompatibility from "../components/BikeCompatibility";
import MissionFleet from "../components/MissionFleet";
import MissionCTA from "../components/MissionCTA";

export default function MissionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { graph, loading, error } = useGraph();

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

  const mission = graph.missions[slug || ""];

  if (!mission) {
    return (
      <div className="bg-[#0B0B0C] min-h-screen flex items-center justify-center text-[#CDA755] uppercase tracking-widest text-xs">
        Mission {slug} not found in Graph
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0C] min-h-screen">
      <MissionHero mission={mission} />
      <MissionVideoSection mission={mission} />
      <MissionIntel mission={mission} />
      <MissionReadiness mission={mission} />
      <MissionHighlights mission={mission} />
      <MissionLogistics mission={mission} />
      <BikeCompatibility mission={mission} />
      <MissionFleet airportCode={mission.insertion_airport || ""} />
      <MissionCTA />
    </div>
  );
}
