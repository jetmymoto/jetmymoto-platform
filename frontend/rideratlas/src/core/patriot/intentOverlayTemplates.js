// Intent overlay templates — content builders for overlayType "intent-airport".
// Unlike airport-rental templates, these aggregate across multiple rentals per keyword.

import { normalizeKeyword, classifyIntentType } from "./keywordUtils.js";
import { buildOverlayPath } from "./overlayTemplates.js";

// ── ID & Path (🔴2: hash-based ID, slug from normalizeKeyword) ──

export function buildIntentOverlayId({ airportCode, keyword }) {
  const code = String(airportCode).toUpperCase();
  const hash = simpleHash(`${code}::${keyword}`);
  return `intent-${code.toLowerCase()}-${hash}`;
}

export function buildIntentOverlaySlug({ airportCode, keyword }) {
  const code = String(airportCode).toLowerCase();
  const kwSlug = normalizeKeyword(keyword);
  return `${code}-${kwSlug}`;
}

export function buildIntentCanonicalPath({ airportCode, keyword }) {
  const slug = buildIntentOverlaySlug({ airportCode, keyword });
  return buildOverlayPath({ airportCode, slug });
}

// ── Simple deterministic hash (no crypto dependency) ──
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit int
  }
  return Math.abs(hash).toString(36).slice(0, 8);
}

// ── Headline / Subheadline ──

function titleize(str) {
  return String(str || "")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function buildIntentHeadline({ keyword, airport }) {
  const city = airport?.city || airport?.name || "";
  const intentType = classifyIntentType(keyword);

  if (intentType === "bike-specific") {
    return limitLength(`${titleize(keyword)} at ${city}`, 80);
  }
  if (intentType === "category") {
    return limitLength(`${titleize(keyword)} Near ${city} Airport`, 80);
  }
  if (intentType === "price") {
    return limitLength(`Affordable Motorcycle Rental at ${city}`, 80);
  }
  return limitLength(`Motorcycle Rental Options at ${city}`, 80);
}

export function buildIntentSubheadline({ keyword, matchedRentals }) {
  const count = matchedRentals?.length || 0;
  if (count === 0) return "Discover available motorcycles for your ride.";
  return `${count} motorcycle${count > 1 ? "s" : ""} matching "${keyword}" available now.`;
}

function limitLength(str, max) {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

// ── SEO ──

export function buildIntentSeoTitle({ keyword, airport }) {
  const city = airport?.city || "";
  return limitLength(`${titleize(keyword)} | ${city} Airport | JetMyMoto`, 60);
}

export function buildIntentSeoDescription({ keyword, airport, matchedRentals }) {
  const city = airport?.city || "";
  const count = matchedRentals?.length || 0;
  return limitLength(
    `Find ${keyword} at ${city} airport. ${count} motorcycles available for pickup. Compare prices and reserve online with JetMyMoto.`,
    155
  );
}

// ── Content blocks ──

export function buildIntentIntro({ keyword, airport, matchedRentals }) {
  const city = airport?.city || "this airport";
  const count = matchedRentals?.length || 0;
  return `Looking for ${keyword} near ${city}? We have ${count} motorcycle${count > 1 ? "s" : ""} available for airport pickup. Compare options, check pricing, and reserve your ride before you land.`;
}

export function buildIntentMatchedBikes({ matchedRentals, graph }) {
  return (matchedRentals || []).slice(0, 5).map((match) => {
    const rental = graph.rentals?.[match.rentalSlug];
    if (!rental) return null;
    const brand = rental.brand || rental.brandName || "";
    const model = rental.model || rental.modelName || "";
    const price = rental.pricing?.pricePerDay || rental.price_day;
    const category = rental.category || "";
    return {
      rentalSlug: match.rentalSlug,
      title: `${brand} ${model}`.trim(),
      category,
      pricePerDay: price || null,
      matchReason: match.matchReason,
    };
  }).filter(Boolean);
}

export function buildIntentFaq({ keyword, airport, matchedRentals }) {
  const city = airport?.city || "this airport";
  const count = matchedRentals?.length || 0;

  return [
    {
      question: `Where can I find ${keyword} near ${city}?`,
      answer: `JetMyMoto lists ${count} motorcycle${count > 1 ? "s" : ""} available for pickup at ${city} airport. Browse and compare options above.`,
    },
    {
      question: `How do I book a motorcycle at ${city} airport?`,
      answer: `Select your preferred motorcycle, check availability for your dates, and submit a reservation request. We'll confirm with the operator within 24 hours.`,
    },
    {
      question: `Can I ship my own motorcycle to ${city} instead?`,
      answer: `Yes — JetMyMoto's Moto Airlift service can ship your own bike to ${city} airport. Use the shipping calculator for a quote.`,
    },
  ];
}

// ── CTAs ──

export function buildIntentPrimaryCta({ matchedRentals }) {
  const count = matchedRentals?.length || 0;
  if (count === 1) return "Reserve This Motorcycle";
  return "Compare & Reserve";
}

export function buildIntentSecondaryCta() {
  return "Ship Your Own Bike Instead";
}
