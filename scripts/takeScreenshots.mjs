import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Vite default port can be 5173, check the console output if it fails
const baseUrl = 'http://localhost:5173';
const outputDir = path.resolve(process.cwd(), 'screenshots/templates');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pages = [
  { name: '01_home', path: '/' },
  { name: '02_rental_detail', path: '/rentals/mxp/bmw-r1300gs-mxp-eagle-rider-mxp' },
  { name: '03_a2a_mission', path: '/a2a/milan-to-munich-alpine-expedition' },
  { name: '04_route_detail', path: '/route/milan-mxp-to-alps' },
  { name: '05_operator_detail', path: '/operators/eagle-rider-mxp' },
  { name: '06_airport_hub_bring', path: '/airport/mxp' },
  { name: '07_airport_hub_rent', path: '/airport/mxp?mode=rent' },
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
              const distance = 400;
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
          window.scrollTo(0, 0); // Scroll back up to take full page screenshot properly
      });
      await new Promise(r => setTimeout(r, 2000));
      
      await page.screenshot({ path: path.join(outputDir, `${p.name}.png`), fullPage: true });
      console.log(`✅ Saved ${p.name}.png`);
    } catch (err) {
      console.error(`❌ Failed on ${p.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('All screenshots captured!');
}

run().catch(console.error);
