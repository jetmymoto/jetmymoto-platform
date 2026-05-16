/* eslint-disable require-jsdoc */

const fs = require("node:fs/promises");
const {FieldValue} = require("firebase-admin/firestore");
const {db} = require("../lib/firebaseAdmin");
const {fetchMissionBySlug} = require("./fetchMissionBySlug");
const {renderMissionVideo} = require("./renderMissionVideoNode");
const {uploadMissionVideo} = require("./uploadMissionVideo");

function createStatusError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getMissionVideoAsset(database, missionSlug) {
  const assetDoc = await database.collection("mission_video_assets")
      .doc(missionSlug)
      .get();
  return assetDoc.exists ? assetDoc.data() : null;
}

function buildCachedVideoResult(mission, cachedVideo) {
  return {
    mission,
    cached: true,
    outputLocation: null,
    compositionId: null,
    durationInFrames: null,
    width: null,
    height: null,
    videoUrl: cachedVideo.videoUrl,
    storagePath: cachedVideo.storagePath || mission.videoStoragePath || null,
    contentHash: cachedVideo.contentHash || null,
  };
}

async function persistMissionVideoAsset(database, mission, uploadedVideo) {
  await database.collection("mission_video_assets").doc(mission.slug).set(
      {
        slug: mission.slug,
        title: mission.title,
        insertion_airport: mission.insertion_airport || null,
        extraction_airport: mission.extraction_airport || null,
        videoUrl: uploadedVideo.videoUrl,
        storagePath: uploadedVideo.storagePath,
        contentHash: uploadedVideo.contentHash,
        updatedAt: FieldValue.serverTimestamp(),
      },
      {merge: true},
  );

  if (mission.sourceCollection && mission.sourceId) {
    await database.collection(mission.sourceCollection)
        .doc(mission.sourceId)
        .set({
          videoUrl: uploadedVideo.videoUrl,
          videoStoragePath: uploadedVideo.storagePath,
          videoUpdatedAt: FieldValue.serverTimestamp(),
        }, {merge: true});
  }
}

async function renderMissionVideoService(options) {
  const database = options.database || db;
  const fetchMissionBySlugImpl =
    options.fetchMissionBySlugImpl || fetchMissionBySlug;
  const renderMissionVideoImpl =
    options.renderMissionVideoImpl || renderMissionVideo;
  const uploadMissionVideoImpl =
    options.uploadMissionVideoImpl || uploadMissionVideo;
  const getMissionVideoAssetImpl =
    options.getMissionVideoAssetImpl || getMissionVideoAsset;
  const onRenderingStart = options.onRenderingStart || (async () => undefined);
  const onUploadingStart = options.onUploadingStart || (async () => undefined);
  const forceRegenerate = options.forceRegenerate === true;

  const mission = await fetchMissionBySlugImpl(options.missionSlug, {database});
  if (!mission) {
    throw createStatusError(
        404,
        `Mission '${options.missionSlug}' was not found.`,
    );
  }

  const cachedVideo = !forceRegenerate ?
    await getMissionVideoAssetImpl(database, mission.slug) :
    null;

  if (!forceRegenerate && mission.videoUrl) {
    return buildCachedVideoResult(mission, {
      videoUrl: mission.videoUrl,
      storagePath: mission.videoStoragePath || null,
      contentHash: null,
    });
  }

  if (!forceRegenerate && cachedVideo?.videoUrl) {
    return buildCachedVideoResult(mission, cachedVideo);
  }

  if (!Array.isArray(mission.coordinates) || mission.coordinates.length < 2) {
    throw createStatusError(
        422,
        `Mission '${mission.slug}' ` +
        "does not have enough route coordinates to render.",
    );
  }

  let renderResult = null;

  try {
    await onRenderingStart(mission);
    renderResult = await renderMissionVideoImpl(mission, {
      renderId: options.renderId,
    });
    await onUploadingStart(mission, renderResult);
    const uploadedVideo = await uploadMissionVideoImpl({
      localFilePath: renderResult.outputLocation,
      slug: mission.slug,
    });

    await persistMissionVideoAsset(database, mission, uploadedVideo);

    return {
      mission,
      ...renderResult,
      ...uploadedVideo,
    };
  } finally {
    if (renderResult?.outputLocation) {
      await fs.unlink(renderResult.outputLocation).catch(() => undefined);
    }
  }
}

module.exports = {
  createStatusError,
  getMissionVideoAsset,
  renderMissionVideoService,
};
