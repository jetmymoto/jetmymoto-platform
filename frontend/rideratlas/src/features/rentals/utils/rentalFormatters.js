/**
 * Pure utility functions for deriving rental display values from rental records.
 * Extracted from RentalCard.jsx so that both UI components and build-time code
 * (overlayTemplates, scoring) can import without pulling in React component code.
 */

const CATEGORY_PRICE_MAP = {
  adventure: 185,
  touring: 210,
  cruiser: 165,
  classic: 145,
  scrambler: 175,
  "sport-touring": 225,
};

const CATEGORY_MEDIA = {
  adventure:
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=80",
  touring:
    "https://images.unsplash.com/photo-1529422643029-d4585747aaf2?auto=format&fit=crop&w=1600&q=80",
  cruiser:
    "https://images.unsplash.com/photo-1517846693594-1567da72af75?auto=format&fit=crop&w=1600&q=80",
  classic:
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
  scrambler:
    "https://images.unsplash.com/photo-1515777315835-281b94c9589f?auto=format&fit=crop&w=1600&q=80",
  "sport-touring":
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80",
  default:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80",
};

function titleizeToken(token) {
  if (!token) return "";
  if (/^\d/.test(token)) return token.toUpperCase();
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function splitModelTokens(rental) {
  const slugTokens = String(rental?.slug || "")
    .split("-")
    .filter(Boolean);
  const airportToken = String(rental?.airportCode || rental?.airport || "").toLowerCase();
  const airportIndex = slugTokens.indexOf(airportToken);

  if (airportIndex <= 0) {
    return slugTokens;
  }

  return slugTokens.slice(0, airportIndex);
}

export function getRentalBrand(rental) {
  if (typeof rental?.brand === "string" && rental.brand.trim()) {
    return rental.brand.trim();
  }

  return titleizeToken(splitModelTokens(rental)[0] || "Unknown");
}

export function getRentalModelName(rental) {
  if (typeof rental?.model === "string" && rental.model.trim()) {
    return rental.model.trim();
  }

  if (typeof rental?.model_name === "string" && rental.model_name.trim()) {
    return rental.model_name.trim();
  }

  const tokens = splitModelTokens(rental).slice(1);

  if (tokens.length === 0) {
    return "Mission Spec";
  }

  return tokens.map(titleizeToken).join(" ");
}

export function getRentalCategoryLabel(rental) {
  return String(rental?.category || "mission-spec")
    .split("-")
    .map(titleizeToken)
    .join(" ");
}

export function getRentalPrice(rental) {
  if (typeof rental?.pricing?.pricePerDay === "number") {
    return rental.pricing.pricePerDay;
  }

  if (typeof rental?.price_day === "number") {
    return rental.price_day;
  }

  if (typeof rental?.price === "number") {
    return rental.price;
  }

  if (typeof rental?.price_day === "string") {
    const parsed = Number.parseFloat(rental.price_day.replace(/[^0-9.]/g, ""));
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return CATEGORY_PRICE_MAP[String(rental?.category || "").toLowerCase()] || 150;
}

export function formatRentalPrice(rental) {
  const amount = getRentalPrice(rental);
  const currency = String(rental?.currency || "EUR").toUpperCase();

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function getRentalPosterUrl(rental) {
  return (
    rental?.posterUrl ||
    rental?.imageUrl ||
    CATEGORY_MEDIA[String(rental?.category || "").toLowerCase()] ||
    CATEGORY_MEDIA.default
  );
}

export { CATEGORY_PRICE_MAP, CATEGORY_MEDIA };
