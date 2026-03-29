import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { destinationsWithCoords } from "./destinations.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INTERNAL_DB_PATH = path.resolve(__dirname, "../../frontend/rideratlas/src/features/poi/poiIndex.json");
const TARGETS_PATH = path.resolve(__dirname, "../../data/target_alpine_pois.json");
const OUTPUT_DIR = path.resolve(__dirname, "../../data/route-pipeline/02-pois");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function normalize(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function processInternalPois() {
  ensureDir(OUTPUT_DIR);
  const destinations = destinationsWithCoords();

  console.log(`[Stage 2] Reading internal proprietary database: ${INTERNAL_DB_PATH}`);
  console.log(`[Stage 2] Reading target Alpine POIs: ${TARGETS_PATH}`);
  
  if (!fs.existsSync(INTERNAL_DB_PATH)) {
    console.error(`[Stage 2] Database file not found at ${INTERNAL_DB_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(TARGETS_PATH)) {
    console.error(`[Stage 2] Target Alpine POIs file not found at ${TARGETS_PATH}. Run Stage 2a first.`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(INTERNAL_DB_PATH, "utf8"));
  const targetsData = JSON.parse(fs.readFileSync(TARGETS_PATH, "utf8"));
  
  // Normalize the targets so we can fuzzy match them without whitespace/special chars issues
  const targetNames = targetsData.target_names || [];
  const normalizedTargets = targetNames.map(n => normalize(n)).filter(n => n.length > 3);

  let validPois = [];
  let matchCount = 0;

  // Simple fuzzy matcher
  function isMatch(poiName) {
    const norm = normalize(poiName);
    if (!norm) return false;
    
    // Direct match check
    if (normalizedTargets.includes(norm)) return true;
    
    // Bidirectional substring match (the POI name contains the target, or vice versa)
    // E.g. "Passo dello Stelvio" vs "Stelvio Pass" (well, that wouldn't match via substring, but "Stelvio" would)
    for (const t of normalizedTargets) {
      if (t.length > 4 && (norm.includes(t) || t.includes(norm))) return true;
    }
    return false;
  }
  
  for (const [key, poi] of Object.entries(rawData)) {
    const destinationSlug = poi.destination || poi.region?.toLowerCase();
    
    // Only map to destinations we're actually processing right now
    if (!destinationSlug || !destinations.find(d => d.slug === destinationSlug)) continue;
    
    // THE INTERSECTION: High-value check based on the target scraped list
    if (isMatch(poi.name)) {
       validPois.push({ key, ...poi, destinationSlug });
       matchCount++;
    }
  }

  const groupedPois = {};
  destinations.forEach(dest => {
    groupedPois[dest.slug] = [];
  });

  for (const poi of validPois) {
    const tagsString = Array.isArray(poi.tags) ? poi.tags.join(", ") : (poi.tags || "");
    const rawContext = [poi.description, tagsString].filter(Boolean).join(" | ");

    const mappedPoi = {
      global_id: poi.slug || poi.key,
      name: poi.name,
      lat: poi.lat,
      lng: poi.lng,
      nearest_airport: poi.nearest_airport,
      category: poi.category,
      raw_context: rawContext,
    };

    groupedPois[poi.destinationSlug].push(mappedPoi);
  }

  let processedFiles = 0;
  for (const dest of destinations) {
    const outFile = path.join(OUTPUT_DIR, `${dest.slug}.json`);
    const poisForDest = groupedPois[dest.slug];

    const result = {
      destination_slug: dest.slug,
      destination_name: dest.name,
      sources: ["internal_proprietary_db", "scraped_target_list"],
      processed_at: new Date().toISOString(),
      poi_count: poisForDest.length,
      pois: poisForDest,
    };

    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    if (poisForDest.length > 0) {
      console.log(`  ✓ ${dest.name} (${dest.slug}): ${poisForDest.length} cross-referenced POIs exported`);
    }
    processedFiles++;
  }

  console.log(`\n[Stage 2] Complete: ${processedFiles} destinations processed.`);
  console.log(`[Stage 2] Cross-Reference Results: Exactly ${matchCount} matches between the Alpine targets and our 50,000 POI database!`);
}

processInternalPois();