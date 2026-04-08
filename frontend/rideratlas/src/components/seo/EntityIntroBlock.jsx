
import React from 'react';

/**
 * EntityIntroBlock Component
 * Provides short, high-signal context about an entity to answer "What is this, and why does it matter for a rider?".
 * Powered strictly by GRAPH truth.
 */
const EntityIntroBlock = ({ entityType, entityData, graphData }) => {
  if (!entityData || !entityType) return null;

  let content = [];

  switch (entityType) {
    case 'rental': {
      const rental = entityData;
      const airport = graphData?.airport || {};
      const machineName = `${rental.brand || ""} ${rental.model || rental.bikeName || rental.id}`.trim();
      const location = airport.city || rental.airportCode || "the hub";
      const category = rental.category ? rental.category.toLowerCase() : "";
      
      let capability = "mixed terrain deployment";
      if (category === "adventure") capability = "long-range riding and mixed terrain deployment";
      if (category === "touring" || category === "sport-touring") capability = "extended highway travel and sweeping coastal routes";
      if (category === "scrambler") capability = "agile urban navigation and light unpaved fire roads";

      let routeContext = "various regional routes";
      const topDestinations = rental.compatibleDestinations || rental.compatible_destinations || [];
      if (topDestinations.length > 0) {
        routeContext = `routes across ${topDestinations.map(d => d.replace(/-/g, ' ')).join(', ')}`;
      }

      content.push(
        `The ${machineName} at ${location} is a high-performance ${category || "premium"} platform built for ${capability}.`,
        `This machine is staged locally and configured for ${routeContext}.`
      );
      break;
    }
    case 'route': {
      const route = entityData;
      const routeName = route.name || route.title || "This route";
      const difficulty = route.difficulty || route.roadProfile?.difficulty || route.difficultyLevel || "moderate";
      
      let terrainDesc = "varied motorcycle roads";
      if (difficulty.toLowerCase().includes("hard") || difficulty.toLowerCase().includes("advanced")) {
        terrainDesc = "technically demanding and visually iconic motorcycle roads";
      } else if (difficulty.toLowerCase().includes("easy") || difficulty.toLowerCase().includes("beginner")) {
        terrainDesc = "accessible and highly scenic motorcycle roads";
      }
      
      let features = "scenic landscapes and consistent riding engagement";
      if (difficulty.toLowerCase().includes("hard") || difficulty.toLowerCase().includes("advanced")) {
        features = "technical switchbacks, rapid elevation changes, and sustained riding intensity";
      }

      content.push(
        `${routeName} is one of the most ${terrainDesc} in the region.`,
        `It combines ${features}, making it ideal for targeted motorcycle deployment.`
      );
      break;
    }
    case 'a2a': {
      const mission = entityData;
      const insertion = graphData?.insertion || {};
      const extraction = graphData?.extraction || {};
      const theater = graphData?.theater || {};
      
      const insertionName = insertion.city || mission.insertion_airport || "the origin";
      const extractionName = extraction.city || mission.extraction_airport || "the destination";
      const theaterName = theater.name || mission.theater || "the region";

      content.push(
        `This A2A mission connects ${insertionName} to ${extractionName} through the ${theaterName} corridor, enabling a one-way expedition across premium riding terrain.`,
        `Riders deploy into the region, traverse the core routes, and extract without retracing their path.`
      );
      break;
    }
    case 'operator': {
      const operator = entityData;
      const operatorName = operator.name || "This operator";
      const locationContext = (operator.airports && operator.airports.length > 0) 
        ? `Their active locations include hubs like ${operator.airports[0]} where they provide access to` 
        : "They provide access to";
        
      content.push(
        `${operatorName} operates a global motorcycle rental network with verified fleets across major riding hubs.`,
        `${locationContext} high-performance touring and adventure machines configured for local terrain.`
      );
      break;
    }
    case 'airport': {
      const airport = entityData;
      const locationName = airport.city || airport.name || airport.code;
      const regionContext = airport.region ? `across ${airport.region}` : "in the surrounding region";
      
      content.push(
        `${locationName} (${airport.code}) is a primary deployment hub for motorcycle travel ${regionContext}.`,
        `From this hub, riders can access localized route networks, long-range touring corridors, and specialized A2A missions.`
      );
      break;
    }
    case 'destination': {
      const destination = entityData;
      const destName = destination.name || destination.slug;
      
      let features = destination.terrain_type ? `known for ${destination.terrain_type}` : "known for dramatic terrain and elevation changes";
      
      content.push(
        `${destName} is a sought-after motorcycle destination, ${features}.`,
        `The region supports both short technical rides and multi-day riding expeditions.`
      );
      break;
    }
    default:
      return null;
  }

  if (content.length === 0) return null;

  return (
    <div className="prose prose-invert max-w-none mb-8">
      {content.map((paragraph, index) => (
        <p key={index} className="text-lg leading-relaxed text-zinc-300 font-medium tracking-wide">
          {paragraph}
        </p>
      ))}
    </div>
  );
};

export default EntityIntroBlock;
