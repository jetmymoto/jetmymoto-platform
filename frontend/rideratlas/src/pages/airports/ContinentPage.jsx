import React, { useMemo, useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SeoHelmet from '../../components/seo/SeoHelmet'; // Import SeoHelmet
import { continentIndex } from "@/features/airport/network/continentIndex";
import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";
import NetworkTower from "@/components/network/NetworkTower";
import { getClustersByContinent } from "@/features/routes/routeFeeds.js";

const CONTINENT_CONFIG = {
  europe: {
    title: "Motorcycle Shipping Europe",
    hero: "Ship Your Motorcycle Across Europe",
    description: "JetMyMoto connects Europe's major motorcycle logistics hubs."
  },
  asia: {
    title: "Motorcycle Shipping Asia",
    hero: "Ship Your Motorcycle Across Asia",
    description: "JetMyMoto connects Asia's major motorcycle logistics hubs."
  },
  "north-america": {
    title: "Motorcycle Shipping North America",
    hero: "Ship Your Motorcycle Across North America",
    description: "JetMyMoto connects North America's major motorcycle logistics hubs."
  },
  "south-america": {
    title: "Motorcycle Shipping South America",
    hero: "Ship Your Motorcycle Across South America",
    description: "JetMyMoto connects South America's major motorcycle logistics hubs."
  },
  oceania: {
    title: "Motorcycle Shipping Oceania",
    hero: "Ship Your Motorcycle Across Oceania",
    description: "JetMyMoto connects Oceania's major motorcycle logistics hubs."
  }
};

const COUNTRY_NAMES = {
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  DE: "Germany",
  CH: "Switzerland",
  AT: "Austria",
  PT: "Portugal",
  NL: "Netherlands",
  BE: "Belgium",
  CZ: "Czech Republic",
  PL: "Poland",
  GR: "Greece",
  HR: "Croatia",
  US: "United States", // Added for North America
  CA: "Canada", // Added for North America
  MX: "Mexico", // Added for North America
};


const ContinentPage = () => {
  const { continent } = useParams();
  const navigate = useNavigate();

  const [intent, setIntent] = useState("moto"); // moto | gt
  const [isScanning, setIsScanning] = useState(false);

  const currentContinentId = continent;
  const currentConfig = CONTINENT_CONFIG[currentContinentId] || {
    title: `Motorcycle & Supercar Network ${currentContinentId.replace("-", " ").toUpperCase()}`,
    hero: `Global Motorcycle & Supercar Network ${currentContinentId.replace("-", " ").toUpperCase()}`,
    description: "Certified airport staging infrastructure expanding globally. Land anywhere. Drive your own machine."
  };

  const continentData = useMemo(() => {
    return continentIndex[currentContinentId] || null;
  }, [currentContinentId]);

  const airportsInContinent = useMemo(() => {
    if (!continentData || !continentData.airports) return [];
    return (continentData.airports || [])
      .map(slug => Object.values(AIRPORT_INDEX || {}).find(airport => airport.slug === slug))
      .filter(Boolean); // Filter out any undefined/null entries
  }, [continentData]);

  const countriesInContinent = useMemo(() => {
    if (!airportsInContinent) return [];
    return [...new Set(airportsInContinent.map(a => a.country))].filter(Boolean);
  }, [airportsInContinent]);


  const continentClusters = useMemo(() => {
    return getClustersByContinent(airportsInContinent, 12);
  }, [airportsInContinent]);

  const regions = useMemo(() => {
    const allDestinations = (continentClusters || []).flatMap(c => c.routes.map(r => r.destination));
    const uniqueRegions = new Map();
    allDestinations.forEach(dest => {
      if (dest && !uniqueRegions.has(dest.slug)) {
        uniqueRegions.set(dest.slug, dest);
      }
    });
    return Array.from(uniqueRegions.values());
  }, [continentClusters]);

  const routes = useMemo(() => {
    return (continentClusters || []).flatMap(c => c.routes).slice(0,12);
  }, [continentClusters]);

  return (
    <>
      <SeoHelmet
        title={`${currentConfig.title} | JetMyMoto`}
        description={currentConfig.description}
        canonicalUrl={`https://jetmymoto.com/airports/${currentContinentId}`}
      />
      <NetworkTower
        level="continent"
        config={currentConfig}
        airports={airportsInContinent}
        regions={regions}
        routes={routes}
        clusters={continentClusters}
      />
    </>
  );
};

export default ContinentPage;