import { airportConfig } from "./airportConfig.generated.js";
import {
  PlaneLanding,
  PlaneTakeoff,
  PhoneCall,
  Navigation,
  Map,
  Shield,
  AlertTriangle,
  TrainFront,
  Luggage,
} from "lucide-react";

/* ---------------------------------
   BASE BUILDERS
----------------------------------*/

import { buildControlPanel } from "../utils/buildControlPanel";

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

const enrichmentMap = {
  NCE: {
    headline: "Alpine Riviera Staging",
    subline: "Primary node for Côte d'Azur deployment.",
    seo: {
      title: "Nice (NCE) Arrival OS | JetMyMoto",
      description: "Motorcycle logistics and deployment platform from Nice Côte d'Azur Airport."
    },
    recovery: {
      premium: {
        name: "Hotel Le Negresco",
        location: "Promenade des Anglais",
        href: "https://www.booking.com/",
        features: ["Luxury", "Sea view", "Secure parking"]
      },
      budget: {
        name: "Ibis Styles Nice Aéroport",
        location: "Airport district",
        href: "https://www.booking.com/",
        features: ["Shuttle", "Walkable", "Affordable"]
      }
    }
  }
};

function createAirport({ code, name, region, city, officialUrl }) {
  const base = {
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
    controlPanel: buildControlPanel({ officialUrl }),
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

  const enrichment = enrichmentMap[code] || {};

  return {
    ...base,
    ...enrichment,
    recovery: enrichment.recovery ? enrichment.recovery : base.recovery,
    airportCode: code,
    iata: code,
  };
}

/* ---------------------------------
   EXPORT GENERATED OBJECT
----------------------------------*/

export const staticAirports = airportConfig.reduce((acc, airport) => {
  acc[airport.code] = createAirport(airport);
  return acc;
}, {});