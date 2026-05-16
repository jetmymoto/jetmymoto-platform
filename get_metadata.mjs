import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:5180';

async function extractMetadata(path) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    const metadata = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText || '';
      const h2s = Array.from(document.querySelectorAll('h2')).map(el => el.innerText.trim()).filter(Boolean);
      const h3s = Array.from(document.querySelectorAll('h3')).map(el => el.innerText.trim()).filter(Boolean);
      const buttons = Array.from(document.querySelectorAll('button')).map(el => el.innerText.trim()).filter(Boolean);
      const links = Array.from(document.querySelectorAll('a')).map(el => el.innerText.trim()).filter(Boolean);
      const text = document.body.innerText.replace(/\n+/g, '\n').substring(0, 2000); // Sample of page text
      
      return { h1, h2s, h3s, buttons: [...new Set(buttons)], links: [...new Set(links)].slice(0, 20), textSample: text };
    });
    
    console.log(`\n=== METADATA FOR ${path} ===\n${JSON.stringify(metadata, null, 2)}`);
  } catch (e) {
    console.error('Failed', e);
  } finally {
    await browser.close();
  }
}

async function run() {
  await extractMetadata('/');
  await extractMetadata('/rentals/MXP/bmw-r1300gs-mxp-eagle-rider-mxp');
}

run();
