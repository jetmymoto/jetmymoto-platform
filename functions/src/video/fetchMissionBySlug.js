/* eslint-disable require-jsdoc */

const {db} = require("../lib/firebaseAdmin");
const STATIC_MISSIONS = require("../data/a2aMissions.json");
const AIRPORT_COORDS = require("../data/airportCoords.json");

const EXTRA_AIRPORT_COORDS = {
  BEG: {lat: 44.8184, lng: 20.3091},
  BGO: {lat: 60.2934, lng: 5.2181},
  DBV: {lat: 42.5614, lng: 18.2682},
  SFO: {lat: 37.6213, lng: -122.379},
  SLC: {lat: 40.7884, lng: -111.9778},
  TIA: {lat: 41.4147, lng: 19.7206},
  YQB: {lat: 46.7911, lng: -71.3933},
  YUL: {lat: 45.47, lng: -73.7408},
};

const THEATER_WAYPOINTS = {
  "alps": [
    [10.1421, 46.5296],
    [12.1373, 46.5385],
    [12.3155, 45.4408],
  ],
  "pyrenees": [
    [0.144, 42.906],
    [-0.337, 42.911],
  ],
  "scottish-highlands": [
    [-4.894, 56.819],
    [-5.475, 57.274],
  ],
  "norwegian-fjords": [
    [8.5966, 59.8794],
    [6.8437, 60.3713],
  ],
  "dolomites": [
    [12.1373, 46.5385],
    [11.7946, 46.488],
  ],
  "socal-coast": [
    [-121.8947, 36.6002],
    [-122.477, 37.8105],
  ],
  "quebec-laurentians": [
    [-74.025, 46.122],
    [-70.687, 47.068],
  ],
  "wasatch-front": [
    [-111.6946, 39.3209],
    [-111.379, 36.998],
    [-115.1728, 36.1147],
  ],
  "balkan-spine": [
    [21.6269, 39.7125],
    [21.6775, 44.6625],
    [14.5058, 46.0569],
  ],
  "albanian-alps": [
    [19.5033, 42.0693],
    [19.78, 42.39],
    [18.78, 42.4],
  ],
  "dalmatian-coast": [
    [18.3500, 42.7100],
    [17.8083, 43.3428],
    [15.2314, 44.1194],
  ],
};

function normalizeCoordinateTuple(value) {
  if (!Array.isArray(value) || value.length < 2) {
    return null;
  }

  const lng = Number(value[0]);
  const lat = Number(value[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }

  return [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
}

function normalizeCoordinateObject(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const lat = Number(value.lat ?? value.latitude);
  const lng = Number(
      value.lng ?? value.lon ?? value.long ?? value.longitude,
  );

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return normalizeCoordinateTuple([lng, lat]);
}

function dedupeCoordinates(points) {
  const deduped = [];
  for (const point of points) {
    const normalized = Array.isArray(point) ?
      normalizeCoordinateTuple(point) :
      normalizeCoordinateObject(point);

    if (!normalized) {
      continue;
    }

    const previous = deduped[deduped.length - 1];
    if (
      previous &&
      previous[0] === normalized[0] &&
      previous[1] === normalized[1]
    ) {
      continue;
    }

    deduped.push(normalized);
  }

  return deduped;
}

function getAirportCoordinate(code, airportCoords) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  if (!normalizedCode) {
    return null;
  }

  const known = airportCoords[normalizedCode];
  if (known) {
    return normalizeCoordinateObject({
      lat: known.lat,
      lng: known.lng ?? known.long,
    });
  }

  const fallback = EXTRA_AIRPORT_COORDS[normalizedCode];
  return fallback ? normalizeCoordinateObject(fallback) : null;
}

function buildFallbackCoordinates(mission, airportCoords) {
  const directCoordinates = dedupeCoordinates([
    ...(mission.coordinates || []),
    ...(mission.routePoints || []),
    ...(mission.waypoints || []),
  ]);

  if (directCoordinates.length >= 2) {
    return directCoordinates;
  }

  const start = getAirportCoordinate(mission.insertion_airport, airportCoords);
  const end = getAirportCoordinate(mission.extraction_airport, airportCoords);
  const theaterWaypoints = THEATER_WAYPOINTS[mission.theater] || [];

  const inferredCoordinates = dedupeCoordinates([
    start,
    ...theaterWaypoints,
    end,
  ]);

  if (inferredCoordinates.length >= 2) {
    return inferredCoordinates;
  }

  if (start && end) {
    return [start, end];
  }

  return inferredCoordinates;
}

async function fetchMissionFromCollection(
    database,
    collectionName,
    missionSlug,
) {
  const snapshot = await database
      .collection(collectionName)
      .where("slug", "==", missionSlug)
      .limit(1)
      .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    ...doc.data(),
    slug: doc.data().slug || missionSlug,
    sourceCollection: collectionName,
    sourceId: doc.id,
  };
}

async function fetchMissionBySlug(missionSlug, options = {}) {
  const database = options.database || db;
  const slug = String(missionSlug || "").trim();
  if (!slug) {
    return null;
  }

  const firestoreMission = await fetchMissionFromCollection(
      database,
      "missions",
      slug,
  ) || await fetchMissionFromCollection(database, "a2a_missions", slug);

  const staticMission = STATIC_MISSIONS.find(
      (entry) => entry.slug === slug,
  ) || null;
  const mission = firestoreMission || staticMission;

  if (!mission) {
    return null;
  }

  const coordinates = buildFallbackCoordinates(mission, AIRPORT_COORDS);

  return {
    ...mission,
    slug,
    title: mission.title || mission.missionTitle || slug,
    subtitle: mission.cinematic_pitch || mission.missionSummary || "",
    coordinates,
  };
}

module.exports = {
  buildFallbackCoordinates,
  dedupeCoordinates,
  fetchMissionBySlug,
};
