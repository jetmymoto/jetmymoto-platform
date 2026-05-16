import missionMediaManifest from '@/data/missionMediaManifest.json';

/**
 * Returns the full media manifest for a given mission.
 */
export function getMissionMedia(missionSlug) {
  return missionMediaManifest[missionSlug] || null;
}

/**
 * Returns the geographic intelligence media (maps) for a mission.
 */
export function getGeographicIntelligenceMedia(missionSlug) {
  const media = getMissionMedia(missionSlug);
  return media ? media.geographicIntelligence : null;
}

/**
 * Returns the editorial media (videos, deployment shots) for a mission.
 */
export function getEditorialMedia(missionSlug) {
  const media = getMissionMedia(missionSlug);
  return media ? media.editorialMedia : null;
}

/**
 * Checks if a mission has all critical media assets.
 */
export function hasCriticalMissionMedia(missionSlug) {
  const media = getMissionMedia(missionSlug);
  if (!media) return false;
  return media.quality.missingCriticalAssets.length === 0;
}
