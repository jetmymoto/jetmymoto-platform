import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://jetmymoto.com";
const BUILD_DATE = new Date().toISOString();

/**
 * GENERATE SITEMAP (LAYER 5 DOMINATION)
 * 
 * Objectives:
 * - Expose all Graph entities (Missions, Rentals, Routes, Operators)
 * - Smart deduplication & lastmod
 * - Scalable XML generation
 */
async function main() {
  console.log("🚀 Starting sitemap generation...");

  // TASK 1 — Imports (using dynamic import for ESM data files)
  const { RENTALS } = await import('../frontend/rideratlas/src/features/rentals/data/rentals.js');
  const { OPERATORS } = await import('../frontend/rideratlas/src/features/rentals/data/operators.js');
  const { GENERATED_RIDE_ROUTES } = await import('../frontend/rideratlas/src/features/routes/data/generatedRideRoutes.js');
  const { missions } = await import('../frontend/rideratlas/src/data/missions.js');
  
  // NEW IMPORTS FOR AIRPORTS AND DESTINATIONS
  const { AIRPORT_INDEX } = await import('../frontend/rideratlas/src/features/airport/network/airportIndex.js');
  const { RIDE_DESTINATIONS } = await import('../frontend/rideratlas/src/features/routes/data/rideDestinations.js');

  // Also import A2A_MISSIONS to ensure full coverage of A2A entities
  let A2A_MISSIONS = [];
  try {
    const a2aMod = await import('../frontend/rideratlas/src/features/routes/data/a2aMissions.js');
    A2A_MISSIONS = a2aMod.A2A_MISSIONS || [];
  } catch (e) {
    console.warn("⚠️ A2A_MISSIONS could not be loaded, skipping.");
  }

  // TASK 3 — Deduplication Layer
  const urlsByLoc = new Map();

  function addUrl(loc, priority = 0.5, entity = {}) {
    const fullLoc = `${BASE_URL}${loc}`;
    if (urlsByLoc.has(fullLoc)) return;

    // TASK 4 — Smart lastmod (use full ISO string as requested)
    const lastmod = entity.updatedAt ? new Date(entity.updatedAt).toISOString() : BUILD_DATE;

    // TASK 5 — XML Output (Include daily changefreq)
    const xmlSnippet = `  <url>
    <loc>${fullLoc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
    
    urlsByLoc.set(fullLoc, xmlSnippet);
  }

  // 0. Home Page
  addUrl('/', 1.0);

  // 0.1 Airports (TOP/INTENT funnel) - Priority: 0.85
  Object.values(AIRPORT_INDEX || {}).forEach(a => {
    const code = a.code || a.id;
    if (code) addUrl(`/airport/${code.toUpperCase()}`, 0.85, a);
  });

  // 0.2 Destinations (TOP funnel) - Priority: 0.85
  Object.values(RIDE_DESTINATIONS || {}).forEach(d => {
    const slug = d.slug || d.id;
    if (slug) addUrl(`/destination/${slug.toLowerCase()}`, 0.85, d);
  });

  // 1. A2A Missions (/a2a/:slug) - Priority: 0.9
  [...missions, ...A2A_MISSIONS].forEach(m => {
    const slug = m.slug || m.id;
    if (slug) addUrl(`/a2a/${slug}`, 0.9, m);
  });

  // 2. Rentals (NEW — CRITICAL) (/rentals/:airport/:slug) - Priority: 0.9
  Object.values(RENTALS).forEach(r => {
    const airport = (r.airport || "").toLowerCase();
    const slug = r.slug || r.id;
    if (airport && slug) addUrl(`/rentals/${airport}/${slug}`, 0.9, r);
  });

  // 3. Routes (/route/:slug) - Priority: 0.8
  GENERATED_RIDE_ROUTES.forEach(route => {
    if (route.slug) addUrl(`/route/${route.slug}`, 0.8, route);
  });

  // 4. Operators (/operators/:id) - Priority: 0.7
  Object.values(OPERATORS).forEach(op => {
    const id = op.id || op.slug;
    if (id) addUrl(`/operators/${id}`, 0.7, op);
  });

  // TASK 6 — File Output (Chunking if > 50k)
  const MAX_URLS_PER_FILE = 49000;
  const allUrls = Array.from(urlsByLoc.values());
  const outputDir = path.resolve(__dirname, '../frontend/rideratlas/public');
  
  if (allUrls.length <= MAX_URLS_PER_FILE) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls.join('\n')}\n</urlset>`;
    const outputPath = path.join(outputDir, 'sitemap.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');
    console.log(`✅ Sitemap successfully generated at: ${outputPath}`);
  } else {
    // Generate sitemap index and chunks
    console.log(`⚠️ More than ${MAX_URLS_PER_FILE} URLs. Splitting into multiple files.`);
    const chunks = Math.ceil(allUrls.length / MAX_URLS_PER_FILE);
    const sitemapFiles = [];
    
    for (let i = 0; i < chunks; i++) {
      const chunkUrls = allUrls.slice(i * MAX_URLS_PER_FILE, (i + 1) * MAX_URLS_PER_FILE);
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chunkUrls.join('\n')}\n</urlset>`;
      const filename = `sitemap-${i + 1}.xml`;
      const outputPath = path.join(outputDir, filename);
      fs.writeFileSync(outputPath, xml, 'utf8');
      sitemapFiles.push(`${BASE_URL}/${filename}`);
      console.log(`✅ Generated chunk: ${outputPath}`);
    }

    const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles.map(file => `  <sitemap>\n    <loc>${file}</loc>\n    <lastmod>${BUILD_DATE}</lastmod>\n  </sitemap>`).join('\n')}
</sitemapindex>`;
    
    const indexPath = path.join(outputDir, 'sitemap.xml');
    fs.writeFileSync(indexPath, indexXml, 'utf8');
    console.log(`✅ Sitemap index successfully generated at: ${indexPath}`);
  }

  console.log(`Total unique URLs: ${urlsByLoc.size}`);

  // TASK 8 — Google Ping (Post-build)
  try {
    const pingUrl = `https://www.google.com/ping?sitemap=${BASE_URL}/sitemap.xml`;
    console.log(`📡 Triggering Google Ping: ${pingUrl}`);
    const res = await fetch(pingUrl);
    console.log(`📬 Google Ping Status: ${res.status} ${res.statusText}`);
  } catch (err) {
    console.log(`⚠️ Google Ping failed (expected in local environments): ${err.message}`);
  }
}

main().catch(err => {
  console.error("❌ Sitemap Generation Failed:", err);
  process.exit(1);
});
