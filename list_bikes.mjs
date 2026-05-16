import fs from 'fs';

// Since rentals.js might use aliases or standard ES exports, we can parse it with regex for safety
// or try to import it. Let's try importing first.
const content = fs.readFileSync('frontend/rideratlas/src/features/rentals/data/rentals.js', 'utf8');

const brandMatches = [...content.matchAll(/brand:\s*["']([^"']+)["']/g)].map(m => m[1]);
const modelMatches = [...content.matchAll(/model:\s*["']([^"']+)["']/g)].map(m => m[1]);

// Wait, regex might desync if they aren't adjacent. 
// Let's do a block-by-block match.
const rentals = content.split('rental({');
const uniqueBikes = new Set();

rentals.forEach(block => {
  const brandMatch = block.match(/brand:\s*["']([^"']+)["']/);
  const modelMatch = block.match(/model:\s*["']([^"']+)["']/);
  
  if (brandMatch && modelMatch) {
    const brand = brandMatch[1].trim();
    const model = modelMatch[1].trim();
    // Normalize a bit for grouping
    const normalizedBrand = brand.toUpperCase() === "BMW" ? "BMW" : brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
    uniqueBikes.add(`${normalizedBrand} | ${model}`);
  }
});

const sortedBikes = Array.from(uniqueBikes).sort();
console.log(`Found ${sortedBikes.length} unique models:\\n`);
sortedBikes.forEach(bike => console.log(`- ${bike}`));
