// Light overlay index builder.
// Builds ONLY structural indexes + publishedUrls + raw overlays.
// NO rental formatters, NO renderData enrichment, NO pricing logic.
//
// This file stays in the sync import chain (graph-core).
// Heavy overlay enrichment lives in graphOverlayShard.js (async).

import { buildPatriotOverlays } from "../patriot/buildPatriotOverlays.js";
import { buildOverlayIndexes } from "../patriot/overlayIndexes.js";
import { getPublishedOverlayUrls } from "../patriot/exportOverlayUrls.js";

export function buildOverlayIndexOnly(graph, intentSignals) {
  const { patriotOverlays, rejections } = buildPatriotOverlays(
    graph,
    intentSignals
  );
  const overlayIndexes = buildOverlayIndexes(patriotOverlays);
  const publishedOverlayUrls = getPublishedOverlayUrls(patriotOverlays);

  return {
    rawPatriotOverlays: patriotOverlays,
    overlayIndexes,
    publishedOverlayUrls,
    overlayRejections: rejections,
  };
}
