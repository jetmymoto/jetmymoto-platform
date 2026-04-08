import bucketIndex from "./poiFilteredBucketIndex.json";

const SHARD_LOADERS = import.meta.glob("./shards/*.json");

function normalizeSlug(value) {
  return String(value || "").trim().toLowerCase();
}

function getBucketKey(slug) {
  const normalizedSlug = normalizeSlug(slug);
  return bucketIndex[normalizedSlug] || "misc";
}

export function createPoiFilteredShard() {
  const bucketCache = new Map();

  async function loadBucket(bucketKey) {
    const normalizedBucket = bucketKey || "misc";
    const loaderPath = `./shards/${normalizedBucket}.json`;
    const loader = SHARD_LOADERS[loaderPath] || SHARD_LOADERS["./shards/misc.json"];

    if (bucketCache.has(normalizedBucket)) {
      return bucketCache.get(normalizedBucket);
    }

    const module = await loader();
    const records = module.default || module || {};
    bucketCache.set(normalizedBucket, records);
    return records;
  }

  function readRecord(slug) {
    const normalizedSlug = normalizeSlug(slug);
    const bucket = getBucketKey(normalizedSlug);
    return bucketCache.get(bucket)?.[normalizedSlug] || null;
  }

  async function loadRecord(slug) {
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug) {
      return null;
    }

    const bucket = getBucketKey(normalizedSlug);
    const records = await loadBucket(bucket);
    return records?.[normalizedSlug] || null;
  }

  return {
    data: null,
    readRecord,
    loadRecord,
    readBucket(bucketKey) {
      const normalizedBucket = bucketKey || "misc";
      return bucketCache.get(normalizedBucket) || null;
    },
    loadBucket,
  };
}