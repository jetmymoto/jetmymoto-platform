import puppeteer from 'puppeteer';
import fs from 'fs';

const ROUTES = [
  { name: 'a2a-mission', path: '/a2a/mxp-to-muc-alpine-traverse' },
];

const BASE_URL = 'http://localhost:5174';

async function captureScreenshots(browser, route) {
  // Desktop
  const pageDesktop = await browser.newPage();
  await pageDesktop.setViewport({ width: 1440, height: 900 });
  console.log(`Capturing Desktop: ${route.name}`);
  await pageDesktop.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  
  // Wait for images and graph and cinematic transitions and VIDEO to load
  await new Promise(r => setTimeout(r, 20000));

  // Pause videos to help Puppeteer capture the screenshot
  await pageDesktop.evaluate(() => {
    const videos = document.querySelectorAll('video');
    videos.forEach(v => v.pause());
  });
  
  const desktopDir = `screenshots/p0_audit/desktop`;
  fs.mkdirSync(desktopDir, { recursive: true });
  await pageDesktop.screenshot({ path: `${desktopDir}/${route.name}.png` });
  await pageDesktop.close();
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: 120000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    for (const route of ROUTES) {
      await captureScreenshots(browser, route);
    }
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
