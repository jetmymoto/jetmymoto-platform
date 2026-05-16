/* eslint-disable require-jsdoc, max-len */

const test = require("node:test");
const assert = require("node:assert/strict");
const {buildFallbackCoordinates, dedupeCoordinates} = require("./fetchMissionBySlug");

test("dedupeCoordinates removes repeated sequential points", () => {
  const points = dedupeCoordinates([
    [23.95, 37.94],
    [23.95, 37.94],
    [21.6269, 39.7125],
  ]);

  assert.deepEqual(points, [
    [23.95, 37.94],
    [21.6269, 39.7125],
  ]);
});

test("buildFallbackCoordinates uses explicit coordinates when present", () => {
  const mission = {
    coordinates: [
      [23.95, 37.94],
      [21.6269, 39.7125],
      [11.79, 48.35],
    ],
    insertion_airport: "ATH",
    extraction_airport: "MUC",
    theater: "balkan-spine",
  };

  const points = buildFallbackCoordinates(mission, {});
  assert.equal(points.length, 3);
});

test("buildFallbackCoordinates falls back to airport and theater points", () => {
  const points = buildFallbackCoordinates({
    insertion_airport: "ATH",
    extraction_airport: "MUC",
    theater: "balkan-spine",
  }, {
    ATH: {lat: "37.94", long: "23.95"},
    MUC: {lat: "48.35", long: "11.79"},
  });

  assert.equal(points[0][0], 23.95);
  assert.equal(points[0][1], 37.94);
  assert.equal(points.at(-1)[0], 11.79);
  assert.equal(points.at(-1)[1], 48.35);
  assert.ok(points.length >= 3);
});

test("buildFallbackCoordinates falls back to a straight line between airports", () => {
  const points = buildFallbackCoordinates({
    insertion_airport: "ATH",
    extraction_airport: "MUC",
    theater: "unknown-theater",
  }, {
    ATH: {lat: "37.94", long: "23.95"},
    MUC: {lat: "48.35", long: "11.79"},
  });

  assert.deepEqual(points, [
    [23.95, 37.94],
    [11.79, 48.35],
  ]);
});
