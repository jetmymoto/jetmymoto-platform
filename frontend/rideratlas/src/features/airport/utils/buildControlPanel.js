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

export function buildControlPanel({ officialUrl = "#" }) {
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
