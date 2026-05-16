const {db} = require("../lib/firebaseAdmin");

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200";

function buildStatLine(stats) {
  return `${stats?.days ?? "?"}D · ${stats?.distance_km ?? "?"}KM · ${
    stats?.difficulty ?? "?"
  }`;
}

function mapMissionToCard(mission) {
  return {
    id: mission.id,
    title: mission.title,
    description: mission.description || "No description available",
    imageUrl: mission.imageUrl || FALLBACK_IMAGE,
    statLine: buildStatLine(mission.stats),
  };
}

async function getAirportMissions(airportCode) {
  const normalizedAirportCode = String(airportCode || "").trim().toUpperCase();

  if (!normalizedAirportCode) {
    return {
      airportCode: null,
      featuredMission: null,
      missions: [],
    };
  }

  // Source of truth: missions_v1
  const snapshot = await db.collection("missions_v1").get();
  const allMissions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Robust filter: support airport.start (current) and start (requested)
  let filtered = allMissions.filter(
    (mission) =>
      mission.airport?.start?.toUpperCase() === normalizedAirportCode ||
      mission.start?.toUpperCase() === normalizedAirportCode ||
      mission.insertion_airport?.toUpperCase() === normalizedAirportCode,
  );

  console.log("[getAirportMissions] Filter results:", {
    airportCode: normalizedAirportCode,
    matchCount: filtered.length,
    totalMissions: allMissions.length,
  });

  // Fallback logic: if no missions for this airport, use high-quality global fallbacks
  let isFallback = false;
  if (!filtered.length) {
    console.warn(
      `[getAirportMissions] No seeded missions for ${normalizedAirportCode}. Deploying fallbacks.`,
    );
    isFallback = true;
    // Pick top 4 missions by distance as safe fallbacks
    filtered = [...allMissions]
      .sort((a, b) => (b.stats?.distance_km || 0) - (a.stats?.distance_km || 0))
      .slice(0, 4);
  }

  // Sort by priority (ascending) then distance (descending)
  const sorted = filtered.sort((a, b) => {
    const priorityA = a.priority || 999;
    const priorityB = b.priority || 999;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return (b.stats?.distance_km || 0) - (a.stats?.distance_km || 0);
  });

  const featured = sorted[0];
  let supporting = sorted.slice(1, 4);

  // Requirement: Always return 3 supporting missions if possible
  // If we have few missions, repeat the featured one to fill the grid
  while (supporting.length < 3 && featured) {
    supporting.push(featured);
  }

  return {
    airportCode: normalizedAirportCode,
    isFallback,
    featuredMission: featured ? mapMissionToCard(featured) : null,
    missions: supporting.map(mapMissionToCard),
  };
}

module.exports = {
  buildStatLine,
  mapMissionToCard,
  getAirportMissions,
};
