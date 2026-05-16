import { getAirport } from './catalog.js';
import { getAvailableA2aMissions, getRentalInventoryForAirport } from './graph.js';

export async function getAirportExperience(airportCode: string) {
  const code = airportCode.toUpperCase();
  
  const [airportData, missionsData, rentalsData] = await Promise.all([
    getAirport(code),
    getAvailableA2aMissions(code),
    getRentalInventoryForAirport(code)
  ]);

  const missionCount = missionsData?.length || 0;
  const rentalCount = rentalsData?.available_rental_ids?.length || 0;
  const hasRideLocal = missionCount > 0 || rentalCount > 0;

  // Cast to any to bypass the restrictive TS inference from the generic extractData helper
  const rawAirport = airportData as any;

  return {
    airport: {
      code: code,
      name: rawAirport?.name || "Unknown Hub",
      region: rawAirport?.region || "Unknown Region",
      country: rawAirport?.country || "Unknown Country",
      lat: rawAirport?.lat,
      lng: rawAirport?.lng
    },

    ride_local: {
      available: hasRideLocal,
      mission_count: missionCount,
      missions: missionsData || [],
      rental_inventory: {
        count: rentalCount,
        items: rentalsData?.parsed_labels || []
      }
    },

    bring_your_own: {
      available: true, // JetMyMoto concierge is globally active for hubs
      type: "concierge",
      message: "Your bike will be waiting airside",
      cta: "Plan Bike Arrival"
    },

    summary: {
      has_experience: hasRideLocal,
      default_path: "bring_your_own", // Neutral starting baseline
      bias: {
        ride_local: hasRideLocal ? "strong" : "none", // Gains strength based on reality
        bring_your_own: "strong", // Always a premium, intentional choice
      }
    },

    source_map: {
      airport: "firestore:airports",
      missions: "json:a2a_missions_v5",
      rentals: "json:a2a_missions_v5"
    }
  };
}

export async function getDualPathPayload(airportCode: string) {
  const code = airportCode.toUpperCase();
  
  const [missionsData, rentalsData] = await Promise.all([
    getAvailableA2aMissions(code),
    getRentalInventoryForAirport(code)
  ]);

  const missionCount = missionsData?.length || 0;
  const rentalCount = rentalsData?.available_rental_ids?.length || 0;
  const rentAvailable = missionCount > 0 || rentalCount > 0;

  return {
    airport_code: code,
    paths: [
      {
        type: "rent",
        id: "path_rent_local",
        title: "Access the Fleet",
        available: rentAvailable,
        strength: rentAvailable ? "strong" : "none",
        mission_count: missionCount,
        rental_count: rentalCount,
        cta: rentAvailable ? "Explore Available Rides" : "Fleet Not Available Here",
        description: "Rent a pre-staged, multi-brand motorcycle and deploy directly from the terminal."
      },
      {
        type: "byo",
        id: "path_bring_own",
        title: "Bring Your Own",
        available: true,
        strength: "strong",
        cta: "Plan Bike Arrival",
        note: "Air-freight concierge available",
        description: "We handle the logistics. Your personal motorcycle arrives airside, ready for your mission."
      }
    ],
    default_path: "byo"
  };
}