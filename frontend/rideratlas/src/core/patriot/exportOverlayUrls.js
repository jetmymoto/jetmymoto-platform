// Exports published overlay URLs for sitemap consumption.
// Single source of truth — replaces raw RENTALS iteration in generateSitemap.

export function getPublishedOverlayUrls(patriotOverlays) {
  const urls = [];

  for (const overlay of Object.values(patriotOverlays || {})) {
    if (overlay.publish?.status !== "published") continue;
    if (overlay.publish?.sitemap === false) continue;

    const path = overlay.seo?.canonicalPath;
    if (!path) continue;

    urls.push({
      path,
      lastmod: overlay.publish?.lastModified || null,
      changefreq: "weekly",
      priority: overlay.overlayType === "intent-airport" ? 0.7 : 0.6,
    });
  }

  return urls;
}
