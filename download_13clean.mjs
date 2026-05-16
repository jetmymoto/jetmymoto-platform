import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";

const serviceAccount = JSON.parse(fs.readFileSync('./functions/serviceAccountKey.json'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });

async function run() {
  const bucket = getStorage().bucket("movie-chat-factory.firebasestorage.app");
  console.log("Fetching files from 13clean/...");
  
  try {
    const [files] = await bucket.getFiles({ prefix: '13clean/' });
    console.log(`Found ${files.length} files. Grouping by model...`);
    
    // We only want the FIRST image for each model to save bandwidth/time
    // The path looks like 13clean/brand/model/1.jpg
    const modelsToDownload = new Map();
    
    files.forEach(file => {
        if (!file.name.endsWith('.jpg') && !file.name.endsWith('.png')) return;
        
        const parts = file.name.split('/');
        if (parts.length >= 4) {
            const brand = parts[1];
            const model = parts[2];
            const key = `${brand}/${model}`;
            
            // Only take 1.jpg or the first image we find for this model
            if (!modelsToDownload.has(key) || file.name.endsWith('1.jpg')) {
                modelsToDownload.set(key, file);
            }
        }
    });
    
    console.log(`Downloading ${modelsToDownload.size} representative images...`);
    
    const downloadDir = path.join(process.cwd(), '13clean_export');
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }
    
    let count = 0;
    for (const [key, file] of modelsToDownload.entries()) {
        const parts = key.split('/');
        const brandDir = path.join(downloadDir, parts[0]);
        const modelDir = path.join(brandDir, parts[1]);
        
        if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
        if (!fs.existsSync(modelDir)) fs.mkdirSync(modelDir, { recursive: true });
        
        const dest = path.join(modelDir, '1.jpg');
        await file.download({ destination: dest });
        count++;
        if (count % 20 === 0) console.log(`Downloaded ${count}/${modelsToDownload.size}`);
    }
    
    console.log("Download complete!");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
