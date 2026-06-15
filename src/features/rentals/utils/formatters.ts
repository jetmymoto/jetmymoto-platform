import { RENTAL_HERO_IMAGE_MAP, buildRentalHeroImageId } from "../data/rentalHeroImageMap";
import type { Rental } from "../types";

const CATEGORY_PRICE_MAP: Record<string, number> = {
  adventure: 185,
  touring: 210,
  cruiser: 165,
  classic: 145,
  scrambler: 175,
  "sport-touring": 225,
};

function titleizeToken(token: string): string {
  if (!token) return "";
  if (/^\d/.test(token)) return token.toUpperCase();
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function splitModelTokens(rental: Partial<Rental>): string[] {
  const slugTokens = String(rental?.slug || "")
    .split("-")
    .filter(Boolean);
  const airportToken = String(rental?.airport || "").toLowerCase();
  const airportIndex = slugTokens.indexOf(airportToken);

  if (airportIndex <= 0) {
    return slugTokens;
  }

  return slugTokens.slice(0, airportIndex);
}

export function getRentalBrand(rental: Partial<Rental>): string {
  if (typeof rental?.brand === "string" && rental.brand.trim()) {
    return rental.brand.trim();
  }

  return titleizeToken(splitModelTokens(rental)[0] || "Unknown");
}

export function getRentalModelName(rental: Partial<Rental>): string {
  if (typeof rental?.model === "string" && rental.model.trim()) {
    return rental.model.trim();
  }

  const tokens = splitModelTokens(rental).slice(1);

  if (tokens.length === 0) {
    return "Mission Spec";
  }

  return tokens.map(titleizeToken).join(" ");
}

export function getRentalCategoryLabel(rental: Partial<Rental>): string {
  return String(rental?.category || "mission-spec")
    .split("-")
    .map(titleizeToken)
    .join(" ");
}

export function getRentalPrice(rental: Partial<Rental>): number {
  if (typeof rental?.pricing?.pricePerDay === "number") {
    return rental.pricing.pricePerDay;
  }

  if (typeof rental?.price_day === "number") {
    return rental.price_day;
  }

  return CATEGORY_PRICE_MAP[String(rental?.category || "").toLowerCase()] || 150;
}

export function formatRentalPrice(rental: Partial<Rental>): string {
  const amount = getRentalPrice(rental);
  const currency = String(rental?.currency || "EUR").toUpperCase();

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function getRentalPosterUrl(rental: Partial<Rental>): string | null {
  // 1. PRIMARY SOURCE: direct rental image
  if (rental?.imageUrl) return rental.imageUrl;

  // 2. SECONDARY: RENTAL_HERO_IMAGE_MAP model image
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const heroId = buildRentalHeroImageId(brand, model);
  if (heroId && RENTAL_HERO_IMAGE_MAP[heroId]) {
    return RENTAL_HERO_IMAGE_MAP[heroId];
  }

  // 3. null premium no-image state
  return null;
}
