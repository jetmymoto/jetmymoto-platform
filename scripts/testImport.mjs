import { RENTALS } from '../frontend/rideratlas/src/features/rentals/data/rentals.js';
import { AIRPORT_INDEX } from '../frontend/rideratlas/src/features/airport/network/airportIndex.js';
import { GENERATED_RIDE_ROUTES } from '../frontend/rideratlas/src/features/routes/data/generatedRideRoutes.js';
import { RIDE_DESTINATIONS } from '../frontend/rideratlas/src/features/routes/data/rideDestinations.js';

console.log(Object.keys(RENTALS).length);
console.log(Object.keys(AIRPORT_INDEX).length);
console.log(Object.keys(GENERATED_RIDE_ROUTES).length);
console.log(Object.keys(RIDE_DESTINATIONS).length);
