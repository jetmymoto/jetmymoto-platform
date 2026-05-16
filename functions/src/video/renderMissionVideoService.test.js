/* eslint-disable require-jsdoc, max-len */

const test = require("node:test");
const assert = require("node:assert/strict");
const {renderMissionVideoService} = require("./renderMissionVideoService");

test("renderMissionVideoService returns cached mission video without rendering", async () => {
  let renderCalled = false;
  let uploadCalled = false;

  const result = await renderMissionVideoService({
    missionSlug: "dbv-to-muc-premium-reposition",
    database: {},
    fetchMissionBySlugImpl: async () => ({
      slug: "dbv-to-muc-premium-reposition",
      title: "The Premium Reposition",
      videoUrl: "https://cdn.example.test/mission.mp4",
      videoStoragePath: "mission-videos/dbv/hash.mp4",
      coordinates: [[18.2682, 42.5614], [11.79, 48.35]],
    }),
    getMissionVideoAssetImpl: async () => null,
    renderMissionVideoImpl: async () => {
      renderCalled = true;
    },
    uploadMissionVideoImpl: async () => {
      uploadCalled = true;
    },
  });

  assert.equal(result.cached, true);
  assert.equal(result.videoUrl, "https://cdn.example.test/mission.mp4");
  assert.equal(renderCalled, false);
  assert.equal(uploadCalled, false);
});

test("renderMissionVideoService triggers rendering and uploading lifecycle hooks", async () => {
  const lifecycle = [];

  const result = await renderMissionVideoService({
    missionSlug: "dbv-to-muc-premium-reposition",
    database: {
      collection() {
        return {
          doc() {
            return {
              async get() {
                return {exists: false};
              },
              async set() {
                return undefined;
              },
            };
          },
        };
      },
    },
    fetchMissionBySlugImpl: async () => ({
      slug: "dbv-to-muc-premium-reposition",
      title: "The Premium Reposition",
      coordinates: [[18.2682, 42.5614], [11.79, 48.35]],
    }),
    renderMissionVideoImpl: async () => ({
      outputLocation: "/tmp/dbv.mp4",
      compositionId: "MissionVideo",
      durationInFrames: 360,
      width: 1920,
      height: 1080,
    }),
    uploadMissionVideoImpl: async () => ({
      videoUrl: "https://cdn.example.test/mission.mp4",
      storagePath: "mission-videos/dbv/hash.mp4",
      contentHash: "hash1234",
    }),
    onRenderingStart: async () => {
      lifecycle.push("rendering");
    },
    onUploadingStart: async () => {
      lifecycle.push("uploading");
    },
  });

  assert.deepEqual(lifecycle, ["rendering", "uploading"]);
  assert.equal(result.cached, undefined);
  assert.equal(result.videoUrl, "https://cdn.example.test/mission.mp4");
});
