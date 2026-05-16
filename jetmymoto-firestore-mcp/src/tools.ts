import { db } from './db.js';

/**
 * Helper to safely extract Firestore document data
 */
const extractData = (doc: FirebaseFirestore.DocumentSnapshot) => ({
  id: doc.id,
  ...doc.data()
});

export async function getAirportHub(code: string) {
  // Query by document ID first, fallback to an 'iata' or 'code' field query
  const docRef = await db.collection('airports').doc(code.toUpperCase()).get();
  if (docRef.exists) return extractData(docRef);

  const snapshot = await db.collection('airports')
    .where('code', '==', code.toUpperCase())
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  return extractData(snapshot.docs[0]);
}

export async function getDualPathOptions(code: string) {
  // Assumes 'missions_v5' contains mission pathways that can be grouped (e.g., On-Road vs Off-Road)
  const snapshot = await db.collection('missions_v5')
    .where('insertion_airport', '==', code.toUpperCase())
    .get();

  return snapshot.docs.map(extractData);
}

export async function getRoutesFromAirport(code: string) {
  const snapshot = await db.collection('trunk_routes')
    .where('origin', '==', code.toUpperCase())
    .get();

  return snapshot.docs.map(extractData);
}

export async function getMotorcyclesForAirport(code: string) {
  // Querying motorcycles available at a given location code
  const snapshot = await db.collection('motorcycles')
    .where('locationCode', '==', code.toUpperCase())
    .get();

  // Fallback: Check if there's an array-contains if exact match fails
  if (snapshot.empty) {
    const arraySnapshot = await db.collection('motorcycles')
      .where('locations', 'array-contains', code.toUpperCase())
      .get();
      
    if (arraySnapshot.empty) {
      // Fallback 2: Check the A2A missions file for qualifying rentals
      try {
        const dataPath = path.resolve('/workspaces/jetmymoto-platform/data/a2a_missions_v5.json');
        const fileContent = await fs.readFile(dataPath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        const matchingMissions = data.missions.filter((m: any) => m.insertion_airport === code.toUpperCase());
        const allRentals = matchingMissions.flatMap((m: any) => m.qualifying_rental_ids || []);
        
        if (allRentals.length > 0) {
          // Deduplicate the rental IDs
          const uniqueRentals = [...new Set(allRentals)];
          return {
             source: "a2a_missions_v5",
             available_rental_ids: uniqueRentals
          };
        }
      } catch (error) {
        console.error("Error reading A2A missions file for rentals:", error);
      }
      return [];
    }
    return arraySnapshot.docs.map(extractData);
  }

  return snapshot.docs.map(extractData);
}

import fs from 'fs/promises';
import path from 'path';

export async function getMissionsForAirport(code: string) {
  try {
    const dataPath = path.resolve('/workspaces/jetmymoto-platform/data/a2a_missions_v5.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Filter missions where insertion_airport matches the provided code
    const matchingMissions = data.missions.filter((m: any) => m.insertion_airport === code.toUpperCase());
    return matchingMissions;
  } catch (error) {
    console.error("Error reading A2A missions file:", error);
    return [];
  }
}

export async function getRenderAssetsForMission(missionId: string) {
  // Check asset_library and render_jobs
  const [assetsSnap, rendersSnap] = await Promise.all([
    db.collection('asset_library').where('missionId', '==', missionId).get(),
    db.collection('render_jobs').where('missionId', '==', missionId).get()
  ]);

  return {
    assets: assetsSnap.docs.map(extractData),
    renderJobs: rendersSnap.docs.map(extractData)
  };
}
