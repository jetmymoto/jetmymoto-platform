import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const outputDir = path.resolve(repoRoot, 'screenshots/templates');
const metaDir = path.resolve(repoRoot, 'screenshots/metatags');
const frontendDir = path.resolve(repoRoot, 'frontend/rideratlas');
const candidatePorts = [5173, 5174, 4173, 4174, 3000];
const preferredPort = Number(process.env.SCREENSHOT_PORT || 5173);
const baseUrlOverride = process.env.SCREENSHOT_BASE_URL || null;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(metaDir)) {
  fs.mkdirSync(metaDir, { recursive: true });
}

const pages = [
  { name: '01_home', path: '/' },
  { name: '02_rental_detail', path: '/rentals/mxp/bmw-r1300gs-mxp-eagle-rider-mxp' },
  { name: '03_a2a_mission', path: '/a2a/milan-to-munich-alpine-expedition' },
  { name: '04_route_detail', path: '/route/milan-mxp-to-alps' },
  { name: '05_operator_detail', path: '/operators/eagle-rider-mxp' },
  { name: '06_airport_hub_bring', path: '/airport/mxp' },
  { name: '07_airport_hub_rent', path: '/airport/mxp?mode=rent' },
  { name: '08_destination_detail', path: '/destination/alps' },
  { name: '09_one_way_rentals', path: '/one-way-rentals' },
  { name: '10_global_tower_europe', path: '/airport/continent/europe' },
  { name: '11_a2a_corridor_cdg_mad', path: '/a2a/cdg-to-mad-iberian-corridor' },
  { name: '12_a2a_corridor_mxp_vie', path: '/a2a/mxp-to-vie-alpine-eastward' },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

async function isUrlReachable(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok || response.status === 404;
  } catch {
    return false;
  }
}

async function resolveRunningBaseUrl() {
  if (baseUrlOverride) {
    return (await isUrlReachable(baseUrlOverride)) ? baseUrlOverride : null;
  }

  const ports = [preferredPort, ...candidatePorts.filter((port) => port !== preferredPort)];
  for (const port of ports) {
    const url = `http://127.0.0.1:${port}`;
    if (await isUrlReachable(url)) {
      return url;
    }
  }

  return null;
}

async function waitForServer(url, timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isUrlReachable(url)) {
      return true;
    }
    await delay(1000);
  }

  return false;
}

function startFrontendServer(port) {
  const child = spawn(
    'bash',
    ['-lc', `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`],
    {
      cwd: frontendDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    }
  );

  child.on('error', (error) => {
    console.error(`[vite] Failed to start dev server: ${error.message}`);
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[vite] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[vite] ${chunk}`);
  });

  return child;
}

async function ensureBaseUrl() {
  const runningUrl = await resolveRunningBaseUrl();
  if (runningUrl) {
    console.log(`Using existing frontend server: ${runningUrl}`);
    return { baseUrl: runningUrl, serverProcess: null };
  }

  const bootUrl = `http://127.0.0.1:${preferredPort}`;
  console.log(`No frontend server detected. Starting Vite in ${frontendDir} on ${bootUrl} ...`);

  const serverProcess = startFrontendServer(preferredPort);
  const ready = await waitForServer(bootUrl);

  if (!ready) {
    serverProcess.kill('SIGTERM');
    throw new Error(`Timed out waiting for frontend server at ${bootUrl}`);
  }

  console.log(`Frontend server ready: ${bootUrl}`);
  return { baseUrl: bootUrl, serverProcess };
}

async function scrollPage(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 600;
      const maxScrollHeight = 10000;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= Math.min(scrollHeight, maxScrollHeight) - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });

    window.scrollTo(0, 0);
  });
}

async function tryScrollPage(page, pageName) {
  try {
    await withTimeout(scrollPage(page), 10000, `${pageName} scroll`);
  } catch (error) {
    console.warn(`  ⚠️ Scroll skipped for ${pageName}: ${error.message}`);
  }
}

async function takeScreenshot(page, filePath) {
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight || document.documentElement.scrollHeight || 0);
  const clipHeight = Math.min(Math.max(bodyHeight, 1080), 10000);

  await page.screenshot({
    path: filePath,
    clip: {
      x: 0,
      y: 0,
      width: 1440,
      height: clipHeight,
    },
  });
}

async function navigateForCapture(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('body', { timeout: 15000 });
  await page.waitForFunction(
    () => document.readyState === 'interactive' || document.readyState === 'complete',
    { timeout: 15000 }
  );
  await delay(750);
}

/**
 * Extracts all SEO-relevant metatags from the current page.
 * Returns a structured object suitable for agent consumption.
 */
async function extractMetatags(page, pagePath) {
  return page.evaluate((path) => {
    const getMeta = (selector) => {
      const el = document.querySelector(selector);
      return el ? (el.getAttribute('content') || el.getAttribute('href') || el.innerText || null) : null;
    };
    const getAllMeta = (selector) => {
      return Array.from(document.querySelectorAll(selector)).map(el => ({
        name: el.getAttribute('name') || el.getAttribute('property') || el.getAttribute('rel') || null,
        content: el.getAttribute('content') || el.getAttribute('href') || null,
      })).filter(m => m.content);
    };

    // Schema.org JSON-LD blocks
    const jsonLdBlocks = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map(el => { try { return JSON.parse(el.textContent); } catch { return null; } })
      .filter(Boolean);

    return {
      path,
      capturedAt: new Date().toISOString(),
      title: document.title || null,
      canonical: getMeta('link[rel="canonical"]'),
      description: getMeta('meta[name="description"]'),
      robots: getMeta('meta[name="robots"]'),
      // Open Graph
      og: {
        title: getMeta('meta[property="og:title"]'),
        description: getMeta('meta[property="og:description"]'),
        image: getMeta('meta[property="og:image"]'),
        url: getMeta('meta[property="og:url"]'),
        type: getMeta('meta[property="og:type"]'),
        siteName: getMeta('meta[property="og:site_name"]'),
      },
      // Twitter Card
      twitter: {
        card: getMeta('meta[name="twitter:card"]'),
        title: getMeta('meta[name="twitter:title"]'),
        description: getMeta('meta[name="twitter:description"]'),
        image: getMeta('meta[name="twitter:image"]'),
      },
      // All meta tags (full dump for agent use)
      allMeta: getAllMeta('meta[name], meta[property]'),
      // Structured data
      jsonLd: jsonLdBlocks,
      // H1/H2 headings (content hierarchy for agents)
      headings: {
        h1: Array.from(document.querySelectorAll('h1')).map(el => el.innerText.trim()).filter(Boolean),
        h2: Array.from(document.querySelectorAll('h2')).slice(0, 8).map(el => el.innerText.trim()).filter(Boolean),
      },
    };
  }, pagePath);
}

async function run() {
  const { baseUrl, serverProcess } = await ensureBaseUrl();

  console.log('Starting browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const allMeta = [];
  let successCount = 0;
  let failureCount = 0;

  try {
    for (const p of pages) {
      console.log(`Taking screenshot of ${p.name} (${baseUrl}${p.path})...`);
      const page = await browser.newPage();
      try {
        await page.setViewport({ width: 1440, height: 1080 });
        await withTimeout(navigateForCapture(page, `${baseUrl}${p.path}`), 20000, `${p.name} navigation`);
        await tryScrollPage(page, p.name);
        await delay(500);

        await withTimeout(
          takeScreenshot(page, path.join(outputDir, `${p.name}.png`)),
          15000,
          `${p.name} screenshot`
        );
        console.log(`  ✅ Screenshot saved: ${p.name}.png`);

        const meta = await extractMetatags(page, p.path);
        allMeta.push({ page: p.name, ...meta });

        const metaPath = path.join(metaDir, `${p.name}.json`);
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
        console.log(`  ✅ Metatags saved: ${p.name}.json`);

        console.log(`     title:       ${meta.title || '(missing)'}`);
        console.log(`     description: ${meta.description ? meta.description.slice(0, 80) + '...' : '(missing)'}`);
        console.log(`     canonical:   ${meta.canonical || '(missing)'}`);
        console.log(`     og:title:    ${meta.og?.title || '(missing)'}`);
        console.log(`     h1:          ${meta.headings?.h1?.[0] || '(missing)'}`);
        console.log(`     json-ld:     ${meta.jsonLd?.length || 0} block(s)`);

        successCount += 1;
      } catch (err) {
        failureCount += 1;
        console.error(`  ❌ Failed on ${p.name}:`, err.message);
      } finally {
        await page.close().catch(() => {});
      }
    }

    const indexPath = path.join(metaDir, '_index.json');
    fs.writeFileSync(indexPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      baseUrl,
      pageCount: allMeta.length,
      successCount,
      failureCount,
      pages: allMeta,
    }, null, 2), 'utf8');
    console.log(`\n✅ Consolidated metatag index: screenshots/metatags/_index.json`);
    console.log(`Capture summary: ${successCount} succeeded, ${failureCount} failed.`);
  } finally {
    await browser.close().catch(() => {});
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  }

  if (failureCount > 0) {
    process.exitCode = 1;
    console.error('Screenshot capture finished with failures. See logs above.');
    return;
  }

  console.log('All screenshots and metatags captured!');
}

run().catch(console.error);
