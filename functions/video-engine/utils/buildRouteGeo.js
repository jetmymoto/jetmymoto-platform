import * as turf from "@turf/turf";
import airportCoordsRaw from "../data/airportCoords.json" with { type: "json" };
// ── Airport coordinate lookup ─────────────────────────────────────────────
const AIRPORT_COORDS = airportCoordsRaw;
function lookupAirport(code) {
    return AIRPORT_COORDS[code] ?? null;
}
// ── Helpers ───────────────────────────────────────────────────────────────
function normalizePoint(point) {
    return [
        Number(point[0].toFixed(6)),
        Number(point[1].toFixed(6)),
    ];
}
function deduplicateSequential(coords) {
    return coords.filter((point, index, collection) => {
        if (index === 0)
            return true;
        const previous = collection[index - 1];
        return previous[0] !== point[0] || previous[1] !== point[1];
    });
}
/**
 * Synthesize a 3-point arc from two endpoints.
 * The midpoint is offset perpendicular to the line to create visual curvature.
 */
function synthesizeArc(start, end) {
    const midLng = (start[0] + end[0]) / 2;
    const midLat = (start[1] + end[1]) / 2;
    // Offset perpendicular to the line for visual arc
    const dLng = end[0] - start[0];
    const dLat = end[1] - start[1];
    const dist = Math.sqrt(dLng * dLng + dLat * dLat);
    const offsetScale = Math.min(dist * 0.15, 1.5);
    // Perpendicular vector (rotated 90°), normalized
    const perpLng = -dLat / (dist || 1) * offsetScale;
    const perpLat = dLng / (dist || 1) * offsetScale;
    return [
        start,
        [midLng + perpLng, midLat + perpLat],
        end,
    ];
}
/**
 * Apply Turf bezierSpline to produce a smooth curved path.
 * Falls back to the raw coordinates if Turf fails.
 */
function applyCurve(coords) {
    if (coords.length < 3)
        return coords;
    try {
        const line = turf.lineString(coords);
        const curved = turf.bezierSpline(line, { resolution: 10000, sharpness: 0.85 });
        const result = curved.geometry.coordinates;
        return result.length >= 2 ? result : coords;
    }
    catch {
        return coords;
    }
}
// ── Coordinate resolution (4-priority system) ─────────────────────────────
function resolveCoordinates(mission) {
    // Priority 1: High-fidelity road coordinates
    if (Array.isArray(mission.road_coordinates) && mission.road_coordinates.length >= 2) {
        return mission.road_coordinates.map(normalizePoint);
    }
    // Priority 2: Explicit coordinates from mission data
    if (Array.isArray(mission.coordinates) && mission.coordinates.length >= 2) {
        return mission.coordinates.map(normalizePoint);
    }
    // Priority 3 & 4: Derive from airport codes
    const insertionCode = mission.insertion_airport;
    const extractionCode = mission.extraction_airport;
    if (!insertionCode || !extractionCode) {
        throw new Error("Cannot build route geometry: no coordinates and no airport codes provided.");
    }
    const start = lookupAirport(insertionCode);
    const end = lookupAirport(extractionCode);
    if (!start || !end) {
        throw new Error(`Unknown airport code: ${!start ? insertionCode : extractionCode}. Add it to airportCoords.json.`);
    }
    // Priority 4: 3-point arc with midpoint offset
    return synthesizeArc(start, end);
}
// ── Main export ───────────────────────────────────────────────────────────
export const buildRouteGeo = (mission) => {
    const rawCoords = resolveCoordinates(mission);
    const deduplicated = deduplicateSequential(rawCoords);
    if (deduplicated.length < 2) {
        throw new Error("Invalid route geometry: fewer than 2 unique coordinates.");
    }
    // Apply bezier curve for smooth animation (only if not using road_coordinates)
    const coordinates = mission.road_coordinates ? deduplicated : applyCurve(deduplicated);
    const lats = coordinates.map((point) => point[1]);
    const lngs = coordinates.map((point) => point[0]);
    const center = [
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
        (Math.min(...lats) + Math.max(...lats)) / 2,
    ];
    const lngSpan = Math.max(...lngs) - Math.min(...lngs);
    const latSpan = Math.max(...lats) - Math.min(...lats);
    const maxSpan = Math.max(lngSpan, latSpan);
    const initialZoom = maxSpan > 20 ? 4.1 : maxSpan > 10 ? 4.6 : maxSpan > 6 ? 5.1 : 5.7;
    const first = coordinates[0];
    const second = coordinates[1];
    const initialBearing = ((Math.atan2(second[0] - first[0], second[1] - first[1]) * 180 / Math.PI) + 360) % 360;
    return {
        coordinates,
        center,
        initialZoom,
        initialBearing,
    };
};
