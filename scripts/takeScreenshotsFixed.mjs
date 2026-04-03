import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const baseUrl = 'http://localhost:5174';
const outputDir = path.resolve(process.cwd(), 'screenshots/templates');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pages = [
  { name: '08_destination_detail', path: '/destination/alps' }
];

async function run() {
  console.log('Starting browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1080 });

  for (const p of pages) {
    console.log(`Taking screenshot of ${p.name} (${baseUrl}${p.path})...`);
    try {
      await page.goto(`${baseUrl}${p.path}`, { waitUntil: 'networkidle0', timeout: 45000 });
      // Scroll down gently to trigger lazy load images
      await page.evaluate(async () => {
          await new Promise((resolve) => {
              let totalHeight = 0;
              const distance = 800;
              // Limit scroll height for very large pages
              const maxScrollHeight = 15000; 
              const timer = setInterval(() => {
                  const scrollHeight = document.body.scrollHeight;
                  window.scrollBy(0, distance);
                  totalHeight += distance;

                  if (totalHeight >= Math.min(scrollHeight, maxScrollHeight) - window.innerHeight) {
                      clearInterval(timer);
                      resolve();
                  }
              }, 150);
          });
          window.scrollTo(0, 0); // Scroll back up to take full page screenshot properly
      });
      await new Promise(r => setTimeout(r, 2000));
      
      // If it still fails on height, we can cap the height
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      const clip = { x: 0, y: 0, width: 1440, height: Math.min(bodyHeight, 16000) };

      await page.screenshot({ path: path.join(outputDir, `${p.name}.png`), clip });
      console.log(`✅ Saved ${p.name}.png`);
    } catch (err) {
      console.error(`❌ Failed on ${p.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('Done capturing missed screenshots!');
}

run().catch(console.error);
