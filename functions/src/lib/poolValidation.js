/**
 * Shared Pool Validation Layer
 * 
 * Centralizes validation and normalization for pool documents
 * Supports both legacy string-based and new object-based intelligence shapes.
 */

function isValidCoordinate(value) {
  if (value == null) return false;
  
  // New object shape
  if (typeof value === "object") {
    return (
      typeof value.lat === "number" && 
      !isNaN(value.lat) &&
      typeof value.lng === "number" && 
      !isNaN(value.lng)
    );
  }
  
  // Legacy string shape
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  
  return false;
}

function isValidPoolStatus(status) {
  const allowed = ["OPEN", "FUNDED", "EXPIRED"];
  return allowed.includes(status);
}

function getSafeMatchBreakdown(raw) {
  const defaultBreakdown = {
    routeOverlap: 0,
    timeAlignment: 0,
    vehicleFit: 0,
    priceEfficiency: 0,
    directionalCompatibility: 0
  };

  if (!raw || typeof raw !== "object") {
    return defaultBreakdown;
  }

  return {
    routeOverlap: Number(raw.routeOverlap) || 0,
    timeAlignment: Number(raw.timeAlignment) || 0,
    vehicleFit: Number(raw.vehicleFit) || 0,
    priceEfficiency: Number(raw.priceEfficiency) || 0,
    directionalCompatibility: Number(raw.directionalCompatibility) || 0
  };
}

function normalizePoolDoc(raw) {
  if (!raw || typeof raw !== "object") return null;

  // Gracefully handle partial/legacy coordinates by converting to consistent shape
  let origin = raw.origin;
  if (typeof raw.origin === "string") {
    origin = { label: raw.origin, lat: null, lng: null };
  } else if (!raw.origin) {
    origin = { label: "Unknown Origin", lat: null, lng: null };
  }

  let destination = raw.destination;
  if (typeof raw.destination === "string") {
    destination = { label: raw.destination, lat: null, lng: null };
  } else if (!raw.destination) {
    destination = { label: "Unknown Destination", lat: null, lng: null };
  }

  return {
    ...raw,
    airportCode: raw.airportCode || "UNK",
    origin,
    destination,
    status: isValidPoolStatus(raw.status) ? raw.status : "OPEN",
    seatsAvailable: Number(raw.seatsAvailable) || 0,
    matchScore: Number(raw.matchScore) || 0,
    matchBreakdown: getSafeMatchBreakdown(raw.matchBreakdown),
    recommendedPools: Array.isArray(raw.recommendedPools) ? raw.recommendedPools : []
  };
}

function validatePoolForWrite(pool) {
  const errors = [];

  if (!pool.airportCode || typeof pool.airportCode !== "string") {
    errors.push("Missing or invalid airportCode");
  }

  if (!isValidCoordinate(pool.origin)) {
    errors.push("Missing or invalid origin");
  }

  if (!isValidCoordinate(pool.destination)) {
    errors.push("Missing or invalid destination");
  }

  if (!pool.departureTime) {
    errors.push("Missing departureTime");
  }

  if (pool.status && !isValidPoolStatus(pool.status)) {
    errors.push(`Invalid status: ${pool.status}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  isValidCoordinate,
  isValidPoolStatus,
  normalizePoolDoc,
  validatePoolForWrite,
  getSafeMatchBreakdown
};
