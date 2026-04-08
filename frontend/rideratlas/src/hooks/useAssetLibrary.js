import { useState, useEffect } from "react";
import { subscribeToAssetLibraryEntry } from "../services/assetLibraryService";

/**
 * Hook to manage asset_library lifecycle for a given entity.
 * Handles: pending -> placeholder, processing -> source, ready -> generated, error -> fallback.
 * @param {string} entityType 
 * @param {string} entityId 
 * @param {string} fallbackUrl - The original/source image URL
 * @returns {Object} - { assets, status, currentImage, caption }
 */
export function useAssetLibrary(entityType, entityId, fallbackUrl) {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityType || !entityId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToAssetLibraryEntry(entityType, entityId, (data) => {
      setEntry(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [entityType, entityId]);

  // Derived state based on VAF Status Rules:
  // pending -> placeholder image
  // processing -> source image
  // ready -> generated asset
  // error -> fallback

  const status = entry?.status || "pending";
  const assets = entry?.assets || {};
  const primaryAsset = entry?.primaryAsset || "hero";

  let currentImage = fallbackUrl;
  let caption = "";
  let alt = "";

  if (status === "ready" && assets[primaryAsset]) {
    currentImage = assets[primaryAsset].imageUrl;
    caption = assets[primaryAsset].caption;
    alt = assets[primaryAsset].alt;
  } else if (status === "processing") {
    // If we had a source image from the job, we'd use it.
    // For now, fallback is the source.
    currentImage = fallbackUrl;
  } else if (status === "pending") {
    // Show a low-res or generic placeholder
    currentImage = fallbackUrl; // In a real scenario, use a specific placeholder
  }

  return {
    assets,
    status,
    currentImage,
    caption,
    alt,
    loading
  };
}
