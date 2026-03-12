import { AIRPORT_INDEX } from "../network/airportIndex";

export const getNearbyAirports = (airportCode, limit = 4) => {
  const current = AIRPORT_INDEX[airportCode];

  if (!current) return [];

  const airports = Object.values(AIRPORT_INDEX);

  return airports
    .filter(a => a.code !== airportCode)
    .filter(a => a.country === current.country)
    .slice(0, limit);
};
