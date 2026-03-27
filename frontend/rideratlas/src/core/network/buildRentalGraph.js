import { OPERATORS } from "../../features/rentals/data/operators";
import { RENTALS } from "../../features/rentals/data/rentals";

const normalizeAirportKey = (value) => String(value || "").trim().toUpperCase();
const normalizeOperatorKey = (value) => String(value || "").trim();
const normalizeDestinationKey = (value) => String(value || "").trim().toLowerCase();
const normalizeRentalKey = (value) => String(value || "").trim();

export function buildRentalGraph() {
  const operators = { ...OPERATORS };
  const rentals = {};
  const rentalsByAirport = {};
  const rentalsByOperator = {};
  const rentalsByType = {};
  const rentalsByDestination = {};

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
  });

  return {
    operators,
    rentals,
    rentalsByAirport,
    rentalsByOperator,
    rentalsByType,
    rentalsByDestination
  };
}
