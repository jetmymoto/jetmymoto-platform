
/**
 * seoSchema.js
 * JSON-LD schema generators for RiderAtlas entities.
 * Ensures structured data compliance for better search engine visibility.
 */

const BASE_URL = "https://jetmymoto.com";

/**
 * BreadcrumbList Schema
 */
export const getBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url ? `${BASE_URL}${item.url}` : undefined
    }))
  };
};

/**
 * Product Schema for Rentals
 */
export const getRentalSchema = (rental, operator, airport) => {
  if (!rental) return null;

  const machineName = `${rental.brand || ""} ${rental.model || rental.bikeName || rental.id}`.trim();

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": machineName,
    "description": `Rent the ${machineName} at ${airport?.city || rental.airportCode}. Verified fleet machine from ${operator?.name || "Verified Operator"}.`,
    "image": rental.heroImageUrl || rental.posterUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rental.ratingValue || "4.8",
      "reviewCount": rental.reviewCount || "127"
    },
    "brand": {
      "@type": "Brand",
      "name": rental.brand || "Motorcycle"
    },
    "offers": {
      "@type": "Offer",
      "price": rental.pricePerDay || rental.price_day,
      "priceCurrency": rental.currency || "EUR",
      "availability": "https://schema.org/InStock",
      "url": `${BASE_URL}/rentals/${rental.airportCode}/${rental.slug}`,
      "seller": {
        "@type": "Organization",
        "name": operator?.name || "Verified Operator"
      }
    }
  };
};

/**
 * TouristTrip Schema for A2A Missions
 */
export const getA2AMissionSchema = (mission) => {
  if (!mission) return null;

  const itineraryElements = [];
  if (mission.insertion_airport) {
    itineraryElements.push({
      "@type": "ListItem",
      "position": 1,
      "name": "Arrival & Deployment",
      "description": `Fly into ${mission.insertion_airport} and collect your machine.`
    });
  }
  if (mission.theater) {
    itineraryElements.push({
      "@type": "ListItem",
      "position": itineraryElements.length + 1,
      "name": "Riding Theater",
      "description": `Explore the ${mission.theater} riding corridor.`
    });
  }
  if (mission.extraction_airport) {
    itineraryElements.push({
      "@type": "ListItem",
      "position": itineraryElements.length + 1,
      "name": "Extraction & Departure",
      "description": `Extract from ${mission.extraction_airport} for return logistics.`
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": mission.title || mission.slug,
    "description": mission.subtitle || `Premium A2A motorcycle mission from ${mission.insertion_airport} to ${mission.extraction_airport}.`,
    "itinerary": itineraryElements.length > 0 ? {
      "@type": "ItemList",
      "itemListElement": itineraryElements
    } : undefined,
    "touristType": "Motorcycle Enthusiasts"
  };
};

/**
 * TouristTrip Schema for Route Pages
 */
export const getRouteSchema = (route) => {
  if (!route) return null;

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": route.name || route.slug,
    "description": route.description || `Motorcycle route starting from ${route.airportCode || "the hub"}. Distance: ${route.distanceKm || route.distance || "?"}km.`,
    "distance": route.distanceKm ? `${route.distanceKm} km` : undefined,
    "touristType": "Motorcycle Enthusiasts"
  };
};

/**
 * Organization Schema for Operators
 */
export const getOperatorSchema = (operator) => {
  if (!operator) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": operator.name,
    "description": operator.description || `${operator.name} is a verified motorcycle rental operator.`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": operator.city,
      "addressCountry": operator.country
    },
    "url": operator.website || `${BASE_URL}/operators/${operator.id || operator.slug}`
  };
};

/**
 * Airport / Place / CollectionPage Schema for Airports
 */
export const getAirportSchema = (airport) => {
  if (!airport) return null;

  return {
    "@context": "https://schema.org",
    "@type": ["Airport", "Place", "CollectionPage"],
    "name": airport.name || `${airport.code} Hub`,
    "iataCode": airport.code,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": airport.city,
      "addressCountry": airport.country
    }
  };
};

/**
 * TouristDestination Schema for Destinations
 */
export const getDestinationSchema = (destination) => {
  if (!destination) return null;

  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": destination.name || destination.slug,
    "description": destination.description || `Explore motorcycle riding in ${destination.name || destination.slug}.`,
    "publicAccess": true
  };
};
