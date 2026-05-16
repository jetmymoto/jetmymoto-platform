import fs from 'fs';
let content = fs.readFileSync('frontend/rideratlas/src/features/rentals/utils/rentalFormatters.js', 'utf8');

const newUrlLogic = `function generate13CleanUrl(brand, model) {
  if (!brand || !model) return null;
  const b = String(brand).toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  let m = String(model).toLowerCase();
  
  // Aggressive flattening for model names
  m = m.replace(/^([a-z])\\s+(\\d+)\\s+([a-z]+)/, "$1$2$3"); // R 1300 GS -> r1300gs
  m = m.replace(/^([a-z]+)\\s+(\\d+)\\s+([a-z]+)/, "$1$2$3"); // F 900 GS -> f900gs
  
  // Replace anything that is not alphanumeric with a hyphen
  m = m.replace(/[^a-z0-9]/g, '-');
  // Remove duplicate hyphens and trim
  m = m.replace(/-+/g, '-').replace(/(^-|-$)/g, '');

  const bucket = "movie-chat-factory.firebasestorage.app";
  return \`https://firebasestorage.googleapis.com/v0/b/\${bucket}/o/13clean%2F\${b}%2F\${m}%2F1.jpg?alt=media\`;
}

export function getRentalPosterUrl(rental, imageGraph) {
  if (imageGraph) {
    const selected = selectBestImage(imageGraph, {
      brand: rental?.brand,
      model: rental?.model,
      category: rental?.category,
      entityType: "rental",
    });
    if (selected?.storageUrl) return selected.storageUrl;
  }

  // 1. PRIMARY SOURCE: Database studio images (highest accuracy)
  if (rental?.imageUrl) return rental.imageUrl;
  if (rental?.posterUrl) return rental.posterUrl;
  if (rental?.generatedImageUrl) return rental.generatedImageUrl;

  // 2. SECONDARY: Deterministic guess to 13clean bucket
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  if (brand && model) {
    return generate13CleanUrl(brand, model);
  }

  // 3. TERTIARY: Category splash fallback
  return CATEGORY_MEDIA[String(rental?.category || "").toLowerCase()] || CATEGORY_MEDIA.default;
}`;

// We need to replace everything from `export function getRentalPosterUrl` to the end of the file, except the export { CATEGORY_PRICE_MAP, CATEGORY_MEDIA };
content = content.replace(
  /export function getRentalPosterUrl\([\s\S]*?CATEGORY_MEDIA\.default\s*\);\s*\}/,
  newUrlLogic
);

// Note: The previous regex might have missed generate13CleanUrl if it was defined before getRentalPosterUrl. Let's do a safer replace.
