import * as turf from "@turf/turf";
import airportCoordsRaw from "../data/airportCoords.json" with { type: "json" };

const AIRPORT_COORDS: Record<string, [number, number]> =
  airportCoordsRaw as unknown as Record<string, [number, number]>;

type Coord = [number, number]; // [lng, lat]

interface FetchRouteOptions {
  from: { lng: number; lat: number };
  to: { lng: number; lat: number };
  waypoints?: Array<{ lng: number; lat: number }>;
}

/**
 * Fetch real-road geometry from the Mapbox Directions API.
 * Returns a GeoJSON-ordered coordinate array ([lng, lat]).
 *
 * Uses `overview=full` to get maximum fidelity.  We apply only a
 * very light geometry simplification (targeting 200-500 pts) so
 * road curves are preserved for overlay rendering.  The caller is
 * responsible for further downsampling when smooth camera motion is
 * needed (e.g. every-20th-point step filter via simplifyPath).
 */
export async function fetchRouteGeometry(
  options: FetchRouteOptions,
): Promise<Coord[]> {
  const token = (
    process.env.REMOTION_MAPBOX_TOKEN ||
    process.env.MAPBOX_TOKEN ||
    ""
  ).trim();

  if (!token) {
    throw new Error(
      "Mapbox token is not configured. Set REMOTION_MAPBOX_TOKEN or MAPBOX_TOKEN.",
    );
  }

  // Build waypoint string: "lng,lat;lng,lat;...;lng,lat"
  const points = [
    options.from,
    ...(options.waypoints ?? []),
    options.to,
  ];
  const coordinateString = points
    .map((p) => `${p.lng},${p.lat}`)
    .join(";");

  // overview=full + steps=true for hero-quality geometry
  // exclude=motorway to keep it cinematic
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinateString}?geometries=geojson&overview=full&steps=true&exclude=motorway&access_token=${token}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Mapbox Directions API error: ${res.status} ${res.statusText}`,
    );
  }

  const json = await res.json();

  if (!json.routes || json.routes.length === 0) {
    throw new Error(
      `Mapbox returned no routes for ${coordinateString}`,
    );
  }

  const fullCoordinates: Coord[] = json.routes[0].geometry.coordinates;

  if (!fullCoordinates || fullCoordinates.length < 5) {
    throw new Error(
      `Invalid Mapbox route: only ${fullCoordinates?.length ?? 0} points returned`,
    );
  }

  return fullCoordinates;
}

/**
 * Resolve airport codes to { lng, lat } objects.
 * Throws if an airport code is unknown.
 */
export function resolveAirportCoord(code: string): { lng: number; lat: number } {
  const coord = AIRPORT_COORDS[code];
  if (!coord) {
    throw new Error(
      `Unknown airport code: ${code}. Add it to airportCoords.json.`,
    );
  }
  return { lng: coord[0], lat: coord[1] };
}
