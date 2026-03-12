import { GENERATED_RIDE_ROUTES } from "./data/generatedRideRoutes.js";

/**
 * @param {Array<T>} items
 * @param {function(T): string} getKey
 * @returns {Map<string, Array<T>>}
 * @template T
 */
function groupBy(items, getKey) {
  return items.reduce((map, item) => {
    const key = getKey(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
    return map;
  }, new Map());
}

export const ROUTES_BY_AIRPORT = groupBy(
  GENERATED_RIDE_ROUTES,
  (route) => route.airport.iata
);

export const ROUTES_BY_COUNTRY = groupBy(
  GENERATED_RIDE_ROUTES,
  (route) => route.airport.country
);
