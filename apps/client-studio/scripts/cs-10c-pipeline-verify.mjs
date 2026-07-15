import { chromium } from 'playwright';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.resolve(APP_DIR, '../../docs');
const VIEWPORT = { width: 1600, height: 900 };

function sha256File(filePath) {
  return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function sha256Buffer(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

async function capturePage(url, outPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-desktop-canvas]');

  const metrics = await page.evaluate(() => {
    const canvas = document.querySelector('[data-desktop-canvas]');
    const hero = document.querySelector('.h-hero-image');
    const pe = document.querySelector('[aria-label="Media Explorer"]')?.closest('div.grid');
    const floor = document.querySelector('[aria-label="Floor Plan Explorer"] .aspect-square');
    const stylesheets = [...document.styleSheets].map((ss) => {
      try {
        return { href: ss.href, rules: ss.cssRules?.length ?? 0 };
      } catch {
        return { href: ss.href, rules: 'blocked' };
      }
    });

    const heroRule = [...document.styleSheets].flatMap((ss) => {
      try {
        return [...ss.cssRules].filter((r) => r.cssText?.includes('hero-image'));
      } catch {
        return [];
      }
    });

    const peCols = pe ? getComputedStyle(pe).gridTemplateColumns : null;

    return {
      url: location.href,
      canvasWidth: canvas?.offsetWidth,
      canvasHeight: canvas?.offsetHeight,
      heroHeight: hero?.offsetHeight,
      heroComputed: hero ? getComputedStyle(hero).height : null,
      peGridCols: peCols,
      floorplanSize: floor ? { w: floor.offsetWidth, h: floor.offsetHeight } : null,
      hasTriptych: pe?.className?.includes('50%') ?? false,
      stylesheetCount: stylesheets.length,
      heroCssRules: heroRule.map((r) => r.cssText).slice(0, 5),
      stylesheets,
      moduleScripts: [...document.querySelectorAll('script[type="module"]')].map((s) => s.src),
      linkStyles: [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href),
    };
  });

  const canvasHeight = await page.locator('[data-desktop-canvas]').evaluate((el) => el.scrollHeight);
  await page.setViewportSize({ width: 1600, height: Math.min(canvasHeight + 48, 9000) });
  const png = await page.locator('[data-desktop-canvas]').screenshot({ type: 'png' });
  fs.writeFileSync(outPath, png);

  await browser.close();
  return { metrics, pngHash: sha256Buffer(png), pngPath: outPath };
}

function findCssInDir(dir, pattern) {
  const hits = [];
  if (!fs.existsSync(dir)) return hits;
  for (const file of fs.readdirSync(dir, { recursive: true })) {
    if (String(file).endsWith('.css')) {
      const full = path.join(dir, String(file));
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes(pattern)) hits.push({ file: full, matches: (content.match(new RegExp(pattern, 'g')) || []).length });
    }
  }
  return hits;
}

async function main() {
  const devUrl = process.env.CS10C_DEV_URL ?? 'http://localhost:4173';
  const prodUrl = process.env.CS10C_PROD_URL ?? 'http://localhost:4174';

  const sourceFingerprint = {
    propertyExplorer: sha256File(path.join(APP_DIR, 'src/features/client-studio/sections/PropertyExplorer/PropertyExplorer.tsx')),
    tailwindConfig: sha256File(path.join(APP_DIR, 'tailwind.config.js')),
    heroImage: sha256File(path.join(APP_DIR, 'src/features/client-studio/sections/Hero/HeroImage.tsx')),
  };

  const devShot = path.join(DOCS_DIR, 'cs-10c-dev-canvas.png');
  const prodShot = path.join(DOCS_DIR, 'cs-10c-prod-canvas.png');

  console.log('Capturing DEV...', devUrl);
  const dev = await capturePage(devUrl, devShot);
  console.log('Capturing PROD preview...', prodUrl);
  const prod = await capturePage(prodUrl, prodShot);

  const distCss = findCssInDir(path.join(APP_DIR, 'dist'), 'hero-image');
  const devCssHero = dev.metrics.heroCssRules;

  const report = {
    capturedAt: new Date().toISOString(),
    sourceFingerprint,
    dev: { url: devUrl, pngHash: dev.pngHash, metrics: dev.metrics },
    prod: { url: prodUrl, pngHash: prod.pngHash, metrics: prod.metrics },
    pngIdentical: dev.pngHash === prod.pngHash,
    metricDiff: {
      canvasWidth: dev.metrics.canvasWidth === prod.metrics.canvasWidth,
      canvasHeight: dev.metrics.canvasHeight === prod.metrics.canvasHeight,
      heroHeight: dev.metrics.heroHeight === prod.metrics.heroHeight,
      peGridCols: dev.metrics.peGridCols === prod.metrics.peGridCols,
      floorplanSize: JSON.stringify(dev.metrics.floorplanSize) === JSON.stringify(prod.metrics.floorplanSize),
      triptych: dev.metrics.hasTriptych === prod.metrics.hasTriptych,
    },
    distCssHeroRules: distCss,
    devHeroCssRules: devCssHero,
  };

  fs.writeFileSync(path.join(DOCS_DIR, 'cs-10c-pipeline-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
