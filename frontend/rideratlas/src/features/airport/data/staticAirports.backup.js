import {
  PlaneLanding,
  PlaneTakeoff,
  PhoneCall,
  Navigation,
  Map,
  Luggage,
  TrainFront,
  Shield,
  AlertTriangle,
} from "lucide-react";

/* ---------------------------------
   BASE BUILDERS
----------------------------------*/

function buildControlPanel(airportName, officialUrl = "#") {
  return [
    { label: "Arrivals", href: `${officialUrl}/arrivals`, icon: PlaneLanding, category: "Info" },
    { label: "Departures", href: `${officialUrl}/departures`, icon: PlaneTakeoff, category: "Info" },
    { label: "Terminal Map", href: officialUrl, icon: Map, category: "Info" },
    { label: "Lost & Found", href: officialUrl, icon: PhoneCall, category: "Auth" },
    { label: "Oversize Bag", href: officialUrl, icon: Luggage, category: "Info" },
    { label: "Airport Police", href: officialUrl, icon: Shield, category: "Auth" },
    { label: "Medical / 112", href: "tel:112", icon: AlertTriangle, category: "Auth" },
    { label: "Uber Pickup", href: officialUrl, icon: Navigation, category: "Transfer" },
    { label: "Train Access", href: officialUrl, icon: TrainFront, category: "Transfer" },
  ];
}

function buildUtilities() {
  return [
    {
      icon: PhoneCall,
      title: "eSIM Data",
      sub: "Stay Connected",
      desc: "Instant activation mobile data.",
      cta: "Activate",
      href: "#",
    },
    {
      icon: Navigation,
      title: "Car Rental Insurance",
      sub: "Damage Protection",
      desc: "Avoid desk upsell pressure.",
      cta: "Compare Coverage",
      href: "#",
    },
    {
      icon: Map,
      title: "Transfer Strategy",
      sub: "Arrival Optimization",
      desc: "Plan exit corridor before leaving terminal.",
      cta: "View Strategy",
      href: "#",
    },
  ];
}

function buildExtension(cityName) {
  return {
    enabled: true,
    headline: `48H ${cityName} Protocol`,
    subline: "Soft landing before mission deployment.",
    items: [
      {
        category: "Recovery",
        title: "Coastal Reset",
        description: "Hydrate, mobility, local reset.",
        performanceAngle: "Reduce fatigue before mission start.",
        ctaLabel: "View Protocol",
        ctaLink: "#",
      },
      {
        category: "Warm-Up",
        title: "Shakedown Route",
        description: "Short dynamic route to calibrate.",
        performanceAngle: "Progressive adaptation.",
        ctaLabel: "View Route",
        ctaLink: "#",
      },
      {
        category: "Logistics",
        title: "Gear Staging",
        description: "Prep luggage & equipment.",
        performanceAngle: "Eliminate day-one chaos.",
        ctaLabel: "View Checklist",
        ctaLink: "#",
      },
    ],
  };
}

function createAirport({ code, name, region, city, officialUrl }) {
  return {
    code,
    name,
    region,
    motto: "",
    seasonality: {
      peak: "",
      risk: "",
      status: "",
    },
    hero: {
      videoUrl: "",
      posterUrl: "",
    },
    controlPanel: buildControlPanel(name, officialUrl),
    utilities: buildUtilities(),
    cityExtension: buildExtension(city),
    recovery: {
      premium: {
        name: "Premium Airport Hotel",
        location: "Near Terminal",
        href: "#",
        features: ["Airport shuttle", "Secure parking"],
      },
      budget: {
        name: "Budget Airport Stay",
        location: "Terminal access",
        href: "#",
        features: ["Walkable", "Low cost"],
      },
    },
  };
}

/* ---------------------------------
   AIRPORT LIST
----------------------------------*/

const airportConfig = [
  { code: "NCE", name: "Nice Côte d'Azur", region: "Provence", city: "Riviera", officialUrl: "https://www.nice.aeroport.fr" },
  { code: "GVA", name: "Geneva Airport", region: "Switzerland", city: "Alps", officialUrl: "https://www.gva.ch" },
  { code: "MUC", name: "Munich Airport", region: "Bavaria", city: "Bavaria", officialUrl: "https://www.munich-airport.com" },
  { code: "BCN", name: "Barcelona El Prat", region: "Catalonia", city: "Barcelona", officialUrl: "https://www.aena.es" },
  { code: "FCO", name: "Rome Fiumicino", region: "Italy", city: "Rome", officialUrl: "https://www.adr.it" },
  // 👉 Add all 50 airports here
];

/* ---------------------------------
   EXPORT GENERATED OBJECT
----------------------------------*/

export const staticAirports = airportConfig.reduce((acc, airport) => {
  acc[airport.code] = createAirport(airport);
  return acc;
}, {});