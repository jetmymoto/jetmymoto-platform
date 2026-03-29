// ── Terrain compatibility ──
const TERRAIN_COMPAT = {
  adventure:       { alpine: 1.0, mountain: 0.9, coastal: 0.7, desert: 0.8, forest: 0.8, urban: 0.5, plains: 0.6 },
  touring:         { alpine: 0.7, mountain: 0.6, coastal: 0.9, desert: 0.6, forest: 0.7, urban: 0.8, plains: 0.9 },
  "sport-touring": { alpine: 0.8, mountain: 0.7, coastal: 0.9, desert: 0.5, forest: 0.7, urban: 0.9, plains: 0.9 },
  cruiser:         { alpine: 0.3, mountain: 0.3, coastal: 0.9, desert: 0.7, forest: 0.5, urban: 0.8, plains: 0.9 },
  classic:         { alpine: 0.4, mountain: 0.4, coastal: 0.8, desert: 0.5, forest: 0.5, urban: 0.9, plains: 0.8 },
  scrambler:       { alpine: 0.7, mountain: 0.8, coastal: 0.6, desert: 0.9, forest: 0.9, urban: 0.6, plains: 0.7 },
};

const DESTINATION_TERRAIN = {
  alps: "alpine", dolomites: "alpine", "stelvio-pass": "alpine", "swiss-alps": "alpine",
  "scottish-highlands": "mountain", "pyrenees": "mountain", "atlas-mountains": "mountain",
  "pacific-coast-highway": "coastal", "amalfi-coast": "coastal", "costa-brava": "coastal",
  "sardinia": "coastal", "corsica": "coastal", "crete-ferry": "coastal",
  "joshua-tree": "desert", "sahara": "desert", "outback": "desert",
  "black-forest": "forest", "bavarian-alps": "alpine", "lake-como": "coastal",
  "malibu": "coastal", "tuscany": "plains", "andalusia": "plains",
};

const DEFAULT_TERRAIN = "plains";

// ── Hard eligibility gates (must ALL pass before scoring) ──

export function checkEligibility(candidate, graph) {
  const errors = [];

  const airport = graph.airports?.[candidate.airportCode];
  if (!airport) {
    errors.push(`Airport ${candidate.airportCode} not found in graph`);
  }

  const rental = graph.rentals?.[candidate.rentalSlug];
  if (!rental) {
    errors.push(`Rental ${candidate.rentalSlug} not found in graph`);
  }

  if (rental) {
    const status = rental.availabilityStatus || rental.availability_status;
    if (status && status !== "available" && status !== "limited") {
      errors.push(`Rental not bookable: status=${status}`);
    }

    const price = rental.pricing?.pricePerDay ?? rental.price_day;
    if (typeof price !== "number" || price <= 0) {
      errors.push("Rental has no usable pricing");
    }

    const hasImage = Boolean(
      rental.posterUrl || rental.imageUrl || rental.videoUrl
    );
    if (!hasImage) {
      errors.push("Rental has no usable hero image");
    }
  }

  if (airport) {
    const routeCount = (graph.indexes?.routesByAirport?.[candidate.airportCode] ||
      graph.routesByAirport?.[candidate.airportCode] || []).length;
    if (routeCount === 0) {
      errors.push(`Airport ${candidate.airportCode} has 0 routes`);
    }
  }

  return { eligible: errors.length === 0, errors };
}

// ── Individual scorers ──

export function scoreAirport(airportCode, graph) {
  const reasons = [];
  const routes = graph.indexes?.routesByAirport?.[airportCode] ||
    graph.routesByAirport?.[airportCode] || [];
  const rentals = graph.indexes?.rentalsByAirport?.[airportCode] ||
    graph.rentalsByAirport?.[airportCode] || [];
  const airport = graph.airports?.[airportCode];

  const routeScore = Math.min(routes.length / 8, 1.0);
  const rentalScore = Math.min(rentals.length / 15, 1.0);

  const destinationSet = new Set();
  routes.forEach((slug) => {
    const route = graph.routes?.[slug];
    const dest = route?.destination?.slug || route?.destination;
    if (dest) destinationSet.add(dest);
  });
  const destScore = Math.min(destinationSet.size / 5, 1.0);

  const operatorSet = new Set();
  rentals.forEach((id) => {
    const r = graph.rentals?.[id];
    const op = r?.operatorId || r?.operator;
    if (op) operatorSet.add(op);
  });
  const opScore = Math.min(operatorSet.size / 3, 1.0);

  const score = routeScore * 0.35 + rentalScore * 0.30 + destScore * 0.20 + opScore * 0.15;

  if (routeScore >= 0.8) reasons.push("Strong route density");
  if (rentalScore >= 0.8) reasons.push("Deep rental inventory");
  if (destScore >= 0.8) reasons.push("Multi-destination reach");
  if (airport?.continent === "europe") reasons.push("European hub premium");

  return { score: Math.min(score, 1.0), reasons };
}

export function scoreRental(rentalSlug, graph) {
  const reasons = [];
  const rental = graph.rentals?.[rentalSlug];
  if (!rental) return { score: 0, reasons: ["Rental not found"] };

  let total = 0;
  const weights = { pricing: 0.25, operator: 0.20, bookable: 0.20, image: 0.15, category: 0.10, destinations: 0.10 };

  const price = rental.pricing?.pricePerDay ?? rental.price_day;
  if (typeof price === "number" && price > 0) {
    total += weights.pricing;
    reasons.push("Pricing present");
  }

  const op = rental.operatorId || rental.operator;
  if (op && graph.operators?.[op]) {
    total += weights.operator;
    reasons.push("Verified operator");
  }

  const status = rental.availabilityStatus || rental.availability_status || "available";
  if (status === "available") {
    total += weights.bookable;
    reasons.push("Bookable");
  } else if (status === "limited") {
    total += weights.bookable * 0.6;
  }

  if (rental.posterUrl || rental.imageUrl) {
    total += weights.image;
    reasons.push("Has image");
  }

  if (rental.category) {
    total += weights.category;
  }

  const dests = rental.compatibleDestinations || rental.compatible_destinations || [];
  if (dests.length > 0) {
    total += weights.destinations;
    reasons.push(`${dests.length} compatible destinations`);
  }

  if (rental.videoUrl) {
    total = Math.min(total + 0.05, 1.0);
    reasons.push("Video bonus");
  }

  return { score: Math.min(total, 1.0), reasons };
}

export function scoreContentDepth(overlay) {
  const reasons = [];
  let total = 0;

  if (overlay.content?.intro) { total += 0.25; reasons.push("Has intro"); }
  if (overlay.content?.whyThisBike?.length > 0) { total += 0.25; reasons.push("Has bike reasons"); }
  if (overlay.content?.whyThisAirport?.length > 0) { total += 0.25; reasons.push("Has airport reasons"); }
  if (overlay.content?.faq?.length >= 2) { total += 0.25; reasons.push(`${overlay.content.faq.length} FAQ entries`); }

  return { score: Math.min(total, 1.0), reasons };
}

export function scoreUniqueness(overlay, existingOverlays) {
  const reasons = [];
  const category = overlay._rentalCategory || "";
  const airportCode = overlay.sourceRefs?.airportCode || "";

  let sameAirportSameCategory = 0;
  for (const existing of existingOverlays) {
    if (
      existing.sourceRefs?.airportCode === airportCode &&
      existing._rentalCategory === category &&
      existing.id !== overlay.id
    ) {
      sameAirportSameCategory++;
    }
  }

  if (sameAirportSameCategory === 0) {
    reasons.push("Unique category at this airport");
    return { score: 1.0, reasons };
  }

  if (sameAirportSameCategory <= 2) {
    reasons.push(`${sameAirportSameCategory} similar at same airport`);
    return { score: 0.6, reasons };
  }

  reasons.push(`${sameAirportSameCategory} duplicates — heavily penalized`);
  return { score: 0.2, reasons };
}

export function scoreCompatibility(rental, destinationSlugs) {
  const category = String(rental?.category || "").toLowerCase();
  const compatMap = TERRAIN_COMPAT[category] || TERRAIN_COMPAT.touring;
  const reasons = [];

  if (destinationSlugs.length === 0) {
    return { score: 0.5, reasons: ["No destinations to score against"] };
  }

  let best = 0;
  for (const slug of destinationSlugs) {
    const terrain = DESTINATION_TERRAIN[slug] || DEFAULT_TERRAIN;
    const fit = compatMap[terrain] ?? 0.5;
    if (fit > best) best = fit;
  }

  if (best >= 0.8) reasons.push("Strong terrain match");
  else if (best >= 0.5) reasons.push("Moderate terrain match");
  else reasons.push("Weak terrain match");

  return { score: best, reasons };
}

// ── Composite scoring ──

export const PUBLISH_THRESHOLD = 0.45;
export const MAX_PER_CATEGORY_PER_AIRPORT = 3;
export const MAX_TOTAL_PER_AIRPORT = 12;

export function computeCompositeScore(factors) {
  return (
    factors.airport * 0.25 +
    factors.rental * 0.20 +
    factors.compatibility * 0.20 +
    factors.content * 0.20 +
    factors.uniqueness * 0.15
  );
}
