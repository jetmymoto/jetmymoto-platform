function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;

  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isWithinRadius(pointA, pointB, radiusKm = 5) {
  const dist = haversineDistanceKm(pointA?.lat, pointA?.lng, pointB?.lat, pointB?.lng);
  if (dist === null) return false;
  return dist <= radiusKm;
}

function getRouteOverlapScore(poolA, poolB) {
  const originDist = haversineDistanceKm(
    poolA?.origin?.lat, poolA?.origin?.lng,
    poolB?.origin?.lat, poolB?.origin?.lng
  );

  const destDist = haversineDistanceKm(
    poolA?.destination?.lat, poolA?.destination?.lng,
    poolB?.destination?.lat, poolB?.destination?.lng
  );

  if (originDist === null || destDist === null) return 0;

  let score = 0;
  if (originDist <= 5) score += 0.5;
  if (destDist <= 5) score += 0.5;

  return score; // Returns 0, 0.5, or 1.0
}

function getDirectionalCompatibility(poolA, poolB) {
  // Simple check for now. If origins and destinations match closely, compatibility is high.
  // Real implementation might involve comparing angle/bearing of travel.
  const routeOverlap = getRouteOverlapScore(poolA, poolB);
  if (routeOverlap === 1) return 1.0;
  if (routeOverlap === 0.5) return 0.5;
  return 0; // If they are not sharing origin/dest, directions are divergent or unknown
}

function getGeoClusterKey(lat, lng, precision = 1) {
  if (lat == null || lng == null) return "unknown";
  // One decimal point gives a grid of roughly 11km x 11km at equator
  return `${Number(lat).toFixed(precision)}_${Number(lng).toFixed(precision)}`;
}

module.exports = {
  haversineDistanceKm,
  isWithinRadius,
  getRouteOverlapScore,
  getDirectionalCompatibility,
  getGeoClusterKey
};
