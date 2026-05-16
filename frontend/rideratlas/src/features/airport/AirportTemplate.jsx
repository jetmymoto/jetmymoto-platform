import React, { useMemo, useEffect, useReducer, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getGraphShardStatus,
  loadGraphShard,
  readGraphSnapshot,
  readGraphShard,
} from "@/core/network/networkGraph";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/core/analytics/trackEvent";

import AirportHero from "./sections/editorial/AirportHero";
import AirportJourneyBridge from "./sections/editorial/AirportJourneyBridge";
import AirportDualPathSection from "./sections/editorial/AirportDualPathSection";
import AirportCuratedMissions from "./sections/editorial/AirportCuratedMissions";
import AirportSystemReveal from "./sections/editorial/AirportSystemReveal";
import AirportArrivalSection from "./sections/editorial/AirportArrivalSection";
import AirportConciergeForm from "./sections/editorial/AirportConciergeForm";
import HubOperatingStandard from "./sections/editorial/HubOperatingStandard";
import BringEnginePanel from "./sections/editorial/BringEnginePanel";
import AirportFleetSection from "../../../../../sections/editorial/AirportFleetSection";

import { getAirportEditorialCopy } from "./copy/getAirportEditorialCopy";
import {
  RENTAL_HERO_IMAGE_MAP,
  buildRentalHeroImageId,
} from "@/features/rentals/data/rentalHeroImageMap";
import { fetchAirportMissions } from "./data/fetchAirportMissions";

const HERO_VIDEO =
  "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_videos%2F_ContryPageH1video.mp4?alt=media&token=b806223e-d96f-4fae-b9d0-3ba67243e98e";

export default function AirportTemplate({
  airport,
  experience,
  initialRideMode = "bring",
}) {
  const params = useParams();
  const airportCode =
    params?.airportCode?.toUpperCase() ||
    airport?.code?.toUpperCase() ||
    "CDG";

  const code = airportCode;

  const [rideMode, setRideMode] = useState(initialRideMode);
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const [missions, setMissions] = useState({
    airportCode,
    featuredMission: null,
    missions: [],
  });

  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const location = useLocation();
  const navigate = useNavigate();
  const graph = readGraphSnapshot();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const queryMode = searchParams.get("mode") || initialRideMode;
  const queryRouteSlug = searchParams.get("route");
  const queryRentalId = searchParams.get("rental");

  useEffect(() => {
    setSelectedRentalId(queryRentalId || null);
  }, [queryRentalId]);

  if (!airport) {
    return (
      <div className="min-h-screen bg-[#f6f3ee] p-20 text-[#050505]">
        Loading airport...
      </div>
    );
  }

  const a = {
    code: airportCode,
    name: airport.name ?? experience?.airport?.name ?? "",
    city: airport.city ?? "",
    country: airport.country ?? "",
    continent: airport.continent ?? "",
    region: airport.region ?? "",
    motto: airport.motto ?? "",
    staging: airport.staging ?? "",

    hero: {
      videoUrl: airport.hero?.videoUrl || HERO_VIDEO,
      posterUrl: airport.hero?.posterUrl || "",
    },

    controlPanel: Array.isArray(airport.controlPanel)
      ? airport.controlPanel
      : [],

    utilities: Array.isArray(airport.utilities) ? airport.utilities : [],

    recovery: airport.recovery ?? {
      premium: { name: "", location: "", href: "#", features: [] },
      budget: { name: "", location: "", href: "#", features: [] },
    },

    cityExtension: airport.cityExtension?.enabled
      ? airport.cityExtension
      : { enabled: false, headline: "", subline: "", items: [] },
  };

  const airportRoutes = useMemo(() => {
    return (
      graph.indexes.routesByAirport?.[a.code]
        ?.map((slug) => graph.entities.routes?.[slug])
        .filter(Boolean) ?? []
    );
  }, [a.code, graph]);

  const { derivedRegions, derivedTheater } = useMemo(() => {
    const rSet = new Set();

    airportRoutes.forEach((r) => {
      if (r.destination?.region) rSet.add(r.destination.region);
    });

    const clusterIds = graph.indexes.clusterByAirport?.[a.code] || [];
    const cluster =
      clusterIds.length > 0 ? graph.entities.clusters?.[clusterIds[0]] : null;

    return {
      derivedRegions: Array.from(rSet),
      derivedTheater: cluster?.region || a.continent || "Global",
    };
  }, [airportRoutes, a.code, a.continent, graph]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("AIRPORT TEMPLATE ACTIVE:", a.code);
    }

    const loadMissions = async () => {
      console.log(`[AirportTemplate] Loading missions for code: ${code}`);
      try {
        const data = await fetchAirportMissions(code);
        console.log(`[AirportTemplate] Missions loaded for ${code}:`, data);

        setMissions(
          data || {
            airportCode: code,
            featuredMission: null,
            missions: [],
          }
        );
      } catch (error) {
        console.error(
          `[AirportTemplate] Failed to load missions for ${code}:`,
          error
        );

        setMissions({
          airportCode: code,
          featuredMission: null,
          missions: [],
        });
      }
    };

    loadMissions();
  }, [code, a.code]);

  useEffect(() => {
    setRideMode(queryMode === "rent" ? "rent" : "bring");
  }, [queryMode, a.code]);

  useEffect(() => {
    if (rideMode !== "rent" && !selectedRentalId) return undefined;

    const status = getGraphShardStatus("rentals");

    if (status === "idle") {
      loadGraphShard("rentals").then(forceUpdate).catch(() => {});
    } else if (status === "loading") {
      const interval = setInterval(() => {
        if (getGraphShardStatus("rentals") === "loaded") {
          clearInterval(interval);
          forceUpdate();
        }
      }, 50);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [rideMode, selectedRentalId]);

  useEffect(() => {
    if (rideMode === "rent" && selectedRentalId) {
      const target = document.getElementById("airport-rental-section");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });

      trackEvent("rental_preselect_view", {
        airport_code: a.code,
        route_slug: queryRouteSlug || "",
        rental_id: selectedRentalId,
        source: "airport_preselect",
      });
    }

    return undefined;
  }, [rideMode, selectedRentalId, a.code, queryRouteSlug]);

  const rentalShard = readGraphShard("rentals");
  const rentalShardStatus = getGraphShardStatus("rentals");
  const isRentalsLoading =
    rentalShardStatus === "idle" || rentalShardStatus === "loading";

  const rentalsMap = rentalShard?.rentals ?? {};
  const rentalsByAirport = rentalShard?.rentalIndexes?.rentalsByAirport ?? {};

  const rentalIds = useMemo(
    () => rentalsByAirport[a.code] || [],
    [rentalsByAirport, a.code]
  );

  const rentals = useMemo(
    () => rentalIds.map((id) => rentalsMap[id]).filter(Boolean),
    [rentalIds, rentalsMap]
  );

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    console.debug("[AirportTemplate:rental-pipeline]", {
      airportCode: a.code,
      rideMode,
      shardStatus: rentalShardStatus,
      rentalIdsResolved: rentalIds.length,
      sampleIds: rentalIds.slice(0, 8),
      sampleRentals: rentals.slice(0, 4).map((rental) => ({
        id: rental?.id,
        bikeName: rental?.bikeName,
        brand: rental?.brand,
        model: rental?.model,
        heroImageId: buildRentalHeroImageId(rental?.brand, rental?.model),
        hasHeroImage: Boolean(
          RENTAL_HERO_IMAGE_MAP[
            buildRentalHeroImageId(rental?.brand, rental?.model)
          ]
        ),
        priceDay: rental?.price_day,
        pricePerDay: rental?.pricing?.pricePerDay,
        category: rental?.category,
      })),
    });
  }, [a.code, rideMode, rentalShardStatus, rentalIds, rentals]);

  const editorialCopy = getAirportEditorialCopy({
    a,
    airportRoutes,
    rentals,
    experience,
    derivedRegions,
    derivedTheater,
    graph, // Pass graph for theater resolution
  });

  const scrollToEngine = () => {
    setTimeout(() => {
      document
        .getElementById("engine-content")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const heroCtas = [
    {
      label: "Bring Your Bike",
      primary: rideMode === "bring",
      onClick: () => {
        setRideMode("bring");
        scrollToEngine();
      },
    },
    {
      label: "Rent Locally",
      primary: rideMode === "rent",
      onClick: () => {
        setRideMode("rent");
        scrollToEngine();
      },
    },
  ];

  const handleSelectMission = (mission) => {
    if (mission?.id) {
      const slug = mission.id.replace(/_/g, "-");
      navigate(`/mission/${slug}`);
      return;
    }

    if (mission?.ctaHref) {
      navigate(mission.ctaHref);
    }
  };

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    console.log("[AirportTemplate] RENDER CHECK", {
      airportCode: a.code,
      featuredMission: missions?.featuredMission ?? null,
      supportingCount: missions?.missions?.length ?? 0,
    });
  }, [a.code, missions]);

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#1C1B18] selection:bg-[#C9A14A]/30">
      <AirportHero
        eyebrow={editorialCopy.hero.eyebrow}
        headline={editorialCopy.hero.headline}
        subheadline={editorialCopy.hero.subheadline}
        description={editorialCopy.hero.description}
        metaLines={editorialCopy.hero.metaLines}
        videoUrl={a.hero?.videoUrl}
        posterUrl={a.hero?.posterUrl}
        ctas={heroCtas}
      />

      <AirportJourneyBridge
        city={a.city}
        derivedTheater={derivedTheater}
        derivedRegions={derivedRegions}
        copy={editorialCopy.journey}
      />

      <AirportDualPathSection
        rideMode={rideMode}
        setRideMode={setRideMode}
        experience={experience}
        onScrollToEngine={scrollToEngine}
      />

      <AirportCuratedMissions
        airportName={editorialCopy.hero.headline}
        featuredMission={missions.featuredMission}
        missions={missions.missions}
        onSelectMission={handleSelectMission}
        allMissionsHref={`/missions?airport=${a.code}`}
        copy={editorialCopy.missions}
      />

      <AirportSystemReveal copy={editorialCopy.system} />

      <AirportArrivalSection copy={editorialCopy.arrival} />

      <div id="engine-content" className="scroll-mt-20">
        <AnimatePresence mode="wait">
          {rideMode === "bring" ? (
            <motion.div
              key="bring"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35 }}
            >
              <BringEnginePanel a={a} />
            </motion.div>
          ) : (
            <motion.div
              key="rent"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35 }}
            >
              <AirportFleetSection
                rentals={rentals}
                selectedRentalId={selectedRentalId}
                setSelectedRentalId={setSelectedRentalId}
                city={a.city}
                airportCode={a.code}
                isLoading={isRentalsLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <HubOperatingStandard
        standard={experience?.operating_standard}
        airportName={editorialCopy.hero.headline}
      />

      <AirportConciergeForm airportName={editorialCopy.hero.headline} />

    </div>
  );
}
