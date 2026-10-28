const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(__dirname, '..', 'frontend', 'node_modules', 'puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
  await sleep(1500);

  // Navigate to Decision Explainability
  const clickNav = async (name) => {
    await page.evaluate((text) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.textContent.includes(text));
      if (target) target.click();
    }, name);
    await sleep(1000);
  };

  await clickNav('Decision Explainability');
  
  // Check if Breakdown button exists
  const breakdownClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.trim() === 'Breakdown' || b.textContent.includes('Breakdown'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  console.log('Breakdown button clicked on Decision Explainability:', breakdownClicked);

  if (!breakdownClicked) {
    // Go to Recovery Center and check
    await clickNav('Recovery Center');
    const recClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Breakdown'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('Breakdown button clicked on Recovery Center:', recClicked);
  }

  await sleep(1200);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_recovery_scoring_breakdown.png') });
  console.log('Saved 08_recovery_scoring_breakdown.png');

  await browser.close();
})();
