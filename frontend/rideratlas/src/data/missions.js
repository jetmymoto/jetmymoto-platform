export const missions = [
  // =================================================================
  // 🏆 THE ORIGINAL PILOT (ALPS)
  // =================================================================
  {
    id: "dolomiti-kings-loop",
    missionTitle: "Dolomiti King's Loop",
    missionTagline: "The Ultimate Alpine Escape",
    missionSummary: "3-day cinematic loop through the heart of the Dolomites with legendary passes and tight switchbacks.",
    aiSummary: "Terrain: Switchback intensive. Tarmac: 9/10. Visuals: 10/10.",
    startAirportCode: "VCE",
    durationDays: 3,
    distanceKm: 750,
    difficultyLevel: "Medium",
    bestSeason: "JUN-SEP",
    riderProfile: "Apex Predator",
    heroImage: "https://images.unsplash.com/photo-1518081461904-7d859ae353c7?q=80&w=2832&auto=format&fit=crop",
    lat: 46.5385, lng: 12.1373, initialPoi: "Passo Giau",
    sectors: [
      { name: "Day 1: Venice to Cortina", dist: "200km", desc: "Escape the lagoon and climb into the foothills. The route sharpens as you approach Cortina.", lat: 46.5385, lng: 12.1373 },
      { name: "Day 2: Sella Ronda Loop", dist: "250km", desc: "The core mission. A legendary circuit hitting Passo Giau, Falzarego, and Pordoi.", lat: 46.4880, lng: 11.7946 },
      { name: "Day 3: Descent to Sea", dist: "300km", desc: "A final high-speed run through the valleys before flattening out towards the Adriatic coast.", lat: 45.4408, lng: 12.3155 }
    ]
  },

  // =================================================================
  // 🇩🇪 GERMANY (PRECISION CARVER)
  // =================================================================
  {
    id: "black-forest-ridge",
    missionTitle: "Black Forest Ridge",
    missionTagline: "The Legendary B500",
    missionSummary: "Germany's most famous motorcycle road. Smooth flowing forest roads and ridge views in an accessible 2-day Stuttgart loop.",
    aiSummary: "Iconic Route. Tarmac: Billiard table smooth.",
    startAirportCode: "STR",
    durationDays: 2,
    distanceKm: 500,
    difficultyLevel: "Easy",
    bestSeason: "MAY-OCT",
    riderProfile: "New Blood",
    heroImage: "https://images.unsplash.com/photo-1516216628259-9474d32d1871?q=80&w=2940&auto=format&fit=crop",
    lat: 48.6000, lng: 8.2000, initialPoi: "B500 Schwarzwaldhochstrasse",
    sectors: [
      { name: "Day 1: The High Road", dist: "250km", desc: "From Stuttgart to Baden-Baden, then mounting the B500 Schwarzwaldhochstrasse.", lat: 48.5678, lng: 8.2274 },
      { name: "Day 2: Lakes & Clocks", dist: "250km", desc: "South to Titisee and Triberg. Dense forest canopies opening up to glacial lakes.", lat: 47.9000, lng: 8.1500 }
    ]
  },
  {
    id: "mosel-valley",
    missionTitle: "Mosel Valley Vineyards",
    missionTagline: "Canyons & Castles",
    missionSummary: "The river has carved steep, slate-covered canyons. Unlike typical river roads, this route 'ladders' up and down the valley walls.",
    aiSummary: "Surface: Perfect engineering. Grip: High. Technicality: Rhythmic.",
    startAirportCode: "FRA",
    durationDays: 3,
    distanceKm: 380,
    difficultyLevel: "Medium",
    bestSeason: "MAY-OCT",
    riderProfile: "Precision Carver",
    heroImage: "https://images.unsplash.com/photo-1596627689938-1649942a9965?q=80&w=2940&auto=format&fit=crop",
    lat: 50.1469, lng: 7.1691, initialPoi: "Cochem Castle",
    sectors: [
      { name: "Day 1: The Lower Mosel", dist: "120km", desc: "Departing Frankfurt. Includes a critical tactical detour to Burg Eltz.", lat: 50.1469, lng: 7.1691 },
      { name: "Day 2: Switchback Gauntlet", dist: "140km", desc: "Climbing out of Piesport mimics an Alpine pass with stacked hairpins.", lat: 49.9487, lng: 7.1121 },
      { name: "Day 3: Volcanic Eifel", dist: "120km", desc: "Pushing into the Vulkan Eifel region of crater lakes. Faster, open roads.", lat: 50.1983, lng: 6.8339 }
    ]
  },
  {
    id: "harz-mountains",
    missionTitle: "Harz Mountains Witch’s Ride",
    missionTagline: "36 Hairpins of Kyffhäuser",
    missionSummary: "The Harz is an isolated granitic massif. The route centers on the legendary Kyffhäuser range and its 36 perfect hairpins.",
    aiSummary: "Alert: Heavy enforcement on weekends. Corner count: Extreme.",
    startAirportCode: "HAJ",
    durationDays: 2,
    distanceKm: 450,
    difficultyLevel: "Medium/Hard",
    bestSeason: "MAY-SEP",
    riderProfile: "Sport Tourer",
    heroImage: "https://images.unsplash.com/photo-1627407981546-24e5d6d39682?q=80&w=2832&auto=format&fit=crop",
    lat: 51.4111, lng: 11.1077, initialPoi: "Kyffhäuser Monument",
    sectors: [
      { name: "Day 1: Kyffhäuser Challenge", dist: "220km", desc: "The objective is the Kyffhäuser monument approach: 36 hairpins in rapid succession.", lat: 51.4111, lng: 11.1077 },
      { name: "Day 2: Brocken Loop", dist: "230km", desc: "Circling the highest peak in Northern Germany via Torfhaus.", lat: 51.8000, lng: 10.5400 }
    ]
  },
  {
    id: "thuringian-forest",
    missionTitle: "Thuringian Forest",
    missionTagline: "The Green Heart",
    missionSummary: "Follows the 'Rennsteig', a historical ridge path. Characterized by 'green tunnel' sensations—roads deeply encased in old-growth forest.",
    aiSummary: "Visibility: Limited by forest. Surface: Smooth. Traffic: Low.",
    startAirportCode: "ERF",
    durationDays: 3,
    distanceKm: 500,
    difficultyLevel: "Easy/Medium",
    bestSeason: "MAY-OCT",
    riderProfile: "Cruiser/Tourer",
    heroImage: "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=2940&auto=format&fit=crop",
    lat: 50.9100, lng: 10.5000, initialPoi: "Dragon Gorge",
    sectors: [
      { name: "Day 1: Castles", dist: "150km", desc: "Erfurt to Eisenach and the massive Wartburg Castle.", lat: 50.9669, lng: 10.3069 },
      { name: "Day 2: The Ridge", dist: "180km", desc: "Penetrate the biosphere reserve towards Oberhof.", lat: 50.7000, lng: 10.7000 },
      { name: "Day 3: Slate Mountains", dist: "170km", desc: "Shift east to the 'Thuringian Sea' reservoirs.", lat: 50.6000, lng: 11.5000 }
    ]
  },
  {
    id: "saxon-switzerland",
    missionTitle: "Saxon Switzerland",
    missionTagline: "Sandstone Pillars",
    missionSummary: "A visual spectacle of bizarre rock needles and table mountains along the Elbe River.",
    aiSummary: "Pace: Slow/Scenic. Geography: Unique sandstone formations.",
    startAirportCode: "DRS",
    durationDays: 2,
    distanceKm: 250,
    difficultyLevel: "Easy",
    bestSeason: "APR-OCT",
    riderProfile: "Sightseer",
    heroImage: "https://images.unsplash.com/photo-1465326779339-e939a9c2a265?q=80&w=2940&auto=format&fit=crop",
    lat: 50.9667, lng: 14.0667, initialPoi: "Bastei Bridge",
    sectors: [
      { name: "Day 1: Sandstone Pillars", dist: "120km", desc: "Dresden to Bad Schandau along the Elbe. Loop the Bastei bridge.", lat: 50.9625, lng: 14.0728 },
      { name: "Day 2: Border Hopping", dist: "130km", desc: "Cross into Czech Bohemian Switzerland and return via Königstein Fortress.", lat: 50.8833, lng: 14.2333 }
    ]
  },

  // =================================================================
  // 🇫🇷 FRANCE (HEXAGON HERITAGE)
  // =================================================================
  {
    id: "corsica-cap-calanques",
    missionTitle: "Corsica Cap & Calanques",
    missionTagline: "The Island of Beauty",
    missionSummary: "Corsica is intense. Relentless sequences of corners with abrasive tarmac on the wildest island in the Med.",
    aiSummary: "Intensity: High. Road Width: Very Narrow. Scenery: Dramatic.",
    startAirportCode: "BIA",
    durationDays: 4,
    distanceKm: 600,
    difficultyLevel: "Hard",
    bestSeason: "MAY-OCT",
    riderProfile: "Technical Rider",
    heroImage: "https://images.unsplash.com/photo-1566376816698-3ce64c76b668?q=80&w=2940&auto=format&fit=crop",
    lat: 42.2500, lng: 8.6500, initialPoi: "Calanques de Piana",
    sectors: [
      { name: "Day 1: Cap Corse", dist: "150km", desc: "Loop around the northern 'finger'. Narrow coastal roads pass Genoese towers.", lat: 42.9000, lng: 9.4500 },
      { name: "Day 2: The Interior", dist: "180km", desc: "Bastia to Corte through the Scala di Santa Regina canyon.", lat: 42.3000, lng: 9.1500 },
      { name: "Day 3: The West Coast", dist: "150km", desc: "Ride to Porto and the Calanques de Piana—red rock cliffs plunging into the sea.", lat: 42.2500, lng: 8.6500 },
      { name: "Day 4: Return", dist: "120km", desc: "Via Col de Vergio and chestnut forests.", lat: 42.5500, lng: 9.3000 }
    ]
  },
  {
    id: "vosges-mountains",
    missionTitle: "Vosges Mountains",
    missionTagline: "Route des Crêtes",
    missionSummary: "High-speed, sweeping corners on granite roads along the mountain ridge separating Alsace and Lorraine.",
    aiSummary: "Flow: High speed. Visibility: Good. Surface: Excellent.",
    startAirportCode: "SXB",
    durationDays: 3,
    distanceKm: 400,
    difficultyLevel: "Medium",
    bestSeason: "MAY-OCT",
    riderProfile: "Sport Tourer",
    heroImage: "https://images.unsplash.com/photo-1629837586524-11867c210532?q=80&w=2940&auto=format&fit=crop",
    lat: 47.8833, lng: 7.0500, initialPoi: "Route des Crêtes",
    sectors: [
      { name: "Day 1: Wine Route", dist: "120km", desc: "Strasbourg to Colmar via the Alsace Wine Route. Cobblestones and vineyards.", lat: 48.0794, lng: 7.3585 },
      { name: "Day 2: The Ridge", dist: "150km", desc: "Ride the Route des Crêtes (D431), a military supply road along the ridge.", lat: 47.8833, lng: 7.0500 },
      { name: "Day 3: 1000 Ponds", dist: "130km", desc: "Explore the 'Plateau des Mille Étangs'—a landscape of forests and small lakes.", lat: 47.8000, lng: 6.6000 }
    ]
  },
  {
    id: "massif-central",
    missionTitle: "Massif Central Volcanoes",
    missionTagline: "Land of Sleeping Giants",
    missionSummary: "Defined by extinct volcanoes ('Puys') and empty, sweeping roads in the heart of France.",
    aiSummary: "Traffic: Minimal. Scenery: Volcanic cones. Flow: Continuous.",
    startAirportCode: "CFE",
    durationDays: 3,
    distanceKm: 500,
    difficultyLevel: "Medium",
    bestSeason: "MAY-SEP",
    riderProfile: "Explorer",
    heroImage: "https://images.unsplash.com/photo-1490761631978-8d4d8c6e267d?q=80&w=2940&auto=format&fit=crop",
    lat: 45.1167, lng: 2.6667, initialPoi: "Puy Mary",
    sectors: [
      { name: "Day 1: The Puys", dist: "150km", desc: "Clermont-Ferrand to Mont-Dore. Ride past the iconic Puy de Dôme.", lat: 45.7719, lng: 2.9644 },
      { name: "Day 2: The Giant", dist: "180km", desc: "Ride to Puy Mary via Pas de Peyrol, the highest road pass in the region.", lat: 45.1167, lng: 2.6667 },
      { name: "Day 3: Gorges", dist: "170km", desc: "Return via the meandering Gorges de la Sioule.", lat: 46.0000, lng: 2.8000 }
    ]
  },
  {
    id: "jura-mountains",
    missionTitle: "Jura Mountains & Lakes",
    missionTagline: "Little Scotland",
    missionSummary: "A limestone arc offering lush, green riding and cooler temperatures along the Swiss border.",
    aiSummary: "Climate: Cool/Fresh. Terrain: Rolling limestone hills. Borders: Multiple crossings.",
    startAirportCode: "GVA",
    durationDays: 3,
    distanceKm: 450,
    difficultyLevel: "Medium",
    bestSeason: "JUN-SEP",
    riderProfile: "Touring",
    heroImage: "https://images.unsplash.com/photo-1552063996-2679644208a0?q=80&w=2940&auto=format&fit=crop",
    lat: 46.3667, lng: 6.0833, initialPoi: "Col de la Faucille",
    sectors: [
      { name: "Day 1: The Ascent", dist: "140km", desc: "Geneva to Saint-Claude via Col de la Faucille for views of Mont Blanc.", lat: 46.3667, lng: 6.0833 },
      { name: "Day 2: Lake District", dist: "160km", desc: "Ride through the 'Little Scotland' area of Lac de Vouglans.", lat: 46.5000, lng: 5.7000 },
      { name: "Day 3: Watch Valley", dist: "150km", desc: "Ride along the Swiss border (Vallée de Joux) and return via Marchairuz.", lat: 46.6000, lng: 6.2000 }
    ]
  },
  {
    id: "normandy-dday",
    missionTitle: "Normandy D-Day",
    missionTagline: "History & Hills",
    missionSummary: "A mix of poignant history along the beaches and surprising topography in the 'Swiss Normandy' hills.",
    aiSummary: "Theme: Heritage. Terrain: Rolling hills. Pace: Relaxed.",
    startAirportCode: "CDG",
    durationDays: 3,
    distanceKm: 450,
    difficultyLevel: "Easy",
    bestSeason: "MAY-SEP",
    riderProfile: "History Buff",
    heroImage: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=2830&auto=format&fit=crop",
    lat: 49.3700, lng: -0.8800, initialPoi: "Omaha Beach",
    sectors: [
      { name: "Day 1: The Landings", dist: "150km", desc: "Caen to Bayeux, visiting Arromanches and Omaha Beach.", lat: 49.3700, lng: -0.8800 },
      { name: "Day 2: Suisse Normande", dist: "150km", desc: "Ride south to Clécy. The Orne river has carved steep, twisty hills.", lat: 48.9167, lng: -0.4833 },
      { name: "Day 3: Pays d'Auge", dist: "150km", desc: "Return via rolling hills of cider and Camembert country.", lat: 49.1456, lng: 0.2278 }
    ]
  },
  {
    id: "brittany-granite",
    missionTitle: "Brittany Pink Granite",
    missionTagline: "The Emerald Coast",
    missionSummary: "A coastal touring route defined by the contrast of pink rocks and blue sea in the Celtic heart of France.",
    aiSummary: "Scenery: Coastal. Weather: Atlantic changes. Vibes: Celtic.",
    startAirportCode: "RNS",
    durationDays: 3,
    distanceKm: 500,
    difficultyLevel: "Easy",
    bestSeason: "JUN-SEP",
    riderProfile: "Coastal Cruiser",
    heroImage: "https://images.unsplash.com/photo-1506434304575-afbb92660c29?q=80&w=2942&auto=format&fit=crop",
    lat: 48.8333, lng: -3.4833, initialPoi: "Pink Granite Coast",
    sectors: [
      { name: "Day 1: Corsair City", dist: "160km", desc: "Rennes to Saint-Malo via the medieval town of Dinan.", lat: 48.6481, lng: -2.0075 },
      { name: "Day 2: Pink Granite", dist: "180km", desc: "Follow the coast west to Perros-Guirec to see massive pink boulders.", lat: 48.8333, lng: -3.4833 },
      { name: "Day 3: Emerald Coast", dist: "160km", desc: "Return via Cap Fréhel and its lighthouse.", lat: 48.6833, lng: -2.3167 }
    ]
  },
  {
    id: "provence-verdon",
    missionTitle: "Provence Verdon",
    missionTagline: "Grand Canyon of Europe",
    missionSummary: "Ride the rim of the Gorges du Verdon and the fast Route Napoleon through the lavender fields.",
    aiSummary: "Visuals: Stunning. Drops: Vertiginous. Traffic: Heavy in August.",
    startAirportCode: "NCE",
    durationDays: 3,
    distanceKm: 400,
    difficultyLevel: "Medium",
    bestSeason: "MAY-JUN",
    riderProfile: "Scenic Rider",
    heroImage: "https://images.unsplash.com/photo-1594302636906-8d591e1d2c6c?q=80&w=2832&auto=format&fit=crop",
    lat: 43.7667, lng: 6.3667, initialPoi: "Gorges du Verdon",
    sectors: [
      { name: "Day 1: Route Napoleon", dist: "130km", desc: "Nice to Castellane via the N85. A fast, historic road with sweeping bends.", lat: 43.8462, lng: 6.5126 },
      { name: "Day 2: The Canyon", dist: "120km", desc: "Loop the Gorges du Verdon. Ride the northern and southern rims.", lat: 43.7667, lng: 6.3667 },
      { name: "Day 3: Lavender Fields", dist: "150km", desc: "Ride through the Valensole plateau and return to Nice via Grasse.", lat: 43.8365, lng: 5.9862 }
    ]
  },

  // =================================================================
  // 🇪🇸 SPAIN (IBERIAN ASPHALT)
  // =================================================================
  {
    id: "picos-de-europa-peaks",
    missionTitle: "Picos de Europa Peaks",
    missionTagline: "The Jaguar's Teeth",
    missionSummary: "Abrupt limestone mountains rising near the sea, creating deep gorges and high passes in a compact area.",
    aiSummary: "Grip: High. Wildlife Hazard: Cattle in high passes.",
    startAirportCode: "BIO",
    durationDays: 3,
    distanceKm: 600,
    difficultyLevel: "Medium",
    bestSeason: "MAY-OCT",
    riderProfile: "Canyon Carver",
    heroImage: "https://images.unsplash.com/photo-1562664377-709f2c337eb2?q=80&w=2940&auto=format&fit=crop",
    lat: 43.2555, lng: -4.6225, initialPoi: "Hermida Gorge",
    sectors: [
      { name: "Day 1: The Gorge", dist: "180km", desc: "Ride south into the Hermida Gorge. 20km of motorcycle nirvana.", lat: 43.2555, lng: -4.6225 },
      { name: "Day 2: The Triangle", dist: "220km", desc: "Potes to Riaño via San Glorio Pass. Exceptional grip.", lat: 43.0699, lng: -4.8972 },
      { name: "Day 3: Cantabrian Corniche", dist: "200km", desc: "Return via the coast through historic towns.", lat: 43.3886, lng: -4.2908 }
    ]
  },
  {
    id: "sierra-nevada-high",
    missionTitle: "Sierra Nevada High",
    missionTagline: "Europe's Highest Road",
    missionSummary: "Ride from the tropical coast to the highest paved road in Europe in a single run.",
    aiSummary: "Altitude Warning: >2500m. Thermal fluctuation extreme.",
    startAirportCode: "AGP",
    durationDays: 3,
    distanceKm: 550,
    difficultyLevel: "Hard",
    bestSeason: "Year-Round",
    riderProfile: "Summit Collector",
    heroImage: "https://images.unsplash.com/photo-1561730766-3d7c588a444d?q=80&w=2940&auto=format&fit=crop",
    lat: 37.0560, lng: -3.3650, initialPoi: "Pico Veleta",
    sectors: [
      { name: "Day 1: The Goat Road", dist: "150km", desc: "Malaga to Almuñécar via the A-4050. A dizzying, technical descent.", lat: 36.7327, lng: -3.6896 },
      { name: "Day 2: Alpujarras", dist: "200km", desc: "Riding the southern flank through white villages like Trevélez.", lat: 36.9996, lng: -3.2646 },
      { name: "Day 3: The Climb", dist: "200km", desc: "Up towards Pico Veleta. Reach ~2,500m.", lat: 37.0560, lng: -3.3650 }
    ]
  },
  {
    id: "galicia-rias",
    missionTitle: "Galicia Rías Baixas",
    missionTagline: "The End of the World",
    missionSummary: "A Celtic, Atlantic atmosphere. The 'Rías' (drowned river valleys) create a jagged coastline maximizing corner density.",
    aiSummary: "Weather: Atlantic conditions. Cuisine: Seafood focus.",
    startAirportCode: "SCQ",
    durationDays: 3,
    distanceKm: 500,
    difficultyLevel: "Medium",
    bestSeason: "JUN-SEP",
    riderProfile: "Urban Nomad",
    heroImage: "https://images.unsplash.com/photo-1547997368-12c82f9d7844?q=80&w=2940&auto=format&fit=crop",
    lat: 42.8805, lng: -9.2631, initialPoi: "Cape Finisterre",
    sectors: [
      { name: "Day 1: Costa da Morte", dist: "160km", desc: "Ride west to Finisterre. The coast is wild and treacherous.", lat: 42.8805, lng: -9.2631 },
      { name: "Day 2: Rías Baixas", dist: "180km", desc: "Head south along the inlets, passing Albariño vineyards.", lat: 42.4336, lng: -8.8077 },
      { name: "Day 3: The Interior", dist: "160km", desc: "Return via the interior hills offering a green, forested contrast.", lat: 42.8782, lng: -8.5448 }
    ]
  },
  {
    id: "silent-route",
    missionTitle: "The Silent Route",
    missionTagline: "Spanish Maestrazgo",
    missionSummary: "Connects the Mediterranean coast with the sparsely populated Maestrazgo mountains. Focus is on solitude and rhythm.",
    aiSummary: "Traffic: Zero. Vibe: Meditative. Road: A-1702.",
    startAirportCode: "VLC",
    durationDays: 3,
    distanceKm: 600,
    difficultyLevel: "Medium",
    bestSeason: "APR-NOV",
    riderProfile: "Soloist",
    heroImage: "https://images.unsplash.com/photo-1534234828569-2f22c6682643?q=80&w=2940&auto=format&fit=crop",
    lat: 40.6167, lng: -0.1000, initialPoi: "The Silent Route",
    sectors: [
      { name: "Day 1: Maestrazgo", dist: "200km", desc: "Ride north from Valencia into rocky medieval terrain. Morella walled city.", lat: 40.6167, lng: -0.1000 },
      { name: "Day 2: The Silent Route", dist: "150km", desc: "Ride the A-1702, famous for its isolation and perfect surface.", lat: 40.7500, lng: -0.5500 },
      { name: "Day 3: Return to Sea", dist: "250km", desc: "Descend via Teruel and its Mudejar towers back to the coast.", lat: 40.3444, lng: -1.1069 }
    ]
  },
  {
    id: "rioja-vineyards",
    missionTitle: "Rioja Vineyards",
    missionTagline: "Wine & Curves",
    missionSummary: "Blends riding with luxury lifestyle. The Ebro valley provides rolling terrain, while the Sierra de Cantabria offers mountain twisties.",
    aiSummary: "Theme: Gastronomy. Pace: Relaxed. Architecture: Modern Wineries.",
    startAirportCode: "BIO",
    durationDays: 3,
    distanceKm: 450,
    difficultyLevel: "Easy",
    bestSeason: "APR-NOV",
    riderProfile: "Connoisseur",
    heroImage: "https://images.unsplash.com/photo-1572569666838-85476d080ee8?q=80&w=2940&auto=format&fit=crop",
    lat: 42.5500, lng: -2.6167, initialPoi: "Laguardia",
    sectors: [
      { name: "Day 1: Green to Gold", dist: "150km", desc: "Bilbao south to the Ebro valley. Landscape shifts to golden vineyards.", lat: 42.5530, lng: -2.5858 },
      { name: "Day 2: Wine Roads", dist: "120km", desc: "Loop through Haro and Elciego. Architecture and landscape.", lat: 42.5114, lng: -2.6169 },
      { name: "Day 3: Sierra de la Demanda", dist: "180km", desc: "Spirited ride south into the mountains before returning north.", lat: 42.2333, lng: -3.0000 }
    ]
  },

  // =================================================================
  // 🇬🇧 UNITED KINGDOM (ROYAL ROADS)
  // =================================================================
  {
    id: "wales-brecon",
    missionTitle: "Wales Brecon Beacons",
    missionTagline: "The Top Gear Roads",
    missionSummary: "South Wales offers the famous Black Mountain Pass (A4069), a rollercoaster of tarmac famously used for car testing.",
    aiSummary: "Surface: Variable. Weather: Rain likely. Sheep: Everywhere.",
    startAirportCode: "CWL",
    durationDays: 2,
    distanceKm: 300,
    difficultyLevel: "Medium",
    bestSeason: "MAY-SEP",
    riderProfile: "Petrolhead",
    heroImage: "https://images.unsplash.com/photo-1605218427368-35b0d87922d9?q=80&w=2832&auto=format&fit=crop",
    lat: 51.8500, lng: -3.8500, initialPoi: "Black Mountain Pass",
    sectors: [
      { name: "Day 1: The Beacons", dist: "150km", desc: "Cardiff to Abergavenny. Ride the A470 through the National Park.", lat: 51.9000, lng: -3.4000 },
      { name: "Day 2: Top Gear Road", dist: "150km", desc: "The Black Mountain Pass (A4069). Hairpin turns and open moorland visibility.", lat: 51.8500, lng: -3.8500 }
    ]
  },
  {
    id: "lake-district-passes",
    missionTitle: "Lake District Passes",
    missionTagline: "Steepest Roads in England",
    missionSummary: "The Lakes offer the steepest paved roads in the UK, with 30% gradients on Hardknott Pass.",
    aiSummary: "Gradient: Extreme (30%). Technicality: High. Surface: Narrow/Bumpy.",
    startAirportCode: "MAN",
    durationDays: 3,
    distanceKm: 350,
    difficultyLevel: "Hard",
    bestSeason: "MAY-SEP",
    riderProfile: "Technical Climber",
    heroImage: "https://images.unsplash.com/photo-1505835676307-e6ae8e110462?q=80&w=2938&auto=format&fit=crop",
    lat: 54.4000, lng: -3.2000, initialPoi: "Hardknott Pass",
    sectors: [
      { name: "Day 1: The Lakes", dist: "100km", desc: "Manchester to Windermere via Kendal.", lat: 54.3700, lng: -2.9000 },
      { name: "Day 2: The Challenge", dist: "120km", desc: "Wrynose and Hardknott Passes. Continue to Honister Pass and Keswick.", lat: 54.4000, lng: -3.2000 },
      { name: "Day 3: Kirkstone", dist: "130km", desc: "Return via Kirkstone Pass and Ullswater.", lat: 54.4600, lng: -2.9200 }
    ]
  },
  {
    id: "cornwall-atlantic",
    missionTitle: "Cornwall Atlantic",
    missionTagline: "The Atlantic Highway",
    missionSummary: "The rugged southwestern tip of England. Coastal views, granite tors, and narrow hedged lanes.",
    aiSummary: "Roads: Narrow B-roads. Traffic: Holiday congestion. Views: Oceanic.",
    startAirportCode: "EXT",
    durationDays: 3,
    distanceKm: 450,
    difficultyLevel: "Easy/Medium",
    bestSeason: "MAY-JUN",
    riderProfile: "Coastal Cruiser",
    heroImage: "https://images.unsplash.com/photo-1445308124430-883fba250785?q=80&w=2940&auto=format&fit=crop",
    lat: 50.0667, lng: -5.7167, initialPoi: "Land's End",
    sectors: [
      { name: "Day 1: North Coast", dist: "150km", desc: "Exeter to Bude via the Atlantic Highway (A39).", lat: 50.8300, lng: -4.5400 },
      { name: "Day 2: The Tip", dist: "120km", desc: "Ride to St Ives and Land's End. Return to Penzance.", lat: 50.0667, lng: -5.7167 },
      { name: "Day 3: Dartmoor", dist: "180km", desc: "Return via Dartmoor National Park. Wild ponies and granite tors.", lat: 50.5700, lng: -3.9200 }
    ]
  },
  {
    id: "peak-district-snake",
    missionTitle: "Peak District",
    missionTagline: "Snake Pass Run",
    missionSummary: "Short but intense. The Snake Pass and Cat & Fiddle roads are legendary UK biking tarmac.",
    aiSummary: "Enforcement: Average Speed Cameras. Flow: Fast sweepers.",
    startAirportCode: "MAN",
    durationDays: 2,
    distanceKm: 200,
    difficultyLevel: "Medium",
    bestSeason: "MAY-OCT",
    riderProfile: "Weekender",
    heroImage: "https://images.unsplash.com/photo-1597176116047-876a32798fcc?q=80&w=2874&auto=format&fit=crop",
    lat: 53.4419, lng: -1.8614, initialPoi: "Snake Pass",
    sectors: [
      { name: "Day 1: Snake & Strines", dist: "100km", desc: "Manchester to Ladybower Reservoir via the Snake Pass (A57).", lat: 53.4419, lng: -1.8614 },
      { name: "Day 2: Cat & Fiddle", dist: "100km", desc: "Ride the Cat and Fiddle road (A537) from Buxton to Macclesfield.", lat: 53.2500, lng: -2.0000 }
    ]
  },
  {
    id: "yorkshire-dales",
    missionTitle: "Yorkshire Dales",
    missionTagline: "The Buttertubs",
    missionSummary: "Classic English countryside riding. The Buttertubs Pass is a narrow, rollercoaster road notoriously driven by Jeremy Clarkson.",
    aiSummary: "Terrain: Open Moors. Surface: Bumpy but grippy.",
    startAirportCode: "LBA",
    durationDays: 2,
    distanceKm: 250,
    difficultyLevel: "Medium",
    bestSeason: "MAY-SEP",
    riderProfile: "Explorer",
    heroImage: "https://images.unsplash.com/photo-1605208722420-7e3c155d0f66?q=80&w=2940&auto=format&fit=crop",
    lat: 54.3500, lng: -2.2000, initialPoi: "Buttertubs Pass",
    sectors: [
      { name: "Day 1: The Dales", dist: "120km", desc: "Leeds to Hawes. Ride Buttertubs Pass between Hawes and Thwaite.", lat: 54.3500, lng: -2.2000 },
      { name: "Day 2: Ribblehead", dist: "130km", desc: "Ride past the iconic Ribblehead Viaduct on the B6255.", lat: 54.2106, lng: -2.3703 }
    ]
  },

  // =================================================================
  // ❄️ SCANDINAVIA (NORDIC HORIZON)
  // =================================================================
  {
    id: "norway-telemark",
    missionTitle: "Norway Telemark",
    missionTagline: "Heroes of Telemark",
    missionSummary: "Telemark offers twisting roads and cultural history deep in the Norwegian interior.",
    aiSummary: "Scenery: Epic. Costs: High. Corner Quality: Excellent.",
    startAirportCode: "OSL",
    durationDays: 3,
    distanceKm: 500,
    difficultyLevel: "Medium",
    bestSeason: "JUN-AUG",
    riderProfile: "Nature Lover",
    heroImage: "https://images.unsplash.com/photo-1520697771746-8805dd661646?q=80&w=2834&auto=format&fit=crop",
    lat: 59.8833, lng: 8.7500, initialPoi: "Gaustatoppen",
    sectors: [
      { name: "Day 1: Heavy Water", dist: "160km", desc: "Oslo to Rjukan, site of WWII sabotage. Deep valleys.", lat: 59.8794, lng: 8.5966 },
      { name: "Day 2: The Giant", dist: "180km", desc: "Ride around Gaustatoppen mountain. The road over Tuddal pass is excellent.", lat: 59.8833, lng: 8.7500 },
      { name: "Day 3: Stave Churches", dist: "160km", desc: "Return via Heddal, the largest Stave Church in Norway.", lat: 59.5794, lng: 9.1764 }
    ]
  },
  {
    id: "lofoten-islands",
    missionTitle: "Lofoten Islands",
    missionTagline: "Arctic Ocean Ride",
    missionSummary: "The E10 winds under sheer granite peaks rising directly from the sea. A bucket list Arctic experience.",
    aiSummary: "Light: 24h daylight in summer. Traffic: Slow RVs. Visuals: Unmatched.",
    startAirportCode: "BOO",
    durationDays: 4,
    distanceKm: 400,
    difficultyLevel: "Easy",
    bestSeason: "JUN-AUG",
    riderProfile: "Photographer",
    heroImage: "https://images.unsplash.com/photo-1443632864897-14973fa006cf?q=80&w=2940&auto=format&fit=crop",
    lat: 67.9297, lng: 13.0844, initialPoi: "Reine",
    sectors: [
      { name: "Day 1: Arrival", dist: "50km", desc: "Ferry from Bodø to Moskenes.", lat: 67.8925, lng: 13.0294 },
      { name: "Day 2: The Wall", dist: "120km", desc: "Moskenes to Reine and Nusfjord. Granite peaks rising from the sea.", lat: 67.9297, lng: 13.0844 },
      { name: "Day 3: Viking Lands", dist: "130km", desc: "Ride north to Svolvær and Henningsvær island.", lat: 68.1500, lng: 14.2000 },
      { name: "Day 4: Return", dist: "100km", desc: "Ferry back to Bodø.", lat: 67.2800, lng: 14.4000 }
    ]
  },
  {
    id: "finland-archipelago",
    missionTitle: "Finland Archipelago",
    missionTagline: "The Yellow Ferries",
    missionSummary: "The Archipelago Trail connects thousands of islands via bridges and yellow cable ferries.",
    aiSummary: "Pace: Relaxed. Ferries: Frequent. Vibe: Maritime.",
    startAirportCode: "TKU",
    durationDays: 3,
    distanceKm: 250,
    difficultyLevel: "Easy",
    bestSeason: "JUN-AUG",
    riderProfile: "Island Hopper",
    heroImage: "https://images.unsplash.com/photo-1548232979-6c557ee14752?q=80&w=2942&auto=format&fit=crop",
    lat: 60.1900, lng: 21.9000, initialPoi: "Nagu Island",
    sectors: [
      { name: "Day 1: Island Hopping", dist: "80km", desc: "Turku to Nagu via Parainen. Includes ferry crossings.", lat: 60.1900, lng: 21.9000 },
      { name: "Day 2: Outer Islands", dist: "90km", desc: "Nagu to Korpo and Houtskär. Scenery becomes barren and maritime.", lat: 60.2200, lng: 21.3700 },
      { name: "Day 3: The Loop", dist: "80km", desc: "Return to mainland via Kustavi and Naantali.", lat: 60.4600, lng: 22.0200 }
    ]
  },
  {
    id: "sweden-bohuslan",
    missionTitle: "Sweden West Coast",
    missionTagline: "Granite & Salt",
    missionSummary: "The Bohuslän coast is a labyrinth of pink granite islands north of Gothenburg.",
    aiSummary: "Terrain: Coastal islands. Bridges: Many. Vibe: Summer holiday.",
    startAirportCode: "GOT",
    durationDays: 3,
    distanceKm: 400,
    difficultyLevel: "Easy",
    bestSeason: "JUN-AUG",
    riderProfile: "Cruiser",
    heroImage: "https://images.unsplash.com/photo-1563728639-653690d56b0d?q=80&w=2940&auto=format&fit=crop",
    lat: 58.3500, lng: 11.2167, initialPoi: "Smögen",
    sectors: [
      { name: "Day 1: Islands", dist: "100km", desc: "Gothenburg north to Marstrand and Tjörn island via bridges.", lat: 57.8833, lng: 11.5833 },
      { name: "Day 2: Granite Coast", dist: "150km", desc: "Ride north to Smögen, famous for its wooden pier and granite rocks.", lat: 58.3500, lng: 11.2167 },
      { name: "Day 3: Return", dist: "150km", desc: "Return via the inland lakes to Gothenburg.", lat: 58.0000, lng: 12.0000 }
    ]
  },
  {
    id: "denmark-jutland",
    missionTitle: "Denmark Jutland",
    missionTagline: "Marguerite Route",
    missionSummary: "Utilizes the 'Marguerite Route' network of scenic byways through the dunes and lakes of Jutland.",
    aiSummary: "Flat: Yes. Relaxed: Yes. Wind: Strong.",
    startAirportCode: "BLL",
    durationDays: 3,
    distanceKm: 400,
    difficultyLevel: "Easy",
    bestSeason: "MAY-SEP",
    riderProfile: "Easy Rider",
    heroImage: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?q=80&w=2940&auto=format&fit=crop",
    lat: 55.3269, lng: 8.7511, initialPoi: "Ribe",
    sectors: [
      { name: "Day 1: West Coast", dist: "120km", desc: "Billund to Ribe. Visit Rømø beach where you can ride on the sand.", lat: 55.3269, lng: 8.7511 },
      { name: "Day 2: Lake District", dist: "150km", desc: "Ride northeast to the Silkeborg lake district.", lat: 56.1667, lng: 9.5500 },
      { name: "Day 3: Return", dist: "130km", desc: "Return via Vejle and the rolling hills of Grejsdalen.", lat: 55.7000, lng: 9.5333 }
    ]
  },

  // =================================================================
  // ⚔️ BALKANS & EAST (WILD FRONTIER)
  // =================================================================
  {
    id: "montenegro-durmitor-coast",
    missionTitle: "Montenegro Durmitor",
    missionTagline: "Fjord to Alpine Plateau",
    missionSummary: "Transition from the Mediterranean heat of Kotor to the snow-capped peaks of Durmitor National Park in one ride.",
    aiSummary: "Terrain: Extreme contrast. Tunnels: Unlit in Piva Canyon.",
    startAirportCode: "TIV",
    durationDays: 3,
    distanceKm: 500,
    difficultyLevel: "Hard",
    bestSeason: "JUN-SEP",
    riderProfile: "Adventure Seeker",
    heroImage: "https://images.unsplash.com/photo-1569388330292-7a6a84165c71?q=80&w=2940&auto=format&fit=crop",
    lat: 43.1150, lng: 19.0300, initialPoi: "Sedlo Pass",
    sectors: [
      { name: "Day 1: The Serpentine", dist: "120km", desc: "The famous Kotor Serpentine. 25 hairpins rising vertically from the bay.", lat: 42.4000, lng: 18.7800 },
      { name: "Day 2: The Lunar Surface", dist: "200km", desc: "P1 road over Durmitor via Sedlo Pass—a treeless, limestone lunar landscape.", lat: 43.1150, lng: 19.0300 },
      { name: "Day 3: The Canyon Run", dist: "180km", desc: "Descent through the Piva Lake road. Tunnels carved directly into cliff faces.", lat: 43.1600, lng: 18.8500 }
    ]
  },
  {
    id: "albanian-alps-theth",
    missionTitle: "Albanian Alps Loop",
    missionTagline: "Into the Accursed Mountains",
    missionSummary: "Albania is the new frontier. Formerly a 4x4 track, the road to Theth is now perfect asphalt.",
    aiSummary: "Status: Wild. Infrastructure: Developing. World-class engineering.",
    startAirportCode: "TIA",
    durationDays: 3,
    distanceKm: 400,
    difficultyLevel: "Very Hard",
    bestSeason: "JUN-OCT",
    riderProfile: "GS Adventurer",
    heroImage: "https://images.unsplash.com/photo-1626257808801-97b79148d88e?q=80&w=2940&auto=format&fit=crop",
    lat: 42.3900, lng: 19.7800, initialPoi: "Theth Valley",
    sectors: [
      { name: "Day 1: Fortress Approach", dist: "100km", desc: "Positioning ride north to Shkodër, dominated by the massive Rozafa Castle.", lat: 42.0693, lng: 19.5033 },
      { name: "Day 2: The New Tarmac", dist: "150km", desc: "The SH21 to Theth. A ribbon of perfect blacktop climbing a massive pass.", lat: 42.3900, lng: 19.7800 },
      { name: "Day 3: Kelmend Loop", dist: "150km", desc: "The SH20 Leqet e Hotit switchbacks. The most photogenic hairpins in the Balkans.", lat: 42.4800, lng: 19.4600 }
    ]
  },
  {
    id: "bosnia-heritage",
    missionTitle: "Bosnia Heritage",
    missionTagline: "Canyons & Bridges",
    missionSummary: "Utilizes the dramatic river canyons that cut through the Dinaric Alps. Heavy emphasis on historical context.",
    aiSummary: "History: Rich/Tragic. Roads: Canyon carving. Food: Excellent.",
    startAirportCode: "SJJ",
    durationDays: 3,
    distanceKm: 450,
    difficultyLevel: "Medium",
    bestSeason: "MAY-OCT",
    riderProfile: "Cultural Explorer",
    heroImage: "https://images.unsplash.com/photo-1565019808940-00803517228c?q=80&w=2940&auto=format&fit=crop",
    lat: 43.3428, lng: 17.8083, initialPoi: "Stari Most",
    sectors: [
      { name: "Day 1: Neretva Run", dist: "140km", desc: "Sarajevo to Mostar via the Neretva river canyon. Visit Stari Most.", lat: 43.3428, lng: 17.8083 },
      { name: "Day 2: Herzegovina", dist: "150km", desc: "Loop through arid limestone landscapes to Blagaj and Trebinje.", lat: 42.7100, lng: 18.3500 },
      { name: "Day 3: Mountains", dist: "160km", desc: "Return to Sarajevo via Sutjeska National Park and Tjentište.", lat: 43.3500, lng: 18.7000 }
    ]
  },
  {
    id: "bulgaria-rhodope",
    missionTitle: "Bulgaria Rhodope",
    missionTagline: "Mystery Mountains",
    missionSummary: "The Rhodope Mountains offer a mystical, lush environment distinct from the sharper peaks of the Rila.",
    aiSummary: "Terrain: Forested. Traffic: Low. Myth: Orpheus birthplace.",
    startAirportCode: "SOF",
    durationDays: 3,
    distanceKm: 600,
    difficultyLevel: "Medium",
    bestSeason: "MAY-OCT",
    riderProfile: "Explorer",
    heroImage: "https://images.unsplash.com/photo-1596541223126-6d2a84358a9e?q=80&w=2940&auto=format&fit=crop",
    lat: 41.6000, lng: 24.3800, initialPoi: "Trigrad Gorge",
    sectors: [
      { name: "Day 1: The Lakes", dist: "180km", desc: "Sofia to Devin via Vacha Reservoir. Endless curves.", lat: 41.7400, lng: 24.4000 },
      { name: "Day 2: Gorges", dist: "150km", desc: "Trigrad Gorge. Vertical marble cliffs hundreds of meters high.", lat: 41.6000, lng: 24.3800 },
      { name: "Day 3: Monasteries", dist: "200km", desc: "Return via Bachkovo and Rila Monasteries.", lat: 42.1333, lng: 23.3400 }
    ]
  },
  {
    id: "macedonia-galicica",
    missionTitle: "Macedonia Galicica",
    missionTagline: "The Two Lakes",
    missionSummary: "Centers on the tectonic lakes of Ohrid and Prespa, separated by the Galicica National Park.",
    aiSummary: "Views: Lake panoramas. Roads: Technical mountain pass.",
    startAirportCode: "SKP",
    durationDays: 2,
    distanceKm: 300,
    difficultyLevel: "Medium",
    bestSeason: "MAY-OCT",
    riderProfile: "Vista Seeker",
    heroImage: "https://images.unsplash.com/photo-1582285161048-b4b081128c7f?q=80&w=2940&auto=format&fit=crop",
    lat: 41.1167, lng: 20.8000, initialPoi: "Ohrid",
    sectors: [
      { name: "Day 1: Canyon Run", dist: "160km", desc: "Skopje to Ohrid via Mavrovo National Park and Radika canyon.", lat: 41.1167, lng: 20.8000 },
      { name: "Day 2: Galicica Pass", dist: "140km", desc: "Cross the steep pass between Lake Ohrid and Lake Prespa.", lat: 40.9500, lng: 20.8500 }
    ]
  },
  {
    id: "serbia-iron-gates",
    missionTitle: "Serbia Iron Gates",
    missionTagline: "Danube Gorge Run",
    missionSummary: "Follows the Danube River where it carves the massive 'Iron Gates' gorge between the Carpathians and Balkans.",
    aiSummary: "Scale: Massive river. Engineering: Tunnels/Galleries.",
    startAirportCode: "BEG",
    durationDays: 2,
    distanceKm: 400,
    difficultyLevel: "Easy/Medium",
    bestSeason: "APR-OCT",
    riderProfile: "Cruiser",
    heroImage: "https://images.unsplash.com/photo-1629124446415-37667d013061?q=80&w=2940&auto=format&fit=crop",
    lat: 44.6625, lng: 21.6775, initialPoi: "Golubac Fortress",
    sectors: [
      { name: "Day 1: Danube Highway", dist: "180km", desc: "Belgrade to Iron Gates via Golubac Fortress. River gorge riding.", lat: 44.6625, lng: 21.6775 },
      { name: "Day 2: Hinterland", dist: "200km", desc: "Loop back through Homolje mountains and dense forests.", lat: 44.3000, lng: 21.8000 }
    ]
  },
  {
    id: "greece-pindus",
    missionTitle: "Greece Pindus Loop",
    missionTagline: "The Spine of Greece",
    missionSummary: "The Pindus range offers alpine riding that challenges the 'island' stereotype. Technical, empty, and wild.",
    aiSummary: "Terrain: Alpine. Villages: Stone slate. Food: Mountain meat.",
    startAirportCode: "SKG",
    durationDays: 3,
    distanceKm: 600,
    difficultyLevel: "Hard",
    bestSeason: "MAY-OCT",
    riderProfile: "Mountain Goat",
    heroImage: "https://images.unsplash.com/photo-1599307399887-8d070b4a4413?q=80&w=2942&auto=format&fit=crop",
    lat: 39.9500, lng: 20.7500, initialPoi: "Vikos Gorge",
    sectors: [
      { name: "Day 1: To Mountains", dist: "200km", desc: "Thessaloniki to Metsovo via the old Katara Pass.", lat: 39.7700, lng: 21.1833 },
      { name: "Day 2: Zagorohoria", dist: "150km", desc: "Explore stone villages and the Vikos Gorge.", lat: 39.9500, lng: 20.7500 },
      { name: "Day 3: Meteora", dist: "200km", desc: "Return via Meteora monasteries atop rock pillars.", lat: 39.7125, lng: 21.6269 }
    ]
  },
  {
    id: "greece-peloponnese",
    missionTitle: "Peloponnese Mythical",
    missionTagline: "Spartan Roads",
    missionSummary: "A 'greatest hits' of Greek riding: high mountains, coastal corniches, and ancient history.",
    aiSummary: "Variety: High. History: Maximum. Roads: Grippy.",
    startAirportCode: "ATH",
    durationDays: 4,
    distanceKm: 800,
    difficultyLevel: "Medium",
    bestSeason: "APR-OCT",
    riderProfile: "Grand Tourer",
    heroImage: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?q=80&w=2940&auto=format&fit=crop",
    lat: 37.0667, lng: 22.2500, initialPoi: "Langada Pass",
    sectors: [
      { name: "Day 1: Canal to Mountains", dist: "200km", desc: "Athens to Kalavryta via Corinth Canal and Vouraikos Gorge.", lat: 38.0333, lng: 22.1100 },
      { name: "Day 2: Arcadia", dist: "180km", desc: "Traverse the fir forests of Arcadia to Olympia.", lat: 37.6389, lng: 21.6300 },
      { name: "Day 3: The Mani", dist: "200km", desc: "Langada Pass crossing Taygetos mountains. One of Greece's best roads.", lat: 37.0667, lng: 22.2500 },
      { name: "Day 4: Argolis", dist: "200km", desc: "Return via Nafplio and Epidaurus.", lat: 37.5667, lng: 22.8000 }
    ]
  },
  {
    id: "romania-apuseni",
    missionTitle: "Romania Apuseni",
    missionTagline: "Sunset Mountains",
    missionSummary: "Offers a more intimate and authentic riding experience than the Transfăgărășan, with karst landscapes.",
    aiSummary: "Authenticity: High. Traffic: Low. Terrain: Karst plateau.",
    startAirportCode: "CLJ",
    durationDays: 3,
    distanceKm: 450,
    difficultyLevel: "Medium",
    bestSeason: "JUN-SEP",
    riderProfile: "Explorer",
    heroImage: "https://images.unsplash.com/photo-1597587748443-41c30364d937?q=80&w=2942&auto=format&fit=crop",
    lat: 46.5500, lng: 22.7667, initialPoi: "Apuseni Park",
    sectors: [
      { name: "Day 1: Into Mountains", dist: "120km", desc: "Cluj to Apuseni Natural Park. Beliș reservoir.", lat: 46.6500, lng: 23.0500 },
      { name: "Day 2: Karst Plateau", dist: "150km", desc: "Padis plateau and Scarisoara ice cave. Narrow roads.", lat: 46.5500, lng: 22.7667 },
      { name: "Day 3: Aries Valley", dist: "180km", desc: "Return via the DN75 following the Aries River curves.", lat: 46.4667, lng: 23.5000 }
    ]
  },

  // =================================================================
  // 🇮🇹 ITALY II (THE SOUTH & ISLES)
  // =================================================================
  {
    id: "sardinia-emerald",
    missionTitle: "Sardinia Emerald",
    missionTagline: "MotoGP Grip Levels",
    missionSummary: "Sardinia is famous for abrasive asphalt. This route targets the legendary SS125 Orientale Sarda.",
    aiSummary: "Tire Wear: High. Grip: Extreme. Traffic: Low in interior.",
    startAirportCode: "OLB",
    durationDays: 4,
    distanceKm: 900,
    difficultyLevel: "Medium",
    bestSeason: "MAY-OCT",
    riderProfile: "Apex Predator",
    heroImage: "https://images.unsplash.com/photo-1534445867742-43195f401b6c?q=80&w=2864&auto=format&fit=crop",
    lat: 40.1200, lng: 9.6500, initialPoi: "SS125 Orientale Sarda",
    sectors: [
      { name: "Day 1: Costa Smeralda", dist: "180km", desc: "Loop north to Porto Cervo. Granite rocks and turquoise water.", lat: 41.1377, lng: 9.5372 },
      { name: "Day 2: The Interior", dist: "220km", desc: "Inland to Nuoro and Gennargentu mountains.", lat: 40.2167, lng: 9.3667 },
      { name: "Day 3: The SS125", dist: "250km", desc: "The highlight: riding the SS125 from Dorgali to Arbatax.", lat: 40.1200, lng: 9.6500 },
      { name: "Day 4: Return North", dist: "250km", desc: "Via Tempio Pausania and the Valley of the Moon.", lat: 40.9200, lng: 9.4900 }
    ]
  },
  {
    id: "sicily-etna-baroque",
    missionTitle: "Sicily Etna & Baroque",
    missionTagline: "Volcanoes & History",
    missionSummary: "Centers on the active volcano Mount Etna and the baroque towns of the south-east.",
    aiSummary: "Surface: Volcanic ash possible. Heat: High. Culture: Rich.",
    startAirportCode: "CTA",
    durationDays: 4,
    distanceKm: 700,
    difficultyLevel: "Medium",
    bestSeason: "APR-NOV",
    riderProfile: "Grand Tourer",
    heroImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2940&auto=format&fit=crop",
    lat: 37.7510, lng: 14.9934, initialPoi: "Mount Etna",
    sectors: [
      { name: "Day 1: The Volcano", dist: "120km", desc: "Ride the SP92 up Mount Etna to Rifugio Sapienza. Black lava fields.", lat: 37.7000, lng: 15.0000 },
      { name: "Day 2: Baroque Loop", dist: "200km", desc: "Head south to Noto, Modica, and Ragusa.", lat: 36.9269, lng: 14.7306 },
      { name: "Day 3: Inland Sicily", dist: "200km", desc: "Ride through the center to Piazza Armerina and Enna.", lat: 37.5667, lng: 14.2833 },
      { name: "Day 4: Godfather Country", dist: "180km", desc: "Return north to Taormina and Savoca.", lat: 37.8516, lng: 15.2853 }
    ]
  },
  {
    id: "abruzzo-gran-sasso",
    missionTitle: "Abruzzo Gran Sasso",
    missionTagline: "Little Tibet",
    missionSummary: "The Gran Sasso massif offers a vast, high-altitude plateau that feels completely unlike the rest of Italy.",
    aiSummary: "Visuals: Cinematic/Western. Traffic: Very Low.",
    startAirportCode: "FCO",
    durationDays: 3,
    distanceKm: 500,
    difficultyLevel: "Medium",
    bestSeason: "MAY-OCT",
    riderProfile: "Film Scout",
    heroImage: "https://images.unsplash.com/photo-1605556754098-b80c54173324?q=80&w=2940&auto=format&fit=crop",
    lat: 42.4500, lng: 13.6333, initialPoi: "Campo Imperatore",
    sectors: [
      { name: "Day 1: Apennines", dist: "150km", desc: "Rome to L’Aquila via the Tiburtina road.", lat: 42.3500, lng: 13.4000 },
      { name: "Day 2: Little Tibet", dist: "180km", desc: "Ride up to Campo Imperatore plateau. Visit Rocca Calascio.", lat: 42.4500, lng: 13.6333 },
      { name: "Day 3: Return", dist: "170km", desc: "Return via Lake Campotosto.", lat: 42.5333, lng: 13.3833 }
    ]
  },

  // =================================================================
  // ☀️ MEDITERRANEAN & OTHERS
  // =================================================================
  {
    id: "portugal-douro",
    missionTitle: "Portugal Douro",
    missionTagline: "World's Best Road",
    missionSummary: "Ride the N222, scientifically voted the world's best driving road, along the wine terraces of the Douro River.",
    aiSummary: "Flow: Perfect. Grip: High. Scenery: Terraced vineyards.",
    startAirportCode: "OPO",
    durationDays: 3,
    distanceKm: 400,
    difficultyLevel: "Medium",
    bestSeason: "APR-OCT",
    riderProfile: "Connoisseur",
    heroImage: "https://images.unsplash.com/photo-1589828156828-874249a5b6c2?q=80&w=2940&auto=format&fit=crop",
    lat: 41.1500, lng: -7.7800, initialPoi: "N222 Road",
    sectors: [
      { name: "Day 1: River Run", dist: "120km", desc: "Porto east to Peso da Régua.", lat: 41.1600, lng: -7.7800 },
      { name: "Day 2: The N222", dist: "100km", desc: "Régua to Pinhão. The N222 offers perfect geometry.", lat: 41.1900, lng: -7.5400 },
      { name: "Day 3: Return", dist: "180km", desc: "Return via Amarante and the N15.", lat: 41.2700, lng: -8.0700 }
    ]
  },
  {
    id: "cyprus-troodos",
    missionTitle: "Cyprus Troodos",
    missionTagline: "Island of Venus",
    missionSummary: "Escape the beach heat into the cool pine forests of the Troodos mountains.",
    aiSummary: "Climate: Cooler at altitude. Roads: Twisty.",
    startAirportCode: "LCA",
    durationDays: 3,
    distanceKm: 400,
    difficultyLevel: "Medium",
    bestSeason: "MAR-NOV",
    riderProfile: "Sun Seeker",
    heroImage: "https://images.unsplash.com/photo-1590425717387-a25b2a0d0d88?q=80&w=2940&auto=format&fit=crop",
    lat: 34.9333, lng: 32.8667, initialPoi: "Mount Olympus",
    sectors: [
      { name: "Day 1: To the Hills", dist: "100km", desc: "Larnaca to Troodos Mountains.", lat: 34.9167, lng: 32.9167 },
      { name: "Day 2: Olympus Loop", dist: "150km", desc: "Loop around Mount Olympus and Kykkos Monastery.", lat: 34.9333, lng: 32.8667 },
      { name: "Day 3: Return", dist: "100km", desc: "Descent via Limassol.", lat: 34.6667, lng: 33.0333 }
    ]
  }
];

export const getMissionById = (id) => missions.find(m => m.id === id);
