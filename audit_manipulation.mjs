import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';

async function runAudit() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. rentals shard = EMPTY []
    console.log('Running EMPTY rentals shard test...');
    const pageEmpty = await browser.newPage();
    await pageEmpty.setRequestInterception(true);
    pageEmpty.on('request', request => {
      // Intercept dynamic import in dev
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

    // 2. rentals shard = DELAYED (5s)
    console.log('Running DELAYED rentals shard test...');
    const pageDelayed = await browser.newPage();
    await pageDelayed.setRequestInterception(true);
    pageDelayed.on('request', async request => {
      if (request.url().includes('graphRentalShard')) {
        await new Promise(r => setTimeout(r, 5000));
        request.continue();
      } else {
        request.continue();
      }
    });
    await pageDelayed.setViewport({ width: 1280, height: 800 });
    await pageDelayed.goto(`${BASE_URL}/airport/mxp?mode=rent`);
    await new Promise(r => setTimeout(r, 1000));
    await pageDelayed.screenshot({ path: 'screenshots/manipulation/delayed_rentals_mxp_1s.png' });
    await pageDelayed.waitForNetworkIdle();
    await pageDelayed.screenshot({ path: 'screenshots/manipulation/delayed_rentals_mxp_loaded.png' });
    await pageDelayed.close();

    // 3. Interaction while loading
    console.log('Running Interaction while loading...');
    const pageInt = await browser.newPage();
    await pageInt.setRequestInterception(true);
    pageInt.on('request', async request => {
      if (request.url().includes('graphRentalShard')) {
        await new Promise(r => setTimeout(r, 10000));
        request.continue();
      } else {
        request.continue();
      }
    });
    await pageInt.goto(`${BASE_URL}/airport/mxp`);
    await new Promise(r => setTimeout(r, 1000));
    // Click "Rent A Bike" mode button
    await pageInt.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const rentButton = buttons.find(b => b.innerText.includes('Rent A Bike'));
      if (rentButton) rentButton.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    fs.mkdirSync('screenshots/interaction', { recursive: true });
    await pageInt.screenshot({ path: 'screenshots/interaction/after_mode_switch_loading.png' });
    await pageInt.close();

  } finally {
    await browser.close();
  }
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
