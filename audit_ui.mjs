import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'airport-mxp-rent', path: '/airport/mxp?mode=rent' },
  { name: 'airport-lax', path: '/airport/lax' },
  { name: 'route-alps-ultimate', path: '/route/milan-mxp-to-alps' }, // Adjusted to real slug
  { name: 'destination-dolomites', path: '/destination/dolomites' },
  { name: 'rental-overlay', path: '/rentals/MXP/bmw-r1300gs-mxp-eagle-rider-mxp' }, // Adjusted to real slug
  { name: 'moto-airlift', path: '/moto-airlift' },
  { name: 'pool-test', path: '/pool/test123' },
];

const BASE_URL = 'http://localhost:5173';

async function captureRoute(browser, route, suffix = '') {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log(`Auditing ${route.name} (${route.path}) ${suffix}`);
  const dir = `screenshots/${route.name}${suffix ? '_' + suffix : ''}`;
  fs.mkdirSync(dir, { recursive: true });

  // Initial render (0-100ms)
  // We'll take a screenshot as soon as possible after goto
  const start = Date.now();
  const gotoPromise = page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded' });
  
  await new Promise(r => setTimeout(r, 50));
  await page.screenshot({ path: `${dir}/a_initial_50ms.png` });

  // Mid-load (300-800ms)
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${dir}/b_mid_500ms.png` });

  // Fully loaded
  await gotoPromise;
  try {
    await page.waitForNetworkIdle({ timeout: 5000 });
  } catch (e) {
    console.log(`Timeout waiting for network idle on ${route.path}`);
  }
  const pageState = await page.evaluate(() => {
    const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim());
    return {
      title: document.title,
      h1s: h1s,
      has404: document.body.innerText.includes('404') || document.body.innerText.includes('Not Found') || h1s.some(h => h.includes('UNKNOWN AIRPORT')),
      url: window.location.href,
      overlayIdsByPath: window.GRAPH?.indexes?.overlayIdByPath ? Object.keys(window.GRAPH.indexes.overlayIdByPath) : 'missing'
    };
  });
  console.log(`Page State for ${route.name}:`, pageState);
  await page.screenshot({ path: `${dir}/c_fully_loaded.png` });


  await page.close();
}

async function runAudit() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Step 1: Normal Audit
    for (const route of ROUTES) {
      await captureRoute(browser, route);
    }

    // Step 2: Network Throttling
    console.log('Running Fast 3G test...');
    const page3G = await browser.newPage();
    const client = await page3G.target().createCDPSession();
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 100, // ms
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
    });
    await page3G.goto(`${BASE_URL}/airport/mxp?mode=rent`, { waitUntil: 'networkidle0', timeout: 60000 });
    const state3G = await page3G.evaluate(() => ({
      h1: document.querySelector('h1')?.innerText,
      rentalCount: document.querySelectorAll('.rental-card').length
    }));
    console.log('Fast 3G State:', state3G);

    fs.mkdirSync('screenshots/throttling', { recursive: true });
    await page3G.screenshot({ path: 'screenshots/throttling/fast_3g_mxp.png' });
    await page3G.close();

    // Step 4: Interaction Tests while loading
    console.log('Running Interaction test while loading...');
    const pageInt = await browser.newPage();
    await pageInt.setRequestInterception(true);
    pageInt.on('request', async request => {
      if (request.url().includes('graphRentalShard')) {
        await new Promise(r => setTimeout(r, 5000));
        request.continue();
      } else {
        request.continue();
      }
    });
    await pageInt.goto(`${BASE_URL}/airport/mxp`);
    // Try to switch mode to rent while loading
    await new Promise(r => setTimeout(r, 500));
    await pageInt.screenshot({ path: 'screenshots/interaction/before_switch.png' });
    // Find the rent mode button/link and click it
    // Based on AirportPage structure, it might have a toggle or query param link
    await pageInt.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const rentLink = links.find(l => l.href.includes('mode=rent'));
      if (rentLink) rentLink.click();
      else window.location.search = '?mode=rent';
    });
    await new Promise(r => setTimeout(r, 500));
    await pageInt.screenshot({ path: 'screenshots/interaction/after_switch_loading.png' });
    await pageInt.waitForNetworkIdle();
    await pageInt.screenshot({ path: 'screenshots/interaction/after_switch_loaded.png' });
    await pageInt.close();

    // 1. rentals shard = EMPTY []
    console.log('Running EMPTY rentals shard test...');
    const pageEmpty = await browser.newPage();
    await pageEmpty.setRequestInterception(true);
    pageEmpty.on('request', request => {
      if (request.url().includes('graphRentalShard')) {
        request.respond({
          status: 200,
          contentType: 'application/javascript',
          body: 'export function buildGraphRentalShard() { return { rentals: {}, operators: {}, rentalIndexes: {} }; }; export const createGraphRentalShardLoader = () => async () => buildGraphRentalShard();'
        });
      } else {
        request.continue();
      }
    });
    await pageEmpty.setViewport({ width: 1280, height: 800 });
    await pageEmpty.goto(`${BASE_URL}/airport/mxp?mode=rent`, { waitUntil: 'networkidle0' });
    fs.mkdirSync('screenshots/manipulation', { recursive: true });
    await pageEmpty.screenshot({ path: 'screenshots/manipulation/empty_rentals_mxp.png' });
    await pageEmpty.close();

    // 2. rentals shard = DELAYED (2–5s)
    console.log('Running DELAYED rentals shard test...');
    const pageDelayed = await browser.newPage();
    await pageDelayed.setRequestInterception(true);
    pageDelayed.on('request', async request => {
      if (request.url().includes('graphRentalShard')) {
        await new Promise(r => setTimeout(r, 3000));
        request.continue();
      } else {
        request.continue();
      }
    });
    await pageDelayed.setViewport({ width: 1280, height: 800 });
    await pageDelayed.goto(`${BASE_URL}/airport/mxp?mode=rent`);
    await new Promise(r => setTimeout(r, 500));
    await pageDelayed.screenshot({ path: 'screenshots/manipulation/delayed_rentals_mxp_500ms.png' });
    await pageDelayed.waitForNetworkIdle();
    await pageDelayed.screenshot({ path: 'screenshots/manipulation/delayed_rentals_mxp_loaded.png' });
    await pageDelayed.close();

  } finally {
    await browser.close();
  }
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
