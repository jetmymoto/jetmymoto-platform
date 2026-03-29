const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

const MAX_PDF_BYTES = 2 * 1024 * 1024; // 2 MB hard cap

async function generateDossierPdf(htmlString) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Block all external network requests — template is fully inline
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.url().startsWith("data:") || req.url() === "about:blank") {
        req.continue();
      } else if (req.resourceType() === "document") {
        req.continue();
      } else {
        req.abort();
      }
    });

    await page.setContent(htmlString, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    const buffer = Buffer.from(pdfBuffer);

    if (buffer.length > MAX_PDF_BYTES) {
      console.warn(`PDF too large (${buffer.length} bytes), discarding`);
      return null;
    }

    return buffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { generateDossierPdf };
