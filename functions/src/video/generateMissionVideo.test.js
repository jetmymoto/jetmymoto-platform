/* eslint-disable require-jsdoc, max-len */

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createGenerateMissionVideoHandler,
  validateGenerateMissionVideoPayload,
} = require("./generateMissionVideo");

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("validateGenerateMissionVideoPayload rejects empty missionSlug", () => {
  assert.throws(
      () => validateGenerateMissionVideoPayload({missionSlug: ""}),
      /missionSlug must be a non-empty string/,
  );
});

test("createGenerateMissionVideoHandler returns 405 for non-POST methods", async () => {
  const handler = createGenerateMissionVideoHandler();
  const response = createMockResponse();

  await handler({method: "GET", body: {}}, response);

  assert.equal(response.statusCode, 405);
  assert.equal(response.body.success, false);
});

test("createGenerateMissionVideoHandler returns cached asset when present", async () => {
  const handler = createGenerateMissionVideoHandler({
    database: {},
    getCachedMissionVideoImpl: async () => ({
      videoUrl: "https://cdn.example.test/mission.mp4",
      storagePath: "mission-videos/demo/hash.mp4",
    }),
  });
  const response = createMockResponse();

  await handler({method: "POST", body: {missionSlug: "demo"}}, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.cached, true);
  assert.equal(response.body.videoUrl, "https://cdn.example.test/mission.mp4");
});

test("createGenerateMissionVideoHandler queues a job when asset is missing", async () => {
  const handler = createGenerateMissionVideoHandler({
    database: {name: "mock-db"},
    getCachedMissionVideoImpl: async () => null,
    fetchMissionBySlugImpl: async () => ({slug: "dbv-to-muc-premium-reposition", title: "The Premium Reposition"}),
    findActiveMissionVideoJobImpl: async () => null,
    queueMissionVideoJobImpl: async () => ({jobId: "job-123"}),
  });
  const response = createMockResponse();

  await handler({method: "POST", body: {missionSlug: "dbv-to-muc-premium-reposition"}}, response);

  assert.equal(response.statusCode, 202);
  assert.equal(response.body.queued, true);
  assert.equal(response.body.jobId, "job-123");
});

test("createGenerateMissionVideoHandler reuses an active queued job", async () => {
  const handler = createGenerateMissionVideoHandler({
    database: {name: "mock-db"},
    getCachedMissionVideoImpl: async () => null,
    fetchMissionBySlugImpl: async () => ({slug: "dbv-to-muc-premium-reposition", title: "The Premium Reposition"}),
    findActiveMissionVideoJobImpl: async () => ({jobId: "job-999", status: "queued"}),
    queueMissionVideoJobImpl: async () => {
      throw new Error("queueMissionVideoJobImpl should not be called");
    },
  });
  const response = createMockResponse();

  await handler({method: "POST", body: {missionSlug: "dbv-to-muc-premium-reposition"}}, response);

  assert.equal(response.statusCode, 202);
  assert.equal(response.body.queued, true);
  assert.equal(response.body.existing, true);
  assert.equal(response.body.jobId, "job-999");
});

test("createGenerateMissionVideoHandler forwards forceRegenerate to the queue", async () => {
  let queuedOptions = null;

  const handler = createGenerateMissionVideoHandler({
    database: {name: "mock-db"},
    getCachedMissionVideoImpl: async () => null,
    fetchMissionBySlugImpl: async () => ({slug: "dbv-to-muc-premium-reposition", title: "The Premium Reposition"}),
    findActiveMissionVideoJobImpl: async () => null,
    queueMissionVideoJobImpl: async (_database, _mission, options) => {
      queuedOptions = options;
      return {jobId: "job-force", existing: false};
    },
  });
  const response = createMockResponse();

  await handler({
    method: "POST",
    body: {
      missionSlug: "dbv-to-muc-premium-reposition",
      forceRegenerate: true,
    },
  }, response);

  assert.equal(response.statusCode, 202);
  assert.equal(queuedOptions.forceRegenerate, true);
});
