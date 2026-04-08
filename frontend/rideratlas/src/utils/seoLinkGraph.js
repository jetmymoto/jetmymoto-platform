
/**
 * seoLinkGraph.js
 * Graph-driven internal linking utility for RiderAtlas.
 * Provides deterministic related-entity links for SEO and discovery.
 */

const limit = (arr, max) => (arr || []).slice(0, max);

const dedup = (links) => {
  const seen = new Set();
  return links.filter((link) => {
    if (!link.to || seen.has(link.to)) return false;
    seen.add(link.to);
    return true;
  });
};

const noSelf = (links, currentPath) =>
  links.filter((link) => link.to !== currentPath);

/**
 * Rental Page Links
 */
export const getLinksForRentalPage = (rental, graph, currentPath) => {
  if (!rental || !graph) return { sections: [] };

  const sections = [];

  // 1. Operator page
  const operator = graph.operators?.[rental.operatorId];
  if (operator) {
    sections.push({
      key: "operator",
      eyebrow: "Rental Partner",
      title: "Supplied by",
      links: [
        {
          to: `/operators/${rental.operatorId}`,
          label: `Supplied by ${operator.name || rental.operatorId}`,
          meta: operator.city ? `Based in ${operator.city}` : "Verified Operator",
        },
      ],
    });
  }

  // 2. Airport hub page
  const airport = graph.airports?.[rental.airportCode];
  if (airport) {
    sections.push({
      key: "airport",
      eyebrow: "Logistics Hub",
      title: "Fly and ride",
      links: [
        {
          to: `/airport/${airport.code}`,
          label: `Fly and ride from ${airport.name || airport.city || airport.code}`,
          meta: `Convenient pickup at ${airport.code}`,
        },
      ],
    });
  }

  // 3. Compatible destination pages
  const destinationLinks = limit(
    (rental.compatibleDestinations || [])
      .map((slug) => {
        const dest = graph.destinations?.[slug];
        if (!dest) return null;
        return {
          to: `/destination/${slug}`,
          label: `Optimized for ${dest.name || slug}`,
          meta: dest.region || "Riding Theater",
        };
      })
      .filter(Boolean),
    3
  );

  if (destinationLinks.length > 0) {
    sections.push({
      key: "destinations",
      eyebrow: "Adventure Ready",
      title: "Explore these regions",
      links: destinationLinks,
    });
  }

  // 4. Optional route matches
  const routeSlugs = graph.routesByAirport?.[rental.airportCode] || [];
  const routeLinks = limit(
    routeSlugs
      .map((slug) => {
        const route = graph.routes?.[slug];
        if (!route) return null;
        return {
          to: `/route/${slug}`,
          label: `Best routes for this machine: ${route.name || slug}`,
          meta: `${route.distanceKm || route.distance || "?"}km journey`,
        };
      })
      .filter(Boolean),
    3
  );

  if (routeLinks.length > 0) {
    sections.push({
      key: "routes",
      eyebrow: "Route Intelligence",
      title: "Recommended routes",
      links: routeLinks,
    });
  }

  return {
    sections: sections
      .map((s) => ({
        ...s,
        links: noSelf(dedup(s.links), currentPath),
      }))
      .filter((s) => s.links.length > 0),
  };
};

/**
 * A2A Mission Page Links
 */
export const getLinksForMissionPage = (mission, graph, currentPath) => {
  if (!mission || !graph) return { sections: [] };

  const sections = [];

  // 1. Insertion airport
  if (mission.insertion_airport) {
    const airport = graph.airports?.[mission.insertion_airport.toUpperCase()];
    if (airport) {
      sections.push({
        key: "insertion-airport",
        eyebrow: "Mission Start",
        title: "Deployment Hub",
        links: [
          {
            to: `/airport/${airport.code}`,
            label: `Deploy from ${airport.name || airport.city || airport.code}`,
            meta: "Arrival OS active",
          },
        ],
      });
    }
  }

  // 2. Extraction airport
  if (mission.extraction_airport) {
    const airport = graph.airports?.[mission.extraction_airport.toUpperCase()];
    if (airport) {
      sections.push({
        key: "extraction-airport",
        eyebrow: "Mission End",
        title: "Extraction Hub",
        links: [
          {
            to: `/airport/${airport.code}`,
            label: `Extract from ${airport.name || airport.city || airport.code}`,
            meta: "Return logistics enabled",
          },
        ],
      });
    }
  }

  // 3. Riding theater / destination page
  if (mission.theater) {
    const dest = graph.destinations?.[mission.theater.toLowerCase()];
    if (dest) {
      sections.push({
        key: "theater",
        eyebrow: "The Theater",
        title: "Riding Theater Intel",
        links: [
          {
            to: `/destination/${dest.slug}`,
            label: `Explore ${dest.name || dest.slug} intelligence`,
            meta: dest.region || "Operational area",
          },
        ],
      });
    }
  }

  // 4. One-way rental matches
  const rentalIds = graph.rentalsByAirport?.[mission.insertion_airport?.toUpperCase()] || [];
  const oneWayLinks = limit(
    rentalIds
      .map((id) => {
        const rental = graph.rentals?.[id];
        if (!rental || !rental.one_way_enabled) return null;
        // Check if extraction airport is in dropoff_airports
        const canDropOff = (rental.dropoff_airports || []).some(
          (code) => code.toUpperCase() === mission.extraction_airport?.toUpperCase()
        );
        if (!canDropOff) return null;

        return {
          to: `/rentals/${rental.airportCode}/${rental.slug}`,
          label: `${rental.brand || ""} ${rental.model || rental.bikeName || id} for this mission`,
          meta: `One-way enabled to ${mission.extraction_airport}`,
        };
      })
      .filter(Boolean),
    3
  );

  if (oneWayLinks.length > 0) {
    sections.push({
      key: "one-way-rentals",
      eyebrow: "Machine Logistics",
      title: "Compatible One-Way Rentals",
      links: oneWayLinks,
    });
  }

  return {
    sections: sections
      .map((s) => ({
        ...s,
        links: noSelf(dedup(s.links), currentPath),
      }))
      .filter((s) => s.links.length > 0),
  };
};

/**
 * Route Page Links
 */
export const getLinksForRoutePage = (route, graph, currentPath) => {
  if (!route || !graph) return { sections: [] };

  const sections = [];

  // 1. Origin airport
  const airportCode = route.originAirportCode || route.airportCode || route.airport?.code;
  if (airportCode) {
    const airport = graph.airports?.[airportCode.toUpperCase()];
    if (airport) {
      sections.push({
        key: "origin-airport",
        eyebrow: "Deployment",
        title: "Start your journey",
        links: [
          {
            to: `/airport/${airport.code}`,
            label: `Deploy from ${airport.city || airport.name || airport.code}`,
            meta: `Hub logistics for ${airport.code}`,
          },
        ],
      });
    }
  }

  // 2. Destination page
  const destSlug = route.destinationSlug || route.destination?.slug;
  if (destSlug) {
    const dest = graph.destinations?.[destSlug.toLowerCase()];
    if (dest) {
      sections.push({
        key: "destination",
        eyebrow: "Intelligence",
        title: "Theater Intel",
        links: [
          {
            to: `/destination/${dest.slug}`,
            label: `Explore ${dest.name || dest.slug} intel`,
            meta: dest.region || "Operational area",
          },
        ],
      });
    }
  }

  // 3. Mission match block - best 2–3 motorcycles from origin hub
  if (airportCode) {
    const rentalIds = graph.rentalsByAirport?.[airportCode.toUpperCase()] || [];
    const missionLinks = limit(
      rentalIds
        .map((id) => {
          const rental = graph.rentals?.[id];
          if (!rental) return null;
          // Ideally check suitability for route terrain
          return {
            to: `/rentals/${rental.airportCode}/${rental.slug}`,
            label: `${rental.brand || ""} ${rental.model || rental.bikeName || id} for this terrain`,
            meta: `${rental.category || "Adventure"} Class`,
          };
        })
        .filter(Boolean),
      3
    );

    if (missionLinks.length > 0) {
      sections.push({
        key: "mission-matches",
        eyebrow: "Tactical Machines",
        title: "Best bikes for this route",
        links: missionLinks,
      });
    }
  }

  // 4. Relevant POIs along the route
  const routePois = limit(
    (graph.poisByDestination?.[destSlug?.toLowerCase()] || [])
      .map((slug) => {
        const poi = graph.pois?.[slug];
        if (!poi) return null;
        return {
          to: `/poi/${slug}`,
          label: poi.name || slug,
          meta: poi.category || "Point of Interest",
        };
      })
      .filter(Boolean),
    10
  );

  if (routePois.length > 0) {
    sections.push({
      key: "pois",
      eyebrow: "Waypoints",
      title: "Points of interest",
      links: routePois,
    });
  }

  return {
    sections: sections
      .map((s) => ({
        ...s,
        links: noSelf(dedup(s.links), currentPath),
      }))
      .filter((s) => s.links.length > 0),
  };
};

/**
 * Operator Page Links
 */
export const getLinksForOperatorPage = (operator, graph, currentPath) => {
  if (!operator || !graph) return { sections: [] };

  const sections = [];

  // 1. Their rental fleet
  const operatorId = operator.id || operator.slug;
  const rentalIds = graph.rentalsByOperator?.[operatorId] || [];
  const fleetLinks = limit(
    rentalIds
      .map((id) => {
        const rental = graph.rentals?.[id];
        if (!rental) return null;
        return {
          to: `/rentals/${rental.airportCode}/${rental.slug}`,
          label: `${rental.brand || ""} ${rental.model || rental.bikeName || id}`,
          meta: `${rental.airportCode} fleet`,
        };
      })
      .filter(Boolean),
    6
  );

  if (fleetLinks.length > 0) {
    sections.push({
      key: "fleet",
      eyebrow: "Fleet Inventory",
      title: "Our Machines",
      links: fleetLinks,
    });
  }

  // 2. Serviced airports
  const airports = operator.airports || [];
  const airportLinks = limit(
    airports
      .map((code) => {
        const airport = graph.airports?.[code.toUpperCase()];
        if (!airport) return null;
        return {
          to: `/airport/${airport.code}`,
          label: `${airport.city || airport.name || airport.code} Hub`,
          meta: "Verified Service Area",
        };
      })
      .filter(Boolean),
    4
  );

  if (airportLinks.length > 0) {
    sections.push({
      key: "airports",
      eyebrow: "Service Network",
      title: "Active Hubs",
      links: airportLinks,
    });
  }

  // 3. Optional nearby route pages
  const nearbyRouteSlugs = [];
  airports.forEach((code) => {
    const slugs = graph.routesByAirport?.[code.toUpperCase()] || [];
    nearbyRouteSlugs.push(...slugs);
  });

  const routeLinks = limit(
    dedup(
      nearbyRouteSlugs
        .map((slug) => {
          const route = graph.routes?.[slug];
          if (!route) return null;
          return {
            to: `/route/${slug}`,
            label: route.name || slug,
            meta: `Deploy from ${route.airportCode}`,
          };
        })
        .filter(Boolean)
    ),
    3
  );

  if (routeLinks.length > 0) {
    sections.push({
      key: "routes",
      eyebrow: "Adventure Access",
      title: "Routes from our hubs",
      links: routeLinks,
    });
  }

  return {
    sections: sections
      .map((s) => ({
        ...s,
        links: noSelf(dedup(s.links), currentPath),
      }))
      .filter((s) => s.links.length > 0),
  };
};

/**
 * Airport Hub Page Links
 */
export const getLinksForAirportPage = (airport, graph, currentPath) => {
  if (!airport || !graph) return { sections: [] };

  const sections = [];

  // 1. Active expedition routes
  const routeSlugs = graph.routesByAirport?.[airport.code] || [];
  const routeLinks = limit(
    routeSlugs
      .map((slug) => {
        const route = graph.routes?.[slug];
        if (!route) return null;
        return {
          to: `/route/${slug}`,
          label: route.name || slug,
          meta: `${route.distanceKm || route.distance || "?"}km route`,
        };
      })
      .filter(Boolean),
    3
  );

  if (routeLinks.length > 0) {
    sections.push({
      key: "routes",
      eyebrow: "Expedition Intel",
      title: "Active Routes",
      links: routeLinks,
    });
  }

  // 2. Tactical riding destinations accessible from this hub
  const destinationSlugs = dedup(
    routeSlugs
      .map((slug) => graph.routes?.[slug]?.destination?.slug)
      .filter(Boolean)
  );

  const destinationLinks = limit(
    destinationSlugs
      .map((slug) => {
        const dest = graph.destinations?.[slug];
        if (!dest) return null;
        return {
          to: `/destination/${slug}`,
          label: dest.name || slug,
          meta: dest.region || "Riding Theater",
        };
      })
      .filter(Boolean),
    3
  );

  if (destinationLinks.length > 0) {
    sections.push({
      key: "destinations",
      eyebrow: "Theater Access",
      title: "Riding Destinations",
      links: destinationLinks,
    });
  }

  // 3. Local rental showroom
  const rentalIds = graph.rentalsByAirport?.[airport.code] || [];
  const rentalLinks = limit(
    rentalIds
      .map((id) => {
        const rental = graph.rentals?.[id];
        if (!rental) return null;
        return {
          to: `/rentals/${rental.airportCode}/${rental.slug}`,
          label: `${rental.brand || ""} ${rental.model || rental.bikeName || id}`,
          meta: `${rental.category || "Adventure"} Class`,
        };
      })
      .filter(Boolean),
    6
  );

  if (rentalLinks.length > 0) {
    sections.push({
      key: "rentals",
      eyebrow: "Machine Pool",
      title: "Local Showroom",
      links: rentalLinks,
    });
  }

  return {
    sections: sections
      .map((s) => ({
        ...s,
        links: noSelf(dedup(s.links), currentPath),
      }))
      .filter((s) => s.links.length > 0),
  };
};

/**
 * Destination Page Links
 */
export const getLinksForDestinationPage = (destination, graph, currentPath) => {
  if (!destination || !graph) return { sections: [] };

  const sections = [];

  // 1. Available routes in the region
  const routeSlugs = graph.routesByDestination?.[destination.slug] || [];
  const routeLinks = limit(
    routeSlugs
      .map((slug) => {
        const route = graph.routes?.[slug];
        if (!route) return null;
        return {
          to: `/route/${slug}`,
          label: route.name || slug,
          meta: `Deploy from ${route.airportCode}`,
        };
      })
      .filter(Boolean),
    4
  );

  if (routeLinks.length > 0) {
    sections.push({
      key: "routes",
      eyebrow: "Regional Intel",
      title: "Available Routes",
      links: routeLinks,
    });
  }

  // 2. Servicing airports
  const airportCodes = dedup(
    routeSlugs
      .map((slug) => graph.routes?.[slug]?.airportCode)
      .filter(Boolean)
  );

  const airportLinks = limit(
    airportCodes
      .map((code) => {
        const airport = graph.airports?.[code.toUpperCase()];
        if (!airport) return null;
        return {
          to: `/airport/${airport.code}`,
          label: `${airport.city || airport.name || airport.code} Hub`,
          meta: "Primary Gateway",
        };
      })
      .filter(Boolean),
    3
  );

  if (airportLinks.length > 0) {
    sections.push({
      key: "airports",
      eyebrow: "Gateways",
      title: "Servicing Airports",
      links: airportLinks,
    });
  }

  // 3. Best bikes for the region
  const rentalIds = graph.rentalsByDestination?.[destination.slug] || [];
  const rentalLinks = limit(
    rentalIds
      .map((id) => {
        const rental = graph.rentals?.[id];
        if (!rental) return null;
        return {
          to: `/rentals/${rental.airportCode}/${rental.slug}`,
          label: `${rental.brand || ""} ${rental.model || rental.bikeName || id}`,
          meta: `${rental.category || "Adventure"} Class`,
        };
      })
      .filter(Boolean),
    3
  );

  if (rentalLinks.length > 0) {
    sections.push({
      key: "rentals",
      eyebrow: "Tactical Machines",
      title: "Best bikes for the region",
      links: rentalLinks,
    });
  }

  return {
    sections: sections
      .map((s) => ({
        ...s,
        links: noSelf(dedup(s.links), currentPath),
      }))
      .filter((s) => s.links.length > 0),
  };
};
