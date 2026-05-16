import fs from 'fs';
let content = fs.readFileSync('frontend/rideratlas/src/features/rentals/utils/rentalFormatters.js', 'utf8');

const newUrlLogic = `function generate14CinematicUrl(brand, model) {
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
  // The database shows the URL structure for cinematic images is:
  // 14cinematic/brand/brand-model/1.webp
  return \`https://storage.googleapis.com/\${bucket}/14cinematic/\${b}/\${b}-\${m}/1.webp\`;
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

  // 1. SECONDARY: Deterministic guess to 14cinematic bucket (using .webp)
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const cleanUrl = generate14CinematicUrl(brand, model);

  // 2. PRIMARY SOURCE: Database studio images (highest accuracy)
  if (rental?.imageUrl) return rental.imageUrl;
  if (rental?.posterUrl) return rental.posterUrl;
  if (rental?.generatedImageUrl) return rental.generatedImageUrl;

  // 3. TERTIARY: Category splash fallback
  return cleanUrl || CATEGORY_MEDIA[String(rental?.category || "").toLowerCase()] || CATEGORY_MEDIA.default;
}`;

const startIndex = content.indexOf('function generate13CleanUrl');
const endIndex = content.lastIndexOf('}');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newUrlLogic + '\n\nexport { CATEGORY_PRICE_MAP, CATEGORY_MEDIA };\n';
  fs.writeFileSync('frontend/rideratlas/src/features/rentals/utils/rentalFormatters.js', content);
  console.log("Replacement successful");
} else {
  console.log("Could not find boundaries");
}
