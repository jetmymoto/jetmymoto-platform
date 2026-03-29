// Intent → rental matching logic (🔴4)
// Explicit matching rules per intent type:
//   bike-specific: match by brand + model substring
//   category:      match by category label
//   price:         match cheapest available rental
//   generic:       match by compatibleDestinations overlap

import { classifyIntentType } from "./keywordUtils.js";

// Match a single intent signal against available rentals at the same airport.
// Returns array of { rentalSlug, matchScore, matchReason } sorted by matchScore desc.
export function matchIntentToRentals(intent, graph) {
  const airportCode = String(intent.airportCode || "").toUpperCase();
  const rentalSlugs = graph.indexes?.rentalsByAirport?.[airportCode]
    || graph.rentalsByAirport?.[airportCode]
    || [];

  if (rentalSlugs.length === 0) return [];

  const intentType = classifyIntentType(intent.keyword);
  const matches = [];

  for (const slug of rentalSlugs) {
    const rental = graph.rentals?.[slug];
    if (!rental) continue;

    const result = scoreMatch(intentType, intent, rental);
    if (result.score > 0) {
      matches.push({
        rentalSlug: slug,
        matchScore: result.score,
        matchReason: result.reason,
      });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

function scoreMatch(intentType, intent, rental) {
  switch (intentType) {
    case "bike-specific":
      return scoreBikeSpecific(intent, rental);
    case "category":
      return scoreCategoryMatch(intent, rental);
    case "price":
      return scorePriceMatch(intent, rental);
    default:
      return scoreGenericMatch(intent, rental);
  }
}

// Bike-specific: brand + model must match
function scoreBikeSpecific(intent, rental) {
  const keyword = String(intent.keyword || "").toLowerCase();
  const brand = String(rental.brand || rental.brandName || "").toLowerCase();
  const model = String(rental.model || rental.modelName || "").toLowerCase();

  if (!brand || !model) return { score: 0, reason: null };

  const brandMatch = keyword.includes(brand);
  const modelTokens = model.split(/[\s-]+/).filter(Boolean);
  const modelMatch = modelTokens.some((token) => token.length >= 3 && keyword.includes(token));

  if (brandMatch && modelMatch) return { score: 1.0, reason: `brand+model: ${brand} ${model}` };
  if (brandMatch) return { score: 0.4, reason: `brand-only: ${brand}` };
  return { score: 0, reason: null };
}

// Category: match by category label in keyword
function scoreCategoryMatch(intent, rental) {
  const keyword = String(intent.keyword || "").toLowerCase();
  const category = String(rental.category || "").toLowerCase();

  if (!category) return { score: 0, reason: null };
  if (keyword.includes(category)) return { score: 0.8, reason: `category: ${category}` };

  // Fuzzy: "dual sport" vs "dual-sport"
  const normalized = category.replace(/-/g, " ");
  if (keyword.includes(normalized)) return { score: 0.7, reason: `category-fuzzy: ${category}` };

  return { score: 0, reason: null };
}

// Price: cheapest rental wins
function scorePriceMatch(intent, rental) {
  const price = rental.pricing?.pricePerDay || rental.price_day;
  if (!price || price <= 0) return { score: 0, reason: null };

  // Inverse price score: cheaper → higher score (100/price capped at 1.0)
  const score = Math.min(1.0, 100 / price);
  return { score, reason: `price: €${price}/day` };
}

// Generic: compatibleDestinations overlap with airport routes
function scoreGenericMatch(intent, rental) {
  const destinations = rental.compatibleDestinations || rental.compatible_destinations || [];
  if (destinations.length === 0) return { score: 0.1, reason: "generic-fallback" };
  return { score: 0.3, reason: `destinations: ${destinations.length}` };
}
