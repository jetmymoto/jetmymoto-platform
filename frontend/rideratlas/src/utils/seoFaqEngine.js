
/**
 * seoFaqEngine.js
 * Generates context-aware FAQs and FAQPage Schema for RiderAtlas entities.
 * Driven strictly by GRAPH truth, providing high-signal answers for long-tail search queries.
 */

export const getFaqSchema = (faqs) => {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export const getFaqsForRental = (rental, operator, airport) => {
  if (!rental) return [];

  const faqs = [];
  const machineName = `${rental.brand || ""} ${rental.model || rental.bikeName || rental.id}`.trim();
  const location = airport?.city || rental.airportCode || "the hub";

  // Q1: Suitability
  const category = rental.category ? rental.category.toLowerCase() : "";
  let terrainMatch = "mixed road conditions";
  if (category === "adventure") terrainMatch = "alpine passes, mixed terrain, and extended touring";
  if (category === "touring" || category === "sport-touring") terrainMatch = "long-distance highway and sweeping coastal routes";
  if (category === "scrambler") terrainMatch = "urban environments and light unpaved fire roads";
  
  faqs.push({
    question: `Is the ${machineName} suitable for alpine or technical riding?`,
    answer: `Yes, this ${category || "premium"} motorcycle is well-suited for ${terrainMatch}. It provides the necessary performance and handling characteristics for diverse European routes.`
  });

  // Q2: Routes
  const topDestinations = rental.compatibleDestinations || rental.compatible_destinations || [];
  let routeContext = "various regional routes";
  if (topDestinations.length > 0) {
    routeContext = `destinations like ${topDestinations.map(d => d.replace(/-/g, ' ')).join(', ')}`;
  }
  
  faqs.push({
    question: `What routes is the ${machineName} best used for from ${location}?`,
    answer: `Deploying from ${location}, this machine is optimized for ${routeContext}. Its configuration matches the elevation changes and cornering demands of these corridors.`
  });

  // Q3: One-way
  if (rental.one_way_enabled || (rental.dropoff_airports && rental.dropoff_airports.length > 0)) {
    faqs.push({
      question: `Can I rent the ${machineName} in ${location} for a one-way trip?`,
      answer: `Yes, one-way A2A (Airport-to-Airport) logistics are supported for this machine. You can deploy from ${location} and extract at designated partner hubs.`
    });
  } else {
    faqs.push({
      question: `Does the ${machineName} require a round-trip return to ${location}?`,
      answer: `Currently, this specific unit is configured for round-trip deployment and must be returned to the ${location} hub.`
    });
  }

  return faqs.slice(0, 4);
};

export const getFaqsForRoute = (route, originAirport, destination) => {
  if (!route) return [];

  const faqs = [];
  const routeName = route.name || route.title || "this route";
  const origin = originAirport?.city || route.airportCode || "the origin hub";

  // Q1: Difficulty
  const difficulty = route.difficulty || route.roadProfile?.difficulty || route.difficultyLevel || "moderate";
  faqs.push({
    question: `How difficult is the ${routeName} motorcycle route?`,
    answer: `This route is classified as ${difficulty}. Riders should be prepared for the specific technical demands of this corridor, including cornering sequences and elevation profiles.`
  });

  // Q2: Best Bike
  let bikeType = "a reliable touring or adventure motorcycle";
  if (difficulty.toLowerCase().includes("hard") || difficulty.toLowerCase().includes("advanced")) {
    bikeType = "a high-performance adventure or sport-touring motorcycle with excellent braking and cornering clearance";
  }
  faqs.push({
    question: `What type of motorcycle is best for riding ${routeName}?`,
    answer: `We recommend ${bikeType}. The machine should be capable of handling the distance and terrain profile comfortably.`
  });

  // Q3: Best Season
  const bestSeason = route.bestSeason || route.destination?.best_season || "late spring through early autumn";
  faqs.push({
    question: `When is the best season to ride from ${origin} to ${destination?.name || "the destination"}?`,
    answer: `The optimal riding window is typically ${bestSeason}, balancing clear road conditions with favorable weather for motorcycle travel.`
  });

  return faqs.slice(0, 4);
};

export const getFaqsForMission = (mission, insertion, extraction, theater) => {
  if (!mission) return [];

  const faqs = [];
  const insertionName = insertion?.city || mission.insertion_airport || "the origin";
  const extractionName = extraction?.city || mission.extraction_airport || "the destination";
  
  // Q1: One-way feasibility
  faqs.push({
    question: `Can I ride one-way between ${insertionName} and ${extractionName}?`,
    answer: `Yes, this A2A (Airport-to-Airport) mission is specifically designed as a one-way corridor. You can deploy at ${insertionName} and extract at ${extractionName} without backtracking.`
  });

  // Q2: Recommended Bike
  faqs.push({
    question: `What type of motorcycle is recommended for the ${theater?.name || mission.theater} corridor?`,
    answer: `For this multi-day mission through ${theater?.name || mission.theater}, a touring or adventure class motorcycle is highly recommended to handle the distance and varied terrain comfortably.`
  });

  // Q3: Duration
  const days = mission.duration_days || mission.duration || "multiple";
  faqs.push({
    question: `How many days do I need for this motorcycle mission?`,
    answer: `We recommend allocating at least ${days} days to properly experience this corridor, allowing time for technical riding sections, tactical stops, and safe pacing.`
  });

  return faqs.slice(0, 4);
};

export const getFaqsForAirport = (airport, routes, rentals) => {
  if (!airport) return [];

  const faqs = [];
  const locationName = airport.city || airport.name || airport.code;

  // Q1: Routes
  const topRoutes = routes.slice(0, 2).map(r => r.name || r.title).filter(Boolean);
  const routesStr = topRoutes.length > 0 ? ` including ${topRoutes.join(" and ")}` : "";
  faqs.push({
    question: `What motorcycle routes can I ride starting from ${locationName}?`,
    answer: `Deploying from ${airport.code}, riders have direct access to several premium motorcycle corridors${routesStr}. It serves as a primary staging point for regional expeditions.`
  });

  // Q2: Bikes Available
  const rentalCount = rentals.length;
  let bikeTypes = "various touring and adventure motorcycles";
  if (rentalCount > 0) {
    const categories = [...new Set(rentals.map(r => r.category).filter(Boolean))];
    if (categories.length > 0) {
      bikeTypes = `machines including ${categories.join(", ")} classes`;
    }
  }
  faqs.push({
    question: `What types of motorcycles are available to rent at ${airport.code}?`,
    answer: `The local verified fleet at this hub features ${bikeTypes}. All units are strictly maintained and pre-configured for the surrounding terrain.`
  });

  // Q3: Logistics
  faqs.push({
    question: `Can I ship my own motorcycle to ${locationName}?`,
    answer: `Yes, through Moto Airlift logistics, you can ship your personal motorcycle to this hub. The machine will be prepped and staged for immediate deployment upon your arrival.`
  });

  return faqs.slice(0, 4);
};

export const getFaqsForDestination = (destination, routes, airports) => {
  if (!destination) return [];

  const faqs = [];
  const destName = destination.name || destination.slug;

  // Q1: Best Routes
  const topRoutes = routes.slice(0, 2).map(r => r.name || r.title).filter(Boolean);
  const routeExamples = topRoutes.length > 0 ? ` Notable rides include ${topRoutes.join(" and ")}.` : "";
  faqs.push({
    question: `What are the best motorcycle routes in ${destName}?`,
    answer: `The ${destName} region offers a dense concentration of high-quality motorcycle routes featuring ${destination.terrain_type || "dramatic terrain and elevation changes"}.${routeExamples}`
  });

  // Q2: Airports
  const topAirports = airports.slice(0, 2).map(a => a.code).filter(Boolean);
  const airportStr = topAirports.length > 0 ? ` The primary logistics hubs are ${topAirports.join(" and ")}.` : "";
  faqs.push({
    question: `Which airports should I fly into to ride in ${destName}?`,
    answer: `For optimal access to the best riding zones, you should target nearby international hubs with active motorcycle fleets.${airportStr}`
  });

  // Q3: Best Bikes
  faqs.push({
    question: `What motorcycles are best suited for riding in ${destName}?`,
    answer: `Given the ${destination.ride_character || "local terrain profiles"}, adventure and sport-touring motorcycles are highly recommended. They provide the necessary agility for tight sections while maintaining comfort over distance.`
  });

  return faqs.slice(0, 4);
};

export const getFaqsForOperator = (operator, rentals) => {
  if (!operator) return [];

  const faqs = [];
  const operatorName = operator.name || "This verified operator";

  faqs.push({
    question: `Where does ${operatorName} operate motorcycle fleets?`,
    answer: `${operatorName} maintains staged fleets at key logistics hubs, specifically at the following airport codes: ${(operator.airports || []).join(", ")}.`
  });

  faqs.push({
    question: `What kind of motorcycles does ${operatorName} rent?`,
    answer: `Their verified fleet primarily consists of well-maintained adventure, touring, and premium class machines suitable for multi-day expeditions.`
  });

  faqs.push({
    question: `Are the motorcycles from ${operatorName} guaranteed?`,
    answer: `Yes, machines listed through the RiderAtlas network from ${operatorName} are verified for accuracy. You can secure the exact make and model requested for your mission.`
  });

  return faqs.slice(0, 4);
};
