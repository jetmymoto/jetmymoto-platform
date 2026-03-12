import { haversineDistance } from "./geoDistance";
import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";
import { RIDE_DESTINATIONS } from "@/features/routes/data/rideDestinations";

export function buildNetworkGraph() {

  const airports = Object.values(AIRPORT_INDEX);

  const routes = [];
  const edges = [];

  RIDE_DESTINATIONS.forEach(region => {

    if (!region.coords) return;

    const airportDistances = airports.map(airport => {

      if (!airport.coords) return null;

      const distance = haversineDistance(
        airport.coords,
        region.coords
      );

      return {
        airport,
        distance
      };

    }).filter(Boolean);

    // sort by distance
    airportDistances.sort((a, b) => a.distance - b.distance);

    // take nearest airports
    const nearest = airportDistances.slice(0, 6);

    nearest.forEach(({ airport, distance }) => {

      const slug = `${airport.slug}-to-${region.slug}`;

      routes.push({
        slug,
        distance: Math.round(distance),
        airport: {
          code: airport.code,
          city: airport.city,
          slug: airport.slug
        },
        destination: {
          slug: region.slug,
          name: region.name
        }
      });

      edges.push({
        from: airport.code,
        to: region.slug,
        type: "route"
      });

    });

  });

  return {
    airports,
    routes,
    edges
  };
}