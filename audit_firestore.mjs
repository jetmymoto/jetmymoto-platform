import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp({ projectId: 'movie-chat-factory' });
}
const db = getFirestore();

const collections = [
  'airports', 'motorcycles', 'missions_v5', 'airportmissionsV1', 
  'route_trunks', 'trunk_routes', 'asset_library', 'render_jobs', 
  'pois', 'poi_library', 'poi_assets', 'plans', 'public_content'
];

async function inspect() {
  for (const coll of collections) {
    try {
      const snap = await db.collection(coll).limit(1).get();
      if (snap.empty) {
        console.log(`\n--- Collection: ${coll} ---`);
        console.log("EMPTY");
      } else {
        console.log(`\n--- Collection: ${coll} (Doc ID: ${snap.docs[0].id}) ---`);
        console.log(JSON.stringify(snap.docs[0].data(), null, 2));
      }
    } catch (e) {
      console.log(`\n--- Collection: ${coll} ---`);
      console.log(`ERROR: ${e.message}`);
    }
  }
}
inspect();