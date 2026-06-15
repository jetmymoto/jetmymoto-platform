import type { Rental } from "../types";

/**
 * Strategic Flattening Map
 * Targets missing assets by grouping visual variants under a canonical slug.
 */
export const FLATTENING_MAP: Record<string, string> = {
  // BMW: group variants under established assets
  "f750-gs": "bmw-f850-gs",
  "f-750-gs": "bmw-f850-gs",
  "f750gs": "bmw-f850-gs",
  "f850-gs": "bmw-f850-gs",
  "f850gs": "bmw-f850-gs",
  "r1250-rt": "bmw-r1250-rt",
  "r-1250-rt": "bmw-r1250-rt",
  "r1250rt": "bmw-r1250-rt",
  "r1300-rt": "bmw-r1250-rt",
  "r1300rt": "bmw-r1250-rt",
  "f900-xr": "bmw-f900-xr",
  "f900xr": "bmw-f900-xr",

  // Moto Morini
  "x-cape": "moto-morini-x-cape",
  "x-cape-650": "moto-morini-x-cape",
  "xcape": "moto-morini-x-cape",

  // Honda
  "cb500x": "honda-cb500x",
  "cb-500x": "honda-cb500x",
  "transalp-750": "honda-xl750-transalp",
  "xl750-transalp": "honda-xl750-transalp",

  // KTM
  "1290-super-adventure-s": "ktm-1290-super-adventure",
  "1290-super-adventure": "ktm-1290-super-adventure",
  "1390-super-adventure": "ktm-1290-super-adventure",
  "1390-super-adventure-automatic": "ktm-1290-super-adventure",

  // Brands with 0 catalog presence (Category Fallbacks)
  "voge-900-dsx": "category-adventure",
  "benelli-trk502": "category-adventure",
  "himalayan": "royal-enfield-himalayan",
};

const BRAND_ALIASES: Record<string, string> = {
  ducati: "ducati",
  "moto morini": "moto-morini",
  motomorini: "moto-morini",
  hond: "honda",
  honda: "honda",
  vespa: "vespa",
  voge: "voge",
  "harley davidson": "harley-davidson",
  "harley-davidson": "harley-davidson",
};

function normalizeToken(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeBrand(brand: string): string {
  const key = normalizeToken(brand).replace(/-/g, " ");
  return BRAND_ALIASES[key] || normalizeToken(brand);
}

function normalizeModel(model: string): string {
  return normalizeToken(
    String(model || "")
      .replace(/\([^)]*\)/g, "")
      .replace(/\b(20\d{2})\b/g, "")
      .replace(/\bautomatic\b/gi, "")
      .replace(/\bauto\b/gi, "")
      .replace(/\btransmission\b/gi, "")
  );
}

function slugToBrandModel(slug: string): { brand: string; model: string } {
  const tokens = String(slug || "").split("-").filter(Boolean);
  if (tokens.length < 2) {
    return { brand: "", model: "" };
  }

  const brandTokens: string[] = [];
  const modelTokens: string[] = [];

  // Known two-token brands
  if (tokens[0] === "moto" && tokens[1] === "morini") {
    brandTokens.push(tokens.shift()!, tokens.shift()!);
  } else if (tokens[0] === "harley" && tokens[1] === "davidson") {
    brandTokens.push(tokens.shift()!, tokens.shift()!);
  } else {
    brandTokens.push(tokens.shift()!);
  }

  modelTokens.push(...tokens);

  return {
    brand: brandTokens.join(" "),
    model: modelTokens.join(" "),
  };
}

export type ResolvedRentalAsset = 
  | { type: "category_fallback"; category: string }
  | { type: "flattened_proxy"; canonicalSlug: string }
  | { type: "fuzzy_candidate"; canonicalSlug: string }
  | { type: "generic_fallback" };

/**
 * Resolves a rental into a canonical asset slug or category fallback.
 */
export function resolveRentalAsset(rental: Partial<Rental>): ResolvedRentalAsset {
  const rawId = rental?.id || rental?.slug || "";
  const brand = normalizeBrand(rental?.brand || "");
  const modelSlug = normalizeModel(rental?.model || "");

  if (modelSlug && FLATTENING_MAP[modelSlug]) {
    const target = FLATTENING_MAP[modelSlug];
    if (target.startsWith("category-")) {
      return { type: "category_fallback", category: target.replace("category-", "") };
    }
    return { type: "flattened_proxy", canonicalSlug: target };
  }

  if (brand && modelSlug) {
    return {
      type: "fuzzy_candidate",
      canonicalSlug: `${brand}-${modelSlug}`,
    };
  }

  if (rawId) {
    const parts = rawId.toLowerCase().split("-").filter(Boolean);
    if (parts.length >= 2) {
      const slugCandidate = `${parts[0]}-${parts[1]}`;
      return { type: "fuzzy_candidate", canonicalSlug: slugCandidate };
    }
  }

  return { type: "generic_fallback" };
}

export function resolveRentalBrandModel(rental: Partial<Rental>) {
  const resolved = resolveRentalAsset(rental);
  if (resolved.type === "category_fallback") {
    return { ...resolved, brand: "", model: "" };
  }

  const { brand, model } = slugToBrandModel((resolved as any).canonicalSlug || "");
  return { ...resolved, brand, model };
}
