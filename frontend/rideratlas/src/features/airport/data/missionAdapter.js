/**
 * Frontend adapter for mission cards.
 * Provides guaranteed fallback states to prevent UI breakage.
 * Ported from functions/src/selectors/missionAdapter.js
 */

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200";

export const EMERGENCY_MISSIONS = [
  {
    id: "fallback-alpine-entry",
    title: "Alpine Entry Protocol",
    description:
      "A high-altitude launch line built for immediate rhythm: fast approach roads, early elevation, and a clean cinematic opening sequence.",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    stats: {
      days: 4,
      distance_km: 780,
      difficulty: "Advanced",
    },
    airport: { start: "GLOBAL", end: "GLOBAL" },
    region_id: "global-premium",
    source: "emergency",
  },
  {
    id: "fallback-coastal-sweep",
    title: "Coastal Sweep",
    description:
      "A premium road-book of sea cliffs, open pacing, and golden-hour arrival windows designed to read well on any airport page.",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    stats: {
      days: 3,
      distance_km: 520,
      difficulty: "Intermediate",
    },
    airport: { start: "GLOBAL", end: "GLOBAL" },
    region_id: "global-premium",
    source: "emergency",
  },
  {
    id: "fallback-continental-run",
    title: "Continental Run",
    description:
      "A long-form directional ride with enough scale, distance, and editorial density to serve as the final global safety net.",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    stats: {
      days: 5,
      distance_km: 1120,
      difficulty: "Advanced",
    },
    airport: { start: "GLOBAL", end: "GLOBAL" },
    region_id: "global-premium",
    source: "emergency",
  },
];

function normalizeAirportCode(value) {
  if (value == null) return null;
  const normalized = String(value).trim().toUpperCase();
  return normalized || null;
}

function parseInteger(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  const parsed = parseInt(String(value).replace(/[^\d-]/g, ""), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function resolveMissionId(mission, fallbackId) {
  const candidate = mission?.id || mission?.slug || fallbackId || null;
  return candidate ? String(candidate).trim() : null;
}

function resolveMissionTitle(mission) {
  return (
    mission?.title ||
    mission?.seo?.title ||
    mission?.meta?.title ||
    mission?.name ||
    "Untitled Mission"
  );
}

function resolveMissionDescription(mission) {
  return (
    mission?.description ||
    mission?.seo?.description ||
    mission?.intel?.story ||
    mission?.cinematic_pitch ||
    mission?.missionSummary ||
    "No description available"
  );
}

function resolveMissionImage(mission) {
  return (
    mission?.imageUrl ||
    mission?.media?.poster_landscape ||
    mission?.media?.poster_cinematic ||
    mission?.media?.poster ||
    FALLBACK_IMAGE
  );
}

function resolveMissionStats(mission) {
  return {
    days: parseInteger(mission?.stats?.days || mission?.meta?.days || mission?.days || mission?.intel?.stats?.duration),
    distance_km: parseInteger(
      mission?.stats?.distance_km ||
        mission?.meta?.distance_km ||
        mission?.distance_km ||
        mission?.corridor_distance_km ||
        mission?.intel?.stats?.distance,
    ),
    difficulty:
      mission?.stats?.difficulty ||
      mission?.meta?.difficulty ||
      mission?.difficulty ||
      mission?.intel?.stats?.difficulty ||
      "Unknown",
  };
}

function resolveMissionAirport(mission) {
  const start = normalizeAirportCode(
    mission?.airport?.start ||
      mission?.shipping?.hub_code ||
      mission?.upsell?.shipping?.hub_code ||
      mission?.start_airport_code ||
      mission?.hub_code ||
      mission?.insertion_airport,
  );

  const end = normalizeAirportCode(
    mission?.airport?.end ||
      mission?.end_airport_code ||
      mission?.extraction_airport ||
      mission?.shipping?.hub_code ||
      mission?.upsell?.shipping?.hub_code,
  );

  return { start, end };
}

function resolveRegionId(mission) {
  return (
    mission?.region_id ||
    mission?.theater ||
    mission?.destination?.region ||
    mission?.destination?.country ||
    mission?.country ||
    mission?.continent ||
    "unknown"
  );
}

export function buildStatLine(stats) {
  return `${stats?.days ?? "?"}D · ${stats?.distance_km ?? "?"}KM · ${
    stats?.difficulty ?? "?"
  }`;
}

export function scoreMission(mission) {
  let score = 0;

  if (mission?.imageUrl && mission.imageUrl !== FALLBACK_IMAGE) score += 3;
  if (mission?.description && mission.description !== "No description available") score += 3;
  if (mission?.stats?.distance_km) score += Math.min(mission.stats.distance_km / 100, 20);
  if (mission?.stats?.days) score += Math.min(mission.stats.days, 10);
  if (mission?.stats?.difficulty && mission.stats.difficulty !== "Unknown") score += 2;
  if (mission?.source === "v4") score += 2;
  if (mission?.source === "v3") score += 1;

  return score;
}

export function normalizeMission(mission, options = {}) {
  const normalized = {
    id: resolveMissionId(mission, options.fallbackId),
    title: resolveMissionTitle(mission),
    description: resolveMissionDescription(mission),
    imageUrl: resolveMissionImage(mission),
    stats: resolveMissionStats(mission),
    airport: resolveMissionAirport(mission),
    region_id: resolveRegionId(mission),
    source: options.source || mission?.source || "unknown",
    slug: mission?.slug || null,
    tags: Array.isArray(mission?.tags) ? mission.tags.filter(Boolean) : [],
  };

  normalized.score = scoreMission(normalized);
  return normalized;
}

export function mapMissionToCard(mission) {
  const normalized = mission?.stats ? mission : normalizeMission(mission);
  const description = normalized.description || "No description available";

  return {
    id: normalized.id,
    title: normalized.title,
    subtitle: description.length > 120 ? `${description.slice(0, 117)}...` : description,
    description,
    imageUrl: normalized.imageUrl || FALLBACK_IMAGE,
    distanceKm: normalized.stats?.distance_km ?? null,
    days: normalized.stats?.days ?? null,
    difficulty: normalized.stats?.difficulty ?? "Unknown",
    statLine: buildStatLine(normalized.stats),
    eyebrow: normalized.airport?.start ? `${normalized.airport.start} Route` : "Signature Route",
    ctaHref: normalized.slug ? `/missions/${normalized.slug}` : normalized.id ? `/mission/${normalized.id}` : null,
    regionId: normalized.region_id,
    source: normalized.source,
  };
}

export function dedupeMissions(missions = []) {
  const seen = new Set();
  const result = [];

  for (const mission of missions) {
    if (!mission?.id || seen.has(mission.id)) continue;
    seen.add(mission.id);
    result.push(mission);
  }

  return result;
}

export function sortMissions(missions = []) {
  return [...missions].sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    if ((b.stats?.distance_km || 0) !== (a.stats?.distance_km || 0)) {
      return (b.stats?.distance_km || 0) - (a.stats?.distance_km || 0);
    }
    return String(a.title || "").localeCompare(String(b.title || ""));
  });
}

const AIRPORT_FALLBACK_MAP = {
  STR: ["MUC", "ZRH", "INN"],
  CDG: ["MXP", "GVA", "LYS"],
  OSL: ["HAM", "CPH"],
};

export function filterMissionsByAirport(all = [], airportCode) {
  const code = normalizeAirportCode(airportCode);

  return all.filter((mission) => {
    const missionCode = mission?.airport?.start;

    if (missionCode === code) return true;

    // fallback mapping
    if (AIRPORT_FALLBACK_MAP[code]?.includes(missionCode)) {
      return true;
    }

    return false;
  });
}

export function getRegionalMissions(all = [], airportCode, primary = []) {
  const normalizedAirportCode = normalizeAirportCode(airportCode);
  const primaryRegions = new Set(primary.map((mission) => mission?.region_id).filter(Boolean));
  const sameRegion = all.filter(
    (mission) =>
      mission?.airport?.start !== normalizedAirportCode &&
      mission?.region_id &&
      primaryRegions.has(mission.region_id),
  );

  if (sameRegion.length > 0) {
    return sortMissions(dedupeMissions(sameRegion));
  }

  return sortMissions(
    dedupeMissions(
      all.filter((mission) => mission?.airport?.start !== normalizedAirportCode),
    ),
  );
}

export function ensureThreeMissions({ primary = [], regional = [], global = [] }) {
  const result = [];

  for (const mission of primary) {
    if (result.length < 3) result.push(mission);
  }

  for (const mission of regional) {
    if (result.length < 3 && !result.find((item) => item.id === mission.id)) {
      result.push(mission);
    }
  }

  for (const mission of global) {
    if (result.length < 3 && !result.find((item) => item.id === mission.id)) {
      result.push(mission);
    }
  }

  return result.slice(0, 3);
}

export function buildGuaranteedMissionCards({ airportCode, missions = [] }) {
  const normalizedAirportCode = normalizeAirportCode(airportCode);
  const normalizedMissions = sortMissions(dedupeMissions(missions));
  const emergencyPool = EMERGENCY_MISSIONS.map((mission) => normalizeMission(mission));

  const primary = sortMissions(filterMissionsByAirport(normalizedMissions, normalizedAirportCode));
  const regional = getRegionalMissions(normalizedMissions, normalizedAirportCode, primary);
  const global = sortMissions(normalizedMissions);

  const guaranteed = ensureThreeMissions({
    primary,
    regional,
    global: [...global, ...emergencyPool],
  });

  const finalCards = guaranteed.map(mapMissionToCard);

  return {
    airportCode: normalizedAirportCode,
    featuredMission: finalCards[0] || mapMissionToCard(emergencyPool[0]),
    missions: finalCards.slice(1, 3),
    meta: {
      totalPool: normalizedMissions.length,
      primaryCount: primary.length,
      regionalCount: regional.length,
      globalCount: global.length,
    },
  };
}
