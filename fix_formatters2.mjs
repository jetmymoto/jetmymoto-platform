import fs from 'fs';
let content = fs.readFileSync('frontend/rideratlas/src/features/rentals/utils/rentalFormatters.js', 'utf8');

const newUrlLogic = `export function getRentalPosterUrl(rental, imageGraph) {
  if (imageGraph) {
    const selected = selectBestImage(imageGraph, {
      brand: rental?.brand,
      model: rental?.model,
      category: rental?.category,
      entityType: "rental",
    });
    if (selected?.storageUrl) return selected.storageUrl;
  }

  // Use the 13clean deterministic mapping as PRIMARY SOURCE OF TRUTH
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const cleanUrl = generate13CleanUrl(brand, model);

  return (
    cleanUrl ||
    rental?.generatedImageUrl ||
    rental?.posterUrl ||
    rental?.imageUrl ||
    CATEGORY_MEDIA[String(rental?.category || "").toLowerCase()] ||
    CATEGORY_MEDIA.default
  );
}`;

content = content.replace(
  /export function getRentalPosterUrl\([\s\S]*?CATEGORY_MEDIA\.default\s*\);\s*\}/,
  newUrlLogic
);

fs.writeFileSync('frontend/rideratlas/src/features/rentals/utils/rentalFormatters.js', content);
