import { useState, useEffect } from 'react';
import { loadGraph } from '../runtime/graphLoader';
import type { NetworkGraph } from '../types';

export function useGraph() {
  const [graph, setGraph] = useState<NetworkGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    loadGraph()
      .then(data => {
        if (mounted) {
          setGraph(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, []);

  return { graph, loading, error };
}
