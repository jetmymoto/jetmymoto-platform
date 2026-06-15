import type { MediaAsset, MediaContext } from "../types";
import { checkContamination } from "../guards/contaminationGuard";

const ARCHETYPE_SHARDS: Record<string, string[]> = {
  "nordic-gateway": ["scandinavian", "nordic"],
  "atlantic-gateway": ["british", "atlantic"],
  "alpine-gateway": ["alpine-core", "dolomites"],
  "coast-gateway": ["mediterranean", "adriatic"],
  "iberian-gateway": ["iberian-atlantic", "mediterranean"],
  "balkan-gateway": ["adriatic", "river-canyons"],
  "hub-gateway": ["alpine-core", "british"]
};

const THEATER_ALIASES: Record<string, string[]> = {
  scandinavian: ["scandinavian", "scandinavia", "nordic", "norway", "fjord", "boreal", "nordic-gateway"],
  scandinavia: ["scandinavian", "scandinavia", "nordic", "norway", "fjord", "boreal", "nordic-gateway"],
  nordic: ["nordic", "scandinavian", "scandinavia", "norway", "fjord", "boreal", "nordic-gateway"],
  adriatic: ["adriatic", "dalmatian", "croatia", "balkan", "coast-gateway"],
  mediterranean: ["mediterranean", "iberian", "spain", "italy", "coast-gateway"],
  alpine: ["alpine", "alpine-core", "dolomites", "swiss", "austria", "bavaria", "alpine-gateway"]
};

const SECTION_ROLES: Record<string, string[]> = {
  hero: ["airport_hero", "airport-transition", "geography"],
  ticker: ["geography", "riding-scene", "airport-transition"],
  proof: ["rental-handover", "riding-scene"],
  logistics: ["rental-handover", "airport-transition"],
  whyCity: ["geography"],
  finalCta: ["airport-transition", "geography"],
  routes: ["route-scene", "geography"],
  fleet: ["model-hero"]
};

export const getSourceWeight = (asset: MediaAsset): number => {
  const source = asset.source || "";
  const tier = asset.qualityTier || "";
  if (source.includes("hardened-regeneration")) return 400;
  if (source.includes("hero-v3")) return 300;
  if (tier.includes("collection_v1")) return 250;
  if (source.includes("hero-v2")) return 200;
  if (source.includes("media-director")) return 100;
  return 0;
};

export function scoreAsset(asset: MediaAsset, context: MediaContext, section: string): number {
  const { airportCode, countryCode, countryName, ridingTheater, archetype } = context;
  let score = 0;

  const { isRejected } = checkContamination(asset, context, section);
  if (isRejected) {
    return -9999;
  }

  const assetAirportCodes = asset.airportCodes || asset.airport_codes || (asset.airportCode ? [asset.airportCode] : []);
  if (assetAirportCodes.includes(airportCode)) score += 100;

  const assetCountries = asset.countries || (asset.country ? [asset.country] : []);
  if (countryCode && assetCountries.includes(countryCode)) score += 70;
  if (countryName && assetCountries.includes(countryName)) score += 70;

  if (archetype) {
    const targetShards = ARCHETYPE_SHARDS[archetype] || [];
    const assetRegion = (asset.region || "").toLowerCase();
    const assetShard = (asset.geo_shard || asset.geoShard || "").toLowerCase();
    if (targetShards.some(shard => assetRegion.includes(shard.toLowerCase()) || assetShard.includes(shard.toLowerCase()))) {
      score += 60;
    }
  }

  if (ridingTheater) {
    const assetTags = (asset.tags || []).map(t => t.toLowerCase());
    const assetTheater = (asset.theater || "").toLowerCase();
    const assetRegion = (asset.region || "").toLowerCase();
    const lowerTheater = ridingTheater.toLowerCase();
    
    const aliases = THEATER_ALIASES[lowerTheater] || [lowerTheater];
    
    if (
      aliases.includes(assetTheater) || 
      aliases.includes(assetRegion) || 
      aliases.some(a => assetTags.includes(a))
    ) {
      score += 40;
    }
  }

  const usage = asset.frontendUsage || asset.frontend_usage || [];
  if (usage.includes("airport_gateway") || usage.includes("airport-gateway") || usage.includes("ticker")) {
    score += 35;
  }

  const targetRoles = SECTION_ROLES[section] || [];
  const assetRole = asset.visualRole || asset.visual_role || "";
  if (targetRoles.includes(assetRole)) {
    score += 30;
  }

  if (context.searchTerm) {
    const term = context.searchTerm.toLowerCase();
    const assetBrand = (asset.brand || "").toLowerCase();
    const assetModel = (asset.model || "").toLowerCase();
    if (assetBrand && term.includes(assetBrand)) score += 50;
    if (assetModel && term.includes(assetModel)) score += 50;
  }

  if (asset.mediaDirectorReady || asset.media_director_ready) {
    score += 25;
  }

  score += (asset.hero_score || asset.qualityScore || 0);
  score += (asset.reuse_score || 0);

  if (asset.isDuplicateCandidate || asset.is_duplicate) score -= 100;
  if (asset.isArchiveCandidate || (asset.filename || "").includes("contact_sheet")) score -= 100;
  if (asset.requiresManualReview || asset.requires_manual_review) score -= 50;

  return score;
}
