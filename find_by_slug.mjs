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

async function findBySlug() {
  const slugs = [
    'osl-to-arn-scandinavian-spine',
    'mxp-to-lin-a2a-001',
    'muc-weekend-001',
    'cdg-to-lys-burgundy-run'
  ];

  for (const slug of slugs) {
    console.log(`Searching for slug: ${slug}`);
    const snap = await db.collection('missions_v5').where('slug', '==', slug).get();
    if (!snap.empty) {
      console.log(`  Found in missions_v5: ${snap.docs[0].id}`);
    } else {
        // Try searching in 'id' field too
        const snap2 = await db.collection('missions_v5').where('id', '==', slug).get();
        if (!snap2.empty) {
            console.log(`  Found in missions_v5 (id field): ${snap2.docs[0].id}`);
        } else {
            console.log(`  Not found.`);
        }
    }
  }
}

findBySlug();
