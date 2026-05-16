import fs from 'fs';
let content = fs.readFileSync('frontend/rideratlas/src/features/rentals/components/RentalCard.jsx', 'utf8');

// Ensure CATEGORY_MEDIA is imported
if (!content.includes('CATEGORY_MEDIA')) {
  content = content.replace(
    'getRentalPosterUrl,\n} from "@/features/rentals/utils/rentalFormatters";',
    'getRentalPosterUrl,\n  CATEGORY_MEDIA,\n} from "@/features/rentals/utils/rentalFormatters";'
  );
}

// Update the onError handler
const newOnError = `onError={(e) => {
            const fallbackUrl = CATEGORY_MEDIA[String(rental?.category || "").toLowerCase()] || CATEGORY_MEDIA.default;
            if (e.target.src !== fallbackUrl) {
              e.target.src = fallbackUrl;
            }
          }}`;

content = content.replace(
  /onError=\{\(e\) => \{[\s\S]*?\}\s*\}\}/,
  newOnError
);

fs.writeFileSync('frontend/rideratlas/src/features/rentals/components/RentalCard.jsx', content);
