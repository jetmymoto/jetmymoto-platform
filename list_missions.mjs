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

async function listMissions() {
  const v5Snap = await db.collection('missions_v5').limit(5).get();
  console.log('--- missions_v5 samples ---');
  v5Snap.forEach(doc => {
    console.log(`ID: ${doc.id}, Data: ${JSON.stringify(doc.data()).slice(0, 100)}...`);
  });
}

listMissions();
