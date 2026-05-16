/* eslint-disable require-jsdoc */

const fs = require("node:fs/promises");
const path = require("node:path");
const {buildFallbackCoordinates} = require("./fetchMissionBySlug");
const {renderMissionVideo} = require("./renderMissionVideoNode");
const missions = require("../data/a2aMissions.json");
const airportCoords = require("../data/airportCoords.json");

async function main() {
  const missionSlug = process.env.MISSION_SLUG ||
    "dbv-to-muc-premium-reposition";
  const mission = missions.find((entry) => entry.slug === missionSlug);

  if (!mission) {
    throw new Error(`Mission '${missionSlug}' was not found in backend data.`);
  }

  const outputDir = path.resolve(__dirname, "../../video-engine/output");
  const outputLocation = path.join(outputDir, "test.mp4");

  await fs.mkdir(outputDir, {recursive: true});

  const renderResult = await renderMissionVideo({
    ...mission,
    subtitle: mission.cinematic_pitch || "",
    coordinates: buildFallbackCoordinates(mission, airportCoords),
  }, {
    outputLocation,
  });

  console.log(`Render complete: ${renderResult.outputLocation}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
