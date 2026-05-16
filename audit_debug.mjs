import puppeteer from 'puppeteer';
import fs from 'fs';

const ROUTES = [
  { name: 'a2a-mission', path: '/a2a/mxp-to-muc-alpine-traverse' },
  { name: 'normal-mission', path: '/mission/milan-mxp-to-alps' },
];

const BASE_URL = 'http://127.0.0.1:5173';

async function runAudit() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-software-rasterizer',
    ]
  });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    page.on('console', msg => console.log(`${route.name} LOG:`, msg.text()));
    page.on('pageerror', err => console.log(`${route.name} ERROR:`, err.message));

    await page.setViewport({ width: 1280, height: 1200 });
    
    console.log(`Auditing ${route.name}...`);
    try {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 10000));
      await page.screenshot({ path: `audit_exports/${route.name}_desktop.png` });
      
      await page.setViewport({ width: 375, height: 1200 });
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: `audit_exports/${route.name}_mobile.png` });
    } catch (e) {
      console.error(`Error on ${route.name}: ${e.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
}

runAudit();
