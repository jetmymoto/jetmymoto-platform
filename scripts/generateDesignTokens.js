const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '..', 'data', 'firecrawl_harvests', 'luxury_brand_dna.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'shared', 'designTokens.js');

if (!fs.existsSync(INPUT_PATH)) {
  console.error(`[Error] Input file not found: ${INPUT_PATH}`);
  console.log('Run `npm run harvest:branding` first.');
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'));

const colorFreq = {};
const fontFreq = {};

// Aggregate frequencies
rawData.forEach(brand => {
  if (brand.primary_colors) {
    brand.primary_colors.forEach(color => {
      const c = color.toUpperCase();
      colorFreq[c] = (colorFreq[c] || 0) + 1;
    });
  }
  if (brand.font_families) {
    brand.font_families.forEach(font => {
      const f = font.toLowerCase().replace(/['"]/g, '').trim();
      fontFreq[f] = (fontFreq[f] || 0) + 1;
    });
  }
});

// Helper: Determine if a hex color is grayscale
const isGrayscale = (hex) => {
  if (hex.length !== 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // If the RGB values are very close to each other, it's grayscale
  return Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
};

const colors = Object.keys(colorFreq).sort((a, b) => colorFreq[b] - colorFreq[a]);
const bases = colors.filter(isGrayscale);
const accents = colors.filter(c => !isGrayscale(c));

// Base selection logic
const primary = bases.length > 0 ? bases[0] : '#000000';
const background = bases.length > 1 ? bases[1] : '#FFFFFF';
// Pick the most common non-grayscale color (usually a gold/warm tone from luxury brands)
const accent = accents.length > 0 ? accents[0] : '#DAA520';

// Font classification logic
const serifKeywords = ['serif', 'georgia', 'times', 'playfair', 'display'];
const sansKeywords = ['sans', 'arial', 'helvetica', 'roboto', 'verdana'];

let topSerif = "Serif";
let topSans = "Sans-serif";
let maxSerif = 0;
let maxSans = 0;

Object.entries(fontFreq).forEach(([font, count]) => {
  const isSansMatch = sansKeywords.some(k => font.includes(k));
  const isSerifMatch = serifKeywords.some(k => font.includes(k));

  if (isSansMatch) {
    if (count > maxSans) { topSans = font; maxSans = count; }
  } else if (isSerifMatch) {
    if (count > maxSerif) { topSerif = font; maxSerif = count; }
  } else {
    // If it doesn't clearly match keywords, fallback based on typical luxury defaults
    if (count > maxSerif && font.includes('neue')) {
        topSans = font; maxSans = count;
    }
  }
});

const formatFont = (f) => f.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const designTokens = `// Auto-generated Luxury Design Tokens
// Engine: Tokenization Aggregator
// Source: data/firecrawl_harvests/luxury_brand_dna.json

export const tokens = {
  colors: {
    primary: "${primary}",
    background: "${background}",
    accent: "${accent}"
  },
  fonts: {
    heading: "${formatFont(topSerif)}",
    body: "${formatFont(topSans)}"
  },
  spacing: {
    section: "80px",
    container: "1200px"
  }
};
`;

fs.writeFileSync(OUTPUT_PATH, designTokens);
console.log(`[Tokenization Engine] ✅ Design tokens aggregated and generated at: ${OUTPUT_PATH}`);
