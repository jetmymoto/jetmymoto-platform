import type { MediaAsset, MediaContext } from "../types";

export function checkContamination(asset: MediaAsset, context: MediaContext, section: string): { isRejected: boolean; rejectReason: string } {
  const { airportCode } = context;
  const assetAirportCodes = asset.airportCodes || asset.airport_codes || (asset.airportCode ? [asset.airportCode] : []);
  const assetRole = asset.visualRole || asset.visual_role || "";
  const isTheaterShared = assetRole === "theater_shared" || (asset.qualityTier || "").includes("collection_v1");

  // 1. Cross-airport contamination check
  const hasOtherAirport = assetAirportCodes.length > 0 && !assetAirportCodes.includes(airportCode);
  
  if (hasOtherAirport && !isTheaterShared) {
    return {
      isRejected: true,
      rejectReason: `Cross-airport contamination: asset belongs to ${assetAirportCodes.join(",")} but requested for ${airportCode}`
    };
  }

  // 2. Role specific strictness
  if (section === "hero" && assetRole !== "airport_hero" && !isTheaterShared) {
    if (!assetAirportCodes.includes(airportCode)) {
       return {
         isRejected: true,
         rejectReason: "Hero section: asset is not airport_hero or theater_shared"
       };
    }
  }

  if (section === "fleet" && assetRole === "airport_hero") {
    return {
      isRejected: true,
      rejectReason: "Fleet section: airport_hero assets are forbidden"
    };
  }

  if (section === "routes" && assetRole === "airport_hero" && !assetAirportCodes.includes(airportCode)) {
    return {
      isRejected: true,
      rejectReason: "Routes section: unrelated airport_hero assets are forbidden"
    };
  }

  return { isRejected: false, rejectReason: "" };
}
