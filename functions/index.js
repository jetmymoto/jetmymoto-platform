const {setGlobalOptions} = require("firebase-functions");

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
