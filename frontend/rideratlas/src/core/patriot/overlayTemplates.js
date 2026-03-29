import {
  getRentalBrand,
  getRentalModelName,
  getRentalCategoryLabel,
  getRentalPosterUrl,
} from "@/features/rentals/utils/rentalFormatters";
import { CINEMATIC_BACKGROUNDS } from "@/utils/cinematicBackgrounds";

// ── Helpers ──

function titleize(str) {
  return String(str || "")
    .split("-")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

function limitLength(str, max) {
  if (!str || str.length <= max) return str || "";
  return str.slice(0, max - 1) + "…";
}

// ── ID & Path ──

export function buildOverlayPath({ airportCode, slug }) {
  return `/rentals/${String(airportCode).toUpperCase()}/${String(slug)}`;
}

export function buildOverlayId({ airportCode, rentalSlug }) {
  const code = String(airportCode).toUpperCase();
  const slug = String(rentalSlug).toLowerCase();
  return `pseo-${code.toLowerCase()}-${slug}`;
}

export function buildCanonicalPath({ airportCode, rentalSlug }) {
  return buildOverlayPath({ airportCode, slug: rentalSlug });
}

export function buildOverlaySlug({ airportCode, rentalSlug }) {
  return `${String(airportCode).toLowerCase()}-${String(rentalSlug)}`;
}

// ── Path normalizer (single source of truth for renderer) ──

export function normalizeOverlayPath(pathname) {
  const parts = String(pathname || "").split("/").filter(Boolean);
  if (parts.length < 3 || parts[0] !== "rentals") return null;
  return `/rentals/${parts[1].toUpperCase()}/${parts.slice(2).join("/")}`;
}

// ── SEO ──

export function buildSeoTitle({ airport, rental }) {
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const city = airport?.city || "";
  const code = airport?.code || "";
  return limitLength(
    `Rent ${brand} ${model} at ${city} (${code}) | JetMyMoto`,
    60
  );
}

export function buildSeoDescription({ airport, rental, destinations }) {
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const city = airport?.city || "";
  const code = airport?.code || "";
  const category = getRentalCategoryLabel(rental);

  const destNames = (destinations || []).slice(0, 2).map(titleize).join(" and ");
  const destClause = destNames ? ` Perfect for ${destNames}.` : "";

  return limitLength(
    `Rent a ${brand} ${model} (${category}) at ${city} ${code}. Verified fleet, premium handoff.${destClause} Or ship your own bike via Moto Airlift.`,
    155
  );
}

export function buildSeoKeywords({ airport, rental, destinations }) {
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const category = getRentalCategoryLabel(rental);
  const city = airport?.city || "";
  const code = airport?.code || "";

  const keywords = [
    `rent ${brand} ${model} ${city}`.toLowerCase(),
    `motorcycle rental ${code}`.toLowerCase(),
    `${category} rental ${city}`.toLowerCase(),
    `rent ${brand.toLowerCase()} ${code.toLowerCase()}`,
    `motorcycle rental near ${city.toLowerCase()} airport`,
  ];

  (destinations || []).slice(0, 3).forEach((dest) => {
    keywords.push(`${brand.toLowerCase()} rental ${titleize(dest).toLowerCase()}`);
    keywords.push(`motorcycle rental ${titleize(dest).toLowerCase()}`);
  });

  return [...new Set(keywords)];
}

// ── Headlines ──

export function buildHeadline({ airport, rental }) {
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const city = airport?.city || "Hub";
  return `${brand} ${model} — Deploy from ${city}`;
}

export function buildSubheadline({ airport, rental }) {
  const category = getRentalCategoryLabel(rental);
  const code = airport?.code || "";
  return `${category} staged at ${code}. Rent locally or ship your own.`;
}

// ── Content blocks ──

export function buildIntro({ airport, rental, operator }) {
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const city = airport?.city || "this hub";
  const code = airport?.code || "";
  const operatorName = operator?.name || "a verified local partner";

  return `The ${brand} ${model} is staged and ready for pickup at ${city} (${code}), operated by ${operatorName}. Whether you're flying into the region for a multi-day mission or looking for a precision-matched rental on arrival, this machine is cleared for immediate handoff through the JetMyMoto dual-engine platform.`;
}

export function buildWhyThisBike({ rental, destinations }) {
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const category = getRentalCategoryLabel(rental);
  const reasons = [];

  reasons.push(`${brand} ${model} — verified ${category.toLowerCase()} platform`);

  if (rental.pricing?.pricePerDay || rental.price_day) {
    const price = rental.pricing?.pricePerDay ?? rental.price_day;
    const currency = String(rental.currency || "EUR").toUpperCase();
    reasons.push(`From ${currency} ${price}/day with transparent fleet pricing`);
  }

  const dests = destinations || [];
  if (dests.length > 0) {
    const destNames = dests.slice(0, 2).map(titleize).join(" and ");
    reasons.push(`Mission-certified for ${destNames}`);
  }

  if (category.toLowerCase().includes("adventure")) {
    reasons.push("Built for mixed terrain and alpine switchbacks");
  } else if (category.toLowerCase().includes("touring") || category.toLowerCase().includes("sport")) {
    reasons.push("Optimized for long-distance comfort and highway stability");
  } else if (category.toLowerCase().includes("cruiser")) {
    reasons.push("Relaxed ergonomics for coastal and lowland touring");
  } else {
    reasons.push("Versatile platform for varied riding conditions");
  }

  return reasons;
}

export function buildWhyThisAirport({ airport, routeCount, rentalCount, destinationCount }) {
  const city = airport?.city || "This hub";
  const code = airport?.code || "";
  const region = airport?.region || "";
  const reasons = [];

  reasons.push(`${city} (${code}) — ${rentalCount} machines staged, ${routeCount} indexed ride lines`);

  if (destinationCount > 1) {
    reasons.push(`Gateway to ${destinationCount} verified destinations`);
  }

  if (region) {
    reasons.push(`Regional cluster: ${region}`);
  }

  reasons.push("Full Moto Airlift logistics support for fly-your-own-bike deployments");

  return reasons;
}

export function buildFaq({ airport, rental, operator }) {
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const city = airport?.city || "this airport";
  const code = airport?.code || "";
  const operatorName = operator?.name || "the local partner";
  const price = rental.pricing?.pricePerDay ?? rental.price_day;
  const currency = String(rental.currency || "EUR").toUpperCase();

  return [
    {
      q: `How much does it cost to rent the ${brand} ${model} at ${city}?`,
      a: price
        ? `The ${brand} ${model} is available from ${currency} ${price} per day at ${code}, operated by ${operatorName}. Final pricing depends on rental duration and season.`
        : `Contact ${operatorName} at ${code} for current pricing on the ${brand} ${model}.`,
    },
    {
      q: `Can I ship my own motorcycle to ${city} instead of renting?`,
      a: `Yes. JetMyMoto's Moto Airlift service handles enclosed motorcycle logistics to ${code}. You can rent locally or fly your own bike — every page exposes both options.`,
    },
    {
      q: `What type of riding is the ${brand} ${model} best for?`,
      a: `The ${model} is classified as ${getRentalCategoryLabel(rental).toLowerCase()}. It's optimized for the terrain reachable from ${city}, including the destinations indexed at this hub.`,
    },
    {
      q: `Is insurance included with this rental?`,
      a: rental.insuranceIncluded || rental.insurance_included
        ? `Yes — insurance is included with rentals from ${operatorName} at ${code}.`
        : `Insurance options are available through ${operatorName}. Check availability during the booking process.`,
    },
  ];
}

// ── CTAs ──

export function buildPrimaryCta() {
  return "Reserve This Machine";
}

export function buildSecondaryCta() {
  return "Ship Your Own Bike Instead";
}

export function buildBookingPath({ airportCode, rentalSlug }) {
  const code = String(airportCode).toUpperCase();
  return `/moto-airlift?intent=rent&airport=${code}&rental=${encodeURIComponent(rentalSlug)}#booking`;
}

export function buildInquiryPath({ airportCode }) {
  const code = String(airportCode).toUpperCase();
  return `/moto-airlift?airport=${code}#booking`;
}

// ── Media resolution (build-time only) ──

export function resolveHeroImage(rental) {
  return (
    rental?.posterUrl ||
    rental?.imageUrl ||
    CINEMATIC_BACKGROUNDS?.courtyardClassic ||
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=80"
  );
}

// ── Related overlays ──

export function selectRelatedOverlays({ overlayId, airportCode, rentalCategory, allOverlays, maxCount = 3 }) {
  const related = [];

  for (const candidate of allOverlays) {
    if (candidate.id === overlayId) continue;
    if (candidate.publish?.status !== "published") continue;
    if (candidate.sourceRefs?.airportCode !== airportCode) continue;
    if (candidate._rentalCategory === rentalCategory) continue;

    related.push(candidate.id);
    if (related.length >= maxCount) break;
  }

  return related;
}
