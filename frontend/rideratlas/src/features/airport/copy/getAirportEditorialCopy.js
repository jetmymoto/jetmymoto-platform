import { formatAirportHubEyebrow, formatAirportHubTitle } from "@/lib/airports/resolveAirportHub";
import { resolveAirportTheater } from "../utils/resolveAirportTheater";
import { resolveAirportTheaterMedia } from "../utils/resolveAirportTheaterMedia";

// Helper for dynamic, airport-aware editorial copy
export function getAirportEditorialCopy({ a, airportRoutes, rentals, experience, derivedRegions, derivedTheater, graph }) {
  // Hero
  const rentalCount = rentals?.length || 0;
  
  // Use defensive formatting helpers
  const eyebrow = formatAirportHubEyebrow(a, a.code);
  const headline = formatAirportHubTitle(a, a.code);
  
  const theater = resolveAirportTheater(a, graph);
  const media = resolveAirportTheaterMedia(a, theater);
  
  let subheadline = "Premium Gateway to the Region & Beyond";
  const heroDescription = theater.heroDescription;
  
  const metaLines = [];
  if (a.code) metaLines.push(`Hub Identifier: ${a.code}`);
  metaLines.push(`Travel Window: MAR — OCT`);
  if (rentalCount > 0) metaLines.push(`Fleet Access: ${rentalCount} Models`);
  metaLines.push(`Logistics Status: One-Way Available`);

  // Journey Bridge
  const journey = {
    heading: `The journey continues from the tarmac`,
    subline: a.city && derivedTheater ? `Arrive in ${a.city}, gateway to ${derivedTheater}.` : undefined,
    statusItems: theater.statusItems,
  };

  // Arrival
  const arrival = {
    heading: "How airport pickup works",
    subline: "Step off the plane, take a breath, and prepare for the next chapter. Every journey starts with a moment of calm.",
  };

  // Curated Missions
  const missions = {
    heading: "Routes from this Airport",
    subline: undefined,
    tags: theater.tags,
  };

  // System Reveal
  const system = {
    heading: theater.title,
    subline: theater.subtitle,
    rhythm: theater.rhythm,
    elevationLabel: theater.elevationLabel,
    elevationValue: theater.elevationValue,
    recommendedMachines: theater.recommendedMachines,
    description: theater.description,
    media: media,
  };

  return {
    hero: { eyebrow, headline, subheadline, metaLines, description: heroDescription, heroImage: media.heroImage },
    journey,
    arrival,
    missions,
    system,
  };
}

