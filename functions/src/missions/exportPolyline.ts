import type { Coord } from "./types.js";

/**
 * Encode an array of [lng, lat] coordinates into a Google Encoded Polyline string.
 * Reference: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 *
 * NOTE: Polyline format expects (lat, lng) order despite our internal [lng, lat] convention.
 */
export function encodePolyline(coordinates: readonly Coord[]): string {
  let encoded = "";
  let prevLat = 0;
  let prevLng = 0;

  for (const coord of coordinates) {
    const lat = Math.round(coord[1] * 1e5);
    const lng = Math.round(coord[0] * 1e5);

    encoded += encodeSignedValue(lat - prevLat);
    encoded += encodeSignedValue(lng - prevLng);

    prevLat = lat;
    prevLng = lng;
  }

  return encoded;
}

function encodeSignedValue(value: number): string {
  let v = value < 0 ? ~(value << 1) : value << 1;
  let encoded = "";

  while (v >= 0x20) {
    encoded += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }

  encoded += String.fromCharCode(v + 63);
  return encoded;
}
