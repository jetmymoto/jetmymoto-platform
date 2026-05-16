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

async function listJobs() {
  const snap = await db.collection('render_jobs').limit(5).get();
  console.log('--- render_jobs samples ---');
  snap.forEach(doc => {
    console.log(`ID: ${doc.id}, Data: ${JSON.stringify(doc.data()).slice(0, 100)}...`);
  });
}

listJobs();
