import { RENTALS } from "../data/rentals";
import type { Rental, RentalRailItem } from "../types";
import { 
  getRentalBrand, 
  getRentalModelName, 
  getRentalPrice, 
  formatRentalPrice, 
  getRentalPosterUrl 
} from "../utils/formatters";

export function getRentalRailItemsByAirport(airportCode: string): RentalRailItem[] {
  const airportRentals = Object.values(RENTALS).filter(r => r.airport === airportCode);
  
  return airportRentals.map(adaptRentalToRailItem);
}

function adaptRentalToRailItem(rental: Rental): RentalRailItem {
  const price = getRentalPrice(rental);
  const isPlaceholderPrice = price === 21;
  const isMissingPrice = !price || price === 0;
  const hasTrustedPricing = !isPlaceholderPrice && !isMissingPrice;

  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const imageUrl = getRentalPosterUrl(rental);

  return {
    id: rental.id,
    slug: rental.slug,
    airportCode: rental.airport,
    brand,
    model,
    displayName: `${brand} ${model}`,
    classLabel: hasTrustedPricing ? "Available / Live class" : "Representative class",
    imageUrl,
    priceDay: hasTrustedPricing ? price : null,
    priceLabel: hasTrustedPricing ? `From ${formatRentalPrice(rental)}/day` : "Quote required",
    availabilityLabel: hasTrustedPricing ? "Available" : "Subject to confirmation",
    isLiveInventory: hasTrustedPricing,
    isRepresentative: !hasTrustedPricing,
    hasTrustedPricing,
    ctaLabel: hasTrustedPricing ? "Book Now" : "Request Quote",
  };
}
