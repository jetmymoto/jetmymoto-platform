// ─── A2A (Airport-to-Airport) Missions ──────────────────────────────────────
// Each mission defines a one-way, open-jaw motorcycle corridor:
//   Insertion Hub → Theater (riding region) → Extraction Hub
//
// These are NOT round-trip routes. The rider flies into Point A,
// rides an epic curated route, drops the bike at Point B, and flies home.
//
// Schema fields:
//   slug              – URL-safe identifier (pattern: {origin}-to-{extraction}-{theater})
//   title             – Mission display name
//   insertion_airport  – IATA code of origin hub (rider flies IN here)
//   extraction_airport – IATA code of destination hub (rider flies OUT here)
//   theater           – destination slug (links to GRAPH.destinations enriched intel)
//   distance_km       – Approximate riding distance of the corridor
//   duration_days     – Suggested ride duration
//   cinematic_pitch   – One-paragraph sales copy for the mission
//   highlights        – Array of 3-4 key route highlights
//   seo.title         – SEO page title
//   seo.description   – Meta description (≤160 chars)
// ─────────────────────────────────────────────────────────────────────────────

export const A2A_MISSIONS = [
  // ── EUROPE ──────────────────────────────────────────────────────────────────
  {
    slug: "mxp-to-muc-alpine-traverse",
    title: "The Alpine Traverse",
    insertion_airport: "MXP",
    extraction_airport: "MUC",
    theater: "alps",
    distance_km: 680,
    duration_days: "3–5",
    cinematic_pitch:
      "Deploy from Milan Malpensa and launch directly into the Italian Dolomites. Push north through Stelvio Pass, thread the Grossglockner High Alpine Road, and descend into Bavaria for extraction at Munich. No backtracking. No wasted highway miles. Pure vertical theater from insertion to extraction.",
    highlights: [
      "Stelvio Pass — 48 hairpins, 2,757m summit",
      "Grossglockner High Alpine Road — Austria's crown jewel",
      "Dolomites corridor — UNESCO World Heritage riding",
      "Bavarian Alps descent into Munich",
    ],
    seo: {
      title: "Motorcycle Trip Milan to Munich | Alpine Traverse A2A Mission",
      description:
        "Fly into Milan (MXP), ride the Dolomites and Grossglockner, drop the bike in Munich (MUC). One-way motorcycle adventure — no backtracking.",
    },
  },
  {
    slug: "mxp-to-zrh-swiss-alpine-crossing",
    title: "The Swiss Alpine Crossing",
    insertion_airport: "MXP",
    extraction_airport: "ZRH",
    theater: "alps",
    distance_km: 520,
    duration_days: "3–4",
    cinematic_pitch:
      "Insert at Milan and climb directly into the Swiss Alps via the Splügen and Julier passes. Thread through the Engadin valley, push west through Andermatt, and extract at Zurich. Every kilometer is above 1,500 meters. This is altitude-locked riding at its finest.",
    highlights: [
      "Splügen Pass — dramatic Italian-Swiss border crossing",
      "Julier Pass — the ancient Roman trade route",
      "Andermatt — crossroads of four major Alpine passes",
      "Engadin Valley — pristine high-altitude corridor",
    ],
    seo: {
      title: "Motorcycle Trip Milan to Zurich | Swiss Alpine Crossing A2A Mission",
      description:
        "Fly into Milan (MXP), ride the Swiss Alps via Splügen, Julier, and Andermatt, extract at Zurich (ZRH). Premium one-way motorcycle logistics.",
    },
  },
  {
    slug: "cdg-to-bcn-pyrenees-crossing",
    title: "The Pyrenees Crossing",
    insertion_airport: "CDG",
    extraction_airport: "BCN",
    theater: "pyrenees",
    distance_km: 920,
    duration_days: "4–6",
    cinematic_pitch:
      "Launch from Paris and carve south through the Massif Central before hitting the Pyrenees head-on. Cross the spine of the range via the Col du Tourmalet and Col d'Aubisque, then descend the Spanish side through Aragón into Catalonia for extraction at Barcelona. France to Spain, Atlantic to Mediterranean.",
    highlights: [
      "Col du Tourmalet — legendary Tour de France climb",
      "Col d'Aubisque — misty high-altitude switchbacks",
      "Aragón descent — dramatic Spanish valleys",
      "Catalonian coastal approach to Barcelona",
    ],
    seo: {
      title: "Motorcycle Trip Paris to Barcelona | Pyrenees Crossing A2A Mission",
      description:
        "Fly into Paris (CDG), ride the Pyrenees via Tourmalet and Aubisque, extract at Barcelona (BCN). One-way motorcycle adventure across France and Spain.",
    },
  },
  {
    slug: "lhr-to-edi-highland-run",
    title: "The Highland Run",
    insertion_airport: "LHR",
    extraction_airport: "EDI",
    theater: "scottish-highlands",
    distance_km: 750,
    duration_days: "4–5",
    cinematic_pitch:
      "Insert at London Heathrow and ride north through the Lake District, cross into Scotland via the Borders, then push deep into the Highlands. Tackle the North Coast 500's most dramatic sections before extracting at Edinburgh. England to Scotland in one continuous, unbroken line.",
    highlights: [
      "Lake District — England's most dramatic riding",
      "Scottish Borders — rolling green corridors",
      "Glen Coe — the cinematic heart of the Highlands",
      "NC500 sections — coastal cliff roads above the Atlantic",
    ],
    seo: {
      title: "Motorcycle Trip London to Edinburgh | Highland Run A2A Mission",
      description:
        "Fly into London (LHR), ride through the Lake District and Scottish Highlands, extract at Edinburgh (EDI). No round-trip — pure one-way adventure.",
    },
  },
  {
    slug: "osl-to-bgo-fjord-expedition",
    title: "The Fjord Expedition",
    insertion_airport: "OSL",
    extraction_airport: "BGO",
    theater: "norwegian-fjords",
    distance_km: 480,
    duration_days: "3–5",
    cinematic_pitch:
      "Deploy from Oslo and push west into the heart of Norwegian fjord country. Thread between Sognefjorden and Hardangerfjorden on roads carved into sheer cliff faces above the water. Ride the Trollstigen if you dare, then extract at Bergen on the Atlantic coast. Midnight sun optional.",
    highlights: [
      "Sognefjorden — the king of Norwegian fjords",
      "Hardangerfjorden — orchard-lined fjord roads",
      "Trollstigen — 11 hairpins on a 10% gradient cliff",
      "Bergen — Hanseatic port extraction point",
    ],
    seo: {
      title: "Motorcycle Trip Oslo to Bergen | Fjord Expedition A2A Mission",
      description:
        "Fly into Oslo (OSL), ride through Sognefjorden and Trollstigen, extract at Bergen (BGO). One-way fjord motorcycle adventure — no backtracking.",
    },
  },
  {
    slug: "muc-to-ath-adriatic-descent",
    title: "The Adriatic Descent",
    insertion_airport: "MUC",
    extraction_airport: "ATH",
    theater: "dolomites",
    distance_km: 1850,
    duration_days: "7–10",
    cinematic_pitch:
      "The ultimate long-range A2A mission. Insert at Munich, drop into the Austrian Alps, cross into the Italian Dolomites, then ride the full length of the Adriatic coast through Croatia, Montenegro, and Albania before extracting at Athens. This is a European grand tour compressed into a single directional corridor.",
    highlights: [
      "Dolomites — UNESCO spires and high passes",
      "Croatian coast — island-studded Adriatic highway",
      "Montenegro — Bay of Kotor switchbacks",
      "Greek approach — Meteora and the Peloponnese",
    ],
    seo: {
      title: "Motorcycle Trip Munich to Athens | Adriatic Descent A2A Mission",
      description:
        "Fly into Munich (MUC), ride the Dolomites and Adriatic coast through Croatia and Montenegro, extract at Athens (ATH). Epic one-way motorcycle logistics.",
    },
  },

  // ── NORTH AMERICA ───────────────────────────────────────────────────────────
  {
    slug: "lax-to-sfo-pacific-coast",
    title: "The Pacific Coast Highway",
    insertion_airport: "LAX",
    extraction_airport: "SFO",
    theater: "socal-coast",
    distance_km: 620,
    duration_days: "2–4",
    cinematic_pitch:
      "Insert at LAX and hit the Pacific Coast Highway northbound. Ride the Big Sur coastline where the Santa Lucia mountains plunge directly into the Pacific. Push through Monterey, cross the Golden Gate, and extract at SFO. The most photographed motorcycle road in America, ridden in the right direction.",
    highlights: [
      "Malibu — coastal warm-up through celebrity canyons",
      "Big Sur — 90 miles of cliff-edge Pacific perfection",
      "Monterey & Carmel — the gentleman's waypoint",
      "Golden Gate Bridge — the iconic extraction crossing",
    ],
    seo: {
      title: "Motorcycle Trip LA to San Francisco | Pacific Coast A2A Mission",
      description:
        "Fly into LA (LAX), ride the PCH and Big Sur, extract at San Francisco (SFO). One-way coastal motorcycle adventure — no round trip needed.",
    },
  },
  {
    slug: "yul-to-yqb-laurentian-corridor",
    title: "The Laurentian Corridor",
    insertion_airport: "YUL",
    extraction_airport: "YQB",
    theater: "quebec-laurentians",
    distance_km: 380,
    duration_days: "2–3",
    cinematic_pitch:
      "Deploy from Montréal and ride north into the Laurentian Mountains. Thread through the Parc national de la Jacques-Cartier, push along the St. Lawrence River's dramatic north shore, and extract at Québec City. French-Canadian backcountry compressed into a single premium corridor.",
    highlights: [
      "Laurentian Mountains — Canadian Shield riding",
      "Route 138 — St. Lawrence River coast road",
      "Charlevoix — UNESCO biosphere reserve",
      "Québec City — walled colonial extraction point",
    ],
    seo: {
      title: "Motorcycle Trip Montreal to Quebec City | Laurentian A2A Mission",
      description:
        "Fly into Montréal (YUL), ride the Laurentian Mountains and Charlevoix coast, extract at Québec City (YQB). One-way Canadian motorcycle logistics.",
    },
  },
  {
    slug: "slc-to-lax-desert-spine",
    title: "The Desert Spine",
    insertion_airport: "SLC",
    extraction_airport: "LAX",
    theater: "wasatch-front",
    distance_km: 1050,
    duration_days: "4–6",
    cinematic_pitch:
      "Insert at Salt Lake City and carve south through the red rock cathedrals of Utah. Push through Monument Valley, across the Navajo Nation, thread the Grand Canyon's south rim, and blast through the Mojave Desert for extraction at LAX. America's most cinematic landscape corridor, ridden point-to-point.",
    highlights: [
      "Wasatch Range — alpine launch above Salt Lake",
      "Monument Valley — iconic western formations",
      "Grand Canyon South Rim — the mandatory detour",
      "Mojave Desert — high-speed desert extraction",
    ],
    seo: {
      title: "Motorcycle Trip Salt Lake City to LA | Desert Spine A2A Mission",
      description:
        "Fly into Salt Lake City (SLC), ride through Utah red rock and Monument Valley, extract at LA (LAX). One-way desert motorcycle adventure.",
    },
  },
  {
    slug: "bna-to-tpa-dixie-run",
    title: "The Dixie Run",
    insertion_airport: "BNA",
    extraction_airport: "TPA",
    theater: "tennessee-valley",
    distance_km: 870,
    duration_days: "3–5",
    cinematic_pitch:
      "Deploy from Nashville and ride the Tail of the Dragon and Blue Ridge Parkway before dropping south through the Appalachian foothills. Cross into Georgia, thread the back roads of the Deep South, and extract at Tampa on the Gulf Coast. Twisties to tidewater in one clean line.",
    highlights: [
      "Tail of the Dragon — 318 curves in 11 miles",
      "Blue Ridge Parkway — America's favorite scenic road",
      "Appalachian foothills — quiet two-lane blacktop",
      "Gulf Coast extraction — warm-weather finish",
    ],
    seo: {
      title: "Motorcycle Trip Nashville to Tampa | Dixie Run A2A Mission",
      description:
        "Fly into Nashville (BNA), ride the Tail of the Dragon and Blue Ridge, extract at Tampa (TPA). One-way motorcycle adventure through the American South.",
    },
  },
  {
    slug: "yvr-to-slc-cascade-spine",
    title: "The Cascade Spine",
    insertion_airport: "YVR",
    extraction_airport: "SLC",
    theater: "pacific-northwest",
    distance_km: 1400,
    duration_days: "5–7",
    cinematic_pitch:
      "Insert at Vancouver and ride south through the volcanic Cascade Range. Thread Mount Baker, Rainier, and Hood before crossing into Oregon's high desert. Push through the painted hills, drop into Idaho's Sawtooth Mountains, and extract at Salt Lake City. Pacific rainforest to desert basin in one directional corridor.",
    highlights: [
      "Sea-to-Sky Highway — British Columbia's coastal launch",
      "Mount Rainier — volcanic ridge riding",
      "Oregon high desert — Painted Hills and John Day",
      "Sawtooth Mountains — Idaho's premier alpine road",
    ],
    seo: {
      title: "Motorcycle Trip Vancouver to Salt Lake City | Cascade Spine A2A Mission",
      description:
        "Fly into Vancouver (YVR), ride the Cascades through Oregon and Idaho, extract at Salt Lake City (SLC). One-way motorcycle adventure — coast to basin.",
    },
  },
  {
    slug: "hnl-to-hnl-oahu-circuit",
    title: "The Oahu Circuit",
    insertion_airport: "HNL",
    extraction_airport: "HNL",
    theater: "hawaii-oahu",
    distance_km: 190,
    duration_days: "1–2",
    cinematic_pitch:
      "The one exception to the open-jaw rule. On an island, the circuit IS the mission. Insert and extract at Honolulu, but ride the full coastal perimeter — North Shore surf breaks, Windward Coast cliffs, and the Ko'olau Range spine. Tropical theater at sea level.",
    highlights: [
      "North Shore — legendary surf break corridor",
      "Windward Coast — dramatic volcanic cliffs",
      "Ko'olau Range — jungle ridge backbone",
      "Diamond Head — iconic extraction approach",
    ],
    seo: {
      title: "Motorcycle Trip Oahu Circuit | Hawaii A2A Mission",
      description:
        "Fly into Honolulu (HNL), ride the full Oahu coastal perimeter — North Shore, Windward Coast, Ko'olau Range. Tropical motorcycle circuit mission.",
    },
  },
];
