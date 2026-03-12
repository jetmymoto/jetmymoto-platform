import { AIRPORT_INDEX } from "./airportIndex";

export const AIRPORT_SLUG_INDEX = Object.values(AIRPORT_INDEX).reduce((acc, airport) => {
  acc[airport.slug] = airport;
  return acc;
}, {});
