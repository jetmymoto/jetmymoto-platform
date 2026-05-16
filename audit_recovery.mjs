import puppeteer from 'puppeteer';
import fs from 'fs';

const ROUTES = [
  { name: 'a2a-mission', path: '/a2a/mxp-to-muc-alpine-traverse' },
  { name: 'normal-mission', path: '/mission/milan-mxp-to-alps' },
];

const BASE_URL = 'http://127.0.0.1:5173';

async function captureRoute(browser, route, isMobile = false) {
  const page = await browser.newPage();
  const suffix = isMobile ? '_mobile' : '_desktop';
  
  const width = isMobile ? 375 : 1440;
  await page.setViewport({ width, height: 1000, isMobile: true });

  console.log(`Auditing ${route.name} (${route.path}) ${suffix}`);
  const dir = `audit_exports`;
  fs.mkdirSync(dir, { recursive: true });

  await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle2', timeout: 90000 });
  
  // Wait for content to settle
  await new Promise(r => setTimeout(r, 3000));

  // Auto-resize viewport to full height to avoid screenshot errors
  const height = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width, height });

  await page.screenshot({ 
    path: `${dir}/${route.name}${suffix}.png`
  });

  await page.close();
}

async function runAudit() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    for (const route of ROUTES) {
      // Desktop
      await captureRoute(browser, route, false);
      // Mobile
      await captureRoute(browser, route, true);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

runAudit();
