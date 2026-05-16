import { db } from './db.js';

const extractData = (doc: FirebaseFirestore.DocumentSnapshot) => ({ id: doc.id, ...doc.data() });

export async function getAirport(code: string) {
  const docRef = await db.collection('airports').doc(code.toUpperCase()).get();
  if (docRef.exists) return extractData(docRef);

  const snapshot = await db.collection('airports')
    .where('code', '==', code.toUpperCase())
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  return extractData(snapshot.docs[0]);
}

export async function getMotorcycleCatalog(slugOrId: string) {
  const docRef = await db.collection('motorcycles').doc(slugOrId).get();
  if (docRef.exists) return extractData(docRef);

  const snapshot = await db.collection('motorcycles')
    .where('slug', '==', slugOrId)
    .limit(1)
    .get();
    
  if (snapshot.empty) return null;
  return extractData(snapshot.docs[0]);
}

export async function getMissionIntel(missionId: string) {
  const docRef = await db.collection('missions_v5').doc(missionId).get();
  if (docRef.exists) return extractData(docRef);
  return null;
}

export async function getRegionalRoutes(regionTag: string) {
  const snapshot = await db.collection('trunk_routes')
    .where('regionTags', 'array-contains', regionTag)
    .get();

  return snapshot.docs.map(extractData);
}

export async function getRenderAssetsForMission(missionId: string) {
  const [assetsSnap, rendersSnap] = await Promise.all([
    db.collection('asset_library').where('missionId', '==', missionId).get(),
    db.collection('render_jobs').where('mission_id', '==', missionId).get()
  ]);

  return {
    assets: assetsSnap.docs.map(extractData),
    renderJobs: rendersSnap.docs.map(extractData)
  };
}