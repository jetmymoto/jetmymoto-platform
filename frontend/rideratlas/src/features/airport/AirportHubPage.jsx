import React, { useMemo, useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { readGraphSnapshot } from "@/core/network/networkGraph";
import { Atmosphere } from "@/components/cinematic/Atmosphere";

// Section Library Components
import CinematicHero from "@/sections/shared/CinematicHero";
import LiveIntelligenceStrip from "@/sections/intelligence/LiveIntelligenceStrip";
import RentalGridSection from "@/sections/intelligence/RentalGridSection";

// Existing High-Quality Components (Promoted to Pilot)
import AirportNetworkIntelligence from "@/features/airport/sections/editorial/AirportNetworkIntelligence";
import AirportDualPathSection from "@/features/airport/sections/editorial/AirportDualPathSection";
import RoutesFromHere from "@/components/luxury/RoutesFromHere";
import AirportArrivalSection from "@/features/airport/sections/editorial/AirportArrivalSection";
import AirportConciergeForm from "@/features/airport/sections/editorial/AirportConciergeForm";

// Data Fetchers
import { fetchAirportMissions } from "@/features/airport/data/fetchAirportMissions";
import { getAirportEditorialCopy } from "@/features/airport/copy/getAirportEditorialCopy";

/**
 * AirportHubPage - Refined MUC Enrichment Pilot.
 * Composed strictly from the approved pilot component set.
 */
export default function AirportHubPage({
  airport,
  experience,
  initialRideMode = "bring"
}) {
  const { airportCode: routeParam } = useParams();
  const location = useLocation();
  const code = (routeParam || airport?.code || "MUC").toUpperCase();
  const graph = readGraphSnapshot();

  const [missionsData, setMissionsData] = useState({ missions: [], featuredMission: null });
  const [rideMode, setRideMode] = useState(initialRideMode);

  useEffect(() => {
    const loadMissions = async () => {
      try {
        const data = await fetchAirportMissions(code);
        setMissionsData(data || { missions: [], featuredMission: null });
      } catch (error) {
        console.error("Failed to load missions for pilot:", error);
      }
    };
    loadMissions();
  }, [code]);

  // Derive Airport Routes from Graph
  const airportRoutes = useMemo(() => {
    return (
      graph.indexes.routesByAirport?.[code]
        ?.map((slug) => graph.entities.routes?.[slug])
        .filter(Boolean) ?? []
    );
  }, [code, graph]);

  // Intel for AirportNetworkIntelligence
  const intel = useMemo(() => ({
    most_common_finish: { value: "Milan (MXP)", confidence: "high" },
    fastest_access: { value: "Alpine Masterline", confidence: "high" },
    killer_metric: { value: "2.4 Hours to High Alpine Terrain" },
    mission_density: { value: "Extreme" },
  }), []);

  const editorialCopy = useMemo(() => {
    // Re-use existing editorial logic for consistency
    const a = {
       code,
       city: airport?.city || code,
       country: airport?.country,
       continent: airport?.continent,
       hero: { videoUrl: airport?.hero?.videoUrl, posterUrl: airport?.hero?.posterUrl }
    };
    return getAirportEditorialCopy({ a, airportRoutes, rentals: [], experience, graph });
  }, [code, airport, airportRoutes, experience, graph]);

  const scrollToRentals = () => {
    document.getElementById("rental-discovery")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#1C1B18] selection:bg-[#C9A14A]/30">
      <Atmosphere />

      {/* 1. CinematicHero */}
      <CinematicHero
        layout="split"
        theme="light"
        eyebrow={`${code} HUB // ARRIVAL OS`}
        headline={airport?.city || code}
        subheadline={editorialCopy.hero.subheadline}
        description={editorialCopy.hero.description}
        videoUrl={airport?.hero?.videoUrl}
        metaLines={editorialCopy.hero.metaLines}
        ctas={[
          { label: "EXPLORE FLEET", primary: true, onClick: scrollToRentals },
          { label: "VIEW MAP", primary: false, onClick: () => {} }
        ]}
      />

      {/* 2. AirportNetworkIntelligence */}
      <AirportNetworkIntelligence intel={intel} airportCode={code} />

      {/* 3. AirportDualPathSection */}
      <AirportDualPathSection 
        rideMode={rideMode} 
        setRideMode={setRideMode} 
        onScrollToEngine={scrollToRentals} 
      />

      {/* 4. RoutesFromHere */}
      <RoutesFromHere routes={airportRoutes} />

      {/* 5. LiveIntelligenceStrip */}
      <LiveIntelligenceStrip airportCode={code} theme="dark" />

      {/* 6. RentalGridSection */}
      <RentalGridSection 
        airportCode={code}
        title="Fleet Showroom"
        eyebrow="Hardware Staging"
        description={`Premium machines currently staged and ready at the ${code} hub. Optimized for technical terrain and long-range deployment.`}
        theme="dark"
      />

      {/* 7. AirportArrivalSection */}
      <AirportArrivalSection copy={editorialCopy.arrival} />

      {/* 8. DossierLeadCapture (AirportConciergeForm) */}
      <div id="dossier-capture">
        <AirportConciergeForm airportName={airport?.city || code} />
      </div>
    </div>
  );
}
