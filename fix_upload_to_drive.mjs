import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync('./functions/serviceAccountKey.json'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });

async function run() {
  const bucket = getStorage().bucket("movie-chat-factory.firebasestorage.app");
  
  console.log("Making the 13clean_export.tar.gz file publicly accessible...");
  
  const dest = 'exports/13clean_export.tar.gz';
  const file = bucket.file(dest);
  
  try {
    // Check if it exists
    const [exists] = await file.exists();
    if (!exists) {
        console.log("File not found! Re-uploading...");
        await bucket.upload('13clean_export.tar.gz', {
          destination: dest,
          metadata: {
            contentType: 'application/gzip'
          }
        });
    }

    // Make the file entirely public (no signed URL needed)
    await file.makePublic();

    // Generate the public publicUrl
    const url = `https://storage.googleapis.com/movie-chat-factory.firebasestorage.app/${dest}`;
    
    console.log("\\n✅ Public Export successful!");
    console.log("Direct Public Download Link:", url);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
