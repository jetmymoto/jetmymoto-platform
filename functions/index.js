const {setGlobalOptions} = require("firebase-functions");

// keep your global config
setGlobalOptions({maxInstances: 10});

// 🔥 IMPORT YOUR FUNCTION
const {createMotoQuote} = require("./src/createMotoQuote");
const {createCheckoutSession} = require("./src/createCheckoutSession");
const {stripeWebhook} = require("./src/stripeWebhook");
const {createTransportPool} = require("./src/createTransportPool");

// 🔥 EXPORT IT (THIS IS WHAT EMULATOR LOOKS FOR)
exports.createMotoQuote = createMotoQuote;
exports.createCheckoutSession = createCheckoutSession;
exports.stripeWebhook = stripeWebhook;
exports.createTransportPool = createTransportPool;
