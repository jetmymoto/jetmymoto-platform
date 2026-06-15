export type Airport = {
  code: string;
  name?: string;
  city: string;
  country: string;
  theater?: string;
  archetype?: string;
  region?: string;
  heroImage?: string;
  description?: string;
  motto?: string;
  subline?: string;
  subheadline?: string;
  [key: string]: any; // Allow for extra metadata
};

export type Route = {
  slug: string;
  title?: string;
  kicker?: string;
  description?: string;
  image?: string;
  insertion_airport?: string;
  extraction_airport?: string;
  duration?: string;
  distance?: string;
  [key: string]: any; // Allow for extra metadata
};

export type Mission = {
  slug: string;
  title?: string;
  theater?: string;
  cinematic_pitch?: string;
  insertion_airport?: string;
  extraction_airport?: string;
  [key: string]: any; // Allow for extra metadata
};

export type NetworkGraph = {
  source: 'MOCK' | 'REAL_SHARDS';
  airports: Record<string, Airport>;
  routes: Record<string, Route>;
  missions: Record<string, Mission>;
  destinations: Record<string, any>;
  clusters: Record<string, any>;
  theaters: Record<string, any>;
  routesByAirport: Record<string, string[]>;
  neighborsByAirport: Record<string, string[]>;
  missionsByInsertion: Record<string, string[]>;
  missionsByExtraction: Record<string, string[]>;
};
