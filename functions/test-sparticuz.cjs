const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");
async function run() {
  console.log("Getting executable path...");
  const execPath = await chromium.executablePath();
  console.log("Executable path:", execPath);
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    executablePath: execPath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log("Browser launched!");
  await browser.close();
}
run().catch(console.error);
