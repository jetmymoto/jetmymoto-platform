function isObjectRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export const GRAPH_SHARD_STATES = Object.freeze({
  IDLE: "idle",
  LOADING: "loading",
  LOADED: "loaded",
  ERROR: "error",
});

export const GRAPH_SHARD_UNKNOWN_STATUS = "missing";

export const GRAPH_SHARD_NAMES = Object.freeze({
  CORE: "core",
  RENTALS: "rentals",
  OVERLAYS: "overlays",
  POI_DETAILS: "poiDetails",
});

export const SHARDS = Object.freeze({
  CORE: "eager",
  RENTALS: "lazy",
  OVERLAYS: "lazy",
  POI_DETAILS: "lazy",
});

export const GRAPH_SHARD_INVARIANTS = Object.freeze({
  OVERLAY_ABOVE_THE_FOLD:
    "Overlay pages must render above-the-fold without requiring additional shard loads.",
  POI_REFERENCE_IMPLEMENTATION: "poiDetails is the reference shard implementation.",
});

export const GRAPH_SHARD_PUBLIC_CONTRACT = Object.freeze({
  names: GRAPH_SHARD_NAMES,
  loading: SHARDS,
  states: Object.freeze(Object.values(GRAPH_SHARD_STATES)),
  unknownStatus: GRAPH_SHARD_UNKNOWN_STATUS,
  referenceImplementation: GRAPH_SHARD_NAMES.POI_DETAILS,
  invariants: GRAPH_SHARD_INVARIANTS,
});

const GRAPH_SHARD_VALUE_VALIDATORS = Object.freeze({
  poiDetails: (value) => value === null || isObjectRecord(value),
  overlays: (value) => {
    return (
      isObjectRecord(value) &&
      isObjectRecord(value.patriotOverlays) &&
      isObjectRecord(value.overlayIndexes)
    );
  },
  rentals: (value) => {
    return (
      isObjectRecord(value) &&
      isObjectRecord(value.rentals) &&
      isObjectRecord(value.operators) &&
      isObjectRecord(value.rentalIndexes)
    );
  },
});

export function validateGraphShardEntry(name, loader) {
  const normalizedName = String(name || "").trim();
  const errors = [];

  if (!normalizedName) {
    errors.push("Shard name must be a non-empty string.");
  }

  if (typeof loader !== "function") {
    errors.push(`Shard \"${normalizedName || "<unknown>"}\" must provide a loader function.`);
  }

  return {
    name: normalizedName,
    valid: errors.length === 0,
    errors,
  };
}

export function validateGraphShardValue(name, value) {
  const normalizedName = String(name || "").trim();
  const validator = GRAPH_SHARD_VALUE_VALIDATORS[normalizedName];

  if (!validator) {
    return {
      valid: true,
      value,
      error: null,
    };
  }

  if (validator(value)) {
    return {
      valid: true,
      value,
      error: null,
    };
  }

  return {
    valid: false,
    value: null,
    error: `Graph shard \"${normalizedName}\" returned an invalid payload.`,
  };
}

export function isManagedGraphShardState(status) {
  return Object.values(GRAPH_SHARD_STATES).includes(status);
}