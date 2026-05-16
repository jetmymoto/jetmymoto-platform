import { useState, useEffect } from 'react';

let cachedManifest = null;

export function usePSeoManifest() {
  const [manifest, setManifest] = useState(cachedManifest);
  const [loading, setLoading] = useState(!cachedManifest);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedManifest) {
      setManifest(cachedManifest);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('/data/generated_pages/entity_page_manifest.json')
      .then(res => {
        if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
        return res.json();
      })
      .then(data => {
        cachedManifest = data;
        setManifest(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load pSEO manifest:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return { manifest, loading, error };
}
