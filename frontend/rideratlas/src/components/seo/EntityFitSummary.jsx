
import React from 'react';

/**
 * EntityFitSummary Component
 * Answers "Who is this for and when should I choose it?".
 * Provides a highly scannable semantic summary driven by GRAPH attributes.
 */
const EntityFitSummary = ({ entityType, entityData, graphData }) => {
  if (!entityData || !entityType) return null;

  let bullets = [];

  switch (entityType) {
    case 'rental': {
      const rental = entityData;
      const category = rental.category ? rental.category.toLowerCase() : "";
      
      if (category === "adventure") {
        bullets.push("Alpine passes and high-altitude terrain");
        bullets.push("Long-range touring across multiple regions");
      } else if (category === "touring" || category === "sport-touring") {
        bullets.push("Extended highway travel");
        bullets.push("Riders seeking performance + comfort balance");
      } else if (category === "scrambler" || category === "classic") {
        bullets.push("Urban riding and scenic pacing");
        bullets.push("Riders prioritizing style and agility");
      } else {
        bullets.push("Mixed terrain deployment");
      }

      if (rental.one_way_enabled) {
        bullets.push("One-way A2A logistics without backtracking");
      } else {
        bullets.push("Round-trip regional exploration");
      }
      break;
    }
    case 'route': {
      const route = entityData;
      const difficulty = route.difficulty || route.roadProfile?.difficulty || route.difficultyLevel || "moderate";
      
      if (difficulty.toLowerCase().includes("hard") || difficulty.toLowerCase().includes("advanced")) {
        bullets.push("Experienced riders");
        bullets.push("Technical riding and switchbacks");
      } else {
        bullets.push("Riders of varying experience levels");
        bullets.push("Scenic pacing and fluid sweeping corners");
      }

      const distance = route.distanceKm || route.distance_km || route.distance;
      if (distance && distance > 300) {
        bullets.push("Multi-day long-range touring");
      } else {
        bullets.push("Focused day rides");
      }
      break;
    }
    case 'a2a': {
      bullets.push("Multi-day expeditions");
      bullets.push("One-way travel without backtracking");
      bullets.push("Cross-border riding missions");
      break;
    }
    case 'destination': {
      const destination = entityData;
      
      if (destination.terrain_type && destination.terrain_type.toLowerCase().includes("mountain")) {
        bullets.push("Multi-day alpine riding");
        bullets.push("Technical terrain");
        bullets.push("Scenic high-altitude routes");
      } else {
        bullets.push("Multi-day riding expeditions");
        bullets.push("Immersive regional touring");
      }
      break;
    }
    case 'airport': {
      bullets.push("Immediate deployment upon arrival");
      bullets.push("Accessing centralized premium rental fleets");
      bullets.push("Staging Moto Airlift logistics");
      break;
    }
    case 'operator': {
      bullets.push("Riders requiring guaranteed machine models");
      bullets.push("Premium terminal-adjacent deployments");
      bullets.push("Reliable fleet maintenance standards");
      break;
    }
    default:
      return null;
  }

  if (bullets.length === 0) return null;

  return (
    <div className="rounded-[28px] border border-[#CDA755]/20 bg-[#CDA755]/5 p-6 mb-12">
      <div className="text-[10px] uppercase tracking-[0.32em] text-[#CDA755] mb-4">
        Mission Fit
      </div>
      <div className="text-xl font-black text-white mb-4">
        Best for:
      </div>
      <ul className="space-y-3">
        {bullets.slice(0, 4).map((bullet, index) => (
          <li key={index} className="flex items-start gap-3 text-sm leading-6 text-zinc-300 font-medium">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#CDA755]" />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EntityFitSummary;
