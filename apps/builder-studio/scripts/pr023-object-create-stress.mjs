/**
 * PR-023 live validation — create ≥5 objects, switch ≥30×, no freeze/reload.
 */
import playwright from '../../../node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.js';
const { chromium } = playwright;
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BUILDER_URL ?? 'http://127.0.0.1:4177/';
const OUT = join(process.cwd(), 'apps/builder-studio/.pr023-artifacts');
mkdirSync(OUT, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function login(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60_000 });
  const hasSidebar = await page
    .locator('[data-studio-shell="workspace-sidebar"]')
    .count();
  if (hasSidebar > 0) return;

  const email = page.locator('input[type="email"], input[name="email"]').first();
  if (await email.count()) {
    await email.fill('builder@ac.local');
    await page.locator('input[type="password"]').first().fill('demo');
    await page
      .getByRole('button', { name: /přihlásit|login|vstoupit/i })
      .first()
      .click();
    await sleep(1000);
  }

  const builderBtn = page.getByRole('button', { name: /builder/i }).first();
  if (await builderBtn.count()) {
    await builderBtn.click();
    await sleep(1500);
  }

  await page.waitForSelector('[data-studio-shell="workspace-sidebar"]', {
    timeout: 60_000,
  });
}

async function waitNotSwitching(page, label, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const loading = await page.locator('text=Přepínám projekt').count();
    const loading2 = await page.locator('text=Načítám projekt').count();
    if (loading === 0 && loading2 === 0) return;
    await sleep(80);
  }
  throw new Error(`FREEZE at ${label}: loading still visible after ${timeoutMs}ms`);
}

function houseButtons(page) {
  return page.locator(
    '[data-studio-shell="workspace-sidebar"] ul li button',
  );
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PW_CHANNEL || undefined,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  let navigations = 0;
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) navigations += 1;
  });

  const report = {
    projects: 0,
    objectsBefore: 0,
    objectsCreated: 0,
    objectsAfter: 0,
    objectSwitches: 0,
    freeze: null,
    reload: false,
    newTab: false,
    createOk: false,
    switchOk: false,
    pageErrors,
  };

  try {
    const pagesBefore = context.pages().length;
    await login(page);
    await waitNotSwitching(page, 'initial');
    await page.waitForSelector(
      '[data-studio-shell="workspace-sidebar"] ul li button, [data-studio-shell="workspace-sidebar"] button[aria-label="Nový objekt"]',
      { timeout: 30_000 },
    );

    report.projects = await page
      .locator('[data-studio-shell="workspace-sidebar"] select[aria-label="Vybrat projekt"] option')
      .count();

    report.objectsBefore = await houseButtons(page).count();

    for (let i = 1; i <= 5; i += 1) {
      await page.getByRole('button', { name: 'Nový objekt' }).click();
      await page.waitForSelector('.platform-dialog', { timeout: 10_000 });
      const title = await page.locator('.platform-dialog').innerText();
      if (!title.includes('Nový objekt')) {
        throw new Error(`Unexpected dialog content: ${title.slice(0, 80)}`);
      }
      await page
        .locator('.platform-dialog input')
        .nth(0)
        .fill(`PR023 Objekt ${i}`);
      await page
        .locator('.platform-dialog input')
        .nth(1)
        .fill(`pr023-objekt-${i}`);
      await page
        .getByRole('button', { name: /Založit objekt/i })
        .click();
      await waitNotSwitching(page, `create-${i}`);
      const listText = await page
        .locator('[data-studio-shell="workspace-sidebar"]')
        .innerText();
      if (!listText.includes(`PR023 Objekt ${i}`)) {
        throw new Error(`Created object not listed: PR023 Objekt ${i}`);
      }
      report.objectsCreated += 1;
    }

    report.createOk = report.objectsCreated === 5;
    report.objectsAfter = await houseButtons(page).count();

    const buttons = houseButtons(page);
    const count = await buttons.count();
    if (count < 2) {
      throw new Error(`Need ≥2 houses to switch, got ${count}`);
    }

    for (let i = 0; i < 30; i += 1) {
      const idx = i % count;
      await buttons.nth(idx).click();
      await waitNotSwitching(page, `switch-${i + 1}`);
      report.objectSwitches += 1;
    }
    report.switchOk = report.objectSwitches === 30;

    report.reload = navigations > 2;
    report.newTab = context.pages().length > pagesBefore;
    report.freeze = null;

    await page.screenshot({
      path: join(OUT, 'after-create-switch.png'),
      fullPage: true,
    });
  } catch (error) {
    report.freeze = String(error?.message ?? error);
    await page.screenshot({
      path: join(OUT, 'failure.png'),
      fullPage: true,
    }).catch(() => {});
  } finally {
    writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    await browser.close();
    if (
      !report.createOk ||
      !report.switchOk ||
      report.freeze !== null ||
      report.reload ||
      report.newTab
    ) {
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
