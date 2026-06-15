import { normalizeResolvedMedia } from "../intelligence/mediaIntelligence";
import missionManifest from "../manifests/missionHeroManifest.json";
import airportManifest from "../manifests/airportHeroManifest.json";
import { loadGraph } from "../../../core/graph/runtime/graphLoader";
import { preloadMedia } from "../../../shared/media/mediaPreload";
import type { MediaAsset } from "../types";

const missionHeroCache = new Map<string, string>();

export async function resolveMissionHero(mission: any): Promise<string> {
  const { slug, theater, insertion_airport } = mission;

  if (missionHeroCache.has(slug)) return missionHeroCache.get(slug)!;

  let resolvedImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80";

  // 1. Mission-specific hero
  const specific = (missionManifest as any[]).find(a => a.missionSlug === slug && a.visual_role === "mission_hero");
  if (specific) {
    const normalized = await normalizeResolvedMedia(specific);
    if (normalized.image) resolvedImage = normalized.image;
  }

  // 2. Theater hero
  if (resolvedImage.includes("unsplash")) {
    const theaterAssets = (missionManifest as any[]).filter(a => a.theater === theater && a.visual_role === "theater_hero");
    if (theaterAssets.length > 0) {
      const best = theaterAssets.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
      const normalized = await normalizeResolvedMedia(best);
      if (normalized.image) resolvedImage = normalized.image;
    }
  }

  // 3. Geography hero
  if (resolvedImage.includes("unsplash")) {
    const geoAssets = (airportManifest as any[]).filter(a => a.visual_role === "geography" && a.gcsPath.includes(`/${theater}/`));
    if (geoAssets.length > 0) {
      const best = geoAssets.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
      const normalized = await normalizeResolvedMedia(best);
      if (normalized.image) resolvedImage = normalized.image;
    }
  }

  // 4. Airport insertion hero
  if (resolvedImage.includes("unsplash")) {
    const graph = await loadGraph();
    const airport = graph.airports[insertion_airport?.toUpperCase()];
    if (airport?.heroImage) {
      const normalized = await normalizeResolvedMedia({ gcsPath: airport.heroImage } as MediaAsset);
      if (normalized.image) resolvedImage = normalized.image;
    }
  }

  missionHeroCache.set(slug, resolvedImage);
  preloadMedia([resolvedImage]);
  return resolvedImage;
}
