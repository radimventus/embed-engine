import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:4196';
const canvasOut = process.argv[3] ?? '../../docs/cs-09b-canvas-1600.png';
const viewportOut = process.argv[4] ?? '../../docs/current-client-studio-1600.png';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-desktop-canvas]');

const canvasHeight = await page.locator('[data-desktop-canvas]').evaluate((el) => el.scrollHeight);
const viewportHeight = Math.min(canvasHeight + 48, 9000);
await page.setViewportSize({ width: 1600, height: viewportHeight });
await page.locator('[data-desktop-canvas]').screenshot({ path: canvasOut });
await page.screenshot({ path: viewportOut, fullPage: false });

console.log(JSON.stringify({ canvasHeight }, null, 2));
await browser.close();
