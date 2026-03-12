/**
 * Airport Content Engine
 * 
 * This helper generates supplementary content for airport pages.
 */

/**
 * Generates SEO keywords for an airport.
 * @param {object} airport - The airport data object.
 * @returns {string[]} An array of 5 SEO keywords.
 */
export function generateSEOKeywords(airport) {

  const city = airport?.city || "";
  const region = airport?.region || "";

  return [

    // Motorcycle logistics
    `motorcycle shipping ${city}`,
    `ship motorcycle to ${city}`,
    `motorcycle transport ${city}`,
    `motorcycle air freight ${city}`,

    // Supercar logistics
    `supercar shipping ${city}`,
    `ship supercar to ${city}`,
    `vehicle air freight ${city}`,
    `luxury car shipping ${city}`,

    // Geographic SEO
    `motorcycle shipping ${city} airport`,
    `vehicle logistics ${region}`,
    `international vehicle shipping ${city}`,

    // Premium keywords
    `private vehicle airlift ${city}`,
    `high value vehicle logistics ${city}`

  ];
}

/**
 * Generates example ride routes from an airport.
 * @param {object} airport - The airport data object.
 * @returns {string[]} An array of 2 example ride routes.
 */
export function generateRideRoutes(airport) {
  if (!airport || !airport.city) {
    return [];
  }

  const city = airport.city;

  return [
    `${city} → Alpine Predator Run`,
    `${city} → Coastal Conquest Route`
  ];
}

/**
 * Generates a list of recovery hotels for an airport.
 * @param {object} airport - The airport data object.
 * @returns {object[]} An array of hotel objects.
 */
export function generateRecoveryHotels(airport) {
  if (!airport || !airport.recovery) {
    return [];
  }

  const hotels = [];

  if (airport.recovery.premium) {
    hotels.push({
      type: 'Premium',
      ...airport.recovery.premium
    });
  }

  if (airport.recovery.budget) {
    hotels.push({
      type: 'Budget',
      ...airport.recovery.budget
    });
  }

  hotels.push({
    type: 'Partner',
    name: 'Logistics Partner Hotel',
    location: 'Industrial Zone',
    href: '#',
    features: ['Truck parking', '24/7 access', 'Mission logistics']
  });

  return hotels;
}
