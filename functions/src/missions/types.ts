// ── Weekend Mission System Types ──────────────────────────────────────────

export type Coord = [number, number]; // [lng, lat]

export type WaypointType =
  | "scenic_pass"
  | "technical_climb"
  | "viewpoint"
  | "rest_stop";

/** Waypoint tier controls route shaping behavior */
export type WaypointTier =
  | "anchor"   // main POI — always included (e.g. Stelvio)
  | "shaper"   // forces geometry direction (e.g. Bormio, Bolzano)
  | "scenic";  // optional scenic stop — can be dropped to shorten

export type RouteType = "loop" | "one_way";
export type RouteSource = "mapbox_directions" | "buildRouteGeo_fallback";

/** Hub routing strategy — determines how waypoint chains are built */
export type HubStrategy =
  | "loop"        // standard: hub → zone → hub
  | "pass_chain"; // expanded: hub → shaper → anchors → shaper → hub

export interface Waypoint {
  readonly name: string;
  readonly coord: Coord;
  readonly type: WaypointType;
  readonly tier: WaypointTier;
  readonly elevation_m?: number;
}

export interface ScenicZone {
  readonly name: string;
  readonly slug: string;
  readonly center: Coord;
  readonly radiusKm: number;
  readonly tags: ReadonlyArray<"mountain_pass" | "coastal" | "national_park">;
  readonly keyWaypoints: readonly Waypoint[];
}

export interface Hub {
  readonly code: string;
  readonly tier: 1 | 2;
  readonly coord: Coord;
  readonly strategy: HubStrategy;
  readonly scenicZones: readonly ScenicZone[];
}

export interface RouteAssets {
  readonly source: RouteSource;
  readonly motorway_used: boolean;
  readonly motorway_reason?: string;
  readonly geojson_path: string;
  readonly gpx_path: string;
  readonly gpx_download_url?: string;
  readonly polyline: string;
  readonly distance_km: number;
}

export interface MissionSEO {
  readonly title: string;
  readonly description: string;
}

export interface WeekendMission {
  readonly code: string;         // "MXP-L1" — operational
  readonly slug: string;         // "mxp-dolomites-weekend-loop" — system
  readonly title: string;        // "Dolomites Weekend Loop" — user-facing
  readonly continent: "europe";
  readonly mission_type: "weekend_escape";
  readonly hub_airport: string;
  readonly insertion_airport: string;
  readonly extraction_airport: string;
  readonly theater: string;
  readonly distance_km: number;
  readonly duration_days: "2–3";
  readonly daily_km_avg: number;
  readonly saddle_hours_avg: number;
  readonly route_type: RouteType;
  readonly cinematic_pitch: string;
  readonly highlights: readonly string[];
  readonly waypoints: readonly Waypoint[];
  readonly route_assets: RouteAssets;
  readonly seo: MissionSEO;
}

// ── Generation Report Types ──────────────────────────────────────────────

export type GenerationStatus = "success" | "failed";

export interface GenerationEntry {
  readonly code: string;
  readonly slug: string;
  readonly status: GenerationStatus;
  readonly source?: RouteSource;
  readonly motorway_used?: boolean;
  readonly distance_km?: number;
  readonly assets: readonly string[];
  readonly error?: string;
  readonly retry_without_motorway?: boolean;
  readonly retry_result?: GenerationStatus;
  readonly retry_error?: string;
}

export interface GenerationReport {
  readonly generated_at: string;
  readonly tier: number;
  readonly total_attempted: number;
  readonly total_succeeded: number;
  readonly total_failed: number;
  readonly missions: readonly GenerationEntry[];
}
