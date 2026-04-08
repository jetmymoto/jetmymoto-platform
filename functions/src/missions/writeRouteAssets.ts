import fs from "node:fs";
import path from "node:path";
import type { Coord, Waypoint } from "./types.js";
import { buildGeoJSON, serializeGeoJSON } from "./exportGeoJSON.js";
import { buildGPX } from "./exportGPX.js";
import { encodePolyline } from "./exportPolyline.js";

interface WriteRouteAssetsOptions {
  readonly slug: string;
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly hub_airport: string;
  readonly distance_km: number;
  readonly coordinates: readonly Coord[];
  readonly waypoints: readonly Waypoint[];
  readonly outputDir: string; // root missions/ directory
}

interface WriteResult {
  readonly geojson_path: string;
  readonly gpx_path: string;
  readonly polyline_path: string;
  readonly polyline: string;
}

export function writeRouteAssets(options: WriteRouteAssetsOptions): WriteResult {
  const missionDir = path.join(options.outputDir, options.slug);
  fs.mkdirSync(missionDir, { recursive: true });

  // 1. GeoJSON
  const geojson = buildGeoJSON({
    coordinates: options.coordinates,
    slug: options.slug,
    title: options.title,
    code: options.code,
    distance_km: options.distance_km,
    hub_airport: options.hub_airport,
    waypoints: options.waypoints,
  });
  const geojsonPath = path.join(missionDir, "route.geojson");
  fs.writeFileSync(geojsonPath, serializeGeoJSON(geojson), "utf-8");

  // 2. GPX (lead-magnet quality)
  const gpx = buildGPX({
    coordinates: options.coordinates,
    title: options.title,
    code: options.code,
    description: options.description,
    waypoints: options.waypoints,
  });
  const gpxPath = path.join(missionDir, "route.gpx");
  fs.writeFileSync(gpxPath, gpx, "utf-8");

  // 3. Encoded polyline
  const polyline = encodePolyline(options.coordinates);
  const polylinePath = path.join(missionDir, "polyline.txt");
  fs.writeFileSync(polylinePath, polyline, "utf-8");

  return {
    geojson_path: `missions/${options.slug}/route.geojson`,
    gpx_path: `missions/${options.slug}/route.gpx`,
    polyline_path: `missions/${options.slug}/polyline.txt`,
    polyline,
  };
}
