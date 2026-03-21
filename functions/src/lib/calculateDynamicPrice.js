const PRICING_CONFIG = {
  baseFee: {
    short: 140,
    medium: 120,
    long: 100,
  },

  tiers: {
    short: {maxKm: 300, rate: 1.4},
    medium: {maxKm: 1200, rate: 1.1},
    long: {rate: 0.9},
  },

  minimumPrice: 180,
  globalMultiplier: 1.0,
};

function getDistanceTier(distanceKm) {
  if (distanceKm < PRICING_CONFIG.tiers.short.maxKm) return "short";
  if (distanceKm < PRICING_CONFIG.tiers.medium.maxKm) return "medium";
  return "long";
}

function calculateDynamicPrice(distanceKm, totalUnits) {
  if (distanceKm <= 0 || totalUnits <= 0) {
    throw new Error("PRICING_ERROR: Invalid inputs");
  }

  const tier = getDistanceTier(distanceKm);
  const rate = PRICING_CONFIG.tiers[tier].rate;
  const baseFee = PRICING_CONFIG.baseFee[tier];

  const rawPrice =
    (baseFee + distanceKm * rate * totalUnits) *
    PRICING_CONFIG.globalMultiplier;

  const finalPrice = Math.max(
      PRICING_CONFIG.minimumPrice,
      Math.ceil(rawPrice / 10) * 10,
  );

  console.log(
      `[PRICING] tier=${tier} distance=${distanceKm} units=${totalUnits} rate=${rate} base=${baseFee} final=${finalPrice}`,
  );

  return finalPrice;
}

module.exports = calculateDynamicPrice;
