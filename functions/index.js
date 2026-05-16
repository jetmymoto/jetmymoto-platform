const {setGlobalOptions} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");

// keep your global config
setGlobalOptions({maxInstances: 10});

// 🔥 IMPORT YOUR FUNCTION
const {createMotoQuote} = require("./src/createMotoQuote");
const {createRentalReservation} = require("./src/createRentalReservation");
const {createCheckoutSession} = require("./src/createCheckoutSession");
const {stripeWebhook} = require("./src/stripeWebhook");
const {createTransportPool} = require("./src/createTransportPool");
const {getRouteMatches} = require("./src/getRouteMatches");
const {onPoolWrite} = require("./src/onPoolWrite");
const {generateFleetMedia} = require("./src/admin/generateFleetMedia");
const {videoWebhookHandler} = require("./src/admin/videoWebhookHandler");
const {visualAssetFactory} = require("./src/admin/visualAssetFactory");
const {img2imgPipeline} = require("./src/pipelines/img2imgPipeline");
const {generateText, filterImages} = require("./src/admin/vertexAiGenerator");
const {generateMissionVideo} = require("./src/video/generateMissionVideo");
const {processMissionVideoJob} = require("./src/video/processMissionVideoJob");
const {getAirportMissions} = require("./src/selectors/getAirportMissions");
const {createPosterEngineJob, processPosterEngineJob} = require("./src/posterEngine");

// 🔥 EXPORT IT (THIS IS WHAT EMULATOR LOOKS FOR)
exports.createMotoQuote = createMotoQuote;
exports.createRentalReservation = createRentalReservation;
exports.createCheckoutSession = createCheckoutSession;
exports.stripeWebhook = stripeWebhook;
exports.createTransportPool = createTransportPool;
exports.getRouteMatches = getRouteMatches;
exports.onPoolWrite = onPoolWrite;
exports.generateFleetMedia = generateFleetMedia;
exports.videoWebhookHandler = videoWebhookHandler;
exports.visualAssetFactory = visualAssetFactory;
exports.generateText = generateText;
exports.filterImages = filterImages;
exports.img2imgPipeline = img2imgPipeline;
exports.generateMissionVideo = generateMissionVideo;
exports.processMissionVideoJob = processMissionVideoJob;
exports.createPosterEngineJob = createPosterEngineJob;
exports.processPosterEngineJob = processPosterEngineJob;
exports.getAirportMissions = onCall(async (req) => {
  const {airportCode} = req.data || {};
  return getAirportMissions(airportCode);
});
