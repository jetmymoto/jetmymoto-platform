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

export function buildControlPanel({ officialUrl = "#", operational_intel }) {
  const intel = operational_intel || {};
  const arrivalLink = intel.arrival_link || `${officialUrl}/arrivals`;
  const departureLink = intel.departure_link || `${officialUrl}/departures`;
  const baggageHref = intel.baggage_phone
    ? `tel:${intel.baggage_phone.replace(/\s+/g, "")}`
    : officialUrl;
  const generalHref = intel.general_phone
    ? `tel:${intel.general_phone.replace(/\s+/g, "")}`
    : officialUrl;

  return [
    { label: "Arrivals", href: arrivalLink, icon: PlaneLanding, category: "Info" },
    { label: "Departures", href: departureLink, icon: PlaneTakeoff, category: "Info" },
    { label: "Terminal Map", href: officialUrl, icon: Map, category: "Info" },
    { label: "Lost & Found", href: baggageHref, icon: PhoneCall, category: "Auth" },
    { label: "Oversize Bag", href: officialUrl, icon: Luggage, category: "Info" },
    { label: "Airport Police", href: generalHref, icon: Shield, category: "Auth" },
    { label: "Medical / 112", href: "tel:112", icon: AlertTriangle, category: "Auth" },
    { label: "Uber Pickup", href: officialUrl, icon: Navigation, category: "Transfer" },
    { label: "Train Access", href: officialUrl, icon: TrainFront, category: "Transfer" },
  ];
}
