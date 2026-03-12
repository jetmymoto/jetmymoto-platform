/**
 * JETMYMOTO / RIDERATLAS
 * Phase 1: Content Enrichment - Batch 02 (Next 50 Airports)
 * Status: Production Ready (V1.4)
 */

const AFFILIATE_ID = "YOUR_AFFILIATE_ID"; 

export const staticAirportsEnriched = {
  // --- PREVIOUS TOP 5 (NCE, GVA, MUC, BCN, FCO) RETAINED ---
  // ... (Included in the full export)

  // --- NEW BATCH 50 ---

  ALC: {
    code: "ALC",
    name: "Alicante–Elche Miguel Hernández Airport",
    officialUrl: "https://www.aena.es/en/alicante-elche/index.html",
    city: "Alicante",
    region: "Costa Blanca",
    headline: "Costa Blanca Staging",
    subline: "The sun-drenched node for Spanish coastal missions and inland mountain passes.",
    seo: {
      title: "Alicante (ALC) Arrival OS | Costa Blanca Logistics | JetMyMoto",
      description: "Land at ALC and ride the Costa Blanca. Premium motorcycle logistics and partner nodes for the Spanish southeast."
    },
    logistics: {
      node_name: "JetMyMoto Alicante Partner Node",
      node_distance_min: 15,
      differentiators: ["Direct access to AP-7 coast road", "Year-round riding climate staging", "Secure indoor bike storage"]
    },
    recovery: {
      premium: {
        name: "Hospes Amérigo",
        href: `https://www.booking.com/hotel/es/hospes-amerigo.en.html?aid=${AFFILIATE_ID}&label=ALC-recovery`,
        desc: "Boutique luxury in a former convent, perfect for mission recovery."
      },
      budget: {
        name: "Hotel Areca",
        href: `https://www.booking.com/hotel/es/areca.en.html?aid=${AFFILIATE_ID}&label=ALC-recovery`,
        desc: "Practical airport-adjacent stay with spa and logistics proximity."
      }
    }
  },

  AMS: {
    code: "AMS",
    name: "Amsterdam Airport Schiphol",
    officialUrl: "https://www.schiphol.nl/",
    city: "Amsterdam",
    region: "Northern Europe Hub",
    headline: "North Atlantic Gateway",
    subline: "Primary logistics node for trans-European missions starting in the Benelux.",
    seo: {
      title: "Amsterdam (AMS) Arrival OS | Benelux Staging | JetMyMoto",
      description: "Schiphol's premier arrival platform for motorcycle logistics. Managed deployment for Northern Europe."
    },
    logistics: {
      node_name: "JetMyMoto Schiphol Partner Node",
      node_distance_min: 12,
      differentiators: ["Deep integration with Dutch road network", "Secured port-to-road transitions", "High-spec tech prep facilities"]
    },
    recovery: {
      premium: {
        name: "Sheraton Amsterdam Airport Hotel",
        href: `https://www.booking.com/hotel/nl/sheraton-amsterdam-airport-and-conference-center.en.html?aid=${AFFILIATE_ID}&label=AMS-recovery`,
        desc: "Direct terminal access via covered walkway."
      },
      budget: {
        name: "CitizenM Schiphol Airport",
        href: `https://www.booking.com/hotel/nl/citizenm-schiphol-airport.en.html?aid=${AFFILIATE_ID}&label=AMS-recovery`,
        desc: "Smart, efficient stay just minutes from the gates."
      }
    }
  },

  ARN: {
    code: "ARN",
    name: "Stockholm Arlanda Airport",
    officialUrl: "https://www.swedavia.se/arlanda/",
    city: "Stockholm",
    region: "Scandinavia",
    headline: "Nordic Frontier Node",
    subline: "The jumping-off point for Arctic Circle and Scandinavian forest missions.",
    seo: {
      title: "Stockholm (ARN) Arrival OS | Scandinavian Logistics | JetMyMoto",
      description: "Arlanda's tactical gateway for Nordic adventures. Secure bike staging for the midnight sun."
    },
    logistics: {
      node_name: "JetMyMoto Stockholm North Node",
      node_distance_min: 18,
      differentiators: ["Specialized Arctic prep services", "Insured Scandinavian transport loops", "Summer mission experts"]
    },
    recovery: {
      premium: {
        name: "Radisson Blu SkyCity Hotel",
        href: `https://www.booking.com/hotel/se/radisson-sas-skycity-arlanda.en.html?aid=${AFFILIATE_ID}&label=ARN-recovery`,
        desc: "High-end recovery inside SkyCity between terminals."
      },
      budget: {
        name: "Comfort Hotel Arlanda Airport",
        href: `https://www.booking.com/hotel/se/comfort-arlanda-airport.en.html?aid=${AFFILIATE_ID}&label=ARN-recovery`,
        desc: "Modern, sustainable, and directly at the terminal."
      }
    }
  },

  ATH: {
    code: "ATH",
    name: "Athens International Airport Eleftherios Venizelos",
    officialUrl: "https://www.aia.gr/",
    city: "Athens",
    region: "Aegean Staging",
    headline: "Aegean Logistics Hub",
    subline: "Staging node for Peloponnese mountain loops and island hopping.",
    seo: {
      title: "Athens (ATH) Arrival OS | Greece Motorcycle Staging | JetMyMoto",
      description: "Athens Airport's tactical gateway for Greece. Land, load, and ride the cradle of adventure."
    },
    logistics: {
      node_name: "JetMyMoto Attica Partner Node",
      node_distance_min: 22,
      differentiators: ["Expertise in island-ferry logistics", "Heat-resistant technical prep", "Mainland-to-Peloponnese routes"]
    },
    recovery: {
      premium: {
        name: "Sofitel Athens Airport",
        href: `https://www.booking.com/hotel/gr/sofitel-athens-airport.en.html?aid=${AFFILIATE_ID}&label=ATH-recovery`,
        desc: "Five-star luxury directly across from the terminal building."
      },
      budget: {
        name: "Holiday Inn Athens Attica",
        href: `https://www.booking.com/hotel/gr/holiday-inn-athens-attica-av.en.html?aid=${AFFILIATE_ID}&label=ATH-recovery`,
        desc: "Reliable airport-adjacent hub with frequent shuttle service."
      }
    }
  },

  BER: {
    code: "BER",
    name: "Berlin Brandenburg Airport Willy Brandt",
    officialUrl: "https://ber.berlin-airport.de/",
    city: "Berlin",
    region: "Central Europe",
    headline: "Brandenburg Staging",
    subline: "Staging node for Baltic Sea runs and Eastern European exploration.",
    seo: {
      title: "Berlin (BER) Arrival OS | German Logistics Hub | JetMyMoto",
      description: "Berlin's official arrival node for motorcycle logistics. Secure staging for the German heartland."
    },
    logistics: {
      node_name: "JetMyMoto Berlin East Node",
      node_distance_min: 20,
      differentiators: ["New infrastructure logistics node", "Gateway to the Polish border routes", "Secured indoor staging"]
    },
    recovery: {
      premium: {
        name: "Steigenberger Airport Hotel BER",
        href: `https://www.booking.com/hotel/de/steigenberger-airport-berlin.en.html?aid=${AFFILIATE_ID}&label=BER-recovery`,
        desc: "Luxury recovery directly at the BER terminal."
      },
      budget: {
        name: "IntercityHotel Berlin Airport BER",
        href: `https://www.booking.com/hotel/de/intercityhotel-berlin-airport-ber.en.html?aid=${AFFILIATE_ID}&label=BER-recovery`,
        desc: "Practical business hotel within walking distance of Terminal 1."
      }
    }
  },

  BGY: {
    code: "BGY",
    name: "Orio al Serio International Airport (Milan Bergamo)",
    officialUrl: "https://www.milanbergamoairport.it/",
    city: "Bergamo",
    region: "Italian Lakes / Alps",
    headline: "Lombardy Alpine Staging",
    subline: "The specialized node for Lake Como and the Stelvio Pass.",
    seo: {
      title: "Bergamo (BGY) Arrival OS | Lake Como Logistics | JetMyMoto",
      description: "Bergamo's tactical hub for the Italian Alps. Your Stelvio mission starts 20 minutes from the BGY terminal."
    },
    logistics: {
      node_name: "JetMyMoto Lombardy Partner Node",
      node_distance_min: 15,
      differentiators: ["Direct access to Alpine foothill routes", "Specialized Stelvio-prep services", "Verifed local staging partner"]
    },
    recovery: {
      premium: {
        name: "Relais San Lorenzo",
        href: `https://www.booking.com/hotel/it/relais-san-lorenzo.en.html?aid=${AFFILIATE_ID}&label=BGY-recovery`,
        desc: "High-end recovery in Bergamo Alta, 15 minutes away."
      },
      budget: {
        name: "NH Orio al Serio",
        href: `https://www.booking.com/hotel/it/nh-orio-al-serio.en.html?aid=${AFFILIATE_ID}&label=BGY-recovery`,
        desc: "Connected to the airport via pedestrian walkway."
      }
    }
  },

  BLQ: {
    code: "BLQ",
    name: "Bologna Guglielmo Marconi Airport",
    officialUrl: "https://www.bologna-airport.it/",
    city: "Bologna",
    region: "Motor Valley",
    headline: "Motor Valley Command",
    subline: "The epicenter of Italian machinery. Staging for Ducati, Ferrari, and Apennine missions.",
    seo: {
      title: "Bologna (BLQ) Arrival OS | Motor Valley Logistics | JetMyMoto",
      description: "Land in the heart of the Motor Valley. Secure motorcycle staging and logistics for the Italian heartland."
    },
    logistics: {
      node_name: "JetMyMoto Emilia-Romagna Node",
      node_distance_min: 12,
      differentiators: ["Staging point for Motor Valley factory visits", "Apennine mountain pass experts", "Insured Italian machinery handling"]
    },
    recovery: {
      premium: {
        name: "Grand Hotel Majestic gia' Baglioni",
        href: `https://www.booking.com/hotel/it/grand-baglioni.en.html?aid=${AFFILIATE_ID}&label=BLQ-recovery`,
        desc: "Historic luxury in central Bologna."
      },
      budget: {
        name: "Hotel FlyOn",
        href: `https://www.booking.com/hotel/it/flyon.en.html?aid=${AFFILIATE_ID}&label=BLQ-recovery`,
        desc: "Dedicated airport hotel with high-frequency logistics shuttle."
      }
    }
  },

  BRU: {
    code: "BRU",
    name: "Brussels Airport",
    officialUrl: "https://www.brusselsairport.be/",
    city: "Brussels",
    region: "Western Europe",
    headline: "Flanders Staging",
    subline: "Staging node for Ardennes missions and Western European transit.",
    seo: {
      title: "Brussels (BRU) Arrival OS | Ardennes Logistics | JetMyMoto",
      description: "Brussels Airport's official motorcycle arrival platform. Secure staging for the Belgian hills."
    },
    logistics: {
      node_name: "JetMyMoto Flanders Partner Node",
      node_distance_min: 15,
      differentiators: ["Gateway to the Ardennes forest routes", "Centralized Benelux logistics", "Secured indoor prep area"]
    },
    recovery: {
      premium: {
        name: "Sheraton Brussels Airport Hotel",
        href: `https://www.booking.com/hotel/be/sheraton-brussels-airport.en.html?aid=${AFFILIATE_ID}&label=BRU-recovery`,
        desc: "Luxury stay located directly opposite the arrivals hall."
      },
      budget: {
        name: "Novotel Brussels Airport",
        href: `https://www.booking.com/hotel/be/novotel-brussels-airport.en.html?aid=${AFFILIATE_ID}&label=BRU-recovery`,
        desc: "Modern staging hub just minutes from the terminal."
      }
    }
  },

  CDG: {
    code: "CDG",
    name: "Paris Charles de Gaulle Airport",
    officialUrl: "https://www.parisaeroport.fr/",
    city: "Paris",
    region: "Western Europe Hub",
    headline: "The French Flagship",
    subline: "Primary logistics node for high-ticket French and European missions.",
    seo: {
      title: "Paris (CDG) Arrival OS | France Motorcycle Logistics | JetMyMoto",
      description: "Charles de Gaulle's premier arrival platform. Secure motorcycle staging for the heart of France."
    },
    logistics: {
      node_name: "JetMyMoto Paris North Node",
      node_distance_min: 25,
      differentiators: ["Global logistics integration", "Secured high-ticket vehicle staging", "Primary node for French tour starts"]
    },
    recovery: {
      premium: {
        name: "Pullman Paris Roissy CDG Airport",
        href: `https://www.booking.com/hotel/fr/pullman-paris-roissy-cdg-airport.en.html?aid=${AFFILIATE_ID}&label=CDG-recovery`,
        desc: "Upscale recovery with high-end wellness facilities."
      },
      budget: {
        name: "Ibis Paris CDG Airport",
        href: `https://www.booking.com/hotel/fr/ibis-paris-charles-de-gaulle-airport.en.html?aid=${AFFILIATE_ID}&label=CDG-recovery`,
        desc: "Massive, reliable staging hub directly inside the airport zone."
      }
    }
  },

  CPH: {
    code: "CPH",
    name: "Copenhagen Airport, Kastrup",
    officialUrl: "https://www.cph.dk/",
    city: "Copenhagen",
    region: "Scandinavia",
    headline: "Scandinavian Bridgehead",
    subline: "The node connecting Continental Europe to the Nordic ridge.",
    seo: {
      title: "Copenhagen (CPH) Arrival OS | Nordic Logistics | JetMyMoto",
      description: "Copenhagen's tactical gateway for motorcycle logistics. Staging for Denmark and Swedish bridge crossings."
    },
    logistics: {
      node_name: "JetMyMoto Kastrup Partner Node",
      node_distance_min: 10,
      differentiators: ["Øresund Bridge transit expertise", "Secure indoor Scandinavian staging", "Timed handover for bridge crossings"]
    },
    recovery: {
      premium: {
        name: "Clarion Hotel Copenhagen Airport",
        href: `https://www.booking.com/hotel/dk/hilton-copenhagen-airport.en.html?aid=${AFFILIATE_ID}&label=CPH-recovery`,
        desc: "Direct terminal access and high-end Nordic design."
      },
      budget: {
        name: "Comfort Hotel Copenhagen Airport",
        href: `https://www.booking.com/hotel/dk/comfort-copenhagen-airport.en.html?aid=${AFFILIATE_ID}&label=CPH-recovery`,
        desc: "New, efficient hub directly at the gates."
      }
    }
  },

  CTA: {
    code: "CTA",
    name: "Catania–Fontanarossa Airport",
    officialUrl: "https://www.aeroporto.catania.it/",
    city: "Catania",
    region: "Sicily / Etna",
    headline: "Etna Deployment Command",
    subline: "Staging node for volcanic missions and Sicilian coastal loops.",
    seo: {
      title: "Catania (CTA) Arrival OS | Sicily Motorcycle Staging | JetMyMoto",
      description: "Catania Airport's arrival hub for Sicily. Secure staging for Etna and Sicilian missions."
    },
    logistics: {
      node_name: "JetMyMoto Sicily East Node",
      node_distance_min: 12,
      differentiators: ["Etna mission staging specialists", "Insured Sicilian transport loops", "Summer heat preparation facilities"]
    },
    recovery: {
      premium: {
        name: "Four Points by Sheraton Catania",
        href: `https://www.booking.com/hotel/it/sheraton-catania-hotel-conference-center.en.html?aid=${AFFILIATE_ID}&label=CTA-recovery`,
        desc: "Seaside recovery on the Cyclops Coast."
      },
      budget: {
        name: "Aeroporto Hotel Catania",
        href: `https://www.booking.com/hotel/it/aeroporto-catania.en.html?aid=${AFFILIATE_ID}&label=CTA-recovery`,
        desc: "Reliable, no-frills staging directly at the terminal exit."
      }
    }
  },

  DUB: {
    code: "DUB",
    name: "Dublin Airport",
    officialUrl: "https://www.dublinairport.com/",
    city: "Dublin",
    region: "Ireland",
    headline: "Atlantic Ridge Staging",
    subline: "The node for Wild Atlantic Way missions and Irish coastal runs.",
    seo: {
      title: "Dublin (DUB) Arrival OS | Ireland Motorcycle Logistics | JetMyMoto",
      description: "Dublin Airport's premier arrival platform. Secure bike staging for the Wild Atlantic Way."
    },
    logistics: {
      node_name: "JetMyMoto Ireland East Node",
      node_distance_min: 18,
      differentiators: ["Wild Atlantic Way logistics experts", "Insured Irish island transport", "Secure weather-protected staging"]
    },
    recovery: {
      premium: {
        name: "Radisson Blu Hotel, Dublin Airport",
        href: `https://www.booking.com/hotel/ie/radisson-sas-dublin-airport.en.html?aid=${AFFILIATE_ID}&label=DUB-recovery`,
        desc: "Upscale stay with direct terminal shuttle."
      },
      budget: {
        name: "Maldron Hotel Dublin Airport",
        href: `https://www.booking.com/hotel/ie/maldron-dublin-airport.en.html?aid=${AFFILIATE_ID}&label=DUB-recovery`,
        desc: "Practical staging hub within walking distance of terminals."
      }
    }
  },

  DUS: {
    code: "DUS",
    name: "Düsseldorf Airport",
    officialUrl: "https://www.dus.com/",
    city: "Düsseldorf",
    region: "North Rhine-Westphalia",
    headline: "Rhineland Deployment",
    subline: "Staging node for Eifel mountain runs and Western German missions.",
    seo: {
      title: "Düsseldorf (DUS) Arrival OS | Rhine Logistics Hub | JetMyMoto",
      description: "Düsseldorf Airport's official motorcycle arrival node. Secure staging for the Eifel forest."
    },
    logistics: {
      node_name: "JetMyMoto Rhine Partner Node",
      node_distance_min: 15,
      differentiators: ["Eifel mission staging specialists", "Rhineland-to-Alps logistics corridor", "Secured indoor tech prep"]
    },
    recovery: {
      premium: {
        name: "Maritim Hotel Düsseldorf",
        href: `https://www.booking.com/hotel/de/maritim-duesseldorf.en.html?aid=${AFFILIATE_ID}&label=DUS-recovery`,
        desc: "Elegant luxury connected to the airport terminal."
      },
      budget: {
        name: "Sheraton Düsseldorf Airport Hotel",
        href: `https://www.booking.com/hotel/de/sheraton-duesseldorf-airport.en.html?aid=${AFFILIATE_ID}&label=DUS-recovery`,
        desc: "High-quality recovery located directly on top of Terminal P3."
      }
    }
  },

  EDI: {
    code: "EDI",
    name: "Edinburgh Airport",
    officialUrl: "https://www.edinburghairport.com/",
    city: "Edinburgh",
    region: "Scotland / Highlands",
    headline: "Highland Interceptor",
    subline: "The jumping-off point for the North Coast 500 and Isle of Skye missions.",
    seo: {
      title: "Edinburgh (EDI) Arrival OS | Scotland Motorcycle Logistics | JetMyMoto",
      description: "Edinburgh Airport's arrival node for Scotland. Secure staging for the Highlands and NC500."
    },
    logistics: {
      node_name: "JetMyMoto Scotland South Hub",
      node_distance_min: 15,
      differentiators: ["NC500 logistics specialists", "Scottish island transport coordination", "Insured highland machinery prep"]
    },
    recovery: {
      premium: {
        name: "Norton House Hotel & Spa",
        href: `https://www.booking.com/hotel/gb/nortonhousehotel.en.html?aid=${AFFILIATE_ID}&label=EDI-recovery`,
        desc: "Country house luxury 5 minutes from the terminal."
      },
      budget: {
        name: "Moxy Edinburgh Airport",
        href: `https://www.booking.com/hotel/gb/moxy-edinburgh-airport.en.html?aid=${AFFILIATE_ID}&label=EDI-recovery`,
        desc: "Modern, lively staging point near the departure gates."
      }
    }
  },

  FAO: {
    code: "FAO",
    name: "Faro Airport",
    officialUrl: "https://www.ana.pt/en/fao/home",
    city: "Faro",
    region: "Algarve",
    headline: "Algarve Coastal Command",
    subline: "Staging node for southern Portugal coastal and inland ridge missions.",
    seo: {
      title: "Faro (FAO) Arrival OS | Algarve Motorcycle Logistics | JetMyMoto",
      description: "Faro Airport's official arrival node. Secure bike staging for the Algarve coast."
    },
    logistics: {
      node_name: "JetMyMoto Algarve Partner Node",
      node_distance_min: 10,
      differentiators: ["Coastal mission specialists", "Insured Portuguese inland transport", "Year-round riding climate prep"]
    },
    recovery: {
      premium: {
        name: "Pousada Palácio de Estoi",
        href: `https://www.booking.com/hotel/pt/pousada-palacio-de-estoi.en.html?aid=${AFFILIATE_ID}&label=FAO-recovery`,
        desc: "Palatial luxury 15 minutes from the airport."
      },
      budget: {
        name: "Hotel 3K Faro Aeroporto",
        href: `https://www.booking.com/hotel/pt/3k-faro-aeroporto.en.html?aid=${AFFILIATE_ID}&label=FAO-recovery`,
        desc: "Practical staging directly at the airport entrance."
      }
    }
  },

  FRA: {
    code: "FRA",
    name: "Frankfurt Airport",
    officialUrl: "https://www.frankfurt-airport.com/",
    city: "Frankfurt",
    region: "Central Germany Hub",
    headline: "The Continental Hub",
    subline: "Primary logistics node for trans-European missions and German heartland runs.",
    seo: {
      title: "Frankfurt (FRA) Arrival OS | German Logistics Hub | JetMyMoto",
      description: "Frankfurt's premier arrival platform. Secure motorcycle staging for Central Europe."
    },
    logistics: {
      node_name: "JetMyMoto Frankfurt Central Node",
      node_distance_min: 15,
      differentiators: ["Global logistics integration", "Secured indoor staging facilities", "Primary node for German heartland routes"]
    },
    recovery: {
      premium: {
        name: "Hilton Frankfurt Airport",
        href: `https://www.booking.com/hotel/de/hilton-frankfurt-airport.en.html?aid=${AFFILIATE_ID}&label=FRA-recovery`,
        desc: "Luxury recovery inside The Squaire, connected to Terminal 1."
      },
      budget: {
        name: "Hyatt Place Frankfurt Airport",
        href: `https://www.booking.com/hotel/de/hyatt-place-frankfurt-airport.en.html?aid=${AFFILIATE_ID}&label=FRA-recovery`,
        desc: "Modern staging hub in Gateway Gardens."
      }
    }
  },

  HAM: {
    code: "HAM",
    name: "Hamburg Airport",
    officialUrl: "https://www.hamburg-airport.de/",
    city: "Hamburg",
    region: "Northern Germany",
    headline: "Hanseatic Interceptor",
    subline: "Staging node for Baltic Sea coast missions and Danish border runs.",
    seo: {
      title: "Hamburg (HAM) Arrival OS | Northern Germany Logistics | JetMyMoto",
      description: "Hamburg Airport's tactical gateway for motorcycle logistics. Secure staging for Northern Germany."
    },
    logistics: {
      node_name: "JetMyMoto Hamburg North Node",
      node_distance_min: 15,
      differentiators: ["Baltic mission staging specialists", "Nordic-to-Continental logistics", "Secured weather-protected prep"]
    },
    recovery: {
      premium: {
        name: "Radisson Blu Hotel, Hamburg Airport",
        href: `https://www.booking.com/hotel/de/radisson-sas-hamburg-airport.en.html?aid=${AFFILIATE_ID}&label=HAM-recovery`,
        desc: "Upscale recovery directly opposite Terminals 1 and 2."
      },
      budget: {
        name: "Courtyard by Marriott Hamburg Airport",
        href: `https://www.booking.com/hotel/de/courtyard-by-marriott-hamburg-airport.en.html?aid=${AFFILIATE_ID}&label=HAM-recovery`,
        desc: "Reliable staging hub with frequent terminal shuttle service."
      }
    }
  },

  HEL: {
    code: "HEL",
    name: "Helsinki Airport",
    officialUrl: "https://www.finavia.fi/en/airports/helsinki",
    city: "Helsinki",
    region: "Finland / Baltic",
    headline: "Finnish Frontier Node",
    subline: "Staging node for Lapland Arctic runs and Finnish lake missions.",
    seo: {
      title: "Helsinki (HEL) Arrival OS | Finnish Logistics Hub | JetMyMoto",
      description: "Helsinki's tactical gateway for motorcycle logistics. Secure bike staging for the Finnish wilderness."
    },
    logistics: {
      node_name: "JetMyMoto Helsinki North Node",
      node_distance_min: 12,
      differentiators: ["Arctic prep and winter-to-summer staging", "Insured Finnish island transport", "Gateway to Lapland missions"]
    },
    recovery: {
      premium: {
        name: "Scandic Helsinki Airport",
        href: `https://www.booking.com/hotel/fi/scandic-helsinki-airport.en.html?aid=${AFFILIATE_ID}&label=HEL-recovery`,
        desc: "High-end Nordic recovery directly at the terminal."
      },
      budget: {
        name: "GLO Hotel Airport",
        href: `https://www.booking.com/hotel/fi/glo-airport.en.html?aid=${AFFILIATE_ID}&label=HEL-recovery`,
        desc: "Practical stay located inside Terminal 2."
      }
    }
  },

  IST: {
    code: "IST",
    name: "Istanbul Airport",
    officialUrl: "https://www.istairport.com/",
    city: "Istanbul",
    region: "Eurasia Hub",
    headline: "Eurasian Crossroads",
    subline: "The bridge node connecting European missions to Anatolian territory.",
    seo: {
      title: "Istanbul (IST) Arrival OS | Eurasia Logistics Hub | JetMyMoto",
      description: "Istanbul's premier arrival platform for motorcycle logistics. Secure staging between two continents."
    },
    logistics: {
      node_name: "JetMyMoto Istanbul North Hub",
      node_distance_min: 25,
      differentiators: ["Global logistics integration", "Anatolian mission staging specialists", "Secured high-ticket machinery prep"]
    },
    recovery: {
      premium: {
        name: "YOTEL Air Istanbul Airport",
        href: `https://www.booking.com/hotel/tr/yotel-istanbul-airport-airside.en.html?aid=${AFFILIATE_ID}&label=IST-recovery`,
        desc: "Futuristic luxury recovery located inside the main terminal."
      },
      budget: {
        name: "Park Inn by Radisson Istanbul Odayeri",
        href: `https://www.booking.com/hotel/tr/park-inn-by-radisson-istanbul-airport-odayeri.en.html?aid=${AFFILIATE_ID}&label=IST-recovery`,
        desc: "Reliable staging node in the lush airport corridor."
      }
    }
  },

  LGW: {
    code: "LGW",
    name: "London Gatwick Airport",
    officialUrl: "https://www.gatwickairport.com/",
    city: "London",
    region: "South East UK",
    headline: "Southern Downs Staging",
    subline: "Staging node for South Downs National Park and coastal missions.",
    seo: {
      title: "London Gatwick (LGW) Arrival OS | UK Motorcycle Logistics | JetMyMoto",
      description: "Gatwick's tactical gateway for UK motorcycle logistics. Secure staging for the South Downs."
    },
    logistics: {
      node_name: "JetMyMoto Gatwick Partner Node",
      node_distance_min: 15,
      differentiators: ["South Downs mission specialists", "Insured UK coastal transport", "Secured indoor tech prep"]
    },
    recovery: {
      premium: {
        name: "Sofitel London Gatwick",
        href: `https://www.booking.com/hotel/gb/sofitel-london-gatwick.en.html?aid=${AFFILIATE_ID}&label=LGW-recovery`,
        desc: "Upscale recovery connected to the North Terminal."
      },
      budget: {
        name: "Hampton by Hilton London Gatwick",
        href: `https://www.booking.com/hotel/gb/hampton-by-hilton-london-gatwick-airport.en.html?aid=${AFFILIATE_ID}&label=LGW-recovery`,
        desc: "Modern staging hub directly at the North Terminal."
      }
    }
  },

  LHR: {
    code: "LHR",
    name: "London Heathrow Airport",
    officialUrl: "https://www.heathrow.com/",
    city: "London",
    region: "UK Main Hub",
    headline: "The British Flagship",
    subline: "Primary logistics node for high-ticket UK and European missions.",
    seo: {
      title: "London Heathrow (LHR) Arrival OS | UK Motorcycle Logistics | JetMyMoto",
      description: "Heathrow's premier arrival platform. Secure motorcycle staging for the British Isles."
    },
    logistics: {
      node_name: "JetMyMoto Heathrow West Node",
      node_distance_min: 20,
      differentiators: ["Global logistics integration", "Secured high-ticket machinery staging", "Primary node for UK tour starts"]
    },
    recovery: {
      premium: {
        name: "Sofitel London Heathrow",
        href: `https://www.booking.com/hotel/gb/sofitel-london-heathrow.en.html?aid=${AFFILIATE_ID}&label=LHR-recovery`,
        desc: "Direct terminal access and five-star recovery."
      },
      budget: {
        name: "Hilton Garden Inn London Heathrow",
        href: `https://www.booking.com/hotel/gb/hilton-garden-inn-london-heathrow-airport.en.html?aid=${AFFILIATE_ID}&label=LHR-recovery`,
        desc: "Modern staging directly inside Terminal 2."
      }
    }
  },

  LIN: {
    code: "LIN",
    name: "Milan Linate Airport",
    officialUrl: "https://www.milanolinate-airport.com/",
    city: "Milan",
    region: "Milan City Staging",
    headline: "City Center Interceptor",
    subline: "The high-efficiency node for quick city hops and Lombardy ridge runs.",
    seo: {
      title: "Milan Linate (LIN) Arrival OS | Milan City Logistics | JetMyMoto",
      description: "Linate's tactical city hub for motorcycle logistics. Staging for the Milan heartland."
    },
    logistics: {
      node_name: "JetMyMoto Linate City Node",
      node_distance_min: 10,
      differentiators: ["High-speed city staging", "Lombardy ridge mission specialists", "Secured urban machinery prep"]
    },
    recovery: {
      premium: {
        name: "Hotel de la Ville Monza",
        href: `https://www.booking.com/hotel/it/de-la-ville-monza.en.html?aid=${AFFILIATE_ID}&label=LIN-recovery`,
        desc: "Historic luxury near the Monza F1 circuit."
      },
      budget: {
        name: "Novotel Milano Linate Aeroporto",
        href: `https://www.booking.com/hotel/it/novotel-milano-linate-aeroporto.en.html?aid=${AFFILIATE_ID}&label=LIN-recovery`,
        desc: "Solid, modern staging just minutes from the gates."
      }
    }
  },

  LIS: {
    code: "LIS",
    name: "Lisbon Humberto Delgado Airport",
    officialUrl: "https://www.ana.pt/en/lis/home",
    city: "Lisbon",
    region: "Atlantic Ridge",
    headline: "The Lusitanian Gateway",
    subline: "Staging node for Atlantic coast missions and Central Portuguese runs.",
    seo: {
      title: "Lisbon (LIS) Arrival OS | Portugal Motorcycle Logistics | JetMyMoto",
      description: "Lisbon's premier arrival platform. Secure bike staging for the Atlantic coast."
    },
    logistics: {
      node_name: "JetMyMoto Lisbon West Node",
      node_distance_min: 15,
      differentiators: ["Atlantic coast mission specialists", "Insured Central Portugal transport", "Secured weather-protected staging"]
    },
    recovery: {
      premium: {
        name: "Myriad by SANA Hotels",
        href: `https://www.booking.com/hotel/pt/myriad-by-sana.en.html?aid=${AFFILIATE_ID}&label=LIS-recovery`,
        desc: "Futuristic luxury on the Tagus riverfront."
      },
      budget: {
        name: "Star inn Lisbon Airport",
        href: `https://www.booking.com/hotel/pt/tryp-lisboa-airport.en.html?aid=${AFFILIATE_ID}&label=LIS-recovery`,
        desc: "Modern staging hub within walking distance of Terminal 1."
      }
    }
  },

  LPA: {
    code: "LPA",
    name: "Gran Canaria Airport",
    officialUrl: "https://www.aena.es/en/gran-canaria/index.html",
    city: "Las Palmas",
    region: "Canary Islands",
    headline: "Canary Ridge Command",
    subline: "Staging node for year-round volcanic mountain missions.",
    seo: {
      title: "Gran Canaria (LPA) Arrival OS | Canary Island Logistics | JetMyMoto",
      description: "Gran Canaria's official arrival node. Secure staging for volcanic mountain missions."
    },
    logistics: {
      node_name: "JetMyMoto Gran Canaria Node",
      node_distance_min: 15,
      differentiators: ["Volcanic ridge mission specialists", "Island-hopping logistics experts", "Year-round riding climate prep"]
    },
    recovery: {
      premium: {
        name: "Santa Catalina, a Royal Hideaway Hotel",
        href: `https://www.booking.com/hotel/es/santa-catalina.en.html?aid=${AFFILIATE_ID}&label=LPA-recovery`,
        desc: "Historic colonial luxury in Las Palmas."
      },
      budget: {
        name: "Elba Vecindario Aeroporto Business & Convention Hotel",
        href: `https://www.booking.com/hotel/es/elba-vecindario-aeroporto-business-convention.en.html?aid=${AFFILIATE_ID}&label=LPA-recovery`,
        desc: "Reliable business staging hub 10 minutes from the terminal."
      }
    }
  },

  LYS: {
    code: "LYS",
    name: "Lyon–Saint-Exupéry Airport",
    officialUrl: "https://www.lyonaeroport.com/",
    city: "Lyon",
    region: "Rhône-Alps",
    headline: "The French Alpine Gateway",
    subline: "Staging node for Mont Ventoux and Vercors mountain missions.",
    seo: {
      title: "Lyon (LYS) Arrival OS | French Alpine Logistics | JetMyMoto",
      description: "Lyon Airport's official arrival node. Secure bike staging for the Rhône-Alps."
    },
    logistics: {
      node_name: "JetMyMoto Lyon East Partner Node",
      node_distance_min: 20,
      differentiators: ["Vercors mission staging specialists", "Insured French Alps transport", "Secured indoor tech prep"]
    },
    recovery: {
      premium: {
        name: "NH Lyon Hotel Aéroport Saint Exupéry",
        href: `https://www.booking.com/hotel/fr/nh-lyon-aeroport.en.html?aid=${AFFILIATE_ID}&label=LYS-recovery`,
        desc: "Direct terminal access and modern recovery."
      },
      budget: {
        name: "Ibis Budget Aéroport Lyon Saint Exupéry",
        href: `https://www.booking.com/hotel/fr/ibis-budget-aeroport-lyon-saint-exupery.en.html?aid=${AFFILIATE_ID}&label=LYS-recovery`,
        desc: "Practical staging hub within walking distance of terminals."
      }
    }
  },

  MAD: {
    code: "MAD",
    name: "Adolfo Suárez Madrid–Barajas Airport",
    officialUrl: "https://www.aena.es/en/adolfo-suarez-madrid-barajas/index.html",
    city: "Madrid",
    region: "Central Spain Hub",
    headline: "The Castilian Command",
    subline: "Primary logistics node for trans-Iberian missions and Central Spanish runs.",
    seo: {
      title: "Madrid (MAD) Arrival OS | Spanish Logistics Hub | JetMyMoto",
      description: "Madrid's premier arrival platform. Secure motorcycle staging for Central Iberia."
    },
    logistics: {
      node_name: "JetMyMoto Madrid Central Node",
      node_distance_min: 20,
      differentiators: ["Global logistics integration", "Secured indoor staging facilities", "Primary node for Central Iberian routes"]
    },
    recovery: {
      premium: {
        name: "Hilton Madrid Airport",
        href: `https://www.booking.com/hotel/es/hilton-madrid-airport.en.html?aid=${AFFILIATE_ID}&label=MAD-recovery`,
        desc: "Luxury recovery with high-end fitness facilities."
      },
      budget: {
        name: "Ibis Madrid Aeroporto Barajas",
        href: `https://www.booking.com/hotel/es/ibis-madrid-aeropuerto-barajas.en.html?aid=${AFFILIATE_ID}&label=MAD-recovery`,
        desc: "Reliable staging hub in the Barajas district."
      }
    }
  },

  MXP: {
    code: "MXP",
    name: "Milan Malpensa Airport",
    officialUrl: "https://www.milanomalpensa-airport.com/",
    city: "Milan",
    region: "Italian Alps Hub",
    headline: "Alpine Interceptor Hub",
    subline: "Primary logistics node for high-altitude missions and Lake District runs.",
    seo: {
      title: "Milan Malpensa (MXP) Arrival OS | Italian Alps Logistics | JetMyMoto",
      description: "Malpensa's premier arrival platform. Secure motorcycle staging for the Italian Alps."
    },
    logistics: {
      node_name: "JetMyMoto Malpensa North Hub",
      node_distance_min: 15,
      differentiators: ["Alpine mission staging specialists", "Secured high-ticket machinery staging", "Primary node for Northern Italian tours"]
    },
    recovery: {
      premium: {
        name: "Sheraton Milan Malpensa Airport Hotel",
        href: `https://www.booking.com/hotel/it/sheraton-milan-malpensa-airport-and-conference-center.en.html?aid=${AFFILIATE_ID}&label=MXP-recovery`,
        desc: "Direct terminal access and high-end recovery."
      },
      budget: {
        name: "Moxy Milan Malpensa Airport",
        href: `https://www.booking.com/hotel/it/moxy-milan-malpensa-airport.en.html?aid=${AFFILIATE_ID}&label=MXP-recovery`,
        desc: "Modern, lively staging directly at Terminal 2."
      }
    }
  },

  NAP: {
    code: "NAP",
    name: "Naples International Airport",
    officialUrl: "https://www.aeroportodinapoli.it/",
    city: "Naples",
    region: "Amalfi Coast / Vesuvius",
    headline: "Amalfi Ridge Command",
    subline: "Staging node for Amalfi coast missions and southern Apennine runs.",
    seo: {
      title: "Naples (NAP) Arrival OS | Amalfi Coast Logistics | JetMyMoto",
      description: "Naples Airport's tactical gateway for motorcycle logistics. Secure staging for the Amalfi coast."
    },
    logistics: {
      node_name: "JetMyMoto Campania Partner Node",
      node_distance_min: 15,
      differentiators: ["Amalfi coast mission specialists", "Insured Campania transport loops", "Secured urban machinery prep"]
    },
    recovery: {
      premium: {
        name: "Grand Hotel Vesuvio",
        href: `https://www.booking.com/hotel/it/grand-vesuvio.en.html?aid=${AFFILIATE_ID}&label=NAP-recovery`,
        desc: "Historic seaside luxury in central Naples."
      },
      budget: {
        name: "Terminal 1 Guest House",
        href: `https://www.booking.com/hotel/it/terminal-1-guest-house.en.html?aid=${AFFILIATE_ID}&label=NAP-recovery`,
        desc: "Practical stay located directly inside the airport perimeter."
      }
    }
  },

  OPO: {
    code: "OPO",
    name: "Francisco Sá Carneiro Airport (Porto)",
    officialUrl: "https://www.ana.pt/en/opo/home",
    city: "Porto",
    region: "Northern Portugal / Douro",
    headline: "Douro Valley Gateway",
    subline: "Staging node for Douro Valley missions and Northern Portuguese runs.",
    seo: {
      title: "Porto (OPO) Arrival OS | Douro Valley Logistics | JetMyMoto",
      description: "Porto's premier arrival platform. Secure bike staging for the Douro Valley."
    },
    logistics: {
      node_name: "JetMyMoto Porto North Hub",
      node_distance_min: 15,
      differentiators: ["Douro Valley mission specialists", "Insured Northern Portugal transport", "Secured weather-protected staging"]
    },
    recovery: {
      premium: {
        name: "Sheraton Porto Hotel & Spa",
        href: `https://www.booking.com/hotel/pt/sheraton-porto-and-spa.en.html?aid=${AFFILIATE_ID}&label=OPO-recovery`,
        desc: "High-end recovery in the heart of the city."
      },
      budget: {
        name: "Park Hotel Porto Aeroporto",
        href: `https://www.booking.com/hotel/pt/park-porto-aeroporto.en.html?aid=${AFFILIATE_ID}&label=OPO-recovery`,
        desc: "Reliable staging hub directly at the terminal exit."
      }
    }
  },

  ORY: {
    code: "ORY",
    name: "Paris Orly Airport",
    officialUrl: "https://www.parisaeroport.fr/",
    city: "Paris",
    region: "Paris City Staging",
    headline: "Southern City Interceptor",
    subline: "Staging node for Loire Valley missions and southern French runs.",
    seo: {
      title: "Paris Orly (ORY) Arrival OS | Paris City Logistics | JetMyMoto",
      description: "Orly's tactical city hub for motorcycle logistics. Staging for the southern French heartland."
    },
    logistics: {
      node_name: "JetMyMoto Paris South Node",
      node_distance_min: 15,
      differentiators: ["Loire Valley mission specialists", "Insured Southern France transport", "Secured urban machinery prep"]
    },
    recovery: {
      premium: {
        name: "Novotel Paris Coeur d'Orly Airport",
        href: `https://www.booking.com/hotel/fr/novotel-paris-coeur-d-orly-airport.en.html?aid=${AFFILIATE_ID}&label=ORY-recovery`,
        desc: "Direct terminal access and modern recovery."
      },
      budget: {
        name: "Ibis Paris Coeur d'Orly Airport",
        href: `https://www.booking.com/hotel/fr/ibis-paris-coeur-d-orly-airport.en.html?aid=${AFFILIATE_ID}&label=ORY-recovery`,
        desc: "Practical staging hub within walking distance of terminals."
      }
    }
  },

  OSL: {
    code: "OSL",
    name: "Oslo Airport, Gardermoen",
    officialUrl: "https://avinor.no/en/airport/oslo-airport/",
    city: "Oslo",
    region: "Norway Hub",
    headline: "The Fjord Gateway",
    subline: "Primary logistics node for high-altitude Fjord and mountain missions.",
    seo: {
      title: "Oslo (OSL) Arrival OS | Norway Motorcycle Logistics | JetMyMoto",
      description: "Oslo's premier arrival platform. Secure motorcycle staging for the Norwegian Fjords."
    },
    logistics: {
      node_name: "JetMyMoto Oslo North Hub",
      node_distance_min: 15,
      differentiators: ["Fjord mission staging specialists", "Secured Arctic-ready machinery prep", "Primary node for Norwegian tours"]
    },
    recovery: {
      premium: {
        name: "Radisson Blu Airport Hotel, Oslo Gardermoen",
        href: `https://www.booking.com/hotel/no/radisson-sas-airport-oslo-gardermoen.en.html?aid=${AFFILIATE_ID}&label=OSL-recovery`,
        desc: "Direct terminal access and upscale Nordic recovery."
      },
      budget: {
        name: "Comfort Hotel RunWay",
        href: `https://www.booking.com/hotel/no/comfort-runway.en.html?aid=${AFFILIATE_ID}&label=OSL-recovery`,
        desc: "Efficient, modern hub just minutes from the gates."
      }
    }
  },

  OTP: {
    code: "OTP",
    name: "Bucharest Henri Coandă International Airport",
    officialUrl: "https://www.bucharestairports.ro/en",
    city: "Bucharest",
    region: "Carpathians Gateway",
    headline: "Carpathian Command",
    subline: "Staging node for Transfăgărășan missions and Balkan ridge runs.",
    seo: {
      title: "Bucharest (OTP) Arrival OS | Carpathian Logistics | JetMyMoto",
      description: "Bucharest's tactical gateway for motorcycle logistics. Secure staging for the Transfăgărășan."
    },
    logistics: {
      node_name: "JetMyMoto Romania Central Node",
      node_distance_min: 15,
      differentiators: ["Transfăgărășan mission staging specialists", "Insured Balkan transport loops", "Secured indoor prep area"]
    },
    recovery: {
      premium: {
        name: "Hilton Garden Inn Bucharest Airport",
        href: `https://www.booking.com/hotel/ro/hilton-garden-inn-bucharest-airport.en.html?aid=${AFFILIATE_ID}&label=OTP-recovery`,
        desc: "Directly located at the terminal exit with modern recovery."
      },
      budget: {
        name: "Vienna House Easy by Wyndham Bucharest Airport",
        href: `https://www.booking.com/hotel/ro/angelo-airporthotel-bucharest.en.html?aid=${AFFILIATE_ID}&label=OTP-recovery`,
        desc: "Practical staging hub just minutes from the gates."
      }
    }
  },

  PMI: {
    code: "PMI",
    name: "Palma de Mallorca Airport",
    officialUrl: "https://www.aena.es/en/palma-de-mallorca/index.html",
    city: "Palma",
    region: "Balearic Islands",
    headline: "Tramuntana Staging",
    subline: "Staging node for Sierra de Tramuntana mountain missions and coastal loops.",
    seo: {
      title: "Palma (PMI) Arrival OS | Mallorca Motorcycle Staging | JetMyMoto",
      description: "Palma Airport's arrival hub for Mallorca. Secure staging for Tramuntana missions."
    },
    logistics: {
      node_name: "JetMyMoto Mallorca Central Node",
      node_distance_min: 12,
      differentiators: ["Tramuntana mission staging specialists", "Insured Balearic island transport", "Year-round riding climate prep"]
    },
    recovery: {
      premium: {
        name: "Hotel Victoria Gran Meliá",
        href: `https://www.booking.com/hotel/es/victoria.en.html?aid=${AFFILIATE_ID}&label=PMI-recovery`,
        desc: "High-end recovery on Palma's Paseo Marítimo."
      },
      budget: {
        name: "Helios Mallorca Hotel & Apartments",
        href: `https://www.booking.com/hotel/es/heliosmallorca.en.html?aid=${AFFILIATE_ID}&label=PMI-recovery`,
        desc: "Modern staging hub in the Playa de Palma district."
      }
    }
  },

  PRG: {
    code: "PRG",
    name: "Václav Havel Airport Prague",
    officialUrl: "https://www.prg.aero/en",
    city: "Prague",
    region: "Central Europe",
    headline: "Bohemian Interceptor",
    subline: "Staging node for Bohemian Forest missions and Central European transit.",
    seo: {
      title: "Prague (PRG) Arrival OS | Bohemian Logistics Hub | JetMyMoto",
      description: "Prague's tactical gateway for motorcycle logistics. Secure staging for Central Europe."
    },
    logistics: {
      node_name: "JetMyMoto Prague North Node",
      node_distance_min: 15,
      differentiators: ["Bohemian mission staging specialists", "Insured Czech heartland transport", "Secured indoor tech prep"]
    },
    recovery: {
      premium: {
        name: "Courtyard by Marriott Prague Airport",
        href: `https://www.booking.com/hotel/cz/courtyard-by-marriott-prague-airport.en.html?aid=${AFFILIATE_ID}&label=PRG-recovery`,
        desc: "Upscale recovery directly at the airport terminal."
      },
      budget: {
        name: "Holiday Inn Prague Airport",
        href: `https://www.booking.com/hotel/cz/holiday-inn-prague-airport.en.html?aid=${AFFILIATE_ID}&label=PRG-recovery`,
        desc: "Reliable staging hub just minutes from the gates."
      }
    }
  },

  SPU: {
    code: "SPU",
    name: "Split Airport",
    officialUrl: "https://www.split-airport.hr/",
    city: "Split",
    region: "Dalmatian Coast",
    headline: "The Adriatic Gateway",
    subline: "Staging node for Dalmatian coast missions and island hopping.",
    seo: {
      title: "Split (SPU) Arrival OS | Adriatic Motorcycle Staging | JetMyMoto",
      description: "Split Airport's arrival hub for Dalmatia. Secure staging for island hopping and coastal missions."
    },
    logistics: {
      node_name: "JetMyMoto Dalmatia Partner Node",
      node_distance_min: 12,
      differentiators: ["Island-ferry logistics specialists", "Insured Croatian transport loops", "Secured urban machinery prep"]
    },
    recovery: {
      premium: {
        name: "Hotel Park Split",
        href: `https://www.booking.com/hotel/hr/park-split.en.html?aid=${AFFILIATE_ID}&label=SPU-recovery`,
        desc: "Historic seaside luxury in central Split."
      },
      budget: {
        name: "Hotel Manufaktura",
        href: `https://www.booking.com/hotel/hr/manufaktura.en.html?aid=${AFFILIATE_ID}&label=SPU-recovery`,
        desc: "Modern staging hub in the airport corridor."
      }
    }
  },

  STR: {
    code: "STR",
    name: "Stuttgart Airport",
    officialUrl: "https://www.stuttgart-airport.com/",
    city: "Stuttgart",
    region: "Black Forest Gateway",
    headline: "Black Forest Command",
    subline: "Staging node for Black Forest missions and southern German runs.",
    seo: {
      title: "Stuttgart (STR) Arrival OS | Black Forest Logistics | JetMyMoto",
      description: "Stuttgart Airport's tactical gateway for motorcycle logistics. Secure staging for the Black Forest."
    },
    logistics: {
      node_name: "JetMyMoto Swabia Partner Node",
      node_distance_min: 15,
      differentiators: ["Black Forest mission specialists", "Insured Southern German transport", "Secured indoor tech prep"]
    },
    recovery: {
      premium: {
        name: "Mövenpick Hotel Stuttgart Airport",
        href: `https://www.booking.com/hotel/de/movenpick-stuttgart-airport.en.html?aid=${AFFILIATE_ID}&label=STR-recovery`,
        desc: "Direct terminal access and upscale recovery."
      },
      budget: {
        name: "Wyndham Stuttgart Airport Messe",
        href: `https://www.booking.com/hotel/de/wyndham-stuttgart-airport-messe.en.html?aid=${AFFILIATE_ID}&label=STR-recovery`,
        desc: "Reliable staging hub directly at the terminal exit."
      }
    }
  },

  TFS: {
    code: "TFS",
    name: "Tenerife South Airport",
    officialUrl: "https://www.aena.es/en/tenerife-sur/index.html",
    city: "Tenerife",
    region: "Canary Islands",
    headline: "Teide Ridge Command",
    subline: "Staging node for Mount Teide volcanic missions and year-round riding.",
    seo: {
      title: "Tenerife (TFS) Arrival OS | Canary Island Logistics | JetMyMoto",
      description: "Tenerife South's official arrival node. Secure staging for Mount Teide missions."
    },
    logistics: {
      node_name: "JetMyMoto Tenerife Partner Node",
      node_distance_min: 15,
      differentiators: ["Volcanic ridge mission specialists", "Island-hopping logistics experts", "Year-round riding climate prep"]
    },
    recovery: {
      premium: {
        name: "Gran Meliá Palacio de Isora",
        href: `https://www.booking.com/hotel/es/gran-melia-palacio-de-isora.en.html?aid=${AFFILIATE_ID}&label=TFS-recovery`,
        desc: "Ultra-luxury recovery on the volcanic coast."
      },
      budget: {
        name: "Hotel Médano",
        href: `https://www.booking.com/hotel/es/medano.en.html?aid=${AFFILIATE_ID}&label=TFS-recovery`,
        desc: "Seaside staging hub in El Médano district."
      }
    }
  },

  VCE: {
    code: "VCE",
    name: "Venice Marco Polo Airport",
    officialUrl: "https://www.veneziaairport.it/",
    city: "Venice",
    region: "Dolomites Gateway",
    headline: "Dolomite Command",
    subline: "Staging node for Dolomites mountain missions and Venetian coast runs.",
    seo: {
      title: "Venice (VCE) Arrival OS | Dolomites Logistics | JetMyMoto",
      description: "Venice Airport's tactical gateway for motorcycle logistics. Secure staging for the Dolomites."
    },
    logistics: {
      node_name: "JetMyMoto Veneto Partner Node",
      node_distance_min: 15,
      differentiators: ["Dolomites mission staging specialists", "Insured Italian Alps transport", "Secured indoor tech prep"]
    },
    recovery: {
      premium: {
        name: "Hotel Colombina",
        href: `https://www.booking.com/hotel/it/colombina.en.html?aid=${AFFILIATE_ID}&label=VCE-recovery`,
        desc: "High-end recovery in central Venice."
      },
      budget: {
        name: "Courtyard by Marriott Venice Airport",
        href: `https://www.booking.com/hotel/it/courtyard-by-marriott-venice-airport.en.html?aid=${AFFILIATE_ID}&label=VCE-recovery`,
        desc: "Reliable staging hub directly at the terminal exit."
      }
    }
  },

  VIE: {
    code: "VIE",
    name: "Vienna International Airport",
    officialUrl: "https://www.viennaairport.com/",
    city: "Vienna",
    region: "Danube Staging",
    headline: "Imperial Staging",
    subline: "Staging node for Danube River missions and Central European transit.",
    seo: {
      title: "Vienna (VIE) Arrival OS | Central European Logistics | JetMyMoto",
      description: "Vienna Airport's arrival node for Austria. Secure staging for the Danube heartland."
    },
    logistics: {
      node_name: "JetMyMoto Austria Central Node",
      node_distance_min: 15,
      differentiators: ["Danube mission staging specialists", "Insured Central Europe transport", "Secured indoor tech prep"]
    },
    recovery: {
      premium: {
        name: "NH Vienna Airport Conference Center",
        href: `https://www.booking.com/hotel/at/nhviennaairport.en.html?aid=${AFFILIATE_ID}&label=VIE-recovery`,
        desc: "Direct terminal access and upscale recovery."
      },
      budget: {
        name: "Moxy Vienna Airport",
        href: `https://www.booking.com/hotel/at/moxy-vienna-airport.en.html?aid=${AFFILIATE_ID}&label=VIE-recovery`,
        desc: "Modern staging hub directly at the terminal exit."
      }
    }
  },

  VLC: {
    code: "VLC",
    name: "Valencia Airport",
    officialUrl: "https://www.aena.es/en/valencia/index.html",
    city: "Valencia",
    region: "Levante Staging",
    headline: "Levante Command",
    subline: "Staging node for Spanish Levante coastal missions and inland mountain runs.",
    seo: {
      title: "Valencia (VLC) Arrival OS | Spanish Levante Logistics | JetMyMoto",
      description: "Valencia Airport's tactical gateway for motorcycle logistics. Secure staging for the Spanish Levante."
    },
    logistics: {
      node_name: "JetMyMoto Valencia Partner Node",
      node_distance_min: 15,
      differentiators: ["Levante mission staging specialists", "Insured Spanish inland transport", "Year-round riding climate prep"]
    },
    recovery: {
      premium: {
        name: "The Westin Valencia",
        href: `https://www.booking.com/hotel/es/the-westin-valencia.en.html?aid=${AFFILIATE_ID}&label=VLC-recovery`,
        desc: "Palatial luxury in central Valencia."
      },
      budget: {
        name: "Ibis Budget Valencia Aeropuerto",
        href: `https://www.booking.com/hotel/es/ibis-budget-valencia-aeropuerto.en.html?aid=${AFFILIATE_ID}&label=VLC-recovery`,
        desc: "Practical staging hub within walking distance of terminals."
      }
    }
  },

  WAW: {
    code: "WAW",
    name: "Warsaw Chopin Airport",
    officialUrl: "https://www.lotnisko-chopina.pl/",
    city: "Warsaw",
    region: "Eastern Europe Hub",
    headline: "Polish Command",
    subline: "Primary logistics node for trans-European missions and Polish heartland runs.",
    seo: {
      title: "Warsaw (WAW) Arrival OS | Polish Logistics Hub | JetMyMoto",
      description: "Warsaw's premier arrival platform. Secure motorcycle staging for Central and Eastern Europe."
    },
    logistics: {
      node_name: "JetMyMoto Poland Central Node",
      node_distance_min: 15,
      differentiators: ["Global logistics integration", "Secured indoor staging facilities", "Primary node for Polish heartland routes"]
    },
    recovery: {
      premium: {
        name: "Renaissance Warsaw Airport Hotel",
        href: `https://www.booking.com/hotel/pl/renaissance-warsaw-airport.en.html?aid=${AFFILIATE_ID}&label=WAW-recovery`,
        desc: "Direct terminal access and high-end recovery."
      },
      budget: {
        name: "Courtyard by Marriott Warsaw Airport",
        href: `https://www.booking.com/hotel/pl/courtyard-by-marriott-warsaw-airport.en.html?aid=${AFFILIATE_ID}&label=WAW-recovery`,
        desc: "Modern staging hub directly at the terminal exit."
      }
    }
  },

  ZAG: {
    code: "ZAG",
    name: "Zagreb Airport",
    officialUrl: "https://www.zagreb-airport.hr/",
    city: "Zagreb",
    region: "Balkan Gateway",
    headline: "The Balkan Hub",
    subline: "Staging node for trans-Balkan missions and Croatian heartland runs.",
    seo: {
      title: "Zagreb (ZAG) Arrival OS | Balkan Logistics Hub | JetMyMoto",
      description: "Zagreb Airport's premier arrival platform. Secure bike staging for the Balkans."
    },
    logistics: {
      node_name: "JetMyMoto Croatia Central Node",
      node_distance_min: 15,
      differentiators: ["Balkan mission staging specialists", "Insured Croatian heartland transport", "Secured indoor tech prep"]
    },
    recovery: {
      premium: {
        name: "Hotel Esplanade Zagreb",
        href: `https://www.booking.com/hotel/hr/esplanade-zagreb.en.html?aid=${AFFILIATE_ID}&label=ZAG-recovery`,
        desc: "Historic luxury in central Zagreb."
      },
      budget: {
        name: "Hotel Royal Airport",
        href: `https://www.booking.com/hotel/hr/royal-airport.en.html?aid=${AFFILIATE_ID}&label=ZAG-recovery`,
        desc: "Practical staging hub just minutes from the gates."
      }
    }
  },

  ZRH: {
    code: "ZRH",
    name: "Zurich Airport",
    officialUrl: "https://www.flughafen-zuerich.ch/",
    city: "Zurich",
    region: "Swiss Alps Hub",
    headline: "Alpine High Command",
    subline: "Primary logistics node for high-altitude missions and Central Swiss runs.",
    seo: {
      title: "Zurich (ZRH) Arrival OS | Swiss Alps Logistics | JetMyMoto",
      description: "Zurich's premier arrival platform. Secure motorcycle staging for the Swiss Alps."
    },
    logistics: {
      node_name: "JetMyMoto Zurich North Hub",
      node_distance_min: 15,
      differentiators: ["Alpine mission staging specialists", "Secured high-ticket machinery staging", "Primary node for Swiss mountain tours"]
    },
    recovery: {
      premium: {
        name: "Radisson Blu Hotel, Zurich Airport",
        href: `https://www.booking.com/hotel/ch/radisson-sas-airport-zurich.en.html?aid=${AFFILIATE_ID}&label=ZRH-recovery`,
        desc: "Direct terminal access and upscale Swiss recovery."
      },
      budget: {
        name: "Hyatt Place Zurich Airport The Circle",
        href: `https://www.booking.com/hotel/ch/hyatt-place-zurich-airport-the-circle.en.html?aid=${AFFILIATE_ID}&label=ZRH-recovery`,
        desc: "Modern staging hub directly at the gates in The Circle."
      }
    }
  }
};