import { VISUAL_STYLE_RULES } from "./visualStyleRules.js";

/**
 * Select the best image from the Image Graph for a given entity context.
 *
 * @param {Object} imageGraph - The IMAGE_GRAPH object with .images and .indexes
 * @param {Object} query
 * @param {string} [query.brand] - Filter by motorcycle brand
 * @param {string} [query.model] - Filter by motorcycle model
 * @param {string} query.entityType - "rental" | "route" | "destination" | "overlay" | "hero"
 * @param {string} [query.emotion] - Override emotion preference
 * @param {string} [query.type] - Override image type preference
 * @param {string} [query.category] - Filter by rental category
 * @returns {Object|null} - Best matching image record, or null
 */
export function selectBestImage(imageGraph, query) {
  if (!imageGraph || !imageGraph.images || !query?.entityType) return null;

  const rule = VISUAL_STYLE_RULES[query.entityType];
  if (!rule) return null;

  const allImages = Object.values(imageGraph.images);
  if (allImages.length === 0) return null;

  const targetType = query.type || rule.type;
  const targetComposition = rule.composition;
  const targetLighting = rule.lighting;
  const targetEmotion = query.emotion || rule.emotion;
  const fallbackType = rule.fallbackType;

  let candidates = allImages;

  if (query.brand) {
    const brandLower = query.brand.toLowerCase();
    const filtered = candidates.filter(
      (img) => (img.brand || "").toLowerCase() === brandLower
    );
    if (filtered.length > 0) candidates = filtered;
  }

  if (query.model) {
    const modelLower = query.model.toLowerCase().replace(/\s+/g, "_");
    const filtered = candidates.filter(
      (img) => (img.model || "").toLowerCase().replace(/\s+/g, "_") === modelLower
    );
    if (filtered.length > 0) candidates = filtered;
  }

  if (query.category) {
    const catLower = query.category.toLowerCase();
    const filtered = candidates.filter(
      (img) => (img.category || "").toLowerCase() === catLower
    );
    if (filtered.length > 0) candidates = filtered;
  }

  const usableFiltered = candidates.filter(
    (img) => img.usableFor && img.usableFor.includes(query.entityType)
  );
  if (usableFiltered.length > 0) candidates = usableFiltered;

  const scored = candidates.map((img) => {
    let matchScore = img.score || 0;

    if (img.type === targetType) matchScore += 0.3;
    else if (img.type === fallbackType) matchScore += 0.1;

    if (img.composition === targetComposition) matchScore += 0.2;

    if (img.lighting === targetLighting) matchScore += 0.1;

    if (img.emotion === targetEmotion) matchScore += 0.15;

    if (img.brandRecognizable) matchScore += 0.05;

    return { ...img, _matchScore: matchScore };
  });

  scored.sort((a, b) => b._matchScore - a._matchScore);

  const best = scored[0];
  if (!best) return null;

  const { _matchScore, ...cleanResult } = best;
  return cleanResult;
}
