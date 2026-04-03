import puppeteer from 'puppeteer';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173'; // Vite dev port
const OUTPUT_DIR = 'agentic_ui_exports';

// Parse service account to get project_id dynamically
const SERVICE_ACCOUNT_PATH = path.resolve(process.cwd(), 'functions/serviceAccountKey.json');
let STORAGE_BUCKET = 'jetmymoto-d0ce4.firebasestorage.app'; // Default
if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  const sa = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  STORAGE_BUCKET = `${sa.project_id}.firebasestorage.app`;
}

const STORAGE_PREFIX = `agentic-ui-docs-2026-04-01`;

const ROUTES = [
  { id: '01_global_hub', path: '/' },
  { id: '02_airport_template', path: '/airport/paris-cdg' },
  { id: '03_route_template', path: '/route/paris-cdg-to-alps' },
  { id: '04_destination_template', path: '/destination/alps' }
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1080, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true }
];

// Helper: Auto-scroll to trigger lazy-loaded images or elements
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 800; // Larger jumps for faster scroll
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

// Helper: Extract structural metadata for AI agents
async function extractAgentMetadata(page, route, viewport) {
  return await page.evaluate((r, v) => {
    const title = document.title;
    const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
    const h1 = document.querySelector('h1')?.innerText || '';
    const h2s = Array.from(document.querySelectorAll('h2')).map(el => el.innerText.trim()).filter(Boolean);
    const buttons = Array.from(document.querySelectorAll('button, a[class*="button"], a[class*="btn"]'))
      .map(el => el.innerText.trim()).filter(Boolean);
    const links = Array.from(document.querySelectorAll('a'))
      .map(el => ({ text: el.innerText.trim(), href: el.getAttribute('href') }))
      .filter(l => l.text);
    
    return {
      template_id: r.id,
      path: r.path,
      viewport: v.name,
      seo: { title, description: metaDesc },
      content_structure: {
        primary_heading: h1,
        secondary_headings: h2s
      },
      interactive_elements: {
        buttons: [...new Set(buttons)],
        total_links: links.length,
        sample_links: links.slice(0, 10)
      },
      timestamp: new Date().toISOString()
    };
  }, route, viewport);
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  console.log('🚀 Starting Puppeteer for Agentic Capture...');
  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  let bucket = null;
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    const storage = new Storage({ 
      keyFilename: SERVICE_ACCOUNT_PATH
    });
    bucket = storage.bucket(STORAGE_BUCKET);
    console.log(`☁️  Connected to Cloud Storage: ${STORAGE_BUCKET}`);
  } else {
    console.log('⚠️  serviceAccountKey.json not found. Will only save locally.');
  }

  for (const route of ROUTES) {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewport({ 
        width: viewport.width, 
        height: viewport.height, 
        isMobile: viewport.isMobile 
      });
      
      console.log(`\n📸 Navigating to [${route.id}] via [${viewport.name}]...`);
      const url = `${BASE_URL}${route.path}`;
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        console.log(`  - Scrolling to trigger lazy loads...`);
        await autoScroll(page);
        
        const fileBase = `${route.id}_${viewport.name}`;
        const imgPath = path.join(OUTPUT_DIR, `${fileBase}.png`);
        const jsonPath = path.join(OUTPUT_DIR, `${fileBase}_metadata.json`);
        
        // 1. Capture Full Page Screenshot
        console.log(`  - Capturing full page layout...`);
        await page.screenshot({ path: imgPath, fullPage: true });
        
        // 2. Extract Agentic Metadata
        console.log(`  - Extracting agentic DOM metadata...`);
        const metadata = await extractAgentMetadata(page, route, viewport);
        fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));
        
        // 3. Upload to Firebase Storage
        if (bucket) {
          console.log(`  - Uploading assets to Storage (${STORAGE_PREFIX}/)...`);
          await bucket.upload(imgPath, { 
            destination: `${STORAGE_PREFIX}/${fileBase}.png`, 
            metadata: { contentType: 'image/png' } 
          });
          await bucket.upload(jsonPath, { 
            destination: `${STORAGE_PREFIX}/${fileBase}_metadata.json`, 
            metadata: { contentType: 'application/json' } 
          });
        }
        
        console.log(`  ✅ Successfully exported ${fileBase}`);
      } catch (e) {
        console.error(`  ❌ Failed to capture ${route.id} [${viewport.name}]:`, e.message);
      } finally {
        await page.close();
      }
    }
  }
  
  await browser.close();
  console.log('\n🎉 All agentic UI exports and uploads completed successfully!');
}

run().catch(console.error);
