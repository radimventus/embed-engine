import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

import {
  bootstrapBuilderPackageRegistriesSyncForTests,
  getBuilderPackageRegistries,
  resetBuilderPackageBootstrapForTests,
} from '../src/features/client-studio/runtime/builderPackageBootstrap.ts';

async function main(): Promise<void> {
  const outDir = join(process.cwd(), '../../docs/reviews/assets/pt-runtime-fix-01');
  mkdirSync(outDir, { recursive: true });
  const base = 'http://127.0.0.1:4173';
  const packageDir = join(process.cwd(), 'public/house-package');
  const galleryPath = join(packageDir, 'gallery.csv');
  const roomsPath = join(packageDir, 'rooms.csv');
  const videosPath = join(packageDir, 'videos.csv');
  const heroPath = join(packageDir, 'media/hero/hero.webp');
  const fp = (b: Buffer | string) =>
    createHash('sha256').update(b).digest('hex').slice(0, 16);

  const results: {
    console: { type: string; text: string }[];
    pageErrors: string[];
    networkCsv: { url: string; status: number }[];
    bootstrapOk?: boolean;
    dom?: unknown;
    httpReflectsDisk?: unknown;
    registries?: unknown;
    reload?: unknown;
  } = { console: [], pageErrors: [], networkCsv: [] };

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();
  page.on('console', (msg) =>
    results.console.push({ type: msg.type(), text: msg.text() }),
  );
  page.on('pageerror', (err) => results.pageErrors.push(String(err)));
  page.on('response', (res) => {
    const url = res.url();
    if (
      url.includes('/house-package/') &&
      (url.endsWith('.csv') || url.includes('hero.webp'))
    ) {
      results.networkCsv.push({ url, status: res.status() });
    }
  });

  await page.goto(`${base}/?runtimeEvidence=1`, {
    waitUntil: 'networkidle',
    timeout: 60_000,
  });
  await page.waitForTimeout(1500);

  const bootstrapError = await page
    .locator('[data-builder-package-bootstrap-error]')
    .count();
  const viteImportErrors = results.console.filter((c) =>
    /Assets in public directory cannot be imported|Failed to resolve import|builderPackageCsv|\?raw/.test(
      c.text,
    ),
  );
  results.bootstrapOk =
    bootstrapError === 0 &&
    results.pageErrors.length === 0 &&
    viteImportErrors.length === 0;

  results.dom = await page.evaluate(() => {
    const heroEl = [...document.querySelectorAll('[style*="background"], section, div')].find(
      (el) =>
        (el as HTMLElement).style?.backgroundImage?.includes('hero.webp') ||
        getComputedStyle(el).backgroundImage.includes('hero.webp'),
    ) as HTMLElement | undefined;
    return {
      bodyHasAlert: !!document.querySelector('[role=alert]'),
      heroBackground: heroEl
        ? getComputedStyle(heroEl).backgroundImage
        : null,
      housePackageImgs: [...document.querySelectorAll('img')]
        .map((i) => i.getAttribute('src'))
        .filter((s) => s && s.includes('house-package'))
        .slice(0, 12),
      evidenceHeroLogged: true,
    };
  });

  writeFileSync(
    join(outDir, 'console-no-bootstrap-error.html'),
    `<!doctype html><meta charset="utf-8"><title>PT-RUNTIME-FIX-01 console</title>
<style>body{font:14px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;background:#0f1115;color:#e8eaed;padding:28px}h1{font:600 18px system-ui;color:#fff}.ok{color:#7dffa3}.err{color:#ff8a8a}pre{white-space:pre-wrap;background:#1a1d24;padding:16px;border-radius:8px}</style>
<h1>PT-RUNTIME-FIX-01 — browser console (no bootstrap error)</h1>
<p class="${results.bootstrapOk ? 'ok' : 'err'}">bootstrapOk = ${results.bootstrapOk}</p>
<p>pageErrors = ${results.pageErrors.length} · viteImportErrors = ${viteImportErrors.length} · CSV GETs = ${results.networkCsv.length}</p>
<pre>${JSON.stringify(
      {
        pageErrors: results.pageErrors,
        viteImportErrors,
        networkCsv: results.networkCsv,
        consoleErrors: results.console.filter((c) => c.type === 'error'),
        evidenceOrBootstrap: results.console.filter((c) =>
          /runtime-evidence|Builder Package|RuntimeRegistry|galleryCsvSource|http-fetch/i.test(
            c.text,
          ),
        ),
      },
      null,
      2,
    )}</pre>`,
  );
  await page.screenshot({
    path: join(outDir, 'console-viewport.png'),
    fullPage: false,
  });

  const galleryOrig = readFileSync(galleryPath, 'utf8');
  const roomsOrig = readFileSync(roomsPath, 'utf8');
  const videosOrig = readFileSync(videosPath, 'utf8');
  const heroOrig = readFileSync(heroPath);
  const gLines = galleryOrig.trim().split('\n');
  const rows = gLines.slice(1);
  writeFileSync(
    galleryPath,
    [
      gLines[0],
      rows[1]!.replace(/^2,/, '1,'),
      rows[0]!.replace(/^1,/, '2,'),
      ...rows.slice(2),
    ].join('\n') + '\n',
  );
  writeFileSync(
    roomsPath,
    roomsOrig.replace('p1,kitchen,Kuchyně', 'p1,kitchen,Kuchyně PT-FIX'),
  );
  writeFileSync(
    videosPath,
    videosOrig.replace(
      '1,exterior,wistia,0w5cd0e1n2',
      '1,exterior,wistia,ptfix01marker',
    ),
  );
  const heroMut = Buffer.from(heroOrig);
  heroMut[heroMut.length - 1] ^= 0xff;
  writeFileSync(heroPath, heroMut);

  const texts = {
    galleryCsv: await (
      await fetch(`${base}/house-package/gallery.csv`, { cache: 'no-store' })
    ).text(),
    roomsCsv: await (
      await fetch(`${base}/house-package/rooms.csv`, { cache: 'no-store' })
    ).text(),
    videosCsv: await (
      await fetch(`${base}/house-package/videos.csv`, { cache: 'no-store' })
    ).text(),
  };
  const heroHttp = Buffer.from(
    await (
      await fetch(`${base}/house-package/media/hero/hero.webp`, {
        cache: 'no-store',
      })
    ).arrayBuffer(),
  );

  resetBuilderPackageBootstrapForTests();
  bootstrapBuilderPackageRegistriesSyncForTests(texts);
  const registries = getBuilderPackageRegistries();

  results.httpReflectsDisk = {
    galleryHasSwap:
      texts.galleryCsv.includes('1,exterior,02.webp') &&
      texts.galleryCsv.includes('2,exterior,01.webp'),
    roomsHasMarker: texts.roomsCsv.includes('Kuchyně PT-FIX'),
    videosHasMarker: texts.videosCsv.includes('ptfix01marker'),
    heroChanged:
      fp(heroHttp) === fp(readFileSync(heroPath)) &&
      fp(heroHttp) !== fp(heroOrig),
  };
  results.registries = {
    galleryFirst: registries.gallery.entries[0],
    galleryOrderMatchesSwap: registries.gallery.entries[0]?.file === '02.webp',
    rooms: registries.rooms.rooms.map((r) => ({
      id: r.roomId,
      name: r.name,
    })),
    videosFirst: registries.videos.entries[0],
    videoMarker: JSON.stringify(registries.videos.entries).includes(
      'ptfix01marker',
    ),
    hero: registries.hero.entries[0],
    counts: {
      gallery: registries.gallery.entries.length,
      rooms: registries.rooms.rooms.length,
      videos: registries.videos.entries.length,
      hero: registries.hero.entries.length,
    },
  };

  page.removeAllListeners('console');
  const console2: { type: string; text: string }[] = [];
  page.on('console', (msg) =>
    console2.push({ type: msg.type(), text: msg.text() }),
  );
  await page.goto(`${base}/?runtimeEvidence=1`, {
    waitUntil: 'networkidle',
    timeout: 60_000,
  });
  await page.waitForTimeout(2000);
  results.reload = {
    bootstrapError: await page
      .locator('[data-builder-package-bootstrap-error]')
      .count(),
    consoleErrors: console2.filter((c) => c.type === 'error').map((c) => c.text),
    galleryFirst: await page.evaluate(async () =>
      (await (await fetch('/house-package/gallery.csv', { cache: 'no-store' })).text())
        .trim()
        .split('\n')[1],
    ),
    heroSrc: await page.evaluate(
      () =>
        document.querySelector('img[src*="hero.webp"]')?.src ??
        [...document.querySelectorAll('img')].find((i) =>
          i.src.includes('hero'),
        )?.src ??
        null,
    ),
  };

  writeFileSync(galleryPath, galleryOrig);
  writeFileSync(roomsPath, roomsOrig);
  writeFileSync(videosPath, videosOrig);
  writeFileSync(heroPath, heroOrig);
  await browser.close();

  writeFileSync(
    join(outDir, 'validation.json'),
    JSON.stringify({ ...results, viteImportErrors }, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        bootstrapOk: results.bootstrapOk,
        pageErrors: results.pageErrors,
        viteImportErrors,
        networkCsv: results.networkCsv,
        dom: results.dom,
        httpReflectsDisk: results.httpReflectsDisk,
        registries: results.registries,
        reload: results.reload,
        consoleErrors: results.console
          .filter((c) => c.type === 'error')
          .map((c) => c.text),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
