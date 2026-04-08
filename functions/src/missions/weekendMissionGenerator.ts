import type {
  Coord,
  Waypoint,
  WaypointTier,
  WeekendMission,
  GenerationEntry,
  GenerationReport,
  RouteSource,
  ScenicZone,
  Hub,
  HubStrategy,
} from "./types.js";
import { writeRouteAssets } from "./writeRouteAssets.js";

// ── Constants ────────────────────────────────────────────────────────────

const MIN_TOTAL_KM = 400;
const MAX_TOTAL_KM = 900;
const AVG_SPEED_KMH = 60; // scenic road average including stops
const MAX_DISTANCE_RETRIES = 2; // max retry attempts for distance adjustment

// ── Mapbox Directions fetch ──────────────────────────────────────────────

interface MapboxRouteResult {
  readonly coordinates: Coord[];
  readonly distance_km: number;
  readonly motorway_used: boolean;
}

async function fetchMapboxRoute(
  waypoints: readonly Coord[],
  excludeMotorway: boolean,
  token: string,
): Promise<Coord[]> {
  const coordStr = waypoints.map((c) => `${c[0]},${c[1]}`).join(";");
  const exclude = excludeMotorway ? "&exclude=motorway" : "";
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}` +
    `?geometries=geojson&overview=full${exclude}&access_token=${token}`;

  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Mapbox ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  if (!json.routes || json.routes.length === 0) {
    throw new Error("Mapbox returned no routes");
  }

  return json.routes[0].geometry.coordinates as Coord[];
}

/**
 * Two-attempt route fetch: exclude=motorway first, relax only on failure.
 */
async function fetchRouteWithMotorwayFallback(
  waypoints: readonly Coord[],
  token: string,
): Promise<MapboxRouteResult> {
  // Attempt 1: avoid motorways (hard rule)
  try {
    const coords = await fetchMapboxRoute(waypoints, true, token);
    const distKm = estimateDistanceKm(coords);
    return { coordinates: coords, distance_km: distKm, motorway_used: false };
  } catch (firstError) {
    // Attempt 2: allow motorways as fallback
    try {
      const coords = await fetchMapboxRoute(waypoints, false, token);
      const distKm = estimateDistanceKm(coords);
      return {
        coordinates: coords,
        distance_km: distKm,
        motorway_used: true,
      };
    } catch (secondError) {
      throw new Error(
        `exclude=motorway: ${(firstError as Error).message} | ` +
        `without exclude: ${(secondError as Error).message}`,
      );
    }
  }
}

// ── Distance estimation ──────────────────────────────────────────────────

function estimateDistanceKm(coords: readonly Coord[]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineKm(coords[i - 1], coords[i]);
  }
  return Math.round(total);
}

function haversineKm(a: Coord, b: Coord): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// ── Cinematic Route Shaping Engine ───────────────────────────────────────
// Builds waypoint sequences based on hub strategy and waypoint tiers:
//   loop:       hub → shapers → anchors → scenics → hub
//   pass_chain: hub → shaper → anchor chain → shaper → hub (expanded)

function buildCinematicWaypointChain(
  hub: Hub,
  zone: ScenicZone,
): readonly Waypoint[] {
  const anchors = zone.keyWaypoints.filter((wp) => wp.tier === "anchor");
  const shapers = zone.keyWaypoints.filter((wp) => wp.tier === "shaper");
  const scenics = zone.keyWaypoints.filter((wp) => wp.tier === "scenic");

  if (hub.strategy === "pass_chain") {
    // Pass-chain: interleave shapers between anchors for maximum distance
    // Pattern: shaper → anchor → shaper → anchor → shaper
    const chain: Waypoint[] = [];
    const usedShapers = [...shapers];
    for (let i = 0; i < anchors.length; i++) {
      if (i < usedShapers.length) {
        chain.push(usedShapers[i]);
      }
      chain.push(anchors[i]);
    }
    // Add remaining shapers at the end
    for (let i = anchors.length; i < usedShapers.length; i++) {
      chain.push(usedShapers[i]);
    }
    // Scenics go at the end (optional, droppable)
    chain.push(...scenics);
    return chain;
  }

  // Loop strategy: shapers first (to force geometry), then anchors, then scenics
  return [...shapers, ...anchors, ...scenics];
}

/**
 * Drop scenic waypoints from a chain to try to reduce distance.
 * Returns a new array without scenic waypoints.
 */
function dropScenicWaypoints(
  chain: readonly Waypoint[],
): readonly Waypoint[] {
  return chain.filter((wp) => wp.tier !== "scenic");
}

/**
 * Build coordinate sequence for Mapbox from a waypoint chain.
 * Bookends with hub coord for loop routes.
 */
function buildCoordSequence(
  hubCoord: Coord,
  chain: readonly Waypoint[],
  isLoop: boolean,
): Coord[] {
  const coords: Coord[] = [hubCoord, ...chain.map((wp) => wp.coord)];
  if (isLoop) {
    coords.push(hubCoord);
  }
  return coords;
}

// ── Mission code generator ───────────────────────────────────────────────

function buildMissionCode(
  hubCode: string,
  routeType: "loop" | "one_way",
  sequenceNum: number,
  extractionCode?: string,
): string {
  if (routeType === "loop") {
    return `${hubCode}-L${sequenceNum}`;
  }
  return `${hubCode}-${extractionCode}-${sequenceNum}`;
}

// ── Slug builder ─────────────────────────────────────────────────────────

function buildSlug(hubCode: string, zoneSlug: string, routeType: "loop" | "one_way"): string {
  const suffix = routeType === "loop" ? "weekend-loop" : "weekend";
  return `${hubCode.toLowerCase()}-${zoneSlug}-${suffix}`;
}

// ── Title builder ────────────────────────────────────────────────────────

function buildTitle(zoneName: string, routeType: "loop" | "one_way"): string {
  return routeType === "loop"
    ? `${zoneName} Weekend Loop`
    : `${zoneName} Weekend Escape`;
}

// ── Pitch builder ────────────────────────────────────────────────────────

function buildPitch(
  hubCode: string,
  zoneName: string,
  highlights: readonly string[],
  routeType: "loop" | "one_way",
): string {
  return (
    `Deploy from ${hubCode} and ride into the ${zoneName}. ` +
    `Hit ${highlights.slice(0, 2).join(" and ")}. ` +
    `${routeType === "loop" ? `Loop back to ${hubCode}` : "Extract at destination"} ` +
    `over a packed 2–3 day weekend escape. No highways, just curves and elevation.`
  );
}

// ── SEO builder ──────────────────────────────────────────────────────────

function buildSEO(
  hubCode: string,
  zoneName: string,
  routeType: "loop" | "one_way",
): { title: string; description: string } {
  const typeLabel = routeType === "loop" ? "Loop" : "Route";
  return {
    title: `Motorcycle Weekend ${typeLabel} from ${hubCode} | ${zoneName} Mission`,
    description:
      `Fly into ${hubCode}, ride the ${zoneName} over a 2–3 day weekend escape. ` +
      `Download the GPX route file and ride — no planning needed.`,
  };
}

// ── Core generation ──────────────────────────────────────────────────────

interface GenerateOptions {
  readonly hubs: readonly Hub[];
  readonly mapboxToken: string;
  readonly outputDir: string;
  readonly dryRun?: boolean;
  readonly delayMs?: number;
}

export interface GenerateResult {
  readonly missions: WeekendMission[];
  readonly report: GenerationReport;
}

export async function generateWeekendMissions(
  options: GenerateOptions,
): Promise<GenerateResult> {
  const missions: WeekendMission[] = [];
  const entries: GenerationEntry[] = [];

  for (const hub of options.hubs) {
    if (hub.scenicZones.length === 0) continue;

    let loopSeq = 0;

    for (const zone of hub.scenicZones) {
      loopSeq++;
      const code = buildMissionCode(hub.code, "loop", loopSeq);
      const slug = buildSlug(hub.code, zone.slug, "loop");
      const title = buildTitle(zone.name, "loop");

      // Cinematic route shaping: build waypoint chain based on strategy + tiers
      const fullChain = buildCinematicWaypointChain(hub, zone);

      const highlights = zone.keyWaypoints
        .filter((wp) => wp.tier === "anchor" || wp.tier === "shaper")
        .map((wp) => {
          const elev = wp.elevation_m ? ` — ${wp.elevation_m}m` : "";
          return `${wp.name}${elev}`;
        });

      const pitch = buildPitch(hub.code, zone.name, highlights, "loop");
      const seo = buildSEO(hub.code, zone.name, "loop");

      console.log(`[GEN] ${code} (${slug}): ${hub.strategy} strategy, ${fullChain.length} waypoints...`);

      if (options.dryRun) {
        const coordCount = fullChain.length + 2; // +2 for hub bookends
        console.log(`[DRY] ${code}: ${coordCount} waypoints, skipping Mapbox call`);
        entries.push({
          code,
          slug,
          status: "success",
          source: "mapbox_directions",
          motorway_used: false,
          distance_km: 0,
          assets: ["(dry-run)"],
        });
        continue;
      }

      // Rate-limit delay
      if (options.delayMs) {
        await delay(options.delayMs);
      }

      try {
        // ── Post-route distance validation loop ──────────────────────
        // Attempt 1: full chain (all tiers)
        // If too long (>900km): retry without scenic waypoints
        // If too short (<400km): accept with warning (can't auto-expand)
        let currentChain = fullChain;
        let route: MapboxRouteResult | null = null;
        let attempt = 0;

        while (attempt <= MAX_DISTANCE_RETRIES) {
          attempt++;
          const coords = buildCoordSequence(hub.coord, currentChain, true);

          if (options.delayMs && attempt > 1) {
            await delay(options.delayMs);
          }

          route = await fetchRouteWithMotorwayFallback(coords, options.mapboxToken);

          if (route.distance_km > MAX_TOTAL_KM && attempt <= MAX_DISTANCE_RETRIES) {
            // Route too long — drop scenic waypoints
            const trimmed = dropScenicWaypoints(currentChain);
            if (trimmed.length < currentChain.length) {
              console.log(
                `[TRIM] ${code}: ${route.distance_km}km > ${MAX_TOTAL_KM}km, ` +
                `dropping ${currentChain.length - trimmed.length} scenic waypoints, retrying...`,
              );
              currentChain = trimmed;
              continue;
            }
          }

          // Route is within range, or we've exhausted retries
          break;
        }

        if (!route) {
          throw new Error("No route produced after retries");
        }

        // Log distance warnings
        if (route.distance_km < MIN_TOTAL_KM) {
          console.warn(
            `[WARN] ${code}: distance ${route.distance_km}km < ${MIN_TOTAL_KM}km — ` +
            `accepting (hub may need expanded zones)`,
          );
        } else if (route.distance_km > MAX_TOTAL_KM) {
          console.warn(
            `[WARN] ${code}: distance ${route.distance_km}km > ${MAX_TOTAL_KM}km — ` +
            `accepting after scenic trim`,
          );
        }

        const dailyKm = Math.round(route.distance_km / 2.5);
        const saddleHours = Math.round((dailyKm / AVG_SPEED_KMH) * 10) / 10;

        // Use the final chain's waypoints for mission data
        const missionWaypoints = [...currentChain];

        // Write GPS assets
        const assets = writeRouteAssets({
          slug,
          code,
          title,
          description: pitch,
          hub_airport: hub.code,
          distance_km: route.distance_km,
          coordinates: route.coordinates,
          waypoints: missionWaypoints,
          outputDir: options.outputDir,
        });

        const mission: WeekendMission = {
          code,
          slug,
          title,
          continent: "europe",
          mission_type: "weekend_escape",
          hub_airport: hub.code,
          insertion_airport: hub.code,
          extraction_airport: hub.code,
          theater: zone.slug,
          distance_km: route.distance_km,
          duration_days: "2–3",
          daily_km_avg: dailyKm,
          saddle_hours_avg: saddleHours,
          route_type: "loop",
          cinematic_pitch: pitch,
          highlights,
          waypoints: missionWaypoints,
          route_assets: {
            source: "mapbox_directions",
            motorway_used: route.motorway_used,
            motorway_reason: route.motorway_used
              ? `No route found with exclude=motorway for ${code}`
              : undefined,
            geojson_path: assets.geojson_path,
            gpx_path: assets.gpx_path,
            polyline: assets.polyline,
            distance_km: route.distance_km,
          },
          seo,
        };

        missions.push(mission);

        entries.push({
          code,
          slug,
          status: "success",
          source: "mapbox_directions",
          motorway_used: route.motorway_used,
          distance_km: route.distance_km,
          assets: ["route.geojson", "route.gpx", "polyline.txt"],
        });

        console.log(
          `[OK]  ${code} (${slug}): ${route.distance_km}km, ` +
          `motorway=${route.motorway_used}, ${route.coordinates.length} pts, ` +
          `${missionWaypoints.length} waypoints (${attempt} attempt${attempt > 1 ? "s" : ""})`,
        );
      } catch (err) {
        const errorMsg = (err as Error).message;
        console.error(`[FAIL] ${code} (${slug}): ${errorMsg}`);

        entries.push({
          code,
          slug,
          status: "failed",
          error: errorMsg,
          retry_without_motorway: errorMsg.includes("without exclude"),
          retry_result: "failed",
          retry_error: errorMsg,
          assets: [],
        });
      }
    }
  }

  const succeeded = entries.filter((e) => e.status === "success").length;
  const failed = entries.filter((e) => e.status === "failed").length;

  const report: GenerationReport = {
    generated_at: new Date().toISOString(),
    tier: options.hubs[0]?.tier ?? 0,
    total_attempted: entries.length,
    total_succeeded: succeeded,
    total_failed: failed,
    missions: entries,
  };

  return { missions, report };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
