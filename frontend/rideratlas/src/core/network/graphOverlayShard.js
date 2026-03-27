import { buildPatriotOverlays } from "../patriot/buildPatriotOverlays.js";
import { buildOverlayIndexes } from "../patriot/overlayIndexes.js";
import { getPublishedOverlayUrls } from "../patriot/exportOverlayUrls.js";
import { INTENT_SIGNALS } from "../patriot/data/intentSignals.js";
import {
  getRentalBrand,
  getRentalCategoryLabel,
  getRentalModelName,
  getRentalPosterUrl,
  getRentalPrice,
} from "@/features/rentals/utils/rentalFormatters";

function normalizeReasons(overlay) {
  const reasons = [];
  const bikeReasons = overlay.content?.whyThisBike;
  const airportReasons = overlay.content?.whyThisAirport;

  if (Array.isArray(bikeReasons)) {
    reasons.push(...bikeReasons.filter(Boolean));
  } else if (typeof bikeReasons === "string" && bikeReasons.trim()) {
    reasons.push(bikeReasons.trim());
  }

  if (Array.isArray(airportReasons)) {
    reasons.push(...airportReasons.filter(Boolean));
  } else if (typeof airportReasons === "string" && airportReasons.trim()) {
    reasons.push(airportReasons.trim());
  }

  if (Array.isArray(overlay.publish?.reasons)) {
    reasons.push(...overlay.publish.reasons.filter(Boolean));
  }

  return [...new Set(reasons)];
}

function enrichMatchedBikes(matchedBikes = [], graph) {
  return matchedBikes.map((bike) => {
    const rental = graph.rentals?.[bike.rentalSlug] || null;

    return {
      ...bike,
      heroImageUrl: rental ? getRentalPosterUrl(rental) : null,
      pricePerDay:
        typeof bike.pricePerDay === "number"
          ? bike.pricePerDay
          : rental
            ? getRentalPrice(rental)
            : null,
      currency: rental?.currency || "EUR",
      operatorName: rental?.operatorId ? graph.operators?.[rental.operatorId]?.name || null : null,
    };
  });
}

function resolveIntentOverlayTopRental(overlay, graph) {
  const slugs = overlay.sourceRefs?.matchedRentalSlugs || [];
  for (const slug of slugs) {
    const rental = graph.rentals?.[slug];
    if (rental) {
      return rental;
    }
  }
  return null;
}

function buildOverlayRenderData(overlay, graph) {
  const airport = graph.airports?.[overlay.sourceRefs?.airportCode] || null;
  const airportCity = airport?.city || overlay.sourceRefs?.airportCode || "";
  const airportCode = overlay.sourceRefs?.airportCode || "";
  const ctaPrimary = overlay.conversion?.primaryCta || "Reserve";
  const ctaSecondary = overlay.conversion?.secondaryCta || "Learn More";

  if (overlay.overlayType === "intent-airport") {
    const matchedBikes = enrichMatchedBikes(overlay.content?.matchedBikes || [], graph);
    const topRental = resolveIntentOverlayTopRental(overlay, graph);
    const operator = topRental?.operatorId ? graph.operators?.[topRental.operatorId] || null : null;

    return {
      airportCity,
      airportCode,
      matchedBikes,
      price:
        typeof matchedBikes[0]?.pricePerDay === "number"
          ? matchedBikes[0].pricePerDay
          : topRental
            ? getRentalPrice(topRental)
            : null,
      currency: topRental?.currency || matchedBikes[0]?.currency || "EUR",
      bikeName: matchedBikes[0]?.title || overlay.headline || "Motorcycle",
      category: matchedBikes[0]?.category || String(overlay.sourceRefs?.intentType || "comparison").toLowerCase(),
      imageUrl: matchedBikes[0]?.heroImageUrl || overlay.media?.heroImageUrl || null,
      operatorName: operator?.name || matchedBikes[0]?.operatorName || null,
      reasons: normalizeReasons(overlay),
      ctaPrimary,
      ctaSecondary,
    };
  }

  const rental = graph.rentals?.[overlay.sourceRefs?.rentalSlug] || null;
  const operator = overlay.sourceRefs?.operatorId
    ? graph.operators?.[overlay.sourceRefs.operatorId] || null
    : null;

  return {
    airportCity,
    airportCode,
    price: rental ? getRentalPrice(rental) : null,
    currency: rental?.currency || "EUR",
    bikeName: rental
      ? `${getRentalBrand(rental)} ${getRentalModelName(rental)}`
      : "Motorcycle",
    category: rental ? getRentalCategoryLabel(rental) : "",
    imageUrl: rental ? getRentalPosterUrl(rental) : overlay.media?.heroImageUrl || null,
    operatorName: operator?.name || null,
    reasons: normalizeReasons(overlay),
    ctaPrimary,
    ctaSecondary,
  };
}

function buildSelfSufficientOverlays(patriotOverlays, graph) {
  return Object.fromEntries(
    Object.entries(patriotOverlays || {}).map(([overlayId, overlay]) => {
      return [
        overlayId,
        {
          ...overlay,
          renderData: buildOverlayRenderData(overlay, graph),
        },
      ];
    })
  );
}

export function buildGraphOverlayShard(graph, intentSignals = INTENT_SIGNALS) {
  const { patriotOverlays: rawPatriotOverlays, rejections } = buildPatriotOverlays(
    graph,
    intentSignals
  );
  const patriotOverlays = buildSelfSufficientOverlays(rawPatriotOverlays, graph);
  const overlayIndexes = buildOverlayIndexes(patriotOverlays);
  const publishedOverlayUrls = getPublishedOverlayUrls(patriotOverlays);

  return {
    patriotOverlays,
    overlayIndexes,
    overlayRejections: rejections,
    publishedOverlayUrls,
  };
}

export function createGraphOverlayShardLoader(graph, intentSignals = INTENT_SIGNALS) {
  return async function loadGraphOverlayShard() {
    return buildGraphOverlayShard(graph, intentSignals);
  };
}