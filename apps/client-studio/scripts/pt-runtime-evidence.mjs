/**
 * PT-RUNTIME-EVIDENCE-01 — capture console + network + page screenshots.
 * Usage: VITE_RUNTIME_EVIDENCE=1 already on server; then:
 *   node apps/client-studio/scripts/pt-runtime-evidence.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '../../../docs/reviews/assets/pt-runtime-evidence-01');
const baseUrl = process.env.EVIDENCE_URL ?? 'http://127.0.0.1:4173/?runtimeEvidence=1';

mkdirSync(outDir, { recursive: true });

const consoleLines = [];
const networkRows = [];

const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
});
const page = await browser.newPage();

page.on('console', (msg) => {
  const text = msg.text();
  if (text.includes('PT-RUNTIME-EVIDENCE-01') || text.includes('[PT-RUNTIME-EVIDENCE-01]')) {
    consoleLines.push(`[${msg.type()}] ${text}`);
  }
});

page.on('response', async (response) => {
  const url = response.url();
  if (
    url.includes('house-package') ||
    url.includes('gallery.csv') ||
    url.includes('rooms.csv') ||
    url.includes('videos.csv') ||
    url.includes('manifest.json') ||
    url.includes('hero')
  ) {
    networkRows.push({
      status: response.status(),
      url,
      resourceType: response.request().resourceType(),
    });
  }
});

await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60_000 });
await page.waitForTimeout(2500);

await page.screenshot({
  path: join(outDir, 'page-viewport.png'),
  fullPage: false,
});

const evidenceFromPage = await page.evaluate(() => {
  const scripts = [...document.querySelectorAll('script[src]')].map(
    (el) => el.getAttribute('src'),
  );
  const links = [...document.querySelectorAll('link[href]')].map((el) =>
    el.getAttribute('href'),
  );
  return {
    location: window.location.href,
    scriptSrcs: scripts,
    linkHrefs: links.slice(0, 40),
  };
});

writeFileSync(join(outDir, 'console-evidence.log'), consoleLines.join('\n') + '\n', 'utf8');
writeFileSync(
  join(outDir, 'network-evidence.json'),
  JSON.stringify(networkRows, null, 2) + '\n',
  'utf8',
);
writeFileSync(
  join(outDir, 'sources-evidence.json'),
  JSON.stringify(evidenceFromPage, null, 2) + '\n',
  'utf8',
);

// Synthetic "console panel" screenshot: render captured logs into a page.
await page.setContent(`<!doctype html><html><body style="margin:0;background:#1e1e1e;color:#d4d4d4;font:12px/1.4 ui-monospace,monospace;padding:16px">
<h1 style="color:#9cdcfe;font-size:14px">DevTools Console — PT-RUNTIME-EVIDENCE-01</h1>
<pre style="white-space:pre-wrap">${consoleLines
  .map((line) => line.replace(/</g, '&lt;'))
  .join('\n')
  .slice(0, 12000)}</pre>
</body></html>`);
await page.screenshot({ path: join(outDir, 'devtools-console.png'), fullPage: true });

await page.setContent(`<!doctype html><html><body style="margin:0;background:#1e1e1e;color:#d4d4d4;font:12px/1.4 ui-monospace,monospace;padding:16px">
<h1 style="color:#9cdcfe;font-size:14px">Network — house-package / CSV / hero / manifest</h1>
<pre style="white-space:pre-wrap">${JSON.stringify(networkRows, null, 2)
  .replace(/</g, '&lt;')
  .slice(0, 12000)}</pre>
</body></html>`);
await page.screenshot({ path: join(outDir, 'devtools-network.png'), fullPage: true });

await page.setContent(`<!doctype html><html><body style="margin:0;background:#1e1e1e;color:#d4d4d4;font:12px/1.4 ui-monospace,monospace;padding:16px">
<h1 style="color:#9cdcfe;font-size:14px">Sources — loaded script/link URLs</h1>
<pre style="white-space:pre-wrap">${JSON.stringify(evidenceFromPage, null, 2)
  .replace(/</g, '&lt;')
  .slice(0, 12000)}</pre>
</body></html>`);
await page.screenshot({ path: join(outDir, 'devtools-sources.png'), fullPage: true });

await browser.close();

console.log(`Evidence written to ${outDir}`);
console.log(`Console lines: ${consoleLines.length}`);
console.log(`Network rows: ${networkRows.length}`);
