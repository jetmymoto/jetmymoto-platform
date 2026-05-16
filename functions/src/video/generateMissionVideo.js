/* eslint-disable require-jsdoc */

const {onRequest} = require("firebase-functions/v2/https");
const {FieldValue} = require("firebase-admin/firestore");
const {db} = require("../lib/firebaseAdmin");
const {fetchMissionBySlug} = require("./fetchMissionBySlug");

function parseRequestBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  return req.body;
}

function validateGenerateMissionVideoPayload(payload) {
  const missionSlug = typeof payload.missionSlug === "string" ?
    payload.missionSlug.trim() :
    "";

  if (!missionSlug || missionSlug.length > 120) {
    const error = new Error("missionSlug must be a non-empty string.");
    error.statusCode = 400;
    throw error;
  }

  return {
    missionSlug,
    forceRegenerate: payload.forceRegenerate === true,
  };
}

function getMissionVideoLockRef(database, missionSlug) {
  return database.collection("mission_video_locks").doc(missionSlug);
}

const MISSION_VIDEO_LOCK_TIMEOUT_MS = 30 * 60 * 1000;

function toTimestampMillis(value) {
  if (!value) {
    return 0;
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function isActiveMissionVideoLock(lock) {
  if (!lock || !["queued", "rendering", "uploading"].includes(lock.status)) {
    return false;
  }

  const updatedAtMillis = toTimestampMillis(lock.updatedAt);
  if (!updatedAtMillis) {
    return true;
  }

  return Date.now() - updatedAtMillis < MISSION_VIDEO_LOCK_TIMEOUT_MS;
}

async function getCachedMissionVideo(database, missionSlug) {
  const assetDoc = await database.collection("mission_video_assets")
      .doc(missionSlug)
      .get();
  return assetDoc.exists ? assetDoc.data() : null;
}

async function findActiveMissionVideoJob(database, missionSlug) {
  const lockDoc = await getMissionVideoLockRef(database, missionSlug).get();
  if (!lockDoc.exists) {
    return null;
  }

  const lock = lockDoc.data();
  if (!isActiveMissionVideoLock(lock)) {
    return null;
  }

  return lock;
}

async function queueMissionVideoJob(database, mission, options = {}) {
  const jobRef = database.collection("mission_video_jobs").doc();
  const lockRef = getMissionVideoLockRef(database, mission.slug);

  return database.runTransaction(async (transaction) => {
    const lockSnapshot = await transaction.get(lockRef);
    const activeLock = lockSnapshot.exists ? lockSnapshot.data() : null;

    if (isActiveMissionVideoLock(activeLock)) {
      return {
        jobId: activeLock.jobId,
        existing: true,
      };
    }

    transaction.set(lockRef, {
      missionSlug: mission.slug,
      jobId: jobRef.id,
      status: "queued",
      forceRegenerate: options.forceRegenerate === true,
      updatedAt: FieldValue.serverTimestamp(),
    });

    transaction.set(jobRef, {
      missionSlug: mission.slug,
      title: mission.title,
      status: "queued",
      forceRegenerate: options.forceRegenerate === true,
      requestedAt: FieldValue.serverTimestamp(),
    });

    return {
      jobId: jobRef.id,
      existing: false,
    };
  });
}

function createGenerateMissionVideoHandler(overrides = {}) {
  const database = overrides.database || db;
  const getCachedMissionVideoImpl =
    overrides.getCachedMissionVideoImpl || getCachedMissionVideo;
  const findActiveMissionVideoJobImpl =
    overrides.findActiveMissionVideoJobImpl || findActiveMissionVideoJob;
  const fetchMissionBySlugImpl =
    overrides.fetchMissionBySlugImpl || fetchMissionBySlug;
  const queueMissionVideoJobImpl =
    overrides.queueMissionVideoJobImpl || queueMissionVideoJob;

  return async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({success: false, error: "Method not allowed"});
      return;
    }

    try {
      const payload = validateGenerateMissionVideoPayload(
          parseRequestBody(req),
      );
      const cachedVideo = !payload.forceRegenerate ?
        await getCachedMissionVideoImpl(
            database,
            payload.missionSlug,
        ) :
        null;

      if (cachedVideo && cachedVideo.videoUrl) {
        res.status(200).json({
          success: true,
          cached: true,
          videoUrl: cachedVideo.videoUrl,
          storagePath: cachedVideo.storagePath || null,
        });
        return;
      }

      const mission = await fetchMissionBySlugImpl(
          payload.missionSlug,
          {database},
      );
      if (!mission) {
        res.status(404).json({success: false, error: "Mission not found"});
        return;
      }

      if (!payload.forceRegenerate && mission.videoUrl) {
        res.status(200).json({
          success: true,
          cached: true,
          videoUrl: mission.videoUrl,
          storagePath: mission.videoStoragePath || null,
        });
        return;
      }

      const activeJob = !payload.forceRegenerate ?
        await findActiveMissionVideoJobImpl(database, mission.slug) : null;

      if (activeJob?.jobId) {
        res.status(202).json({
          success: true,
          queued: true,
          existing: true,
          jobId: activeJob.jobId,
          missionSlug: mission.slug,
        });
        return;
      }

      const queued = await queueMissionVideoJobImpl(database, mission, {
        forceRegenerate: payload.forceRegenerate,
      });

      res.status(202).json({
        success: true,
        queued: true,
        existing: queued.existing === true,
        jobId: queued.jobId,
        missionSlug: mission.slug,
      });
    } catch (error) {
      const statusCode = Number(error.statusCode) || 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Mission video generation failed.",
      });
    }
  };
}

const generateMissionVideo = onRequest(
    {
      cors: true,
      memory: "2GiB",
      timeoutSeconds: 540,
    },
    createGenerateMissionVideoHandler(),
);

module.exports = {
  createGenerateMissionVideoHandler,
  findActiveMissionVideoJob,
  generateMissionVideo,
  getCachedMissionVideo,
  queueMissionVideoJob,
  validateGenerateMissionVideoPayload,
};
