import {
  GRAPH_SHARD_STATES,
  validateGraphShardEntry,
  validateGraphShardValue,
} from "./graphShards.contract.js";

function normalizeShardName(name) {
  return String(name || "").trim();
}

function createShardRecord(loader) {
  return {
    status: GRAPH_SHARD_STATES.IDLE,
    value: null,
    error: null,
    promise: null,
    loader,
  };
}

export function createGraphShardRuntime(manifest = {}) {
  const shardState = new Map();

  const setShard = (name, nextShard) => {
    shardState.set(name, nextShard);
    return nextShard;
  };

  const updateShard = (name, updates) => {
    const shard = shardState.get(name);

    if (!shard) {
      throw new Error(`Unknown graph shard: ${name}`);
    }

    const nextShard = {
      ...shard,
      ...updates,
    };

    shardState.set(name, nextShard);
    return nextShard;
  };

  const register = (rawName, loader) => {
    const validation = validateGraphShardEntry(rawName, loader);

    if (!validation.valid) {
      throw new Error(validation.errors.join(" "));
    }

    if (shardState.has(validation.name)) {
      throw new Error(`Graph shard \"${validation.name}\" is already registered.`);
    }

    setShard(validation.name, createShardRecord(loader));
    return validation.name;
  };

  for (const [rawName, loader] of Object.entries(manifest)) {
    register(rawName, loader);
  }

  const read = (name) => {
    const key = normalizeShardName(name);
    const shard = shardState.get(key);
    return shard?.value ?? null;
  };

  const status = (name) => {
    const key = normalizeShardName(name);
    const shard = shardState.get(key);
    return shard?.status ?? "missing";
  };

  const reset = (name) => {
    const key = normalizeShardName(name);
    const shard = shardState.get(key);

    if (!shard) {
      throw new Error(`Unknown graph shard: ${key}`);
    }

    setShard(key, createShardRecord(shard.loader));
    return GRAPH_SHARD_STATES.IDLE;
  };

  const prime = (name, value) => {
    const key = normalizeShardName(name);
    const shard = shardState.get(key);

    if (!shard) {
      throw new Error(`Unknown graph shard: ${key}`);
    }

    const validation = validateGraphShardValue(key, value);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    setShard(key, {
      ...shard,
      status: GRAPH_SHARD_STATES.LOADED,
      value: validation.value,
      error: null,
      promise: null,
    });

    return validation.value;
  };

  const snapshot = () => {
    return [...shardState.entries()].map(([name, shard]) => ({
      name,
      status: shard.status,
      hasValue: shard.value !== null,
      error: shard.error instanceof Error ? shard.error.message : null,
    }));
  };

  const load = async (name) => {
    const key = normalizeShardName(name);
    const shard = shardState.get(key);

    if (!shard) {
      throw new Error(`Unknown graph shard: ${key}`);
    }

    if (shard.status === "loaded") {
      return shard.value;
    }

    if (shard.promise) {
      return shard.promise;
    }

    const loadPromise = Promise.resolve()
      .then(() => shard.loader())
      .then((value) => {
        const validation = validateGraphShardValue(key, value);

        if (!validation.valid) {
          throw new Error(validation.error);
        }

        updateShard(key, {
          status: GRAPH_SHARD_STATES.LOADED,
          value: validation.value,
          error: null,
          promise: null,
        });

        return validation.value;
      })
      .catch((error) => {
        updateShard(key, {
          status: GRAPH_SHARD_STATES.ERROR,
          error,
          promise: null,
        });
        throw error;
      });

    updateShard(key, {
      status: GRAPH_SHARD_STATES.LOADING,
      error: null,
      promise: loadPromise,
    });

    return loadPromise;
  };

  return Object.freeze({
    read,
    status,
    load,
    register,
    reset,
    prime,
    snapshot,
    keys: () => [...shardState.keys()],
  });
}
