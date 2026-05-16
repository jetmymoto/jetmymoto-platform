/* eslint-disable require-jsdoc, max-len */

const test = require("node:test");
const assert = require("node:assert/strict");
const {processMissionVideoJobDocument} = require("./processMissionVideoJob");

function createSnapshot(job) {
  const writes = [];

  return {
    writes,
    snapshot: {
      ref: {
        async set(payload) {
          writes.push(payload);
        },
      },
      data() {
        return job;
      },
    },
  };
}

test("processMissionVideoJobDocument advances through rendering and uploading states", async () => {
  const {snapshot, writes} = createSnapshot({
    missionSlug: "dbv-to-muc-premium-reposition",
    status: "queued",
  });

  await processMissionVideoJobDocument(snapshot, {
    database: {},
    serverTimestamp: () => "timestamp",
    renderMissionVideoServiceImpl: async (options) => {
      await options.onRenderingStart();
      await options.onUploadingStart();
      return {
        mission: {slug: "dbv-to-muc-premium-reposition"},
        videoUrl: "https://cdn.example.test/mission.mp4",
        storagePath: "mission-videos/dbv/hash.mp4",
      };
    },
  });

  assert.equal(writes[0].status, "rendering");
  assert.equal(writes[1].status, "uploading");
  assert.equal(writes[2].status, "completed");
  assert.equal(writes[2].videoUrl, "https://cdn.example.test/mission.mp4");
});

test("processMissionVideoJobDocument marks failed jobs cleanly", async () => {
  const {snapshot, writes} = createSnapshot({
    missionSlug: "dbv-to-muc-premium-reposition",
    status: "queued",
  });

  await processMissionVideoJobDocument(snapshot, {
    database: {},
    serverTimestamp: () => "timestamp",
    renderMissionVideoServiceImpl: async () => {
      throw new Error("boom");
    },
  });

  assert.equal(writes.length, 2);
  assert.equal(writes[0].status, "rendering");
  assert.equal(writes[1].status, "failed");
  assert.equal(writes[1].error, "boom");
});
