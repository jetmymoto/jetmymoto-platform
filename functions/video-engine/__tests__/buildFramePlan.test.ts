/**
 * buildFramePlan.test.ts
 *
 * Node built-in test runner tests for buildFramePlan utility.
 * Run: cd functions && npx ts-node --esm video-engine/__tests__/buildFramePlan.test.ts
 *       OR compile first and run: node --test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildFramePlan,
  buildOverlayCoords,
  encodePolyline,
  type FramePlanResult,
} from "../utils/buildFramePlan.js";

// Simple Athens → Munich test route (airport-level resolution, 2 points)
const TEST_COORDS: Array<[number, number]> = [
  [23.9444, 37.9364], // ATH
  [11.786, 48.3538],  // MUC
];

describe("buildFramePlan", () => {
  it("returns the default frame count", () => {
    const plan = buildFramePlan(TEST_COORDS);
    assert.equal(plan.totalFrames, 150);
    assert.equal(plan.frames.length, 150);
  });

  it("returns durationSeconds = 24", () => {
    const plan = buildFramePlan(TEST_COORDS);
    assert.equal(plan.durationSeconds, 24);
  });

  it("sets correct frameIndex on each entry", () => {
    const plan = buildFramePlan(TEST_COORDS);
    for (let i = 0; i < plan.frames.length; i++) {
      assert.equal(plan.frames[i].frameIndex, i);
    }
  });

  it("returns valid bounds [minLng, minLat, maxLng, maxLat]", () => {
    const plan = buildFramePlan(TEST_COORDS);
    const [minLng, minLat, maxLng, maxLat] = plan.bounds;
    assert.ok(minLng < maxLng, "minLng should be less than maxLng");
    assert.ok(minLat < maxLat, "minLat should be less than maxLat");
  });

  it("all zoom values are clamped [0, 22]", () => {
    const plan = buildFramePlan(TEST_COORDS);
    for (const frame of plan.frames) {
      assert.ok(frame.zoom >= 0 && frame.zoom <= 22, `Frame ${frame.frameIndex} zoom out of range: ${frame.zoom}`);
    }
  });

  it("all pitch values are clamped [0, 60]", () => {
    const plan = buildFramePlan(TEST_COORDS);
    for (const frame of plan.frames) {
      assert.ok(frame.pitch >= 0 && frame.pitch <= 60, `Frame ${frame.frameIndex} pitch out of range: ${frame.pitch}`);
    }
  });

  it("Act 0 (dive frames): routeProgress = 0", () => {
    const plan = buildFramePlan(TEST_COORDS);
    for (let i = 0; i < plan.diveFrames; i++) {
      assert.equal(plan.frames[i].routeProgress, 0, `Frame ${i} should have routeProgress=0`);
    }
  });

  it("Act settle (post-flyover): routeProgress = 1", () => {
    const plan = buildFramePlan(TEST_COORDS);
    const start = plan.diveFrames + plan.flyoverFrames;
    for (let i = start; i < plan.totalFrames; i++) {
      assert.equal(plan.frames[i].routeProgress, 1, `Frame ${i} should have routeProgress=1`);
    }
  });

  it("Flyover frames have increasing routeProgress", () => {
    const plan = buildFramePlan(TEST_COORDS);
    let prev = -1;
    const start = plan.diveFrames;
    const end = plan.diveFrames + plan.flyoverFrames;
    for (let i = start; i < end; i++) {
      const { routeProgress } = plan.frames[i];
      assert.ok(routeProgress >= prev, `Frame ${i} routeProgress should be non-decreasing`);
      prev = routeProgress;
    }
  });

  it("fullRoutePolyline and cameraRoutePolyline are non-empty strings", () => {
    const plan = buildFramePlan(TEST_COORDS);
    assert.ok(typeof plan.fullRoutePolyline === "string" && plan.fullRoutePolyline.length > 0);
    assert.ok(typeof plan.cameraRoutePolyline === "string" && plan.cameraRoutePolyline.length > 0);
  });

  it("throws for fewer than 2 coordinates", () => {
    assert.throws(
      () => buildFramePlan([[23.9, 37.9]]),
      /at least 2 coordinates/,
    );
  });

  it("throws for empty coordinates", () => {
    assert.throws(() => buildFramePlan([]), /at least 2 coordinates/);
  });
});

describe("buildOverlayCoords", () => {
  it("returns ≤500 points", () => {
    const dense: Array<[number, number]> = Array.from({ length: 2000 }, (_, i) => [
      23.9 + i * 0.001,
      37.9 + i * 0.0005,
    ]);
    const overlay = buildOverlayCoords(dense);
    assert.ok(overlay.length <= 500, `Expected ≤500 points, got ${overlay.length}`);
  });

  it("preserves at least 2 points", () => {
    const overlay = buildOverlayCoords(TEST_COORDS);
    assert.ok(overlay.length >= 2);
  });
});

describe("encodePolyline", () => {
  it("returns a non-empty string for valid input", () => {
    const encoded = encodePolyline(TEST_COORDS);
    assert.ok(typeof encoded === "string" && encoded.length > 0);
  });

  it("round-trips to consistent length for same input", () => {
    const a = encodePolyline(TEST_COORDS);
    const b = encodePolyline(TEST_COORDS);
    assert.equal(a, b);
  });
});
