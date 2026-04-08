import type { Coord, Waypoint } from "./types.js";

interface GPXExportOptions {
  readonly coordinates: readonly Coord[];
  readonly title: string;
  readonly code: string;
  readonly description: string;
  readonly waypoints?: readonly Waypoint[];
  readonly durationDays?: number; // defaults to 2
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Split coordinates into roughly equal day segments.
 * Returns an array of coordinate arrays, one per day.
 */
function splitIntoDaySegments(
  coordinates: readonly Coord[],
  days: number,
): readonly (readonly Coord[])[] {
  if (days <= 1 || coordinates.length <= 2) {
    return [coordinates];
  }

  const segmentSize = Math.ceil(coordinates.length / days);
  const segments: Coord[][] = [];

  for (let i = 0; i < coordinates.length; i += segmentSize) {
    segments.push([...coordinates.slice(i, i + segmentSize)]);
  }

  return segments;
}

export function buildGPX(options: GPXExportOptions): string {
  const displayName = `${options.code} — ${options.title}`;
  const days = options.durationDays ?? 2;
  const lines: string[] = [];

  lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  lines.push(
    `<gpx version="1.1" creator="JetMyMoto Mission System"`,
    `     xmlns="http://www.topografix.com/GPX/1/1"`,
    `     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
    `     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">`,
  );

  // Metadata
  lines.push(`  <metadata>`);
  lines.push(`    <name>${escapeXml(displayName)}</name>`);
  lines.push(`    <desc>${escapeXml(options.description)}</desc>`);
  lines.push(`    <author><name>JetMyMoto</name></author>`);
  lines.push(`    <time>${new Date().toISOString()}</time>`);
  lines.push(`  </metadata>`);

  // Waypoints (POIs for Garmin / Komoot)
  for (const wp of options.waypoints ?? []) {
    const lat = wp.coord[1];
    const lng = wp.coord[0];
    lines.push(`  <wpt lat="${lat}" lon="${lng}">`);
    lines.push(`    <name>${escapeXml(wp.name)}</name>`);
    lines.push(`    <type>${escapeXml(wp.type)}</type>`);
    if (wp.elevation_m !== undefined) {
      lines.push(`    <ele>${wp.elevation_m}</ele>`);
    }
    lines.push(`  </wpt>`);
  }

  // Day-segmented tracks
  const segments = splitIntoDaySegments(options.coordinates, days);

  for (let dayIdx = 0; dayIdx < segments.length; dayIdx++) {
    const dayNum = dayIdx + 1;
    const dayLabel = segments.length > 1
      ? `${displayName} — Day ${dayNum}`
      : displayName;

    lines.push(`  <trk>`);
    lines.push(`    <name>${escapeXml(dayLabel)}</name>`);
    lines.push(`    <desc>${escapeXml(options.description)}</desc>`);
    lines.push(`    <trkseg>`);

    for (const coord of segments[dayIdx]) {
      const lng = coord[0];
      const lat = coord[1];
      lines.push(`      <trkpt lat="${lat}" lon="${lng}"></trkpt>`);
    }

    lines.push(`    </trkseg>`);
    lines.push(`  </trk>`);
  }

  lines.push(`</gpx>`);

  return lines.join("\n");
}
