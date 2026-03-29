import { readGraphSnapshot } from "@/core/network/networkGraph";

/**
 * Experience Upsell Engine
 * Generates context-aware rider recommendations to enrich the reservation flow.
 */

const CACHE_KEY = "jetmymoto_experience_cache";
const TIMEOUT_MS = 1500;

export async function generateExperienceUpsell(context) {
  const { airportCode, airportCity, category, terrainType, durationDays, machineName } = context;
  const days = durationDays || 3;
  const cacheKey = `${CACHE_KEY}_${airportCode}_${days}_${category}`;

  // 1. Check Session Cache
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // Ignore cache errors
  }

  // 2. Fetch GRAPH Data (Truth)
  const graph = readGraphSnapshot();
  // In production: search graph.poisByDestination or graph.routes for exact matches

  // 3. Build Deterministic Fallbacks
  const cityLabel = airportCity || airportCode || "the hub";
  const terrainLabel = terrainType || "this region";
  
  const fallback = {
    hotelSuggestion: null,
    restaurantSuggestion: null,
    routeHighlight: null,
    bikerSpot: null
  };

  // Logic based on Target 6 (Trip length)
  
  // 1-2 days: Route highlight only
  fallback.routeHighlight = {
    title: "Primary Vector",
    description: `This setup puts you in range of one of the cleanest riding segments near ${cityLabel} — long visibility, fast elevation change, and very little dead mileage.`
  };

  if (days >= 3) {
    // 3-5 days: Route highlight + biker stop
    fallback.bikerSpot = {
      title: "High-Altitude Checkpoint",
      description: "There’s a natural checkpoint riders stop at for the view alone. It’s worth anchoring into the route."
    };
  }

  if (days >= 6) {
    // 6+ days: Add hotel staging logic and food stop
    fallback.hotelSuggestion = {
      title: "Logistics Partner Hotel",
      description: `Most riders stage from a base just outside the hub. There’s a strong option with secure parking and easy early departure access for the ${machineName}.`
    };
    fallback.restaurantSuggestion = {
      title: "Apex Corridor Outpost",
      description: "There’s a rider stop on this corridor that’s worth planning around. Simple food, but it’s where people actually land after a long run."
    };
  }

  // 4. Simulate Async LLM/Firecrawl Refinement
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return the generated data, safely cached
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(fallback));
      } catch (e) {}
      resolve(fallback);
    }, 300); // Fast 300ms simulated resolution to stay well under 1.5s timeout
  });
}
