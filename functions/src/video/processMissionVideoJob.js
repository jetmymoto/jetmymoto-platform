/* eslint-disable require-jsdoc */

const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {FieldValue} = require("firebase-admin/firestore");
const {db} = require("../lib/firebaseAdmin");
const {renderMissionVideoService} = require("./renderMissionVideoService");

function createTimestampFactory(overrides = {}) {
  return overrides.serverTimestamp || (() => FieldValue.serverTimestamp());
}

async function processMissionVideoJobDocument(snapshot, overrides = {}) {
  if (!snapshot) {
    return null;
  }

  const database = overrides.database || db;
  const renderMissionVideoServiceImpl =
    overrides.renderMissionVideoServiceImpl || renderMissionVideoService;
  const serverTimestamp = createTimestampFactory(overrides);
  const jobRef = snapshot.ref;
  const job = snapshot.data();
  const lockRef =
    job?.missionSlug && typeof database.collection === "function" ?
      database.collection("mission_video_locks").doc(job.missionSlug) :
      null;

  if (!job || job.status !== "queued") {
    return null;
  }

  const setJobState = async (status, extra = {}) => {
    await jobRef.set({
      status,
      ...extra,
    }, {merge: true});
  };

  const setLockState = async (status, extra = {}) => {
    if (!lockRef) {
      return;
    }

    await lockRef.set({
      missionSlug: job.missionSlug,
      jobId: jobRef.id,
      status,
      updatedAt: serverTimestamp(),
      ...extra,
    }, {merge: true});
  };

  const claimJob = async () => {
    if (typeof database.runTransaction !== "function" || !lockRef) {
      await setJobState("rendering", {
        startedAt: serverTimestamp(),
      });
      await setLockState("rendering");
      return true;
    }

    return database.runTransaction(async (transaction) => {
      const freshJobSnapshot = await transaction.get(jobRef);
      if (!freshJobSnapshot.exists) {
        return false;
      }

      const freshJob = freshJobSnapshot.data();
      if (!freshJob || freshJob.status !== "queued") {
        return false;
      }

      transaction.set(jobRef, {
        status: "rendering",
        startedAt: serverTimestamp(),
      }, {merge: true});

      transaction.set(lockRef, {
        missionSlug: freshJob.missionSlug,
        jobId: jobRef.id,
        status: "rendering",
        updatedAt: serverTimestamp(),
        forceRegenerate: freshJob.forceRegenerate === true,
      }, {merge: true});

      return true;
    });
  };

  const claimed = await claimJob();
  if (!claimed) {
    return null;
  }

  try {
    const rendered = await renderMissionVideoServiceImpl({
      missionSlug: job.missionSlug,
      database,
      forceRegenerate: job.forceRegenerate === true,
      renderId: jobRef.id,
      onRenderingStart: async () => undefined,
      onUploadingStart: async () => {
        await setJobState("uploading", {
          uploadingAt: serverTimestamp(),
        });
        await setLockState("uploading");
      },
    });

    await setJobState("completed", {
      completedAt: serverTimestamp(),
      missionSlug: rendered.mission.slug,
      videoUrl: rendered.videoUrl,
      storagePath: rendered.storagePath,
      cached: rendered.cached === true,
      error: FieldValue.delete(),
    });
    if (lockRef) {
      await lockRef.delete().catch(() => undefined);
    }
  } catch (error) {
    await setJobState("failed", {
      failedAt: serverTimestamp(),
      error: error.message || "Mission video job failed.",
    });
    if (lockRef) {
      await lockRef.delete().catch(() => undefined);
    }
  }

  return null;
}

const processMissionVideoJob = onDocumentCreated(
    {
      document: "mission_video_jobs/{jobId}",
      memory: "2GiB",
      timeoutSeconds: 540,
    },
    async (event) => processMissionVideoJobDocument(event.data),
);

module.exports = {
  processMissionVideoJobDocument,
  processMissionVideoJob,
};
