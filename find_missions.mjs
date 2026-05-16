import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'functions/serviceAccountKey.json'), 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function findMissions() {
  const missionIds = [
    'osl-to-arn-scandinavian-spine',
    'mxp-to-lin-a2a-001',
    'muc-weekend-001',
    'cdg-to-lys-burgundy-run'
  ];

  for (const id of missionIds) {
    console.log(`Searching for mission: ${id}`);
    
    // Check missions_v5
    const v5Snap = await db.collection('missions_v5').where('id', '==', id).get();
    if (!v5Snap.empty) {
      console.log(`  Found in missions_v5: ${v5Snap.docs[0].id}`);
      continue;
    }

    // Check by doc ID
    const v5Doc = await db.collection('missions_v5').doc(id).get();
    if (v5Doc.exists) {
      console.log(`  Found in missions_v5 (doc ID): ${id}`);
      continue;
    }

    // Check a2a collection if it exists
    try {
      const a2aSnap = await db.collection('a2a').doc(id).get();
      if (a2aSnap.exists) {
        console.log(`  Found in a2a collection: ${id}`);
        continue;
      }
    } catch (e) {}

    console.log(`  Not found: ${id}`);
  }
}

findMissions();
