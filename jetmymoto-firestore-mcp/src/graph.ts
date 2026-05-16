import fs from 'fs/promises';
import path from 'path';

async function readA2AJson() {
  const dataPath = path.resolve('/workspaces/jetmymoto-platform/data/a2a_missions_v5.json');
  const fileContent = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(fileContent);
}

export async function getAvailableA2aMissions(airportCode: string) {
  try {
    const data = await readA2AJson();
    return data.missions.filter((m: any) => m.insertion_airport === airportCode.toUpperCase());
  } catch (error) {
    console.error("Error reading A2A missions file:", error);
    return [];
  }
}

export async function getRentalInventoryForAirport(airportCode: string) {
  try {
    const data = await readA2AJson();
    const matchingMissions = data.missions.filter((m: any) => m.insertion_airport === airportCode.toUpperCase());
    const allRentals = matchingMissions.flatMap((m: any) => m.qualifying_rental_ids || []);
    
    if (allRentals.length === 0) return { available_rental_ids: [], parsed_labels: [] };

    const uniqueRentals = [...new Set(allRentals)] as string[];
    
    // Synthesize human-readable display labels from composite keys
    // Example: "bmw-r1300gs-mxp-eagle-rider-mxp"
    const parsedLabels = uniqueRentals.map(id => {
      const parts = id.split('-');
      if (parts.length >= 4) {
        const brand = parts[0];
        const model = parts[1]; // simplified extraction
        const airport = parts[2];
        const operator = parts.slice(3).join('-');
        return {
          raw_id: id,
          label: `${brand.toUpperCase()} ${model.toUpperCase()} at ${operator} (${airport.toUpperCase()})`,
          derived_brand: brand,
          derived_model: model,
          derived_airport: airport,
          derived_operator: operator
        };
      }
      return { raw_id: id, label: id };
    });

    return {
      source: "a2a_missions_v5.json",
      warning: "These are composite graph IDs, NOT exact Firestore catalog IDs.",
      available_rental_ids: uniqueRentals,
      parsed_labels: parsedLabels
    };
  } catch (error) {
    console.error("Error reading A2A missions file for rentals:", error);
    return { available_rental_ids: [], parsed_labels: [], error: "Failed to read graph data" };
  }
}