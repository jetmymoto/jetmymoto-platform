import {
  checkEligibility,
  scoreAirport,
  scoreRental,
  scoreContentDepth,
  scoreUniqueness,
  scoreCompatibility,
  computeCompositeScore,
  PUBLISH_THRESHOLD,
  MAX_PER_CATEGORY_PER_AIRPORT,
  MAX_TOTAL_PER_AIRPORT,
} from "./overlayScoring.js";

import {
  buildOverlayId,
  buildOverlaySlug,
  buildCanonicalPath,
  buildOverlayPath,
  buildSeoTitle,
  buildSeoDescription,
  buildSeoKeywords,
  buildHeadline,
  buildSubheadline,
  buildIntro,
  buildWhyThisBike,
  buildWhyThisAirport,
  buildFaq,
  buildPrimaryCta,
  buildSecondaryCta,
  buildBookingPath,
  buildInquiryPath,
  resolveHeroImage,
  selectRelatedOverlays,
} from "./overlayTemplates.js";

import { validateOverlay } from "./overlayValidation.js";
import { matchIntentToRentals } from "./intentMatching.js";
import { deduplicateIntents } from "./intentDedup.js";
import { classifyIntentType } from "./keywordUtils.js";
import { ENRICHED_PATRIOT_DATA } from "./data/enrichedPatriotData.js";
import {
  buildIntentOverlayId,
  buildIntentOverlaySlug,
  buildIntentCanonicalPath,
  buildIntentHeadline,
  buildIntentSubheadline,
  buildIntentSeoTitle,
  buildIntentSeoDescription,
  buildIntentIntro,
  buildIntentMatchedBikes,
  buildIntentFaq,
  buildIntentPrimaryCta,
  buildIntentSecondaryCta,
} from "./intentOverlayTemplates.js";

export function buildPatriotOverlays(graph, intentSignals = []) {
  const rentalsByAirport =
    graph.indexes?.rentalsByAirport || graph.rentalsByAirport || {};
  const routesByAirport =
    graph.indexes?.routesByAirport || graph.routesByAirport || {};

  // ── Step 1: Candidate generation ──
  const candidates = [];

  for (const [airportCode, rentalIds] of Object.entries(rentalsByAirport)) {
    for (const rentalSlug of rentalIds) {
      candidates.push({
        airportCode: airportCode.toUpperCase(),
        rentalSlug,
        overlayType: "airport-rental",
      });
    }
  }

  // ── Step 2: Eligibility filter ──
  const eligible = [];
  const rejections = [];

  for (const candidate of candidates) {
    const { eligible: isEligible, errors } = checkEligibility(candidate, graph);
    if (isEligible) {
      eligible.push(candidate);
    } else {
      rejections.push({
        id: buildOverlayId({ airportCode: candidate.airportCode, rentalSlug: candidate.rentalSlug }),
        phase: "eligibility",
        reason: errors.join("; "),
        overlayType: candidate.overlayType,
        score: null,
        semanticGroupId: null,
      });
    }
  }

  // ── Step 3: Build overlay records ──
  const overlays = [];

  for (const candidate of eligible) {
    const { airportCode, rentalSlug } = candidate;
    const airport = graph.airports[airportCode];
    const rental = graph.rentals[rentalSlug];
    const operatorId = rental.operatorId || rental.operator;
    const operator = operatorId ? graph.operators?.[operatorId] : undefined;
    const destinations = rental.compatibleDestinations ||
      rental.compatible_destinations || [];

    const routeSlugs = routesByAirport[airportCode] || [];
    const routeCount = routeSlugs.length;
    const rentalCount = (rentalsByAirport[airportCode] || []).length;

    const destinationSet = new Set();
    routeSlugs.forEach((slug) => {
      const route = graph.routes?.[slug];
      const dest = route?.destination?.slug || route?.destination;
      if (dest) destinationSet.add(dest);
    });
    const destinationCount = destinationSet.size;

    const id = buildOverlayId({ airportCode, rentalSlug });
    const slug = buildOverlaySlug({ airportCode, rentalSlug });
    const canonicalPath = buildCanonicalPath({ airportCode, rentalSlug });

    const overlay = {
      id,
      slug,
      overlayType: "airport-rental",
      brand: "both",

      sourceRefs: {
        airportCode,
        rentalSlug,
        operatorId: operatorId || undefined,
        destinationSlug: destinations[0] || undefined,
      },

      headline: buildHeadline({ airport, rental }),
      subheadline: buildSubheadline({ airport, rental }),

      seo: {
        title: buildSeoTitle({ airport, rental }),
        description: buildSeoDescription({ airport, rental, destinations }),
        canonicalPath,
        keywords: buildSeoKeywords({ airport, rental, destinations }),
      },

      media: {
        heroImageUrl: resolveHeroImage(rental),
      },

      content: {
        intro: buildIntro({ airport, rental, operator }),
        whyThisBike: buildWhyThisBike({ rental, destinations }),
        whyThisAirport: buildWhyThisAirport({
          airport,
          routeCount,
          rentalCount,
          destinationCount,
        }),
        faq: buildFaq({ airport, rental, operator }),
      },

      relationships: {
        relatedOverlayIds: [],
      },

      conversion: {
        primaryMode: "rental",
        bookingPath: buildBookingPath({ airportCode, rentalSlug }),
        inquiryPath: buildInquiryPath({ airportCode }),
        primaryCta: buildPrimaryCta(),
        secondaryCta: buildSecondaryCta(),
      },

      scoring: {
        airport: 0,
        rental: 0,
        content: 0,
        compatibility: 0,
        uniqueness: 0,
        composite: 0,
      },

      publish: {
        status: "draft",
        indexable: false,
        sitemap: false,
        score: 0,
        reasons: [],
      },

      // Internal (stripped before export)
      _rentalCategory: String(rental.category || "").toLowerCase(),
    };

    overlays.push(overlay);
  }

  // ── Step 3b: Intent overlay generation ──
  const dedupedIntents = deduplicateIntents(intentSignals);

  for (const intent of dedupedIntents) {
    const airportCode = String(intent.airportCode || "").toUpperCase();
    const airport = graph.airports?.[airportCode];
    if (!airport) continue;

    const matchedRentals = matchIntentToRentals(intent, graph);
    if (matchedRentals.length === 0) continue;

    const intentType = classifyIntentType(intent.keyword);
    const id = buildIntentOverlayId({ airportCode, keyword: intent.keyword });
    const slug = buildIntentOverlaySlug({ airportCode, keyword: intent.keyword });
    const canonicalPath = buildIntentCanonicalPath({ airportCode, keyword: intent.keyword });
    const topMatch = matchedRentals[0];
    const topRental = graph.rentals?.[topMatch.rentalSlug];

    const enriched = ENRICHED_PATRIOT_DATA[slug] || {};

    const intentOverlay = {
      id,
      slug,
      overlayType: "intent-airport",
      brand: "both",

      sourceRefs: {
        airportCode,
        keyword: intent.keyword,
        intentType,
        operatorId: intent.operatorId || undefined,
        matchedRentalSlugs: matchedRentals.slice(0, 5).map((m) => m.rentalSlug),
      },

      headline: enriched.h1_tag || buildIntentHeadline({ keyword: intent.keyword, airport }),
      subheadline: buildIntentSubheadline({ keyword: intent.keyword, matchedRentals }),

      seo: {
        title: buildIntentSeoTitle({ keyword: intent.keyword, airport }),
        description: enriched.meta_description || buildIntentSeoDescription({ keyword: intent.keyword, airport, matchedRentals }),
        canonicalPath,
        keywords: [intent.keyword, airport.city, airportCode].filter(Boolean),
      },

      media: {
        heroImageUrl: topRental ? resolveHeroImage(topRental) : null,
      },

      content: {
        intro: buildIntentIntro({ keyword: intent.keyword, airport, matchedRentals }),
        cinematicPitch: enriched.cinematic_pitch || null,
        matchedBikes: buildIntentMatchedBikes({ matchedRentals, graph }),
        faq: buildIntentFaq({ keyword: intent.keyword, airport, matchedRentals }),
      },

      relationships: {
        relatedOverlayIds: [],
      },

      conversion: {
        primaryMode: "comparison",
        bookingPath: buildBookingPath({ airportCode, rentalSlug: topMatch.rentalSlug }),
        inquiryPath: buildInquiryPath({ airportCode }),
        primaryCta: buildIntentPrimaryCta({ matchedRentals }),
        secondaryCta: buildIntentSecondaryCta(),
      },

      scoring: {
        airport: 0,
        rental: 0,
        content: 0,
        compatibility: 0,
        uniqueness: 0,
        intentBoost: 0,
        composite: 0,
      },

      publish: {
        status: "draft",
        indexable: false,
        sitemap: false,
        score: 0,
        reasons: [],
      },

      meta: {
        intentSource: intent.operatorId || null,
        lastSeenAt: intent.lastSeenAt || null,
        frequency: intent.frequency || 1,
      },

      _rentalCategory: intentType,
    };

    overlays.push(intentOverlay);
  }

  // ── Step 4: Score all overlays ──
  for (const overlay of overlays) {
    const { airportCode, rentalSlug } = overlay.sourceRefs;

    if (overlay.overlayType === "intent-airport") {
      // Intent overlays: score airport + content, apply intent boost (🚀1)
      const airportResult = scoreAirport(airportCode, graph);
      const contentResult = scoreContentDepth(overlay);
      const uniqueResult = scoreUniqueness(overlay, overlays);

      // Intent boost: +0.10 base, freshness bonus for recently seen signals
      const INTENT_BOOST = 0.10;
      const freshness = overlay.meta?.frequency > 1 ? 0.05 : 0;

      overlay.scoring = {
        airport: airportResult.score,
        rental: 0,
        content: contentResult.score,
        compatibility: 0,
        uniqueness: uniqueResult.score,
        intentBoost: INTENT_BOOST + freshness,
        composite: computeCompositeScore({
          airport: airportResult.score,
          rental: 0.5, // neutral baseline for intent overlays
          content: contentResult.score,
          compatibility: 0.5, // neutral baseline
          uniqueness: uniqueResult.score,
        }) + INTENT_BOOST + freshness,
      };

      const allReasons = [
        ...airportResult.reasons,
        ...contentResult.reasons,
        ...uniqueResult.reasons,
        `intent-boost: +${(INTENT_BOOST + freshness).toFixed(2)}`,
      ];

      overlay.publish.score = overlay.scoring.composite;
      overlay.publish.reasons = allReasons;
    } else {
      // Rental overlays: existing scoring logic
      const rental = graph.rentals[rentalSlug];
      const destinations = rental?.compatibleDestinations ||
        rental?.compatible_destinations || [];

      const airportResult = scoreAirport(airportCode, graph);
      const rentalResult = scoreRental(rentalSlug, graph);
      const contentResult = scoreContentDepth(overlay);
      const compatResult = scoreCompatibility(rental, destinations);
      const uniqueResult = scoreUniqueness(overlay, overlays);

      overlay.scoring = {
        airport: airportResult.score,
        rental: rentalResult.score,
        content: contentResult.score,
        compatibility: compatResult.score,
        uniqueness: uniqueResult.score,
        composite: computeCompositeScore({
          airport: airportResult.score,
          rental: rentalResult.score,
          content: contentResult.score,
          compatibility: compatResult.score,
          uniqueness: uniqueResult.score,
        }),
      };

      const allReasons = [
        ...airportResult.reasons,
        ...rentalResult.reasons,
        ...contentResult.reasons,
        ...compatResult.reasons,
        ...uniqueResult.reasons,
      ];

      overlay.publish.score = overlay.scoring.composite;
      overlay.publish.reasons = allReasons;
    }
  }

  // ── Step 5: Publish decision with caps ──
  const airportCategoryCounts = {};
  const airportTotalCounts = {};

  // Sort by score descending so best overlays get published first
  overlays.sort((a, b) => b.scoring.composite - a.scoring.composite);

  for (const overlay of overlays) {
    const { airportCode } = overlay.sourceRefs;
    const category = overlay._rentalCategory;
    const catKey = `${airportCode}::${category}`;

    airportCategoryCounts[catKey] = (airportCategoryCounts[catKey] || 0);
    airportTotalCounts[airportCode] = (airportTotalCounts[airportCode] || 0);

    if (overlay.scoring.composite < PUBLISH_THRESHOLD) {
      overlay.publish.status = "rejected";
      const reason = `Score ${overlay.scoring.composite.toFixed(2)} below threshold ${PUBLISH_THRESHOLD}`;
      overlay.publish.reasons.push(reason);
      rejections.push({
        id: overlay.id,
        phase: "scoring",
        reason,
        overlayType: overlay.overlayType,
        score: overlay.scoring.composite,
        semanticGroupId: catKey,
      });
      continue;
    }

    if (airportCategoryCounts[catKey] >= MAX_PER_CATEGORY_PER_AIRPORT) {
      overlay.publish.status = "rejected";
      const reason = `Exceeds ${MAX_PER_CATEGORY_PER_AIRPORT} overlays for ${category} at ${airportCode}`;
      overlay.publish.reasons.push(reason);
      rejections.push({
        id: overlay.id,
        phase: "category-cap",
        reason,
        overlayType: overlay.overlayType,
        score: overlay.scoring.composite,
        semanticGroupId: catKey,
      });
      continue;
    }

    if (airportTotalCounts[airportCode] >= MAX_TOTAL_PER_AIRPORT) {
      overlay.publish.status = "rejected";
      const reason = `Exceeds ${MAX_TOTAL_PER_AIRPORT} total overlays at ${airportCode}`;
      overlay.publish.reasons.push(reason);
      rejections.push({
        id: overlay.id,
        phase: "airport-cap",
        reason,
        overlayType: overlay.overlayType,
        score: overlay.scoring.composite,
        semanticGroupId: catKey,
      });
      continue;
    }

    overlay.publish.status = "published";
    overlay.publish.indexable = true;
    overlay.publish.sitemap = true;

    airportCategoryCounts[catKey]++;
    airportTotalCounts[airportCode]++;
  }

  // ── Step 6: Validate published overlays ──
  const canonicalPaths = new Set();

  for (const overlay of overlays) {
    if (overlay.publish.status !== "published") continue;

    const { valid, errors } = validateOverlay(overlay, graph, canonicalPaths);
    if (!valid) {
      overlay.publish.status = "rejected";
      overlay.publish.indexable = false;
      overlay.publish.sitemap = false;
      overlay.publish.reasons.push(...errors);
      rejections.push({
        id: overlay.id,
        phase: "validation",
        reason: errors.join("; "),
        overlayType: overlay.overlayType,
        score: overlay.scoring.composite,
        semanticGroupId: `${overlay.sourceRefs.airportCode}::${overlay._rentalCategory}`,
      });
    } else {
      canonicalPaths.add(overlay.seo.canonicalPath);
    }
  }

  // ── Step 7: Wire related overlays (published only) ──
  const publishedOverlays = overlays.filter((o) => o.publish.status === "published");

  for (const overlay of publishedOverlays) {
    overlay.relationships.relatedOverlayIds = selectRelatedOverlays({
      overlayId: overlay.id,
      airportCode: overlay.sourceRefs.airportCode,
      rentalCategory: overlay._rentalCategory,
      allOverlays: publishedOverlays,
    });
  }

  // ── Step 8: Build output map (strip internal fields) ──
  const patriotOverlays = {};

  for (const overlay of overlays) {
    const { _rentalCategory, ...clean } = overlay;
    patriotOverlays[overlay.id] = clean;
  }

  // ── Diagnostics ──
  const published = overlays.filter((o) => o.publish.status === "published").length;
  const rejected = overlays.filter((o) => o.publish.status === "rejected").length;
  const draft = overlays.filter((o) => o.publish.status === "draft").length;

  if (typeof console !== "undefined") {
    console.log(
      `[Patriot pSEO] ${candidates.length} candidates → ${eligible.length} eligible → ${published} published, ${rejected} rejected, ${draft} draft`
    );
    console.log(
      `[Patriot pSEO] ${rejections.length} rejections logged (eligibility: ${rejections.filter((r) => r.phase === "eligibility").length}, scoring: ${rejections.filter((r) => r.phase === "scoring").length}, caps: ${rejections.filter((r) => r.phase === "category-cap" || r.phase === "airport-cap").length}, validation: ${rejections.filter((r) => r.phase === "validation").length})`
    );
  }

  return { patriotOverlays, rejections };
}
