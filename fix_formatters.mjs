import fs from 'fs';
let content = fs.readFileSync('frontend/rideratlas/src/features/rentals/utils/rentalFormatters.js', 'utf8');

const newUrlLogic = `function generate13CleanUrl(brand, model) {
  if (!brand || !model) return null;
  const b = String(brand).toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  let m = String(model).toLowerCase();
  
  m = m.replace(/^([a-z])\\s+(\\d+)\\s+([a-z]+)/, "$1$2$3");
  m = m.replace(/^([a-z]+)\\s+(\\d+)\\s+([a-z]+)/, "$1$2$3");
  m = m.replace(/[\\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');

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

  // Use the 13clean deterministic mapping FIRST
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const cleanUrl = generate13CleanUrl(brand, model);

  return (
    rental?.generatedImageUrl ||
    rental?.posterUrl ||
    rental?.imageUrl ||
    cleanUrl ||
    CATEGORY_MEDIA[String(rental?.category || "").toLowerCase()] ||
    CATEGORY_MEDIA.default
  );
}`;

content = content.replace(
  /export function getRentalPosterUrl\([\s\S]*?CATEGORY_MEDIA\.default\s*\);\s*\}/,
  newUrlLogic
);

fs.writeFileSync('frontend/rideratlas/src/features/rentals/utils/rentalFormatters.js', content);
