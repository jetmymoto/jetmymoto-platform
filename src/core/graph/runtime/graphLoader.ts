import type { NetworkGraph } from '../types';

let graphCache: NetworkGraph | null = null;
let loadPromise: Promise<NetworkGraph> | null = null;

/**
 * Asynchronously loads the network graph from the public data endpoint.
 * Implements a singleton cache to ensure only one fetch occurs.
 */
export async function loadGraph(): Promise<NetworkGraph> {
  if (graphCache) return graphCache;
  if (loadPromise) return loadPromise;

  loadPromise = fetch('/data/coreGraph.json')
    .then(async res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch graph data: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      // Normalize to NetworkGraph format
      graphCache = {
        source: 'REAL_SHARDS',
        airports: data.airports || {},
        routes: data.routes || {},
        missions: data.missions || {},
        destinations: data.destinations || {},
        clusters: data.clusters || {},
        theaters: data.theaters || {},
        routesByAirport: data.routesByAirport || {},
        neighborsByAirport: data.neighborsByAirport || {},
        missionsByInsertion: data.missionsByInsertion || {},
        missionsByExtraction: data.missionsByExtraction || {}
      } as NetworkGraph;
      
      return graphCache;
    })
    .catch(err => {
      loadPromise = null; // Allow retry on failure
      throw err;
    });

  return loadPromise;
}

/**
 * Returns the graph synchronously if it has already been loaded.
 */
export function getCachedGraph(): NetworkGraph | null {
  return graphCache;
}
