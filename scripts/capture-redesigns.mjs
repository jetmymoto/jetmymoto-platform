import puppeteer from 'puppeteer';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

// Load Firebase Project ID and Storage Bucket from local configs if possible
// We will use the service account from functions/serviceAccountKey.json
const SERVICE_ACCOUNT_PATH = path.resolve(process.cwd(), 'functions/serviceAccountKey.json');
const STORAGE_BUCKET = 'jetmymoto-d0ce4.firebasestorage.app'; // Default format, may need to be adjusted

const BASE_URL = 'http://localhost:5173'; // Vite preview or dev default
const OUTPUT_DIR = path.resolve(process.cwd(), 'screenshots/redesigned-funnel');

// The three redesigned canonical pages
const ROUTES = [
  { id: '01_airport_mxp', path: '/airport/mxp' }
];

const VIEWPORT = { width: 1440, height: 1080 };

// Auto-scroll to trigger lazy-loaded images or elements
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 800; // Large jumps for speed
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });
  
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1000));
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  let bucket = null;
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
      const storage = new Storage({ 
        keyFilename: SERVICE_ACCOUNT_PATH,
        projectId: serviceAccount.project_id 
      });
      // Fallback bucket name format usually project_id.appspot.com
      const bucketName = `${serviceAccount.project_id}.firebasestorage.app`; 
      bucket = storage.bucket(bucketName);
      console.log(`☁️  Connected to Cloud Storage: ${bucketName}`);
    } catch (err) {
      console.log('⚠️  Could not initialize Cloud Storage, will only save locally.', err.message);
    }
  } else {
    console.log('⚠️  serviceAccountKey.json not found. Will only save locally.');
  }

  console.log(`\n🚀 Starting Puppeteer to capture redesigned pages...`);
  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    
    console.log(`\n📸 Capturing [${route.id}] -> ${BASE_URL}${route.path}`);
    try {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle2', timeout: 60000 });
      
      console.log(`   - Scrolling to load lazy assets...`);
      await autoScroll(page);
      
      const imgPath = path.join(OUTPUT_DIR, `${route.id}.png`);
      
      // Capture Full Page Screenshot
      await page.screenshot({ path: imgPath, fullPage: true });
      console.log(`   ✅ Saved locally: screenshots/redesigned-funnel/${route.id}.png`);
      
      // Upload to Firebase Storage
      if (bucket) {
        const dest = `audits/redesigned-funnel/${route.id}.png`;
        console.log(`   - Uploading to Cloud Storage (${dest})...`);
        await bucket.upload(imgPath, { 
          destination: dest, 
          metadata: { contentType: 'image/png' } 
        });
        console.log(`   ☁️  Upload complete!`);
      }
      
    } catch (e) {
      console.error(`   ❌ Failed to capture ${route.id}:`, e.message);
    } finally {
      await page.close();
    }
  }
  
  await browser.close();
  console.log('\n🎉 Audit capture completed!');
}

run().catch(console.error);
