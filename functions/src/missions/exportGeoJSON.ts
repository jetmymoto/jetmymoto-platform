import type { Coord, Waypoint } from "./types.js";

interface GeoJSONExportOptions {
  readonly coordinates: readonly Coord[];
  readonly slug: string;
  readonly title: string;
  readonly code: string;
  readonly distance_km: number;
  readonly hub_airport: string;
  readonly waypoints?: readonly Waypoint[];
}

interface GeoJSONFeature {
  readonly type: "Feature";
  readonly properties: Record<string, unknown>;
  readonly geometry: {
    readonly type: string;
    readonly coordinates: readonly Coord[] | Coord;
  };
}

interface GeoJSONCollection {
  readonly type: "FeatureCollection";
  readonly features: readonly GeoJSONFeature[];
}

export function buildGeoJSON(options: GeoJSONExportOptions): GeoJSONCollection {
  const routeFeature: GeoJSONFeature = {
    type: "Feature",
    properties: {
      slug: options.slug,
      code: options.code,
      title: options.title,
      distance_km: options.distance_km,
      hub_airport: options.hub_airport,
      feature_type: "route",
    },
    geometry: {
      type: "LineString",
      coordinates: [...options.coordinates],
    },
  };

  const waypointFeatures: GeoJSONFeature[] = (options.waypoints ?? []).map((wp) => ({
    type: "Feature" as const,
    properties: {
      name: wp.name,
      waypoint_type: wp.type,
      elevation_m: wp.elevation_m ?? null,
    },
    geometry: {
      type: "Point" as const,
      coordinates: wp.coord,
    },
  }));

  return {
    type: "FeatureCollection",
    features: [routeFeature, ...waypointFeatures],
  };
}

export function serializeGeoJSON(collection: GeoJSONCollection): string {
  return JSON.stringify(collection, null, 2);
}
