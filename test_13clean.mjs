import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync('./functions/serviceAccountKey.json'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });

function slugifyModel(model) {
  let s = String(model || "").toLowerCase();
  
  // Specific OEM weirdness: BMW groups letter-number-letters "R 1300 GS" -> "r1300gs"
  s = s.replace(/^([a-z])\s+(\d+)\s+([a-z]+)/, "$1$2$3");
  // F 900 GS Adventure -> f900gs-adventure
  s = s.replace(/^([a-z]+)\s+(\d+)\s+([a-z]+)/, "$1$2$3");
  
  // Replace spaces with hyphens, remove weird chars
  s = s.replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
  return s;
}

async function run() {
  const bucket = getStorage().bucket("movie-chat-factory.firebasestorage.app");
  const models = [
    {b: "BMW", m: "R 1300 GS"},
    {b: "BMW", m: "R 1300 GS Adventure"},
    {b: "BMW", m: "F 750 GS"},
    {b: "BMW", m: "R 1250 RT"},
    {b: "Ducati", m: "Multistrada V4"},
    {b: "Ducati", m: "DesertX"},
    {b: "Honda", m: "Africa Twin 1100"},
    {b: "Honda", m: "XL 750 Transalp"},
    {b: "Moto Morini", m: "X-Cape 650"},
    {b: "KTM", m: "1290 Super Adventure"},
    {b: "Harley-Davidson", m: "Road Glide"},
    {b: "Yamaha", m: "Tenere 700"},
    {b: "Yamaha", m: "MT-07"}
  ];
  
  const cache = new Set();
  const [files] = await bucket.getFiles({ prefix: '13clean/' });
  files.forEach(f => cache.add(f.name));

  for (const item of models) {
    const bSlug = item.b.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let mSlug = slugifyModel(item.m);
    
    // Direct match check
    let found = cache.has(`13clean/${bSlug}/${mSlug}/1.jpg`);
    
    // If not found, maybe it's just the basic name without displacement?
    if (!found) {
        // Find best fuzzy match in cache
        const brandFiles = Array.from(cache).filter(n => n.startsWith(`13clean/${bSlug}/`));
        const possible = brandFiles.find(n => n.includes(mSlug.split('-')[0]));
        console.log(`${item.b} ${item.m} -> ${found ? mSlug : 'FAILED'} (fuzzy: ${possible})`);
    } else {
        console.log(`${item.b} ${item.m} -> ${mSlug}`);
    }
  }
}
run();
