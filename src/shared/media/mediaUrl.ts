/**
 * Converts gs:// paths to public browser-usable URLs.
 * Sanitizes and handles potential object-object corruption.
 */
export function getPublicMediaUrl(gcsPath: string | null | undefined): string | null {
  if (!gcsPath) return null;

  // If it's already a URL, return it
  if (gcsPath.startsWith('http') || gcsPath.startsWith('/')) {
    if (gcsPath.includes('[object Object]')) return null;
    return gcsPath;
  }

  if (gcsPath.startsWith('gs://')) {
    const parts = gcsPath.replace('gs://', '').split('/');
    const bucket = parts[0].trim().toLowerCase();
    const path = parts.slice(1).join('/');
    return `https://storage.googleapis.com/${bucket}/${path}`;
  }

  // Fallback if it's just a path without gs://
  return `https://storage.googleapis.com/movie-chat-factory.firebasestorage.app/${gcsPath}`;
}
