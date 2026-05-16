import { getFunctions, httpsCallable } from "firebase/functions";

/**
 * Fetches mission portfolio for a specific airport.
 * Returns { airportCode, featuredMission, missions, isFallback }
 */
export async function fetchAirportMissions(airportCode) {
  const code = String(airportCode || "").trim().toUpperCase();

  if (!code) {
    return {
      airportCode: "UNK",
      featuredMission: null,
      missions: [],
    };
  }

  // Simplified init as requested
  const functions = getFunctions();
  const getAirportMissionsCallable = httpsCallable(functions, "getAirportMissions");

  try {
    console.log(`[fetchAirportMissions] Calling getAirportMissions for: ${code}`);
    
    const result = await getAirportMissionsCallable({ airportCode: code });
    
    // Payload is in result.data
    const payload = result.data;

    console.log("[fetchAirportMissions] Received payload:", payload);

    return {
      airportCode: payload?.airportCode || code,
      featuredMission: payload?.featuredMission || null,
      missions: Array.isArray(payload?.missions) ? payload.missions : [],
      isFallback: !!payload?.isFallback
    };
  } catch (error) {
    console.error(`[fetchAirportMissions] Error fetching missions for ${code}:`, error);
    return {
      airportCode: code,
      featuredMission: null,
      missions: [],
      error: error.message
    };
  }
}
