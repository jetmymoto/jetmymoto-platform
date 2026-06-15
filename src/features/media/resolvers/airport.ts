import { findMediaAssets, normalizeResolvedMedia } from "../intelligence/mediaIntelligence";
import { scoreAsset, getSourceWeight } from "../scoring/assetScorer";
import type { MediaAsset, MediaContext } from "../types";
import { loadGraph } from "../../../core/graph/runtime/graphLoader";
import { preloadMedia } from "../../../shared/media/mediaPreload";

export type HeroPack = {
  title: {
    line1: string;
    line2: string;
    line3: string;
    highlight: string;
  };
  kicker: string;
  description: string;
  stats: { label: string; value: string }[];
  images: string[];
};

const heroPackCache = new Map<string, HeroPack>();

export async function resolveAirportMedia(
  context: MediaContext,
  section: string,
  count: number = 1
): Promise<MediaAsset[]> {
  const { airportCode, ridingTheater, archetype, searchTerm } = context;

  const searchQueries = [
    { airportCode },
    { theater: ridingTheater, visualRole: "theater_shared" },
    { vibe: archetype },
    { vibe: ridingTheater }
  ];

  if (searchTerm) {
    searchQueries.push({ vibe: searchTerm });
  }

  let allCandidates: MediaAsset[] = [];
  for (const query of searchQueries) {
    const assets = await findMediaAssets({ ...query, maxResults: 50 });
    allCandidates = [...allCandidates, ...assets];
  }

  const uniqueCandidates = Array.from(new Map(allCandidates.map(a => [a.assetId || a.id || a.gcsPath, a])).values());

  const scored = uniqueCandidates.map(asset => {
    let score = scoreAsset(asset, context, section);
    return { asset, score };
  }).filter(s => s.score > -1000)
  .sort((a, b) => {
    const sourceDelta = getSourceWeight(b.asset) - getSourceWeight(a.asset);
    if (sourceDelta) return sourceDelta;
    if (b.score !== a.score) return b.score - a.score;
    const priorityDelta = (b.asset.priority || 0) - (a.asset.priority || 0);
    return priorityDelta;
  });

  return scored.slice(0, count).map(s => s.asset);
}

export async function resolveAirportHero(airportCode: string): Promise<HeroPack> {
  const code = airportCode.toUpperCase();
  if (heroPackCache.has(code)) return heroPackCache.get(code)!;

  const graph = await loadGraph();
  const airport = graph.airports[code];
  const archetype = airport?.archetype || "gateway";
  const ridingTheater = airport?.theater || "Other";
  
  const context: MediaContext = {
    airportCode: code,
    countryCode: airport?.country,
    countryName: airport?.country,
    ridingTheater,
    archetype
  };

  const assets = airport?.heroImage 
    ? [{ gcsPath: airport.heroImage, assetId: `graph-${code}`, visualRole: 'hero' } as MediaAsset]
    : await resolveAirportMedia(context, "hero", 3);
  
  // Resolve canonical URLs
  const normalizedAssets = await Promise.all(assets.map(a => normalizeResolvedMedia(a, null, { role: "hero" })));
  const images = normalizedAssets.map(a => a.image).filter(Boolean) as string[];

  // Fallback if no images found
  if (images.length === 0) {
    images.push("https://images.unsplash.com/photo-1519750783826-e2420f4d687f?auto=format&fit=crop&w=2000&q=80");
  }

  const heroPack = {
    title: {
      line1: "Rent.",
      line2: "Ship.",
      line3: "Ride ",
      highlight: "one-way."
    },
    kicker: `Motorcycle Gateway - ${code}`,
    description: airport?.description || airport?.motto || `Premium ways to start a motorcycle trip from ${code}: rent a brutal ADV bike, ship your own machine, or book a one-way theater route.`,
    stats: [
      { label: "Launch", value: code },
      { label: "Theater", value: ridingTheater },
      { label: "Garage", value: "Verified Fleet" },
      { label: "Exit", value: "Multi-Node" }
    ],
    images
  };

  heroPackCache.set(code, heroPack);
  preloadMedia(images.slice(0, 3));
  return heroPack;
}
