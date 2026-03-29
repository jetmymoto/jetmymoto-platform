import { readGraphSnapshot } from "@/core/network/networkGraph";

/**
 * Route Builder & Multi-Day Itinerary Engine
 * Generates structured day-by-day deployment plans based on mission context.
 */

const CACHE_KEY = "jetmymoto_itinerary_cache";
const TIMEOUT_MS = 1500;

export async function generateItinerary(context) {
  const { airportCode, airportCity, durationDays, category, terrainType } = context;
  const days = Math.max(1, durationDays || 3);
  const cacheKey = `${CACHE_KEY}_${airportCode}_${days}_${category}`;

  // 1. Check Cache
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // Ignore
  }

  // 2. Fetch GRAPH Data (Truth)
  const graph = readGraphSnapshot();
  // Future: query graph.routes and graph.poisByDestination using airportCode

  // 3. Build Deterministic Skeleton
  const isAdventure = category?.toLowerCase().includes("adventure");
  const isTouring = category?.toLowerCase().includes("touring");
  
  const baseTerrain = terrainType || (isAdventure ? "mixed terrain" : "paved sweeps");
  
  const itinerary = {
    overview: `A ${days}-day tactical deployment from ${airportCity || airportCode}, optimized for ${category} handling across ${baseTerrain}.`,
    days: []
  };

  if (days === 1) {
    itinerary.days.push({
      day: 1,
      title: "Local Recon Loop",
      summary: "Familiarization with the machine and immediate surrounding terrain.",
      distanceKm: Math.floor(Math.random() * 40) + 140, // 140-180km
      highlights: ["Scenic overlook", "Technical cornering", "Return to hub"]
    });
  } else {
    itinerary.days.push({
      day: 1,
      title: "Outbound Vector",
      summary: `Clearing the city limits of ${airportCity || airportCode} and entering primary ride territory.`,
      distanceKm: 180,
      highlights: ["Highway egress", "First elevation gains", "Arrival at basecamp"]
    });

    for (let i = 2; i < days; i++) {
      itinerary.days.push({
        day: i,
        title: isAdventure ? "Deep Terrain Penetration" : isTouring ? "Endurance Sweepers" : "Core Mission Routes",
        summary: "Core mission riding. Challenging sections and maximum scenic exposure.",
        distanceKm: isTouring ? 320 : 240,
        highlights: ["Technical passes", "Remote POIs", "Extended saddle time"]
      });
    }

    itinerary.days.push({
      day: days,
      title: "Extraction & Return",
      summary: "Descending back to civilization and returning to the hub.",
      distanceKm: 160,
      highlights: ["Final descent", "Refueling", "Machine handover"]
    });
  }

  // 4. Simulate LLM Refinement (Controlled Enhancement)
  return new Promise((resolve) => {
    setTimeout(() => {
      // In production, an LLM would refine the summary and highlights based on real POI names.
      // Here we guarantee a fast, perfectly structured response.
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(itinerary));
      } catch (e) {}
      resolve(itinerary);
    }, 600); // Simulated LLM latency
  });
}
