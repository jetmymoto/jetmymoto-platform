import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp({
    projectId: 'movie-chat-factory'
  });
}

const db = getFirestore();

async function inspectMotorcycles() {
  const snapshot = await db.collection('motorcycles').limit(2).get();
  if (snapshot.empty) {
    console.log('No motorcycles found in the collection.');
    return;
  }

  snapshot.docs.forEach(doc => {
    console.log(`ID: ${doc.id}`);
    console.log(JSON.stringify(doc.data(), null, 2));
    console.log('---');
  });
}

inspectMotorcycles().catch(console.error);
