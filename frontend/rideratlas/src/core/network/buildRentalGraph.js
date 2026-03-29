import { OPERATORS } from "../../features/rentals/data/operators";
import { RENTALS } from "../../features/rentals/data/rentals";

const normalizeAirportKey = (value) => String(value || "").trim().toUpperCase();
const normalizeOperatorKey = (value) => String(value || "").trim();
const normalizeDestinationKey = (value) => String(value || "").trim().toLowerCase();
const normalizeRentalKey = (value) => String(value || "").trim();
const OPERATOR_FIELD_FALLBACKS = Object.freeze({
  security_deposit_amount: "Varies by machine",
  security_deposit_policy: "Security deposit authorization applies under operator terms at pickup.",
  cancellation_policy: "Standard",
  terms_last_verified: "",
  source_terms_url: "",
});

// ── Suitability terrain weights ──
// Maps destination slug tokens to terrain categories for scoring.
const TERRAIN_TOKENS = {
  alpine: ["alps", "alpine", "dolomites", "stelvio", "grossglockner", "tyrol", "bavarian-alps", "swiss-alps", "black-forest", "allgaeu"],
  coastal: ["coast", "coastal", "pacific-coast", "pch", "highway-1", "amalfi", "brighton", "cornwall"],
  urban: ["city", "urban", "london", "milan", "munich", "paris", "los-angeles"],
};

function computeSuitabilityScores(destinations, capabilities) {
  const destSet = new Set((destinations || []).map((d) => d.toLowerCase()));
  const capSet = new Set((capabilities || []).map((c) => c.toLowerCase()));

  let alpineHits = 0;
  let coastalHits = 0;
  let urbanHits = 0;

  for (const dest of destSet) {
    if (TERRAIN_TOKENS.alpine.some((t) => dest.includes(t))) alpineHits++;
    if (TERRAIN_TOKENS.coastal.some((t) => dest.includes(t))) coastalHits++;
    if (TERRAIN_TOKENS.urban.some((t) => dest.includes(t))) urbanHits++;
  }

  // Capability boost
  if (capSet.has("alpine-ready") || capSet.has("alpine-ready-setup")) alpineHits += 2;
  if (capSet.has("lowered-seat") || capSet.has("lowered-seat-gs")) alpineHits += 1;

  return {
    alpineScore: Math.min(10, Math.round((alpineHits / 3) * 10)),
    coastalScore: Math.min(10, Math.round((coastalHits / 2) * 10)),
    urbanScore: Math.min(10, Math.round((urbanHits / 2) * 10)),
  };
}

function sanitizeOperator(operator) {
  const nextOperator = { ...operator };

  for (const [field, fallback] of Object.entries(OPERATOR_FIELD_FALLBACKS)) {
    const current = nextOperator?.[field];
    nextOperator[field] =
      typeof current === "string" && current.trim() ? current.trim() : fallback;
  }

  return nextOperator;
}

export function buildRentalGraph() {
  const operators = Object.fromEntries(
    Object.entries(OPERATORS).map(([operatorId, operatorValue]) => [
      operatorId,
      sanitizeOperator(operatorValue),
    ]),
  );
  const rentals = {};
  const rentalsByAirport = {};
  const rentalsByOperator = {};
  const rentalsByType = {};
  const rentalsByDestination = {};
  const rentalsByDropoff = {};
  const rentalsByOperatorByAirport = {};
  const operatorsByAirport = {};
  const suitabilityScores = {};

  // Initialize operator indexes
  Object.keys(operators).forEach(opId => {
    rentalsByOperator[normalizeOperatorKey(opId)] = [];
  });

  Object.entries(RENTALS).forEach(([rentalKey, rentalValue]) => {
    const fallbackId = normalizeRentalKey(rentalKey);
    const rentalId = normalizeRentalKey(rentalValue?.id) || fallbackId;
    const rentalSlug = normalizeRentalKey(rentalValue?.slug) || rentalId;
    const operatorKey = normalizeOperatorKey(rentalValue?.operator);
    const airportKey = normalizeAirportKey(rentalValue?.airport);

    // Validations
    if (!rentalId) {
      console.warn("Invalid rental skipped: Missing or invalid ID", rentalValue);
      return;
    }

    if (!operatorKey || !operators[operatorKey]) {
      console.warn("Invalid rental skipped: Missing or unknown operator", rentalId);
      return;
    }

    if (!airportKey) {
      console.warn("Invalid rental skipped: Missing or invalid airport", rentalId);
      return;
    }

    if (!rentalValue?.category || typeof rentalValue.category !== "string") {
      console.warn("Invalid rental skipped: Missing or invalid category", rentalId);
      return;
    }

    if (!Array.isArray(rentalValue?.compatible_destinations)) {
      console.warn("Invalid rental skipped: compatible_destinations is not an array", rentalId);
      return;
    }

    const normalizedDestinations = rentalValue.compatible_destinations.map((dest) =>
      normalizeDestinationKey(dest)
    );

    const sanitizedRental = {
      ...rentalValue,
      id: rentalId,
      slug: rentalSlug,
      airportCode: airportKey,
      operatorId: operatorKey,
      bookingMode: rentalValue.booking_mode ?? "request",
      availabilityStatus: rentalValue.availability_status ?? "available",
      insuranceIncluded: rentalValue.insurance_included ?? true,
      compatibleDestinations: normalizedDestinations,
    };

    // Push valid rental into sanitized rentals map
    rentals[rentalId] = sanitizedRental;

    // Index: Airport
    if (!rentalsByAirport[airportKey]) rentalsByAirport[airportKey] = [];
    rentalsByAirport[airportKey].push(rentalId);

    // Index: Operator
    if (!rentalsByOperator[operatorKey]) rentalsByOperator[operatorKey] = [];
    rentalsByOperator[operatorKey].push(rentalId);

    // Index: Operator×Airport compound (O(1) fleet reveal)
    if (!rentalsByOperatorByAirport[airportKey]) rentalsByOperatorByAirport[airportKey] = {};
    if (!rentalsByOperatorByAirport[airportKey][operatorKey]) rentalsByOperatorByAirport[airportKey][operatorKey] = [];
    rentalsByOperatorByAirport[airportKey][operatorKey].push(rentalId);

    // Index: Operators per airport (de-duped at end)
    if (!operatorsByAirport[airportKey]) operatorsByAirport[airportKey] = new Set();
    operatorsByAirport[airportKey].add(operatorKey);

    // Index: Suitability scores per rental
    suitabilityScores[rentalId] = computeSuitabilityScores(
      normalizedDestinations,
      sanitizedRental.capabilities,
    );

    // Index: Category/Type
    const cat = sanitizedRental.category.toLowerCase();
    if (!rentalsByType[cat]) rentalsByType[cat] = [];
    rentalsByType[cat].push(rentalId);

    // Index: Destinations
    sanitizedRental.compatibleDestinations.forEach((dest) => {
      const destSlug = normalizeDestinationKey(dest);
      if (!rentalsByDestination[destSlug]) rentalsByDestination[destSlug] = [];
      rentalsByDestination[destSlug].push(rentalId);
    });

    // Index: One-way dropoff airports (A2A support)
    if (sanitizedRental.one_way_enabled && Array.isArray(sanitizedRental.dropoff_airports)) {
      sanitizedRental.dropoff_airports.forEach((dropCode) => {
        const key = normalizeAirportKey(dropCode);
        if (!key) return;
        if (!rentalsByDropoff[key]) rentalsByDropoff[key] = [];
        rentalsByDropoff[key].push(rentalId);
      });
    }
  });

  // Post-loop: convert operatorsByAirport Sets → Arrays
  const operatorsByAirportFinal = {};
  for (const [apt, opSet] of Object.entries(operatorsByAirport)) {
    operatorsByAirportFinal[apt] = Array.from(opSet);
  }

  // Post-loop: compute cheapest bike per airport (deterministic tie-break)
  const cheapestByAirport = {};
  for (const [apt, ids] of Object.entries(rentalsByAirport)) {
    let cheapest = null;
    for (const id of ids) {
      const r = rentals[id];
      if (!r) continue;
      const price = r.pricing?.pricePerDay ?? r.price_day ?? Infinity;
      const deposit = r.deposit ?? Infinity;
      const isAlpine = (suitabilityScores[id]?.alpineScore ?? 0) >= 5;

      if (!cheapest) {
        cheapest = { rentalId: id, pricePerDay: price, deposit, currency: r.currency || "EUR", bikeName: r.bikeName || `${r.brand || ""} ${r.model || ""}`.trim(), isAlpineReady: isAlpine };
        continue;
      }

      // Deterministic tie-break: price → deposit → lexicographic rentalId
      if (
        price < cheapest.pricePerDay ||
        (price === cheapest.pricePerDay && deposit < cheapest.deposit) ||
        (price === cheapest.pricePerDay && deposit === cheapest.deposit && id < cheapest.rentalId)
      ) {
        cheapest = { rentalId: id, pricePerDay: price, deposit, currency: r.currency || "EUR", bikeName: r.bikeName || `${r.brand || ""} ${r.model || ""}`.trim(), isAlpineReady: isAlpine };
      }
    }
    if (cheapest) {
      // Strip deposit from public contract — internal tie-break only
      const { deposit: _deposit, ...publicCheapest } = cheapest;
      cheapestByAirport[apt] = publicCheapest;
    }
  }

  return {
    operators,
    rentals,
    rentalsByAirport,
    rentalsByOperator,
    rentalsByType,
    rentalsByDestination,
    rentalsByDropoff,
    rentalsByOperatorByAirport,
    operatorsByAirport: operatorsByAirportFinal,
    cheapestByAirport,
    suitabilityScores,
  };
}
