const fs = require('fs');
const path = require('path');
let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch (e) {
  puppeteer = require(path.join(__dirname, '..', 'frontend', 'node_modules', 'puppeteer-core'));
}

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureAll() {
  console.log(`Launching browser using: ${executablePath}`);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });

  console.log('Navigating to http://127.0.0.1:5173...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2500); // Wait for initial state fetch

  console.log('1. Capturing 01_overview_dashboard.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_overview_dashboard.png') });

  // 2. Open Guided Demo Modal
  console.log('2. Opening Guided Demo Modal...');
  const demoBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('Start Guided Demo'));
  });
  if (demoBtn && demoBtn.asElement()) {
    await demoBtn.asElement().click();
    await sleep(1000);
    console.log('Capturing 02_guided_demo_modal.png');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_guided_demo_modal.png') });

    // Close demo modal (click close button or backdrop)
    const closeBtn = await page.$('button svg.lucide-x');
    if (closeBtn) {
      await closeBtn.click();
      await sleep(600);
    }
  }

  // 3. Inject Starvation workload and step simulation
  console.log('3. Injecting Starvation scenario...');
  const injectBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('Inject Starvation'));
  });
  if (injectBtn && injectBtn.asElement()) {
    await injectBtn.asElement().click();
    await sleep(1500);

    // Advance 15 steps to trigger sliding window anomaly detector
    console.log('Stepping 15 ticks to trigger anomaly surveillance...');
    const stepBtn = await page.$('button[title*="Advance"]');
    if (stepBtn) {
      for (let i = 0; i < 15; i++) {
        await stepBtn.click();
        await sleep(150);
      }
    }
    await sleep(1500);
    console.log('Capturing 03_anomaly_surveillance_triggered.png');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_anomaly_surveillance_triggered.png') });
  }

  // Helper function to click sidebar tab
  async function clickNavTab(label) {
    await page.evaluate((text) => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const target = buttons.find(b => b.textContent.includes(text));
      if (target) target.click();
    }, label);
    await sleep(1200);
  }

  // 4. Process Explorer
  console.log('4. Navigating to Process Explorer...');
  await clickNavTab('Process Explorer');
  console.log('Capturing 04_process_explorer.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_process_explorer.png') });

  // 5. Inspect PCB Drawer
  console.log('5. Opening PCB Inspection Drawer...');
  const inspectBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('Inspect PCB'));
  });
  if (inspectBtn && inspectBtn.asElement()) {
    await inspectBtn.asElement().click();
    await sleep(1000);
    console.log('Capturing 05_process_pcb_drawer.png');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_process_pcb_drawer.png') });

    // Close drawer
    const closeDrawerBtn = await page.$('div.fixed button svg.lucide-x');
    if (closeDrawerBtn) {
      await closeDrawerBtn.click();
      await sleep(600);
    }
  }

  // 6. Scheduling Laboratory
  console.log('6. Navigating to Scheduling Laboratory...');
  await clickNavTab('Scheduling Laboratory');
  console.log('Capturing 06_scheduling_laboratory.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_scheduling_laboratory.png') });

  // 7. Recovery Center
  console.log('7. Navigating to Recovery Center...');
  await clickNavTab('Recovery Center');
  console.log('Capturing 07_recovery_center.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_recovery_center.png') });

  // 8. Recovery Scoring Breakdown Modal
  console.log('8. Opening Scoring Breakdown Modal...');
  const breakdownBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('Scoring Breakdown'));
  });
  if (breakdownBtn && breakdownBtn.asElement()) {
    await breakdownBtn.asElement().click();
    await sleep(1000);
    console.log('Capturing 08_recovery_scoring_breakdown.png');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_recovery_scoring_breakdown.png') });

    const closeModalBtn = await page.$('div.fixed button svg.lucide-x');
    if (closeModalBtn) {
      await closeModalBtn.click();
      await sleep(600);
    }
  }

  // 9. Decision Explainability
  console.log('9. Navigating to Decision Explainability...');
  await clickNavTab('Decision Explainability');
  console.log('Capturing 09_decision_explainability.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_decision_explainability.png') });

  // 10. Experiment Workbench
  console.log('10. Navigating to Experiment Workbench...');
  await clickNavTab('Experiment Workbench');
  console.log('Capturing 10_experiment_benchmarks.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_experiment_benchmarks.png') });

  // 11. Workload Studio
  console.log('11. Navigating to Workload Studio...');
  await clickNavTab('Workload Studio');
  console.log('Capturing 11_workload_studio.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_workload_studio.png') });

  // 12. Architecture Inspector
  console.log('12. Navigating to Architecture Inspector...');
  await clickNavTab('Architecture Inspector');
  console.log('Capturing 12_architecture_inspector.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12_architecture_inspector.png') });

  // 13. Reports & Export
  console.log('13. Navigating to Reports & Export...');
  await clickNavTab('Reports & Export');
  console.log('Capturing 13_reports_export_center.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '13_reports_export_center.png') });

  // 14. Event Timeline
  console.log('14. Navigating to Event Timeline...');
  await clickNavTab('Event Timeline');
  console.log('Capturing 14_event_timeline.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '14_event_timeline.png') });

  // 15. Settings & Viva Guide
  console.log('15. Navigating to Settings & Viva Guide...');
  await clickNavTab('Settings & Viva Guide');
  console.log('Capturing 15_settings_viva_guide.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '15_settings_viva_guide.png') });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

captureAll().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
