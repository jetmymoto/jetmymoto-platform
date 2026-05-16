import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./functions/serviceAccountKey.json'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });

async function run() {
  const bucket = getStorage().bucket('movie-chat-factory.firebasestorage.app');
  console.log('📡 Connecting to Firebase Storage...');
  console.log('📥 Downloading 13clean_export.tar.gz (70MB)...');
  
  try {
    await bucket.file('exports/13clean_export.tar.gz').download({ 
      destination: './13clean_export.tar.gz' 
    });
    console.log('✅ Success! The file "13clean_export.tar.gz" is now in your project root.');
  } catch (e) {
    console.error('❌ Download failed:', e.message);
  }
}
run();
