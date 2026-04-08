/**
 * a2aNarrativeIntel.js — Iron Legion Mission Dossiers
 *
 * Seeded editorial narratives for the 7 Phase-2 Launch Blitz corridors.
 * Shape matches the output of scripts/05-harvestA2ANarratives.mjs.
 *
 * When the harvest script runs live (requires SERPAPI_KEY + GEMINI_API_KEY),
 * its output at data/a2a_narratives_enriched.json should be synced here to
 * replace the seeded content with AI-enriched Iron Legion narrator copy.
 *
 * Used by: NarratorSpotlight.jsx
 */

export const A2A_NARRATIVE_INTEL = [
  // ── CDG → MAD — Trans-Pyrenean Price Killer ────────────────────────────────
  {
    slug: "cdg-to-mad-iberian-corridor",
    cinematic_pitch_enhanced:
      "Deploy from Charles de Gaulle Ring Road, track south on the N10 corridor through the Loire basin. Six hundred kilometres in, the Pyrenean wall announces itself — the Col du Somport at 1,632m is the axis of this corridor. South face: ambient temperature climbs 30°C in 40km. The AP-15 drops you into Aragon, the Ebro valley follows, Madrid ring-road extraction via the M-30. 1,064km. Fleet rebalancing at 35% below standard market rate. This is the Price Killer flagship — operators need hardware in Iberia, and you ride the scenic line through the highest pass in the Western Pyrenees.",
    highlights_enriched: [
      "Col du Somport — 1,632m summit, 12% eastern approach gradient, 8km sustained climb from Urdós",
      "N10 Loire Corridor — 340km fastest French trunk road before the mountain commitment",
      "AP-15 Aragon Descent — 18km of 6% sustained gradient, 300m elevation drop through flowing sweepers",
      "M-30 Madrid Ring — urban extraction infrastructure, DGT speed enforcement, signed to Barajas",
    ],
    difficulty_rating: 3,
    terrain_tags: ["pyrenean-high-alpine", "highway-transit", "urban-extraction", "altitude-pass"],
    hardware_recommendation:
      "BMW R 1300 GS — 21-inch front wheel and 210mm suspension travel handles Pyrenean chip-seal mid-corner irregularities. 105Nm torque at 6,750rpm sustains 120kph cruise on the 1,064km run without fatigue.",
    sensory_anchor:
      "Summit air at 1,632m bites through the visor. The asphalt transitions from smooth French tarmac to Pyrenean chip-seal in 400 metres. Then the col opens south — 30°C warmer, 40km below, the Ebro plain at your feet.",
    source: "field-intel",
  },

  // ── MXP → VIE — Alpine to Imperial ────────────────────────────────────────
  {
    slug: "mxp-to-vie-alpine-eastward",
    cinematic_pitch_enhanced:
      "Extract north-east from Milano Malpensa, clear the A8 to Varese, cross the Swiss border at Gaggiolo. The Brenner Autobahn peaks at 1,374m — motorway-grade infrastructure through the highest rail-accessible Alpine crossing in Europe. East of Innsbruck the valley deepens. Inn River runs alongside you for 80km before the Austrian plateau opens east toward Vienna. Ringstrasse extraction at the end. 656km of Alpine transit. Milan operators need hardware in Vienna; you cross the spine of Europe at altitude while they clear the rental slot.",
    highlights_enriched: [
      "Brenner Pass (Passo del Brennero) — 1,374m summit, A22/A13 motorway-grade, Europa Bridge at 190m deck height",
      "Inn Valley Corridor — 140km of 600-800m elevation, outstanding sight lines, consistent surface quality",
      "Innsbruck Bypass — urban technical section, 640m elevation, significant crosswind exposure from valley gap",
      "Vienna Ringstrasse Approach — imperial boulevard extraction, 8-lane infrastructure, structured urban arrival",
    ],
    difficulty_rating: 2,
    terrain_tags: ["alpine-transit", "motorway-high-altitude", "valley-corridor", "urban-arrival"],
    hardware_recommendation:
      "BMW F 750 GS — 800cc parallel-twin, 19-inch front wheel, 770mm seat height. The 798cc motor sustains 140kph Autobahn cruise without strain while keeping range to 400km between stops on the 656km run.",
    sensory_anchor:
      "Brenner summit in April: -2°C ambient at 1,374m, thermal layer mandatory. The parallel-twin resonates off tunnel concrete on the Europa Bridge approach. Then the Austrian valley opens below — warmer, wider, faster.",
    source: "field-intel",
  },

  // ── OSL → CPH — Nordic Coast ───────────────────────────────────────────────
  {
    slug: "osl-to-cph-nordic-coast",
    cinematic_pitch_enhanced:
      "Deploy south from Oslo Gardermoen on the E6, clear Østfold county to the Swedish border. The E6 Gothenburg bypass marks the mid-point at 300km. The E20 carries you across Skåne's agricultural plateau — Swedish granite flattening into Danish clay. The Øresund Bridge crossing at 60kph enforced limit: 8km of open Baltic Ocean exposure, no windbreak, European mainland visible to the south. Copenhagen extraction via the E20 ring system. 516km of Scandinavian corridor geometry. Oslo operators reposition hardware to the Danish capital; you ride the most architecturally dramatic bridge crossing in Europe.",
    highlights_enriched: [
      "E6 Østfold Corridor — 120km of fast Norwegian 2-lane, 90kph limit, exceptional surface quality",
      "Swedish E6 Gothenburg Bypass — 4-lane motorway interchange, 300km marker, fuel logistics mandatory",
      "Øresund Bridge — 7.845km crossing, 60kph enforced, deck-level crosswind up to 20m/s documented",
      "E20 Skåne Approach — final 100km, flat agricultural landscape, unobstructed horizon geometry",
    ],
    difficulty_rating: 1,
    terrain_tags: ["scandinavian-corridor", "bridge-crossing", "nordic-plains", "urban-extraction"],
    hardware_recommendation:
      "Honda XL 750 Transalp — 755cc parallel-twin, 21/18-inch wheel setup, 190mm front suspension travel. The tall windscreen handles Øresund crosswind loading. 400km range on the 16.7L tank completes Oslo–Gothenburg without stopping.",
    sensory_anchor:
      "Øresund Bridge at dusk: the deck narrows to two lanes of Atlantic exposure, 15m/s headwind, bars pulling right. Copenhagen glitters 4km ahead across the water. No shelter. Commit to the crossing.",
    source: "field-intel",
  },

  // ── MXP → FCO — Italian Spine ──────────────────────────────────────────────
  {
    slug: "mxp-to-fco-italian-spine",
    cinematic_pitch_enhanced:
      "Extract south from Malpensa on the A1 Autostrada del Sole — Italy's main logistical artery and arguably Europe's most engineered highway corridor. The Apennines announce themselves at Florence; the A1 cuts through them via a 52km mountain section with 7 major tunnel sequences. South of the range the Roman Campagna opens wide. Fiumicino airport extraction at sea level. 511km of north-south Italian fleet rebalancing. Milan's surplus inventory reaches Rome's underserved rental market.",
    highlights_enriched: [
      "A1 Po Valley Section — 200km of flat Autostrada, 130kph legal limit, industrial flatlands",
      "Apennine Mountain Section (Florence-Rome) — 52km, 7 major tunnels, 945m peak elevation",
      "Val di Chiana Interchange — Florence southern bypass, complex motorway geometry at 250m elevation",
      "GRA Roman Ring Road — outer ring extraction infrastructure, signed to Fiumicino from 30km",
    ],
    difficulty_rating: 2,
    terrain_tags: ["motorway-spine", "apennine-transit", "highway-italy", "urban-extraction"],
    hardware_recommendation:
      "Ducati Multistrada V4 — 170bhp V4 Granturismo, 185mm Skyhook suspension, full radar suite. The long-wheelbase stability absorbs the 511km motorway run while the electronic suspension adapts to Apennine surface changes mid-corner.",
    sensory_anchor:
      "Apennine tunnel sequence south of Florence: 4 tunnels in 12km, LED-lit white walls strobing past. Exit into the Val d'Arno morning light. Sudden silence from the V4 exhaust note — then the motorway opens south.",
    source: "field-intel",
  },

  // ── LHR → DUB — Celtic Crossing ────────────────────────────────────────────
  {
    slug: "lhr-to-dub-celtic-crossing",
    cinematic_pitch_enhanced:
      "Deploy west from Heathrow on the M4, clear the M25 ring, and cross Wales on the A55 North Wales Expressway. Holyhead port is the pivot — Irish Ferries Stena service crosses the Irish Sea in 3h20. Dublin arrival at the North Wall Quay. The ride continues on the N1 south to Dublin city extraction. 449km including the sea crossing. London operators rebalance hardware to the Irish market; the Celtic Sea segment is non-negotiable logistics that happens to deliver you to one of Europe's most underrated riding destinations.",
    highlights_enriched: [
      "A55 North Wales Expressway — 130km dual-carriageway, Snowdonia backdrop visible north, fast sweepers",
      "Irish Sea Crossing — 112km Holyhead–Dublin Port route, 3h20 Stena vessel, motorcycle deck boarding",
      "Snowdonia Approach — final 40km to Holyhead, coastal section with Irish Sea visible to the north-west",
      "N1 Dublin Airport Approach — urban extraction, 4-lane divided, signed to Swords/Dublin City",
    ],
    difficulty_rating: 1,
    terrain_tags: ["ferry-crossing", "coastal-approach", "celtic-corridor", "urban-extraction"],
    hardware_recommendation:
      "Honda Africa Twin CRF1100L — 1,084cc parallel-twin, 21-inch front wheel, 230mm suspension travel. The long-range 24.8L fuel tank completes London–Holyhead without a fuel stop. Wind protection handles the exposed North Wales coastal section.",
    sensory_anchor:
      "Irish Sea ferry deck in March: salt spray over the motorcycle, 8°C ambient, Dublin bay materialising through the mist at 60 minutes out. The Africa Twin lashed to deck cleats — secure, waiting.",
    source: "field-intel",
  },

  // ── CDG → LYS — Burgundy Run ──────────────────────────────────────────────
  {
    slug: "cdg-to-lys-burgundy-run",
    cinematic_pitch_enhanced:
      "Paris southern extraction on the A6 Autoroute du Soleil — France's most heavily trafficked artery becomes, south of Fontainebleau, a legitimate high-speed touring corridor. The Burgundy plateau opens at 150km. Dijon marks the wine country gateway and the A31/A6 split. The Rhône Valley approach via Mâcon is an 80km sweep of river geography. Lyon Perrache extraction or the North bypass to Saint-Exupéry Airport. 411km. Paris operators rebalance fleet south toward the Alps staging hub.",
    highlights_enriched: [
      "A6 Burgundy Section — 200km from Fontainebleau to Dijon, long-radius bends on plateau terrain at 250-400m",
      "Clos Vougeot Valley — scenic alternative via D974 Côte de Nuits, wine estate road geometry",
      "Saône River Corridor — 60km of valley road from Mâcon to Lyon, consistent 100kph rhythm",
      "Lyon North Bypass (A46) — industrial ring approach, Saint-Exupéry airport signed from 15km",
    ],
    difficulty_rating: 1,
    terrain_tags: ["motorway-france", "plateau-transit", "rhone-valley", "urban-extraction"],
    hardware_recommendation:
      "BMW R 1250 RT — 136bhp boxer-twin, 25L fuel tank, full fairing with 110mm adjustable screen. The 411km Paris–Lyon run completes in a single tank. Cruise control sustains 130kph Autoroute legal maximum without rider fatigue.",
    sensory_anchor:
      "Burgundy plateau south of Dijon at 09:00: low morning light across flat vine rows, 12°C ambient, clean asphalt with no lorry traffic yet. The A6 is yours. 150km to Lyon at 130kph.",
    source: "field-intel",
  },

  // ── OSL → ARN — Scandinavian Spine ────────────────────────────────────────
  {
    slug: "osl-to-arn-scandinavian-spine",
    cinematic_pitch_enhanced:
      "Deploy east from Oslo Gardermoen on the E18, cross the Norwegian–Swedish border at Ørje, and track the E18 through Värmland toward Stockholm. The Swedish spine road runs through boreal forest geometry at 90-110kph for 300km — pine corridors opening to lake vistas, Swedish road surface at European peak quality. Arlanda Airport extraction north of Stockholm via the E4. 339km of Scandinavian hub-to-hub rebalancing. The shortest corridor in the European fleet, but the most efficient: 339km of Class-1 Nordic infrastructure with zero technical risk.",
    highlights_enriched: [
      "E18 Värmland Section — 200km through Swedish boreal forest, 90kph limit, minimal traffic volume",
      "Örebro Bypass — Swedish lakeside city bypass at 200km marker, E18/E20 junction, fuel logistics",
      "Mälaren Lake Corridor — final 80km approach along the lake's northern shore into Stockholm basin",
      "E4 Arlanda Approach — Stockholm northern bypass, airport signed from 20km, toll-road infrastructure",
    ],
    difficulty_rating: 1,
    terrain_tags: ["scandinavian-forest", "nordic-spine", "lake-corridor", "boreal-transit"],
    hardware_recommendation:
      "Yamaha Ténéré 700 — 689cc CP2 parallel-twin, 21-inch front wheel, 210mm suspension travel. The 16L tank covers 300km of the 339km run. The minimal electronics suite and predictable power delivery suit the sustained boreal-forest cruise pace.",
    sensory_anchor:
      "Swedish E18 at dawn: pine shadows crossing the road at 5-second intervals, ambient 7°C, no other vehicles visible. The forest corridor runs dead straight for 4km. The parallel-twin pulling 110kph without drama.",
    source: "field-intel",
  },
];

/**
 * Returns the enriched narrative for a given mission slug, or null.
 * @param {string} slug
 * @returns {object|null}
 */
export function getNarrativeIntel(slug) {
  return A2A_NARRATIVE_INTEL.find((n) => n.slug === slug) ?? null;
}
