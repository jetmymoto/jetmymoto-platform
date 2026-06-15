export type Rental = {
  id: string;
  slug: string;
  airport: string;
  operator: string;
  brand: string;
  model: string;
  imageUrl?: string;
  category: string;
  price_day: number;
  currency: string;
  one_way_enabled?: boolean;
  dropoff_airports?: string[];
  compatible_destinations?: string[];
  capabilities?: string[];
  videoUrl?: string;
  bikeName?: string;
  pricing?: {
    pricePerDay: number;
  };
};

export type RentalRailItem = {
  id: string;
  slug: string;
  airportCode: string;
  brand: string;
  model: string;
  displayName: string;
  classLabel: string;
  imageUrl: string | null;
  priceDay: number | null;
  priceLabel: string;
  availabilityLabel: string;
  isLiveInventory: boolean;
  isRepresentative: boolean;
  hasTrustedPricing: boolean;
  ctaLabel: string;
};
