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
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const dir = `audit_exports`;
  fs.mkdirSync(dir, { recursive: true });

  for (const route of ROUTES) {
    console.log(`Auditing ${route.name}...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 2000 });
    
    try {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 5000));
      await page.screenshot({ path: `${dir}/${route.name}_desktop.png` });
      
      await page.setViewport({ width: 375, height: 2000 });
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: `${dir}/${route.name}_mobile.png` });
    } catch (e) {
      console.error(`Error on ${route.name}: ${e.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
}

runAudit();
