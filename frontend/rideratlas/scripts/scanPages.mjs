import { GENERATED_RIDE_ROUTES } from "../src/features/routes/data/generatedRideRoutes.js";

console.log("ROUTE PAGES");
console.log();

GENERATED_RIDE_ROUTES.forEach(route => {
  console.log(`/route/${route.slug}`);
});

console.log();
console.log("DESTINATION PAGES");
console.log();

const destinations = new Set();

GENERATED_RIDE_ROUTES.forEach(route => {
  if(route.destination?.slug){
    destinations.add(route.destination.slug);
  }
});

destinations.forEach(d => {
  console.log(`/destination/${d}`);
});
