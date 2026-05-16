const THEATER_BY_CODE = {
  MXP: "alpine",
  MUC: "alpine",
  VIE: "alpine-danube",
  INN: "alpine",
  ZRH: "alpine",
  GVA: "alpine",

  ALC: "mediterranean-iberian",
  BCN: "mediterranean-iberian",
  VLC: "mediterranean-iberian",
  MAD: "iberian-interior",
  AGP: "andalusian-coastal",

  LHR: "british-gateway",
  LGW: "british-gateway",
  MAN: "british-north",

  DBV: "adriatic",
  SPU: "adriatic",
  ZAG: "balkan-adriatic",

  ATH: "aegean-balkan",
  SKG: "aegean-balkan",

  OSL: "nordic-fjord",
  BGO: "nordic-fjord",
  ARN: "scandinavian",
  CPH: "scandinavian",

  CDG: "western-europe",
  NCE: "riviera-alpine",
  LYS: "alpine-rhone"
};

const THEATERS = {
  alpine: {
    theaterId: "alpine",
    title: "The Alpine Gateway",
    subtitle: "Immediate access to high passes, lakeside roads, and northern Italy’s mountain corridors.",
    rhythm: "Alpine / Technical",
    elevationLabel: "Total Elevation",
    elevationValue: "18,750m",
    recommendedMachines: ["BMW R1300GS", "Multistrada V4"],
    tags: ["Alpine", "Technical", "Mountain"],
    description: "This route requires high-altitude proficiency. Best enjoyed during the late summer window when the passes are fully clear.",
    heroDescription: "Immediate access to Europe's most storied mountain passes and technical high-altitude corridors.",
    statusItems: [
      { label: "Riding Season", value: "PRIME CONDITIONS", accent: true },
      { label: "Local Forecast", value: "22°C / CLEAR SKY", accent: false },
      { label: "Route Advice", value: "NORTHERN PASSES OPEN", italic: true },
      { label: "Fleet Availability", value: "96% READY", accent: false },
    ]
  },
  "alpine-bavarian": {
    theaterId: "alpine-bavarian",
    title: "The Bavarian Alpine Gateway",
    subtitle: "Direct access into Austria, Tyrol, the Dolomites, and high-altitude touring corridors.",
    rhythm: "Alpine / Technical",
    elevationLabel: "Total Elevation",
    elevationValue: "15,200m",
    recommendedMachines: ["BMW R1300GS", "KTM 1290 Super Adventure"],
    tags: ["Bavarian", "Alpine", "Touring"],
    description: "North-to-south transitions through the heart of the Alps. Exceptional infrastructure and high-speed transit segments.",
    heroDescription: "Bavaria's primary gateway into Austria, Tyrol, and the heart of the high Alps.",
    statusItems: [
      { label: "Riding Season", value: "PEAK SUMMER", accent: true },
      { label: "Bavarian Status", value: "ALL ROADS CLEAR", accent: false },
      { label: "Route Advice", value: "TRANS-ALPINE READY", italic: true },
      { label: "Fleet Availability", value: "100% READY", accent: false },
    ]
  },
  "mediterranean-iberian": {
    theaterId: "mediterranean-iberian",
    title: "The Mediterranean Launch Point",
    subtitle: "Coastal roads, inland mountain passes, and fast access into Iberia’s riding network.",
    rhythm: "Coastal / Mountain",
    elevationLabel: "Regional Access",
    elevationValue: "4,500m",
    recommendedMachines: ["BMW R1300GS", "Multistrada V4"],
    tags: ["Coastal", "Mountain", "Touring"],
    description: "Sun-drenched tarmac and rhythmic coastal curves. Ideal for year-round riding with stable temperatures.",
    heroDescription: "Access Iberia's sun-drenched coastal roads and rhythmic inland mountain passes.",
    statusItems: [
      { label: "Riding Season", value: "YEAR ROUND", accent: true },
      { label: "Local Forecast", value: "24°C / SUNNY", accent: false },
      { label: "Route Advice", value: "COASTAL ROUTES CLEAR", italic: true },
      { label: "Fleet Availability", value: "92% READY", accent: false },
    ]
  },
  "british-gateway": {
    theaterId: "british-gateway",
    title: "The British Gateway",
    subtitle: "Fast access into UK routes, ferry corridors, and northern European riding networks.",
    rhythm: "Transit / Touring",
    elevationLabel: "Terrain Gain",
    elevationValue: "2,200m",
    recommendedMachines: ["Triumph Tiger 1200", "BMW R1300GS"],
    tags: ["Touring", "Island", "Transit"],
    description: "Gateway to the British Isles. Technical country lanes and high-speed motorway links to the ferry ports.",
    heroDescription: "The primary gateway into technical UK country lanes and Northern European touring corridors.",
    statusItems: [
      { label: "Riding Season", value: "MAR — OCT", accent: true },
      { label: "Local Forecast", value: "18°C / OVERCAST", accent: false },
      { label: "Route Advice", value: "FERRY LINKS ACTIVE", italic: true },
      { label: "Fleet Availability", value: "88% READY", accent: false },
    ]
  },
  "nordic-fjord": {
    theaterId: "nordic-fjord",
    title: "The Nordic Fjord Hub",
    subtitle: "Immediate access to dramatic coastal shelf roads, inland tunnels, and fjord-side technical sections.",
    rhythm: "Fjord / Technical",
    elevationLabel: "Vertical Gain",
    elevationValue: "8,800m",
    recommendedMachines: ["BMW R1300GS", "Husqvarna Norden 901"],
    tags: ["Fjord", "Nordic", "Wilderness"],
    description: "Spectacular scenery meets technical water-crossing logistics. Expect dramatic weather shifts and pristine tarmac.",
    heroDescription: "Immediate access to Norway's dramatic coastal shelf roads and technical fjord-side corridors.",
    statusItems: [
      { label: "Riding Season", value: "JUN — SEP", accent: true },
      { label: "Local Forecast", value: "14°C / VARIABLE", accent: false },
      { label: "Route Advice", value: "FJORD PASSES OPEN", italic: true },
      { label: "Fleet Availability", value: "94% READY", accent: false },
    ]
  },
  "aegean-balkan": {
    theaterId: "aegean-balkan",
    title: "The Aegean Balkan Link",
    subtitle: "A rugged intersection of ancient coastal routes and the southern Balkan mountain spine.",
    rhythm: "Rugged / Coastal",
    elevationLabel: "Peak Elevation",
    elevationValue: "6,400m",
    recommendedMachines: ["KTM 1290 Super Adventure", "Yamaha Ténéré 700"],
    tags: ["Rugged", "Coastal", "Ancient"],
    description: "Challenging surfaces and rewarding vistas. A gateway to the less-traveled interior of the southern Balkans.",
    heroDescription: "A rugged intersection of ancient Aegean coastal routes and the southern Balkan spine.",
    statusItems: [
      { label: "Riding Season", value: "APR — NOV", accent: true },
      { label: "Local Forecast", value: "26°C / SUNNY", accent: false },
      { label: "Route Advice", value: "COASTAL TRACKS CLEAR", italic: true },
      { label: "Fleet Availability", value: "85% READY", accent: false },
    ]
  },
  "adriatic": {
    theaterId: "adriatic",
    title: "The Adriatic Corridor",
    subtitle: "Limestone peaks meeting the turquoise sea. Fast coastal sweepers and technical karst climbs.",
    rhythm: "Coastal / Sweeping",
    elevationLabel: "Coastal Ascent",
    elevationValue: "5,100m",
    recommendedMachines: ["Ducati Multistrada", "BMW S1000XR"],
    tags: ["Coastal", "Sweeping", "Karst"],
    description: "One of Europe's most beautiful coastal transits. High grip levels and constant visual drama.",
    heroDescription: "Sweep along the Adriatic coast where limestone peaks meet the turquoise sea.",
    statusItems: [
      { label: "Riding Season", value: "MAY — OCT", accent: true },
      { label: "Local Forecast", value: "23°C / CLEAR", accent: false },
      { label: "Route Advice", value: "COASTAL ROAD ACTIVE", italic: true },
      { label: "Fleet Availability", value: "98% READY", accent: false },
    ]
  },
  fallback: {
    theaterId: "fallback",
    title: "The Regional Riding Gateway",
    subtitle: "Access curated riding corridors from this airport hub.",
    rhythm: "Regional",
    elevationLabel: "Regional Access",
    elevationValue: "Varies",
    recommendedMachines: ["BMW R1300GS", "Honda Africa Twin"],
    tags: ["Touring", "Access"],
    description: "A strategic node in the RiderAtlas network. Optimized for seamless arrivals and immediate departures.",
    heroDescription: "Begin your journey directly from the tarmac with immediate access to regional riding corridors.",
    statusItems: [
      { label: "Riding Season", value: "MAR — OCT", accent: true },
      { label: "Local Forecast", value: "20°C / FAIR", accent: false },
      { label: "Route Advice", value: "ALL LINKS ACTIVE", italic: true },
      { label: "Fleet Availability", value: "90% READY", accent: false },
    ]
  }
};

export function resolveAirportTheater(airport, graph) {
  const code = airport?.code?.toUpperCase();
  
  // 1. Explicit check
  if (airport?.theater && THEATERS[airport.theater]) return THEATERS[airport.theater];
  if (airport?.cluster && THEATERS[airport.cluster]) return THEATERS[airport.cluster];
  
  // 2. By Code
  const theaterId = THEATER_BY_CODE[code];
  if (theaterId) {
    // Special case for Munich
    if (code === 'MUC') return THEATERS["alpine-bavarian"];
    return THEATERS[theaterId] || THEATERS.fallback;
  }
  
  // 3. By Country/Region (simplified)
  const country = airport?.country?.toLowerCase() || "";
  const region = airport?.region?.toLowerCase() || "";
  
  if (country === "spain" || country === "portugal") return THEATERS["mediterranean-iberian"];
  if (country === "italy" || country === "switzerland" || country === "austria") return THEATERS["alpine"];
  if (country === "norway") return THEATERS["nordic-fjord"];
  if (country === "united kingdom" || country === "ireland" || country === "uk") return THEATERS["british-gateway"];
  if (country === "greece") return THEATERS["aegean-balkan"];
  if (country === "croatia" || country === "montenegro") return THEATERS["adriatic"];
  
  if (region.includes("alpine") || region.includes("alps")) return THEATERS["alpine"];

  return THEATERS.fallback;
}
