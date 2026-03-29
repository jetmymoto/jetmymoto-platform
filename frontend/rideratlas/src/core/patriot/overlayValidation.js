export function validateOverlay(overlay, graph, existingPaths) {
  const errors = [];

  // ── Source ref integrity ──
  const refs = overlay.sourceRefs || {};

  if (refs.airportCode && !graph.airports?.[refs.airportCode]) {
    errors.push(`sourceRefs.airportCode "${refs.airportCode}" not found in graph`);
  }

  if (refs.rentalSlug && !graph.rentals?.[refs.rentalSlug]) {
    errors.push(`sourceRefs.rentalSlug "${refs.rentalSlug}" not found in graph`);
  }

  if (refs.operatorId && !graph.operators?.[refs.operatorId]) {
    errors.push(`sourceRefs.operatorId "${refs.operatorId}" not found in graph`);
  }

  // ── Canonical path uniqueness ──
  const path = overlay.seo?.canonicalPath;
  if (!path) {
    errors.push("Missing seo.canonicalPath");
  } else if (existingPaths && existingPaths.has(path)) {
    errors.push(`Duplicate canonicalPath "${path}"`);
  }

  // ── Content minimum thresholds ──
  if (!overlay.headline || overlay.headline.length < 10) {
    errors.push("Headline too short or missing");
  }

  if (!overlay.seo?.title || overlay.seo.title.length < 15) {
    errors.push("SEO title too short or missing");
  }

  if (!overlay.seo?.description || overlay.seo.description.length < 30) {
    errors.push("SEO description too short or missing");
  }

  if (!overlay.media?.heroImageUrl) {
    errors.push("Missing media.heroImageUrl");
  }

  if (!overlay.content?.intro || overlay.content.intro.length < 20) {
    errors.push("Intro content too short or missing");
  }

  // ── Related overlay integrity (condition #10) ──
  const relatedIds = overlay.relationships?.relatedOverlayIds || [];

  for (const relId of relatedIds) {
    if (relId === overlay.id) {
      errors.push(`relatedOverlayIds contains self-reference "${relId}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
