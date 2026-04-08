import { IMAGE_GRAPH_DATA } from "./imageGraphData.js";

function buildImageIndexes(images) {
  const byBrand = {};
  const byModel = {};
  const byType = {};
  const byEmotion = {};
  const byUsableFor = {};
  const byCategory = {};

  for (const img of images) {
    const brandKey = (img.brand || "").toLowerCase();
    const modelKey = (img.model || "").toLowerCase().replace(/\s+/g, "_");
    const typeKey = img.type || "studio";
    const emotionKey = img.emotion || "power";
    const categoryKey = (img.category || "").toLowerCase();

    if (!byBrand[brandKey]) byBrand[brandKey] = [];
    byBrand[brandKey].push(img.id);

    if (!byModel[modelKey]) byModel[modelKey] = [];
    byModel[modelKey].push(img.id);

    if (!byType[typeKey]) byType[typeKey] = [];
    byType[typeKey].push(img.id);

    if (!byEmotion[emotionKey]) byEmotion[emotionKey] = [];
    byEmotion[emotionKey].push(img.id);

    if (categoryKey) {
      if (!byCategory[categoryKey]) byCategory[categoryKey] = [];
      byCategory[categoryKey].push(img.id);
    }

    for (const use of img.usableFor || []) {
      if (!byUsableFor[use]) byUsableFor[use] = [];
      byUsableFor[use].push(img.id);
    }
  }

  return { byBrand, byModel, byType, byEmotion, byUsableFor, byCategory };
}

export function buildImageGraph() {
  const images = {};
  for (const entry of IMAGE_GRAPH_DATA) {
    images[entry.id] = Object.freeze(entry);
  }

  const indexes = buildImageIndexes(IMAGE_GRAPH_DATA);

  return Object.freeze({
    images,
    indexes,
    totalImages: IMAGE_GRAPH_DATA.length,
  });
}
