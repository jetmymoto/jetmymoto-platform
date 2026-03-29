export function buildOverlayIndexes(patriotOverlays) {
  const overlayIdByPath = {};
  const overlayIdsByAirport = {};
  const overlayIdsByRental = {};
  const overlayIdsByRoute = {};
  const overlayIdsByDestination = {};
  const overlayIdsByOverlayType = {};
  const overlayIdsByIntentType = {};

  for (const [id, overlay] of Object.entries(patriotOverlays)) {
    const isPublished = overlay.publish?.status === "published";

    // ── Path index (published only, one-to-one) ──
    if (isPublished && overlay.seo?.canonicalPath) {
      overlayIdByPath[overlay.seo.canonicalPath] = id;
    }

    const refs = overlay.sourceRefs || {};

    // ── Airport index ──
    if (refs.airportCode) {
      const key = refs.airportCode;
      if (!overlayIdsByAirport[key]) overlayIdsByAirport[key] = [];
      overlayIdsByAirport[key].push(id);
    }

    // ── Rental index ──
    if (refs.rentalSlug) {
      const key = refs.rentalSlug;
      if (!overlayIdsByRental[key]) overlayIdsByRental[key] = [];
      overlayIdsByRental[key].push(id);
    }

    // ── Destination index ──
    if (refs.destinationSlug) {
      const key = refs.destinationSlug;
      if (!overlayIdsByDestination[key]) overlayIdsByDestination[key] = [];
      overlayIdsByDestination[key].push(id);
    }

    // ── Overlay type index ──
    if (overlay.overlayType) {
      const key = overlay.overlayType;
      if (!overlayIdsByOverlayType[key]) overlayIdsByOverlayType[key] = [];
      overlayIdsByOverlayType[key].push(id);
    }

    // ── Intent type index (intent overlays only) ──
    if (refs.intentType) {
      const key = refs.intentType;
      if (!overlayIdsByIntentType[key]) overlayIdsByIntentType[key] = [];
      overlayIdsByIntentType[key].push(id);
    }
  }

  return {
    overlayIdByPath,
    overlayIdsByAirport,
    overlayIdsByRental,
    overlayIdsByRoute,
    overlayIdsByDestination,
    overlayIdsByOverlayType,
    overlayIdsByIntentType,
  };
}
