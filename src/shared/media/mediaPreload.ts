import { getPublicMediaUrl } from "./mediaUrl";

/**
 * Strategy: 
 * - Eagerly load the current visible hero.
 * - Preload ONLY the next 1 image in a sequence if applicable.
 * - Do not bulk preload galleries.
 */

export function preloadMedia(urls: (string | null | undefined)[]) {
  if (typeof window === 'undefined') return;

  // Preload first 3 images maximum
  const targets = urls.slice(0, 3).filter(Boolean) as string[];
  
  targets.forEach(url => {
    const publicUrl = getPublicMediaUrl(url);
    if (!publicUrl) return;

    const img = new Image();
    img.src = publicUrl;
  });
}

/**
 * Performance Debugger
 */
export function initMediaDebug() {
  if (import.meta.env.MODE === 'production') return;

  (window as any).__MEDIA_DEBUG__ = {
    heroLoadedAt: 0,
    imageCount: 0,
    eagerCount: 0,
    lazyCount: 0
  };
}

export function logHeroLoad() {
  if (typeof window === 'undefined' || !(window as any).__MEDIA_DEBUG__) return;
  (window as any).__MEDIA_DEBUG__.heroLoadedAt = performance.now();
}
