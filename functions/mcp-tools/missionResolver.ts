import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRouteGeo } from "../video-engine/utils/buildRouteGeo";
import {
  fetchRouteGeometry,
  resolveAirportCoord,
} from "../video-engine/utils/fetchRouteGeometry";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── In-Memory Mission Catalog ─────────────────────────────────────────────
// Loads the A2A mission catalog from the canonical data file. Falls back
// gracefully if the file is missing so the tool never crashes at startup.

type RawMission = {
  slug: string;
  title: string;
  continent: string;
  insertion_airport: string;
  extraction_airport: string;
  theater: string;
  distance_km: number;
  duration_days: string;
  cinematic_pitch: string;
  highlights: string[];
  coordinates?: Array<[number, number]>;
  code?: string;
  mission_type?: string;
  price_radar?: {
    subsidy_pct?: number;
    positioning?: string;
    notes?: string;
  };
};

function loadMissionCatalog(): RawMission[] {
  const catalogPath = path.resolve(__dirname, "../src/data/a2aMissions.json");
  try {
    const raw = fs.readFileSync(catalogPath, "utf-8");
    return JSON.parse(raw) as RawMission[];
  } catch {
    return [];
  }
}

function loadWeekendMissionCatalog(): RawMission[] {
  const catalogPath = path.resolve(__dirname, "../src/data/weekendMissions.json");
  try {
    const raw = fs.readFileSync(catalogPath, "utf-8");
    return JSON.parse(raw) as RawMission[];
  } catch {
    return [];
  }
}

const MISSION_INDEX = new Map<string, RawMission>();
for (const m of loadMissionCatalog()) {
  MISSION_INDEX.set(m.slug, m);
}
for (const m of loadWeekendMissionCatalog()) {
  MISSION_INDEX.set(m.slug, m);
}

// ── Public API ────────────────────────────────────────────────────────────

export interface MissionRenderInput {
  slug: string;
  title: string;
  insertion_airport: string;
  extraction_airport: string;
  cinematic_pitch: string;
  coordinates: Array<[number, number]>;
  routeGeo: {
    coordinates: Array<[number, number]>;
    center: [number, number];
    initialZoom: number;
    initialBearing: number;
  };
}

/**
 * Resolve a mission slug to the full render-ready input props for Remotion.
 *
 * Coordinate resolution priority:
 *   1. Mapbox Directions API (real-road geometry via fetchRouteGeometry)
 *   2. Fallback: synthetic buildRouteGeo (offline / API failure)
 *
 * Returns null only if the slug is completely unknown.
 */
export async function resolveMissionForRender(
  slug: string,
): Promise<MissionRenderInput | null> {
  const mission = MISSION_INDEX.get(slug);
  if (!mission) return null;

  let routeGeo: MissionRenderInput["routeGeo"];

  try {
    // ── Primary: real-road geometry from Mapbox Directions API ────────
    const from = resolveAirportCoord(mission.insertion_airport);
    const to = resolveAirportCoord(mission.extraction_airport);
    const realCoords = await fetchRouteGeometry({ from, to });

    // Derive camera params from the real coordinates
    const lats = realCoords.map((p) => p[1]);
    const lngs = realCoords.map((p) => p[0]);
    const center: [number, number] = [
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
      (Math.min(...lats) + Math.max(...lats)) / 2,
    ];
    const lngSpan = Math.max(...lngs) - Math.min(...lngs);
    const latSpan = Math.max(...lats) - Math.min(...lats);
    const maxSpan = Math.max(lngSpan, latSpan);
    const initialZoom =
      maxSpan > 20 ? 4.1 : maxSpan > 10 ? 4.6 : maxSpan > 6 ? 5.1 : 5.7;
    const first = realCoords[0];
    const second = realCoords[1];
    const initialBearing =
      ((Math.atan2(second[0] - first[0], second[1] - first[1]) * 180) /
        Math.PI +
        360) %
      360;

    routeGeo = {
      coordinates: realCoords,
      center,
      initialZoom,
      initialBearing,
    };

    console.log(`[route] ${slug}: Mapbox Directions → ${realCoords.length} pts`);
  } catch (err) {
    // ── Fallback: synthetic arc geometry ──────────────────────────────
    console.warn(
      `[route] ${slug}: Mapbox Directions failed, falling back to buildRouteGeo:`,
      (err as Error).message,
    );

    routeGeo = buildRouteGeo({
      coordinates: mission.coordinates,
      insertion_airport: mission.insertion_airport,
      extraction_airport: mission.extraction_airport,
    });
  }

  const coordinates = routeGeo.coordinates;

  // Debug log for pipeline verification
  console.log({
    slug,
    coordCount: coordinates.length,
    start: coordinates[0],
    end: coordinates[coordinates.length - 1],
  });

  return {
    slug: mission.slug,
    title: mission.title,
    insertion_airport: mission.insertion_airport,
    extraction_airport: mission.extraction_airport,
    cinematic_pitch: mission.cinematic_pitch,
    coordinates,
    routeGeo,
  };
}

/**
 * List all available mission slugs with basic metadata.
 * Every mission now reports hasCoordinates: true because buildRouteGeo
 * synthesizes geometry from airport codes when explicit coords are absent.
 */
export function listAvailableMissions(): Array<{
  slug: string;
  title: string;
  theater: string;
  hasCoordinates: boolean;
  insertion_airport: string;
  extraction_airport: string;
}> {
  return Array.from(MISSION_INDEX.values()).map((m) => ({
    slug: m.slug,
    title: m.title,
    theater: m.theater,
    hasCoordinates: true,
    insertion_airport: m.insertion_airport,
    extraction_airport: m.extraction_airport,
  }));
}
