import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { destinationsWithCoords } from "./destinations.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TELEMETRY_DIR = path.resolve(__dirname, "../../data/route-pipeline/01-telemetry");
const POI_DIR = path.resolve(__dirname, "../../data/route-pipeline/02-pois");
const OUTPUT_DIR = path.resolve(__dirname, "../../data/route-pipeline/03-enriched");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJsonSafe(filepath) {
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, "utf8"));
}

async function main() {
  ensureDir(OUTPUT_DIR);
  const destinations = destinationsWithCoords();

  console.log(`[Stage 3] Enriching ${destinations.length} destinations via MOCK-CLAUDE (Testing Mode)`);
  console.log(`[Stage 3] Output:  ${OUTPUT_DIR}\n`);

  let processed = 0;

  for (const dest of destinations) {
    const outFile = path.join(OUTPUT_DIR, `${dest.slug}.json`);
    const pois = readJsonSafe(path.join(POI_DIR, `${dest.slug}.json`));

    if (!pois || pois.poi_count === 0) {
      // If we don't have POIs, skip
      continue;
    }

    // Mock the Claude LLM response
    const premium_pois = (pois.pois || []).map(p => {
      let cinematicDesc = "";
      let riderTip = "";
      const cat = (p.category || "").toUpperCase();

      if (cat === "CAFE" || p.name.toLowerCase().includes("cafe")) {
        cinematicDesc = `Transforming the standard coffee stop into a premium staging ground, ${p.name} serves as the ultimate espresso recovery zone. Surrounded by high-performance machines, riders converge here to decode the morning's telemetric feedback over flawless Italian roasts.`;
        riderTip = "Park directly in the line of sight from the terrace; the outdoor seating offers perfect visibility of your machine while you recharge.";
      } else if (cat === "FUEL" || p.name.toLowerCase().includes("fuel") || p.name.toLowerCase().includes("station")) {
        cinematicDesc = `More than just a pump, ${p.name} acts as a vital tactical refueling node nestled within the demanding alpine theater. This essential logistics point ensures your high-compression engine receives the premium octane required to conquer the looming ascents.`;
        riderTip = "Pumps here occasionally reject international cards at the terminal; keep small Euro notes tucked in your tank bag for seamless transactions.";
      } else if (cat === "SCENIC_POINT" || cat === "MOUNTAIN_PASS" || p.name.toLowerCase().includes("col")) {
        cinematicDesc = `Arrive at ${p.name}, a masterclass in visual majesty where the flawless tarmac seemingly drops into the abyss. This high-altitude vantage point commands absolute reverence, rewarding precise cornering with sweeping panoramas of the glacial valley.`;
        riderTip = "The crosswinds at the summit can be aggressive. Lean your bike into the prevailing wind on the side stand and avoid parking on loose gravel shoulders.";
      } else if (cat === "RESTAURANT" || cat === "GASTRO") {
        cinematicDesc = `Elevating the mid-ride culinary experience, ${p.name} offers a distinguished gastronomic intermission. Here, riders trade their helmets for regional delicacies in a refined atmosphere, perfectly resetting before the next leg of the journey.`;
        riderTip = "Reservations are often required during peak touring season; call ahead and request a table with clear sightlines to the motorcycle parking area.";
      } else {
        cinematicDesc = `Step into the historic orbit of ${p.name}. This cultural landmark demands a momentary pause from the throttle, offering a deeply atmospheric slice of local heritage amidst the relentless riding.`;
        riderTip = "Allocate at least 30 minutes for exploration; leave your heavy gear locked in the panniers if possible.";
      }

      return {
        name: p.name,
        cinematic_description: cinematicDesc,
        rider_tip: riderTip
      };
    });

    const result = {
      destination_slug: dest.slug,
      destination_name: dest.name,
      enriched_at: new Date().toISOString(),
      provider: "mock-claude",
      model: "claude-sonnet-4-mock",
      cinematic_pitch: `The ${dest.name} represent the absolute zenith of global motorcycle touring. Here, immaculate ribbons of alpine tarmac weave through dramatic monolithic peaks and plunging glacial valleys. This is not just a ride; it is a masterclass in elevation and precision engineering.`,
      ride_character: "A relentless, intoxicating rhythm of tight hairpins and sweeping high-speed arcs set against a backdrop of sheer vertical granite.",
      best_season: "Late June through September — the high passes have shed their snowpack and the valley floors are in full, vibrant bloom.",
      premium_pois: premium_pois,
      // Include prompt for visibility of the new rules
      _prompt_used: `You must deeply analyze the POI's 'Type' or 'Category'. DO NOT use a generic luxury template. If the POI is a CAFE, describe it as a premium staging ground or espresso recovery zone. If it is FUEL, describe it as a tactical refueling node. If it is a SCENIC_POINT, focus on the visual majesty and tarmac quality. Adapt the vocabulary to the specific location. The 'Rider Tip' must be highly specific to the category. A fuel tip should be about octane levels or payment methods. A cafe tip should be about parking visibility or local specialties.`
    };

    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    console.log(`  ✓ ${dest.name} (${dest.slug}) MOCKED enriched`);
    processed++;
  }

  console.log(`\n[Stage 3] Complete: ${processed} enriched (MOCK MODE)`);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
