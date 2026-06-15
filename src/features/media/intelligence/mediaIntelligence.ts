import type { MediaAsset } from "../types";
import heroManifest from "../manifests/airportHeroManifest.json";

export async function resolveCanonicalUrl(gcsPath: string | null | undefined): Promise<string | null> {
  if (!gcsPath) return null;
  
  if (typeof gcsPath === 'string' && (gcsPath.startsWith('http') || gcsPath.startsWith('/'))) {
    if (gcsPath.includes('[object Object]')) return null;
    return gcsPath;
  }
  
  let bucket = 'movie-chat-factory.firebasestorage.app';
  let path = gcsPath;

  if (typeof gcsPath === 'string' && gcsPath.startsWith('gs://')) {
    const parts = gcsPath.replace('gs://', '').split('/');
    bucket = parts[0].trim().toLowerCase();
    path = parts.slice(1).join('/');
  }

  return `https://storage.googleapis.com/${bucket}/${path}`;
}

export async function normalizeResolvedMedia(
  asset: MediaAsset | null | undefined | string, 
  fallback?: any, 
  context: Record<string, any> = {}
) {
  const standard = {
    image: null as string | null,
    assetId: (asset as any)?.assetId || (asset as any)?.id || "unknown",
    source: (asset as any)?.source || (asset ? "manifest" : "fallback"),
    alt: (asset as any)?.alt || (asset as any)?.title || context.alt || "Adventure motorcycle",
    role: (asset as any)?.visualRole || (asset as any)?.visual_role || context.role || "general"
  };

  if (typeof asset === "string" && (asset.startsWith("http") || asset.startsWith("/"))) {
    standard.image = asset;
    return standard;
  }

  const candidateUrl = (asset as any)?.image || (asset as any)?.url || (asset as any)?.src || (asset as any)?.public_url || (asset as any)?.downloadUrl;
  if (candidateUrl && typeof candidateUrl === "string") {
    standard.image = candidateUrl;
    return standard;
  }

  const gcsPath = (asset as any)?.gcsPath || (asset as any)?.gsPath || (asset as any)?.gcs_path;
  if (gcsPath) {
    const resolved = await resolveCanonicalUrl(gcsPath);
    if (resolved && typeof resolved === 'string' && !resolved.includes('[object Object]')) {
      standard.image = resolved;
      standard.source = "gcs";
      return standard;
    }
  }

  if (fallback) {
    if (typeof fallback === "string") {
      standard.image = fallback;
    } else {
      standard.image = fallback.image || fallback.url || fallback.src;
    }
    standard.source = "fallback";
  }

  return standard;
}

export async function findMediaAssets(criteria: {
  region?: string;
  airportCode?: string;
  missionSlug?: string;
  missionType?: string;
  useCase?: string;
  vibe?: string;
  sceneCategory?: string;
  brand?: string;
  model?: string;
  theater?: string;
  visualRole?: string;
  maxResults?: number;
}): Promise<MediaAsset[]> {
  const { maxResults = 10, ...filters } = criteria;
  
  const hasCriteria = Object.values(filters).some(v => v !== undefined && v !== "");
  if (!hasCriteria) {
    return [];
  }

  // Load from static manifest instead of Firestore
  const allAssets = heroManifest as MediaAsset[];

  const results = allAssets.filter(asset => {
    if (filters.region && asset.region !== filters.region) return false;
    
    if (filters.airportCode) {
      const assetCodes = asset.airportCodes || asset.airport_codes || (asset.airportCode ? [asset.airportCode] : []);
      const pathMatches = asset.gcsPath?.includes(`/airports/${filters.airportCode}/`) || asset.gcsPath?.includes(`_${filters.airportCode}_`);
      if (!assetCodes.includes(filters.airportCode) && !pathMatches) return false;
    }

    if (filters.visualRole) {
      const role = asset.visualRole || asset.visual_role;
      if (role !== filters.visualRole) return false;
    }

    // Rough text matching for other filters since manifest might not have exact fields
    const assetString = JSON.stringify(asset).toLowerCase();
    if (filters.vibe && !assetString.includes(filters.vibe.toLowerCase())) return false;
    if (filters.brand && !assetString.includes(filters.brand.toLowerCase())) return false;
    if (filters.model && !assetString.includes(filters.model.toLowerCase())) return false;
    if (filters.theater && !assetString.includes(filters.theater.toLowerCase())) return false;

    return true;
  });

  return results.slice(0, maxResults);
}
