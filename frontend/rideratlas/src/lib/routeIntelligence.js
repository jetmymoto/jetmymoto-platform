const ROUTES = [
  {
    from: "Munich",
    to: "Alps",
    basePrice: 1200,
    distance: 300,
    activePool: true,
    riders: 3
  },
  {
    from: "Nice",
    to: "Dolomites",
    basePrice: 1400,
    distance: 500,
    activePool: false,
    riders: 0
  },
  {
    from: "Barcelona",
    to: "Pyrenees",
    basePrice: 900,
    distance: 200,
    activePool: true,
    riders: 2
  }
];

export function getRouteIntelligence(from, to) {
  if (!from || !to) return null;

  const match = ROUTES.find(
    r =>
      from.toLowerCase().includes(r.from.toLowerCase()) &&
      to.toLowerCase().includes(r.to.toLowerCase())
  );

  if (!match) {
    return {
      status: "unknown",
      soloPrice: 1500, // Normalized key
      sharedPrice: 1500,
      suggestion: "New route — pricing will be optimized after submission"
    };
  }

  // Simple optimization math for the MVP shared price estimate
  const sharedPrice = Math.round(match.basePrice / Math.max(1, match.riders || 1));

  return {
    status: "active",
    distance: match.distance,
    soloPrice: match.basePrice,
    sharedPrice,
    riders: match.riders,
    hasPool: match.activePool
  };
}
