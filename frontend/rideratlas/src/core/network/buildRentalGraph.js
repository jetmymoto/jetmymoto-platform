import { OPERATORS } from "../../features/rentals/data/operators";
import { RENTALS } from "../../features/rentals/data/rentals";

export function buildRentalGraph() {
  const operators = { ...OPERATORS };
  const rentals = {};
  const rentalsByAirport = {};
  const rentalsByOperator = {};
  const rentalsByType = {};
  const rentalsByDestination = {};

  // Initialize operator indexes
  Object.keys(operators).forEach(opId => {
    rentalsByOperator[opId] = [];
  });

  Object.values(RENTALS).forEach(rental => {
    // Validations
    if (!rental.id || typeof rental.id !== "string") {
      console.warn("Invalid rental skipped: Missing or invalid ID", rental);
      return;
    }

    if (!rental.operator || !operators[rental.operator]) {
      console.warn("Invalid rental skipped: Missing or unknown operator", rental.id);
      return;
    }

    if (!rental.airport || typeof rental.airport !== "string") {
      console.warn("Invalid rental skipped: Missing or invalid airport", rental.id);
      return;
    }

    if (!rental.category || typeof rental.category !== "string") {
      console.warn("Invalid rental skipped: Missing or invalid category", rental.id);
      return;
    }

    if (!Array.isArray(rental.compatible_destinations)) {
      console.warn("Invalid rental skipped: compatible_destinations is not an array", rental.id);
      return;
    }

    // Push valid rental into sanitized rentals map
    rentals[rental.id] = rental;

    // Index: Airport
    const airport = rental.airport.toUpperCase();
    if (!rentalsByAirport[airport]) rentalsByAirport[airport] = [];
    rentalsByAirport[airport].push(rental.id);

    // Index: Operator
    if (!rentalsByOperator[rental.operator]) rentalsByOperator[rental.operator] = [];
    rentalsByOperator[rental.operator].push(rental.id);

    // Index: Category/Type
    const cat = rental.category.toLowerCase();
    if (!rentalsByType[cat]) rentalsByType[cat] = [];
    rentalsByType[cat].push(rental.id);

    // Index: Destinations
    rental.compatible_destinations.forEach(dest => {
      const destSlug = dest.toLowerCase();
      if (!rentalsByDestination[destSlug]) rentalsByDestination[destSlug] = [];
      rentalsByDestination[destSlug].push(rental.id);
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
