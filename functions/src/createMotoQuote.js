const { onRequest } = require("firebase-functions/v2/https");
const { z } = require("zod");
const cors = require("cors")({ origin: true });
const { transporter, escapeHtml, sendEmailWithTimeout } = require("./lib/emailUtils");
const { buildDossierHtml } = require("./lib/buildDossierHtml");
const { generateDossierPdf } = require("./lib/generateDossierPdf");

async function geocodeCity(city) {
  if (!city || typeof city !== 'string') {
    throw new Error("GEOCODE_ERROR: Invalid city provided");
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`,
      {
        headers: {
          "User-Agent": "jetmymoto-server"
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`GEOCODE_ERROR: API failure (${res.status})`);
    }

    const data = await res.json();

    if (!(data && data.length)) {
      throw new Error("GEOCODE_ERROR: Geocoding failed for: " + city);
    }

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error("GEOCODE_ERROR: Invalid coordinates returned for: " + city);
    }

    return { lat, lng };
  } catch (error) {
    if (error && error.message && error.message.startsWith("GEOCODE_ERROR")) {
      throw error;
    }
    throw new Error("GEOCODE_ERROR: Unexpected error geocoding " + city);
  }
}

// 1. Updated Validation Schema
const quotePayloadSchema = z.object({
  pickupCountry: z.string().optional().or(z.literal("")),
  pickupCity: z.string().min(2).max(100),
  destinationCity: z.string().min(2).max(100),
  arrivalDate: z.string().optional().or(z.literal("")),
  contact: z.union([
    z.string().email(),
    z.object({
      email: z.string().email(),
      name: z.string().optional(),
      phone: z.string().optional()
    })
  ]),
  
  // NEW: Structured multi-bike inputs
  bikes: z.object({
    small: z.number().int().min(0),
    medium: z.number().int().min(0),
    large: z.number().int().min(0),
  }).optional(),
  bikeDetails: z.array(z.any()).optional(),

  // Dual-engine rental context
  requestMode: z.enum(["logistics", "rental"]).nullable().optional(),
  selectedRentalId: z.string().max(120).nullable().optional(),
  selectedRentalAirport: z.string().max(12).nullable().optional(),
  selectedRentalOperator: z.string().max(160).nullable().optional(),
  selectedRentalMachine: z.string().max(160).nullable().optional(),

  // Broker engine fields (rental micro-transaction)
  brokerFee: z.number().min(0).max(1000).nullable().optional(),
  checkoutAction: z.enum(["initiate_stripe_session"]).nullable().optional(),

  // LEGACY: Kept optional for backwards compatibility
  bikeModel: z.string().max(100).optional(),
  quantity: z.number().int().min(1).max(10).optional(),
}).refine(data => {
  const totalNewBikes = ((data.bikes && data.bikes.small) || 0) + ((data.bikes && data.bikes.medium) || 0) + ((data.bikes && data.bikes.large) || 0);
  return totalNewBikes > 0 || (data.quantity && data.quantity > 0);
}, { message: "Payload must contain at least one valid transport unit." });

// Class Multipliers
const CLASS_MULTIPLIER = {
  small: 1.0,
  medium: 1.2,
  large: 1.5
};

function mapHubToIATA(hub) {
  const map = {
    Mallorca: "PMI",
    Berlin: "BER",
    London: "LHR",
  };
  return map[hub] || hub;
}

function getNearestHub(lat, lng, airports) {
  let closest = null;
  let minDist = Infinity;

  for (const airport of airports) {
    const dist = Math.sqrt(
      Math.pow(lat - airport.lat, 2) +
      Math.pow(lng - airport.lng, 2)
    );

    if (dist < minDist) {
      minDist = dist;
      closest = airport.code;
    }
  }

  return closest;
}

exports.createMotoQuote = onRequest({ memory: "1GiB", cors: true }, (req, res) => {
  // Hardcode headers to bypass strict Codespace/Emulator proxy filtering
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Intercept OPTIONS preflight before anything else runs
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  cors(req, res, async () => {
    try {
    console.log("-> Incoming request:", JSON.stringify(req.body));
    
    const cleanedInput = { ...req.body };

    // 1. Remove trust in frontend coordinates
    delete cleanedInput.pickupLat;
    delete cleanedInput.pickupLng;
    delete cleanedInput.destinationLat;
    delete cleanedInput.destinationLng;
    
    // Compatibility mapping BEFORE validation (NEW -> LEGACY)
    if (!cleanedInput.arrivalDate && cleanedInput.departureDate) {
      cleanedInput.arrivalDate = cleanedInput.departureDate;
    }
    if (!cleanedInput.contact && cleanedInput.customerEmail) {
      cleanedInput.contact = cleanedInput.customerEmail;
    }

    // 2. Parse and Validate Payload
    let rawData;
    try {
      rawData = quotePayloadSchema.parse(cleanedInput);
      console.log("OK: Validation passed");
    } catch (err) {
      console.error("ERR: ZOD VALIDATION ERRORS:", JSON.stringify(err.issues || err.errors, null, 2));
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        details: err.issues || err.errors
      });
    }

    // 3. Enforce backend-only geocoding
    console.log(`Geocoding routes: ${rawData.pickupCity} -> ${rawData.destinationCity}`);
    const pickupGeo = await geocodeCity(rawData.pickupCity);
    const destinationGeo = await geocodeCity(rawData.destinationCity);

    console.log(`Geocoded pickup: ${pickupGeo.lat}, ${pickupGeo.lng}`);
    console.log(`Geocoded destination: ${destinationGeo.lat}, ${destinationGeo.lng}`);

    const airports = require("./data/airports");

    const nearestHub = getNearestHub(
      pickupGeo.lat,
      pickupGeo.lng,
      airports
    );

    rawData.hub = (nearestHub && nearestHub.length > 3) ? mapHubToIATA(nearestHub) : nearestHub;

    // 4. Backward Compatibility Migration
    let normalizedBikes = rawData.bikes || { small: 0, medium: 0, large: 0 };
    let normalizedDetails = rawData.bikeDetails || [];

    if (!rawData.bikes && rawData.quantity && rawData.quantity > 0) {
      normalizedBikes.medium = rawData.quantity;
      if (rawData.bikeModel) {
        for (let i = 0; i < rawData.quantity; i++) {
          normalizedDetails.push({ 
            class: "medium", 
            model: rawData.bikeModel 
          });
        }
      }
    }
    console.log("OK: Normalization complete:", JSON.stringify(normalizedBikes));

    // 4. Calculate total abstract capacity units
    const totalUnits = 
      (normalizedBikes.small * CLASS_MULTIPLIER.small) +
      (normalizedBikes.medium * CLASS_MULTIPLIER.medium) +
      (normalizedBikes.large * CLASS_MULTIPLIER.large);

    if (totalUnits <= 0) {
      return res.status(400).json({ success: false, error: "Invalid request data: total units must be > 0" });
    }

    // Calculate final price (simulated pricing pipeline)
    const calculateDistanceKm = require("./lib/calculateDistanceKm");
    const calculateDynamicPrice = require("./lib/calculateDynamicPrice");
    
    const distanceKm = calculateDistanceKm(
      pickupGeo.lat,
      pickupGeo.lng,
      destinationGeo.lat,
      destinationGeo.lng
    );

    if (typeof distanceKm !== 'number' || isNaN(distanceKm)) {
      return res.status(400).json({ success: false, error: "Invalid request data: route distance could not be computed" });
    }

    const estimatedPrice = calculateDynamicPrice(distanceKm, totalUnits);

    if (typeof estimatedPrice !== 'number' || isNaN(estimatedPrice)) {
      return res.status(400).json({ success: false, error: "Invalid request data: price could not be computed" });
    }

    console.log(`Calculated Distance: ${distanceKm} km, Price: EUR ${estimatedPrice}`);

    // 5. Construct Document
    const bookingRef = `JMM-${Date.now()}`;
    const bookingDocument = {
      bookingRef,
      pickupCountry: rawData.pickupCountry || "Auto",
      pickupCity: rawData.pickupCity,
      destinationCity: rawData.destinationCity,
      destinationLat: destinationGeo.lat,
      destinationLng: destinationGeo.lng,
      pickupLat: pickupGeo.lat,
      pickupLng: pickupGeo.lng,
      hub: rawData.hub,
      arrivalDate: rawData.arrivalDate,
      contact: rawData.contact,
      bikes: normalizedBikes,
      bikeDetails: normalizedDetails,
      requestMode: rawData.requestMode || "logistics",
      selectedRentalId: rawData.selectedRentalId || null,
      selectedRentalAirport: rawData.selectedRentalAirport || null,
      selectedRentalOperator: rawData.selectedRentalOperator || null,
      selectedRentalMachine: rawData.selectedRentalMachine || null,
      brokerFee: rawData.brokerFee || null,
      checkoutAction: rawData.checkoutAction || null,
      totalUnits: parseFloat(totalUnits.toFixed(2)),
      distanceKm,
      estimatedPrice,
      createdAt: new Date().toISOString()
    };

    // Respond to client immediately — PDF + email are best-effort and non-blocking
    console.log("OK: Returning success response");
    res.status(200).json({
      success: true,
      bookingRef,
      data: bookingDocument
    });

    // ── PDF generation (best-effort, never blocks response) ──
    let pdfBuffer = null;
    try {
      const dossierHtml = buildDossierHtml(bookingDocument);
      pdfBuffer = await generateDossierPdf(dossierHtml);
    } catch (pdfErr) {
      console.error("PDF generation failed:", (pdfErr && pdfErr.message) || "Unknown error");
    }

    // ── Email dispatch ──
    try {
      const isRental = rawData.requestMode === "rental";
      const email =
        typeof rawData.contact === "string"
          ? rawData.contact
          : rawData.contact.email;

      // ── Internal ops notification ──
      const opsHtml = `
        <p><strong>Booking Ref:</strong> ${escapeHtml(bookingRef)}</p>
        <p><strong>Request Mode:</strong> ${escapeHtml(rawData.requestMode || "logistics")}</p>
        <p><strong>Route:</strong> ${escapeHtml(rawData.pickupCity)} (${escapeHtml(rawData.pickupCountry)}) -> ${escapeHtml(rawData.destinationCity)}</p>
        <p><strong>Distance:</strong> ${distanceKm} km</p>
        ${
          isRental
            ? `
        <p><strong>Rental Machine:</strong> ${escapeHtml(rawData.selectedRentalMachine || "Unknown")}</p>
        <p><strong>Rental Airport:</strong> ${escapeHtml(rawData.selectedRentalAirport || "Unknown")}</p>
        <p><strong>Rental Operator:</strong> ${escapeHtml(rawData.selectedRentalOperator || "Unknown")}</p>
        `
            : ""
        }
        <p><strong>Fleet:</strong></p>
        <ul>
          ${normalizedBikes.large > 0 ? `<li>${normalizedBikes.large} Large</li>` : ""}
          ${normalizedBikes.medium > 0 ? `<li>${normalizedBikes.medium} Medium</li>` : ""}
          ${normalizedBikes.small > 0 ? `<li>${normalizedBikes.small} Small</li>` : ""}
        </ul>
        <p><strong>Units:</strong> ${parseFloat(totalUnits.toFixed(2))}</p>
        <p><strong>Estimate:</strong> EUR ${estimatedPrice}</p>
      `;

      console.log(`[EMAIL] queued: ${bookingRef}`);

      void sendEmailWithTimeout(
        transporter.sendMail({
          from: process.env.GMAIL_EMAIL,
          to: "info@jetmymoto.com",
          subject: `[NEW BOOKING] ${bookingRef} - ${rawData.hub}`,
          html: opsHtml,
        }),
        3000
      ).catch(err => {
        console.error("Ops email delivery failed:", (err && err.message) || "Unknown error");
      });

      // ── Customer confirmation email (conditional on requestMode) ──
      const fallbackLink = `https://rideratlas.com/booking/${encodeURIComponent(bookingRef)}`;
      const fallbackBlock = `
        <p style="margin-top:24px;font-size:13px;color:#888;">If the attachment does not load, your dossier is available here:</p>
        <p><a href="${fallbackLink}" style="color:#CDA755;">View your deployment dossier</a></p>
      `;

      const customerSubject = isRental
        ? `JetMyMoto: Tactical Hardware Secured - ${escapeHtml(rawData.selectedRentalMachine || "Your Rental")}`
        : `Your booking request ${bookingRef}`;

      const customerHtml = isRental
        ? `
          <p>Commander,</p>
          <p>Your rental deployment is confirmed. Attached is your official Reservation Dossier.</p>
          <p>Present this document to <strong>${escapeHtml(rawData.selectedRentalOperator || "the operator")}</strong>
             at <strong>${escapeHtml(rawData.selectedRentalAirport || "the staging hub")}</strong>.</p>
          <p><strong>Booking Ref:</strong> ${escapeHtml(bookingRef)}</p>
          <p>This document confirms your machine reservation.</p>
          ${fallbackBlock}
          <p>&mdash; JetMyMoto Tactical Division</p>
        `
        : `
          <p>Hi,</p>
          <p>Your motorcycle booking request has been received.</p>
          <p><strong>Booking Ref:</strong> ${escapeHtml(bookingRef)}</p>
          <p><strong>Route:</strong> ${escapeHtml(rawData.pickupCity)} &rarr; ${escapeHtml(rawData.destinationCity)} (${distanceKm} km)</p>
          <p><strong>Estimated Price:</strong> EUR ${estimatedPrice}</p>
          <p>We will contact you shortly with confirmation and next steps.</p>
          ${fallbackBlock}
          <p>&ndash; JetMyMoto Team</p>
        `;

      const pdfFilename = isRental
        ? `JetMyMoto-Reservation-${bookingRef}.pdf`
        : `JetMyMoto-Dossier-${bookingRef}.pdf`;

      void sendEmailWithTimeout(
        transporter.sendMail({
          from: process.env.GMAIL_EMAIL,
          to: email,
          subject: customerSubject,
          html: customerHtml,
          attachments: pdfBuffer
            ? [{ filename: pdfFilename, content: pdfBuffer, contentType: "application/pdf" }]
            : [],
        }),
        15000
      ).catch(err => {
        console.error("Customer email failed:", (err && err.message) || "Unknown error");
      });
    } catch (err) {
      console.error("Email preparation error:", err);
    }

  } catch (err) {
    console.error("🔥 FUNCTION CRASH:", err);
    
    if (err instanceof z.ZodError || (err && err.issues)) {
      console.error("ERR: ZOD VALIDATION ERRORS:", JSON.stringify(err.issues || err.errors, null, 2));
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        details: err.issues || err.errors
      });
    }

    if (err && err.message && err.message.startsWith("GEOCODE_ERROR")) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
  });
});
