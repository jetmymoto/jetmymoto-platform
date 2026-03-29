// Keyword normalization utilities for intent signal processing.
// Used by: intent harvester, merger, overlay builder, semantic dedup.

const STOPWORDS = new Set([
  "best", "cheap", "cheapest", "top", "most", "popular",
  "good", "great", "amazing", "awesome", "excellent",
  "near", "nearby", "around", "close",
  "rental", "rentals", "rent", "hire",
  "motorcycle", "motorbike", "bike", "scooter",
  "for", "in", "at", "the", "a", "an", "to", "of", "and", "or",
  "with", "from", "on", "by", "is", "are", "was", "were",
]);

// normalizeKeyword: raw keyword → slug-safe form
// "Best BMW R1250GS rental Milan" → "bmw-r1250gs-milan"
export function normalizeKeyword(keyword) {
  return String(keyword || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .join("-");
}

// normalizeKeywordRoot: keyword → semantic root (stopwords removed)
// "Best cheap BMW R1250GS rental near Milan" → "bmw-r1250gs-milan"
// Used for semantic deduplication grouping.
export function normalizeKeywordRoot(keyword) {
  return String(keyword || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .join("-");
}

// classifyIntentType: keyword → intent category for priority hierarchy
// Priority: bike-specific > category > price > generic
export function classifyIntentType(keyword) {
  const lower = String(keyword || "").toLowerCase();

  // Bike-specific: contains brand+model pattern (e.g., "BMW R1250GS", "Ducati Multistrada")
  const bikePatterns = [
    /\b(bmw|ducati|honda|yamaha|kawasaki|ktm|triumph|harley|suzuki|aprilia|moto\s?guzzi|royal\s?enfield)\b.*\b[a-z]?\d{2,}/,
    /\b[a-z]?\d{2,}.*\b(bmw|ducati|honda|yamaha|kawasaki|ktm|triumph|harley|suzuki|aprilia)\b/,
  ];
  if (bikePatterns.some((p) => p.test(lower))) return "bike-specific";

  // Category: contains category term
  const categoryTerms = /\b(adventure|touring|sport|naked|cruiser|enduro|dual[- ]sport|supermoto|cafe[- ]racer|scrambler|trail)\b/;
  if (categoryTerms.test(lower)) return "category";

  // Price: contains price/cost/budget terms
  const priceTerms = /\b(cheap|cheapest|budget|affordable|price|cost|deal|discount|low[- ]cost|economical)\b/;
  if (priceTerms.test(lower)) return "price";

  return "generic";
}
