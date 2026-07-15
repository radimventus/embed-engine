import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const BASE = process.env.CS_URL ?? 'http://127.0.0.1:4173/';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

const jsBundles = [];
page.on('response', (response) => {
  const url = response.url();
  const ct = response.headers()['content-type'] ?? '';
  if (url.includes('.js') || ct.includes('javascript')) {
    jsBundles.push({ url, status: response.status(), contentType: ct });
  }
});

await page.goto(BASE, { waitUntil: 'networkidle' });

const audit = await page.evaluate(() => {
  const canvas = document.querySelector('[data-desktop-canvas]');
  const reactRoot =
    document.getElementById('root') ??
    document.querySelector('[data-reactroot]') ??
    document.querySelector('#root > *');

  const ariaEls = [...document.querySelectorAll('[aria-label]')];
  const ariaLabels = ariaEls.map((el) => ({
    tag: el.tagName.toLowerCase(),
    ariaLabel: el.getAttribute('aria-label'),
  }));

  const cssFiles = [
    ...[...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => ({
      type: 'link',
      href: l.href,
    })),
    ...[...document.querySelectorAll('style')].map((s, i) => ({
      type: 'style',
      href: s.getAttribute('data-vite-dev-id') ?? `[inline-style-${i}]`,
    })),
  ];

  const moduleScripts = [...document.querySelectorAll('script[type="module"]')].map(
    (s) => s.src || s.textContent?.slice(0, 80) || '[inline-module]',
  );

  const mainJs =
    moduleScripts.find((u) => u.includes('main.tsx') || u.includes('/assets/index-')) ??
    moduleScripts[0] ??
    null;

  return {
    locationHref: location.href,
    bodyInnerHtmlLength: document.body.innerHTML.length,
    canvasInnerHtmlLength: canvas?.innerHTML.length ?? null,
    canvasSectionCount: canvas ? canvas.querySelectorAll('section').length : null,
    ariaLabelElementCount: ariaEls.length,
    ariaLabels,
    reactRoot: reactRoot
      ? {
          tagName: reactRoot.tagName,
          id: reactRoot.id || null,
          className: reactRoot.className || null,
          childElementCount: reactRoot.childElementCount,
        }
      : null,
    mainJsBundleUrl: mainJs,
    cssFiles,
    moduleScripts,
    canvasPresent: !!canvas,
    title: document.title,
  };
});

audit.networkJsBundles = jsBundles.filter(
  (b) => b.url.includes('main') || b.url.includes('/assets/index-') || b.url.includes('@vite'),
);
audit.capturedAt = new Date().toISOString();
audit.auditUrl = BASE;

await page.screenshot({
  path: '/Users/radimventus/embed-engine/docs/cs-10d-render-identity-fullpage.png',
  fullPage: true,
});

await browser.close();

writeFileSync(
  '/Users/radimventus/embed-engine/docs/cs-10d-render-identity.json',
  JSON.stringify(audit, null, 2),
);

console.log(JSON.stringify(audit, null, 2));
