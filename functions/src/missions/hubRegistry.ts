import type { Hub } from "./types.js";

// ── Tier 1 Hubs — Primary European Weekend Escape Origins ────────────────
// Waypoint tier guide:
//   anchor  = main POI, always retained
//   shaper  = forces route geometry / direction, prevents Mapbox collapse
//   scenic  = optional stop, first to be dropped if route too long

const MXP: Hub = {
  code: "MXP",
  tier: 1,
  coord: [8.7281, 45.6306],
  strategy: "loop",
  scenicZones: [
    {
      name: "Dolomites",
      slug: "dolomites",
      center: [11.85, 46.45],
      radiusKm: 200,
      tags: ["mountain_pass"],
      keyWaypoints: [
        { name: "Brescia", coord: [10.2118, 45.5416], tier: "shaper", type: "rest_stop" },
        { name: "Passo del Tonale", coord: [10.5868, 46.2602], tier: "anchor", type: "scenic_pass", elevation_m: 1884 },
        { name: "Passo dello Stelvio", coord: [10.4531, 46.5285], tier: "anchor", type: "scenic_pass", elevation_m: 2757 },
        { name: "Bolzano", coord: [11.3548, 46.4983], tier: "shaper", type: "rest_stop" },
        { name: "Lago di Garda Viewpoint", coord: [10.7981, 45.6495], tier: "scenic", type: "viewpoint", elevation_m: 200 },
      ],
    },
    {
      name: "Lake Como & Stelvio",
      slug: "como-stelvio",
      center: [9.65, 46.15],
      radiusKm: 150,
      tags: ["mountain_pass"],
      keyWaypoints: [
        { name: "Bellagio", coord: [9.2580, 45.9830], tier: "shaper", type: "viewpoint", elevation_m: 230 },
        { name: "Bormio", coord: [10.3710, 46.4685], tier: "shaper", type: "rest_stop", elevation_m: 1225 },
        { name: "Stelvio Pass — Trafoi Exit", coord: [10.5073, 46.5515], tier: "anchor", type: "scenic_pass", elevation_m: 2757 },
      ],
    },
    {
      name: "Liguria Coast",
      slug: "liguria-coast",
      center: [9.50, 44.30],
      radiusKm: 180,
      tags: ["coastal"],
      keyWaypoints: [
        { name: "Pavia", coord: [9.1590, 45.1847], tier: "shaper", type: "rest_stop" },
        { name: "Portofino Viewpoint", coord: [9.2092, 44.3034], tier: "anchor", type: "viewpoint", elevation_m: 100 },
        { name: "Cinque Terre Overlook", coord: [9.7105, 44.1264], tier: "anchor", type: "viewpoint", elevation_m: 350 },
        { name: "Passo del Bracco", coord: [9.6625, 44.2172], tier: "scenic", type: "scenic_pass", elevation_m: 615 },
        { name: "Parma", coord: [10.3279, 44.8015], tier: "shaper", type: "rest_stop" },
      ],
    },
  ],
};

const MUC: Hub = {
  code: "MUC",
  tier: 1,
  coord: [11.7861, 48.3538],
  strategy: "loop",
  scenicZones: [
    {
      name: "Bavarian Alps",
      slug: "bavarian-alps",
      center: [11.10, 47.40],
      radiusKm: 150,
      tags: ["mountain_pass"],
      keyWaypoints: [
        { name: "Garmisch-Partenkirchen", coord: [11.0908, 47.5011], tier: "shaper", type: "rest_stop", elevation_m: 700 },
        { name: "Deutsche Alpenstrasse", coord: [11.3948, 47.4833], tier: "anchor", type: "scenic_pass", elevation_m: 1200 },
        { name: "Rossfeld Panoramastrasse", coord: [13.0500, 47.6300], tier: "anchor", type: "scenic_pass", elevation_m: 1600 },
        { name: "Berchtesgaden Viewpoint", coord: [13.0026, 47.6321], tier: "scenic", type: "viewpoint", elevation_m: 530 },
      ],
    },
    {
      name: "Austrian Tyrol",
      slug: "austrian-tyrol",
      center: [11.40, 47.10],
      radiusKm: 200,
      tags: ["mountain_pass"],
      keyWaypoints: [
        { name: "Innsbruck", coord: [11.3933, 47.2692], tier: "shaper", type: "rest_stop" },
        { name: "Hahntennjoch Pass", coord: [10.6697, 47.2261], tier: "anchor", type: "technical_climb", elevation_m: 1894 },
        { name: "Timmelsjoch Pass", coord: [11.0938, 46.9072], tier: "anchor", type: "scenic_pass", elevation_m: 2474 },
        { name: "Kühtai Saddle", coord: [11.0167, 47.2128], tier: "scenic", type: "scenic_pass", elevation_m: 2017 },
        { name: "Seefeld", coord: [11.1900, 47.3297], tier: "shaper", type: "rest_stop" },
      ],
    },
    {
      name: "Dolomites North",
      slug: "dolomites-north",
      center: [11.85, 46.65],
      radiusKm: 220,
      tags: ["mountain_pass"],
      keyWaypoints: [
        { name: "Mittenwald", coord: [11.2614, 47.4433], tier: "shaper", type: "rest_stop" },
        { name: "Brenner Pass Approach", coord: [11.5075, 47.0000], tier: "anchor", type: "scenic_pass", elevation_m: 1370 },
        { name: "Jaufenpass", coord: [11.3091, 46.8467], tier: "anchor", type: "technical_climb", elevation_m: 2094 },
        { name: "Passo Pennes", coord: [11.4429, 46.8142], tier: "scenic", type: "scenic_pass", elevation_m: 2211 },
        { name: "Sterzing/Vipiteno", coord: [11.4327, 46.8979], tier: "shaper", type: "rest_stop" },
      ],
    },
  ],
};

const INN: Hub = {
  code: "INN",
  tier: 1,
  coord: [11.3440, 47.2602],
  strategy: "pass_chain",  // INN is too central for simple loops — force expanded chains
  scenicZones: [
    {
      name: "Timmelsjoch & Dolomites Chain",
      slug: "timmelsjoch-dolomites",
      center: [11.20, 46.60],
      radiusKm: 180,
      tags: ["mountain_pass"],
      keyWaypoints: [
        { name: "Kühtai Pass", coord: [11.0167, 47.2128], tier: "shaper", type: "scenic_pass", elevation_m: 2017 },
        { name: "Sölden", coord: [10.8397, 46.9667], tier: "shaper", type: "rest_stop", elevation_m: 1368 },
        { name: "Timmelsjoch High Alpine Road", coord: [11.0938, 46.9072], tier: "anchor", type: "scenic_pass", elevation_m: 2474 },
        { name: "Merano", coord: [11.1597, 46.6713], tier: "shaper", type: "rest_stop" },
        { name: "Passo Pennes", coord: [11.4429, 46.8142], tier: "anchor", type: "scenic_pass", elevation_m: 2211 },
        { name: "Sterzing/Vipiteno", coord: [11.4327, 46.8979], tier: "shaper", type: "rest_stop" },
        { name: "Brenner Pass", coord: [11.5075, 47.0000], tier: "scenic", type: "scenic_pass", elevation_m: 1370 },
      ],
    },
    {
      name: "Arlberg & Silvretta Chain",
      slug: "arlberg-silvretta",
      center: [10.10, 47.05],
      radiusKm: 160,
      tags: ["mountain_pass"],
      keyWaypoints: [
        { name: "Fernpass", coord: [10.8236, 47.3275], tier: "shaper", type: "scenic_pass", elevation_m: 1216 },
        { name: "Arlberg Pass", coord: [10.2131, 47.1297], tier: "anchor", type: "scenic_pass", elevation_m: 1793 },
        { name: "Flexenpass", coord: [10.1500, 47.1500], tier: "scenic", type: "technical_climb", elevation_m: 1773 },
        { name: "Bludenz", coord: [9.8222, 47.1544], tier: "shaper", type: "rest_stop" },
        { name: "Silvretta High Alpine Road", coord: [10.0833, 46.9333], tier: "anchor", type: "scenic_pass", elevation_m: 2032 },
        { name: "Landeck", coord: [10.5667, 47.1333], tier: "shaper", type: "rest_stop" },
      ],
    },
    {
      name: "Zillertal & Grossglockner Chain",
      slug: "zillertal-grossglockner",
      center: [12.30, 47.10],
      radiusKm: 200,
      tags: ["mountain_pass"],
      keyWaypoints: [
        { name: "Gerlos Pass", coord: [12.1039, 47.2331], tier: "anchor", type: "scenic_pass", elevation_m: 1507 },
        { name: "Mittersill", coord: [12.4833, 47.2833], tier: "shaper", type: "rest_stop" },
        { name: "Grossglockner High Alpine Road", coord: [12.8425, 47.0744], tier: "anchor", type: "scenic_pass", elevation_m: 2504 },
        { name: "Heiligenblut", coord: [12.8500, 47.0400], tier: "scenic", type: "rest_stop", elevation_m: 1288 },
        { name: "Lienz", coord: [12.7694, 46.8297], tier: "shaper", type: "rest_stop" },
        { name: "Felbertauern Approach", coord: [12.5000, 47.1167], tier: "shaper", type: "scenic_pass", elevation_m: 1650 },
      ],
    },
  ],
};

const BCN: Hub = {
  code: "BCN",
  tier: 1,
  coord: [2.0785, 41.2971],
  strategy: "loop",
  scenicZones: [
    {
      name: "Eastern Pyrenees",
      slug: "pyrenees-east",
      center: [1.50, 42.40],
      radiusKm: 200,
      tags: ["mountain_pass"],
      keyWaypoints: [
        { name: "Vic", coord: [2.2549, 41.8876], tier: "shaper", type: "rest_stop" },
        { name: "Coll de Nargó", coord: [1.3000, 42.1833], tier: "anchor", type: "scenic_pass", elevation_m: 932 },
        { name: "Port del Cantó", coord: [1.2833, 42.2833], tier: "anchor", type: "technical_climb", elevation_m: 1725 },
        { name: "Aigüestortes NP Viewpoint", coord: [0.9500, 42.5500], tier: "scenic", type: "viewpoint", elevation_m: 1800 },
        { name: "La Seu d'Urgell", coord: [1.4570, 42.3578], tier: "shaper", type: "rest_stop" },
      ],
    },
    {
      name: "Costa Brava",
      slug: "costa-brava",
      center: [3.00, 41.90],
      radiusKm: 150,
      tags: ["coastal"],
      keyWaypoints: [
        { name: "Girona", coord: [2.8249, 41.9794], tier: "shaper", type: "rest_stop" },
        { name: "Tossa de Mar Cliffs", coord: [2.9333, 41.7194], tier: "anchor", type: "viewpoint", elevation_m: 120 },
        { name: "Cap de Creus", coord: [3.3167, 42.3194], tier: "anchor", type: "viewpoint", elevation_m: 80 },
        { name: "Cadaqués Approach", coord: [3.2764, 42.2889], tier: "scenic", type: "scenic_pass", elevation_m: 200 },
        { name: "Figueres", coord: [2.9620, 42.2668], tier: "shaper", type: "rest_stop" },
      ],
    },
    {
      name: "Andorra",
      slug: "andorra",
      center: [1.55, 42.55],
      radiusKm: 220,
      tags: ["mountain_pass"],
      keyWaypoints: [
        { name: "Manresa", coord: [1.8286, 41.7257], tier: "shaper", type: "rest_stop" },
        { name: "La Seu d'Urgell", coord: [1.4570, 42.3578], tier: "shaper", type: "rest_stop" },
        { name: "Port d'Envalira", coord: [1.7000, 42.5400], tier: "anchor", type: "scenic_pass", elevation_m: 2408 },
        { name: "Coll d'Ordino", coord: [1.5300, 42.5700], tier: "anchor", type: "technical_climb", elevation_m: 1981 },
        { name: "Puigcerdà", coord: [1.9283, 42.4314], tier: "shaper", type: "rest_stop" },
      ],
    },
  ],
};

const VIE: Hub = {
  code: "VIE",
  tier: 1,
  coord: [16.5697, 48.1103],
  strategy: "loop",
  scenicZones: [
    {
      name: "Grossglockner",
      slug: "grossglockner",
      center: [12.75, 47.08],
      radiusKm: 300,
      tags: ["mountain_pass"],
      keyWaypoints: [
        { name: "Grossglockner High Alpine Road", coord: [12.8425, 47.0744], tier: "anchor", type: "scenic_pass", elevation_m: 2504 },
        { name: "Edelweissspitze", coord: [12.8400, 47.1200], tier: "scenic", type: "viewpoint", elevation_m: 2571 },
        { name: "Salzburg", coord: [13.0550, 47.8095], tier: "shaper", type: "rest_stop" },
      ],
    },
    {
      name: "Wachau & Waldviertel",
      slug: "wachau-waldviertel",
      center: [15.30, 48.50],
      radiusKm: 150,
      tags: ["national_park"],
      keyWaypoints: [
        { name: "Krems an der Donau", coord: [15.6142, 48.4092], tier: "shaper", type: "rest_stop" },
        { name: "Dürnstein Castle Viewpoint", coord: [15.5189, 48.3950], tier: "anchor", type: "viewpoint", elevation_m: 310 },
        { name: "Jauerling Summit Road", coord: [15.3500, 48.3167], tier: "anchor", type: "scenic_pass", elevation_m: 960 },
        { name: "Zwettl", coord: [15.1683, 48.6047], tier: "shaper", type: "rest_stop" },
        { name: "Gmünd", coord: [14.9833, 48.7667], tier: "shaper", type: "rest_stop" },
        { name: "Horn", coord: [15.6608, 48.6614], tier: "shaper", type: "rest_stop" },
      ],
    },
    {
      name: "Semmering & Southern Alps",
      slug: "semmering-south",
      center: [15.50, 47.40],
      radiusKm: 180,
      tags: ["mountain_pass"],
      keyWaypoints: [
        { name: "Wiener Neustadt", coord: [16.2500, 47.8167], tier: "shaper", type: "rest_stop" },
        { name: "Semmering Pass", coord: [15.8283, 47.6367], tier: "anchor", type: "scenic_pass", elevation_m: 985 },
        { name: "Mariazell", coord: [15.3167, 47.7733], tier: "shaper", type: "rest_stop" },
        { name: "Rax Cable Car Viewpoint", coord: [15.7667, 47.7000], tier: "scenic", type: "viewpoint", elevation_m: 1545 },
        { name: "Höllental Gorge", coord: [15.8000, 47.7167], tier: "anchor", type: "viewpoint", elevation_m: 500 },
        { name: "Graz", coord: [15.4395, 47.0707], tier: "shaper", type: "rest_stop" },
      ],
    },
  ],
};

const ATH: Hub = {
  code: "ATH",
  tier: 1,
  coord: [23.9445, 37.9364],
  strategy: "loop",
  scenicZones: [
    {
      name: "Peloponnese",
      slug: "peloponnese",
      center: [22.40, 37.50],
      radiusKm: 200,
      tags: ["coastal", "mountain_pass"],
      keyWaypoints: [
        { name: "Corinth Canal Viewpoint", coord: [22.9844, 37.9347], tier: "shaper", type: "viewpoint", elevation_m: 75 },
        { name: "Nafplio", coord: [22.8008, 37.5683], tier: "shaper", type: "rest_stop" },
        { name: "Langada Pass", coord: [22.3500, 37.0800], tier: "anchor", type: "technical_climb", elevation_m: 1524 },
        { name: "Monemvasia Approach", coord: [23.0375, 36.6861], tier: "anchor", type: "viewpoint", elevation_m: 100 },
        { name: "Tripoli", coord: [22.3767, 37.5108], tier: "shaper", type: "rest_stop" },
      ],
    },
    {
      name: "Meteora & Thessaly",
      slug: "meteora",
      center: [21.63, 39.72],
      radiusKm: 350,
      tags: ["national_park", "mountain_pass"],
      keyWaypoints: [
        { name: "Lamia", coord: [22.4267, 38.8997], tier: "shaper", type: "rest_stop" },
        { name: "Thermopylae", coord: [22.5333, 38.7986], tier: "scenic", type: "viewpoint", elevation_m: 50 },
        { name: "Meteora Rock Pillars", coord: [21.6306, 39.7217], tier: "anchor", type: "viewpoint", elevation_m: 400 },
        { name: "Katara Pass", coord: [21.2000, 39.7833], tier: "anchor", type: "scenic_pass", elevation_m: 1690 },
        { name: "Trikala", coord: [21.7681, 39.5558], tier: "shaper", type: "rest_stop" },
      ],
    },
    {
      name: "Mani Peninsula",
      slug: "mani",
      center: [22.40, 36.70],
      radiusKm: 280,
      tags: ["coastal"],
      keyWaypoints: [
        { name: "Corinth Canal Viewpoint", coord: [22.9844, 37.9347], tier: "shaper", type: "viewpoint", elevation_m: 75 },
        { name: "Kalamata", coord: [22.1128, 37.0389], tier: "shaper", type: "rest_stop" },
        { name: "Areopoli Village", coord: [22.3667, 36.7667], tier: "anchor", type: "rest_stop", elevation_m: 300 },
        { name: "Cape Tenaro", coord: [22.4833, 36.3889], tier: "anchor", type: "viewpoint", elevation_m: 20 },
        { name: "Sparta", coord: [22.4297, 37.0742], tier: "shaper", type: "rest_stop" },
      ],
    },
  ],
};

// ── Tier 2 Hubs — Secondary ──────────────────────────────────────────────

const ZRH: Hub = { code: "ZRH", tier: 2, coord: [8.5492, 47.4647], strategy: "loop", scenicZones: [] };
const LYS: Hub = { code: "LYS", tier: 2, coord: [5.0887, 45.7256], strategy: "loop", scenicZones: [] };
const FCO: Hub = { code: "FCO", tier: 2, coord: [12.2389, 41.8003], strategy: "loop", scenicZones: [] };
const BUD: Hub = { code: "BUD", tier: 2, coord: [19.2556, 47.4298], strategy: "loop", scenicZones: [] };
const PRG: Hub = { code: "PRG", tier: 2, coord: [14.2600, 50.1008], strategy: "loop", scenicZones: [] };
const ZAG: Hub = { code: "ZAG", tier: 2, coord: [16.0688, 45.7430], strategy: "loop", scenicZones: [] };
const SPU: Hub = { code: "SPU", tier: 2, coord: [16.2980, 43.5389], strategy: "loop", scenicZones: [] };
const TIA: Hub = { code: "TIA", tier: 2, coord: [19.7206, 41.4147], strategy: "loop", scenicZones: [] };

// ── Registry ─────────────────────────────────────────────────────────────

const ALL_HUBS: readonly Hub[] = [
  MXP, MUC, INN, BCN, VIE, ATH,
  ZRH, LYS, FCO, BUD, PRG, ZAG, SPU, TIA,
];

export function getHubsByTier(tier: 1 | 2): readonly Hub[] {
  return ALL_HUBS.filter((h) => h.tier === tier);
}

export function getHubByCode(code: string): Hub | undefined {
  return ALL_HUBS.find((h) => h.code === code);
}

export function getTier1Hubs(): readonly Hub[] {
  return getHubsByTier(1);
}

export function getAllHubs(): readonly Hub[] {
  return ALL_HUBS;
}
