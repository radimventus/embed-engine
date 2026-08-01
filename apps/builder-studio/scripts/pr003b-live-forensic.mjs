/**
 * PR-003B live forensic validation against Builder on :4177
 */
import playwright from '../../../node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.js';
const { chromium } = playwright;
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BUILDER_URL ?? 'http://127.0.0.1:4177/';
const OUT = join(process.cwd(), 'apps/builder-studio/.pr003b-artifacts');
mkdirSync(OUT, { recursive: true });

const BROWSER_PATH =
  process.env.PLAYWRIGHT_CHROMIUM ??
  join(
    process.cwd(),
    '.playwright-browsers/chromium-1148/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
  );

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function login(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60_000 });
  // Already in studio?
  const hasSidebar = await page.locator('[data-studio-shell="workspace-sidebar"]').count();
  if (hasSidebar > 0) return;

  // Landing → Builder or login form
  const email = page.locator('input[type="email"], input[name="email"]').first();
  if (await email.count()) {
    await email.fill('builder@ac.local');
    await page.locator('input[type="password"]').first().fill('demo');
    await page.getByRole('button', { name: /přihlásit|login|vstoupit/i }).first().click();
    await page.waitForTimeout(1000);
  }

  // Pick Builder studio if on landing
  const builderBtn = page.getByRole('button', { name: /builder/i }).first();
  if (await builderBtn.count()) {
    await builderBtn.click();
    await page.waitForTimeout(1500);
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
    await sleep(100);
  }
  throw new Error(`FREEZE at ${label}: loading still visible after ${timeoutMs}ms`);
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PW_CHANNEL || undefined,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  const report = {
    dialog: null,
    create: null,
    projectSwitches: 0,
    houseSwitches: 0,
    freeze: null,
    errors: [],
  };

  try {
    await login(page);
    await waitNotSwitching(page, 'initial');

    // --- PR-006 dialog forensic ---
    await page.getByRole('button', { name: 'Nový projekt' }).click();
    await page.waitForSelector('.platform-dialog', { timeout: 10_000 });
    await page.screenshot({
      path: join(OUT, 'dialog-open.png'),
      fullPage: true,
    });

    const dialogMetrics = await page.evaluate(() => {
      const dialog = document.querySelector('.platform-dialog');
      const backdrop = document.querySelector('.platform-dialog-backdrop');
      const body = document.querySelector('.platform-dialog__body');
      const actions = document.querySelector('.platform-dialog__actions');
      const inputs = [...document.querySelectorAll('.platform-dialog input, .platform-dialog textarea, .platform-dialog select')];
      if (!dialog) return { ok: false, reason: 'no dialog' };
      const dr = dialog.getBoundingClientRect();
      const ar = actions?.getBoundingClientRect();
      const style = getComputedStyle(dialog);
      const bg = style.backgroundColor;
      const opaque =
        bg.startsWith('rgb(') && !bg.startsWith('rgba(0, 0, 0, 0)') && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
      const overlaps = inputs.map((el) => {
        const r = el.getBoundingClientRect();
        const coveredByActions =
          ar !== undefined &&
          r.bottom > ar.top + 2 &&
          r.top < ar.bottom - 2 &&
          r.right > ar.left &&
          r.left < ar.right;
        return {
          tag: el.tagName,
          top: r.top,
          bottom: r.bottom,
          visible: r.height > 0 && r.width > 0,
          coveredByActions,
        };
      });
      return {
        ok: true,
        dialog: {
          height: dr.height,
          width: dr.width,
          overflowY: style.overflowY,
          maxHeight: style.maxHeight,
          padding: style.padding,
          display: style.display,
          backgroundColor: bg,
          opaque,
          inBody: dialog.parentElement === document.body || backdrop?.parentElement === document.body,
        },
        bodyOverflow: body ? getComputedStyle(body).overflowY : null,
        inputCount: inputs.length,
        overlaps,
        anyCovered: overlaps.some((o) => o.coveredByActions),
        anyInvisible: overlaps.some((o) => !o.visible),
      };
    });
    report.dialog = dialogMetrics;
    writeFileSync(join(OUT, 'dialog-metrics.json'), JSON.stringify(dialogMetrics, null, 2));

    if (
      !dialogMetrics.ok ||
      dialogMetrics.anyCovered ||
      dialogMetrics.anyInvisible ||
      dialogMetrics.dialog?.opaque !== true
    ) {
      report.create = 'FAIL_DIALOG_LAYOUT';
      throw new Error(`Dialog layout broken: ${JSON.stringify(dialogMetrics)}`);
    }

    const projectName = `PR003B ${Date.now()}`;
    await page.locator('.platform-dialog input').first().fill(projectName);
    await page.getByRole('button', { name: /Založit projekt/i }).click();
    await waitNotSwitching(page, 'after-create', 60_000);

    const inSelect = await page.evaluate((name) => {
      const select = document.querySelector('[data-studio-shell="workspace-sidebar"] select');
      if (!select) return false;
      return [...select.options].some((o) => o.textContent?.includes(name));
    }, projectName);
    report.create = inSelect ? 'PASS' : 'FAIL_NOT_IN_SELECT';
    if (!inSelect) {
      await page.screenshot({ path: join(OUT, 'create-fail.png'), fullPage: true });
      throw new Error('Created project not in selectbox');
    }

    // Close dialog if still open
    if (await page.locator('.platform-dialog').count()) {
      await page.getByRole('button', { name: 'Zavřít' }).click().catch(() => {});
    }

    const folderSelect = page.locator('[data-studio-shell="workspace-sidebar"] select');
    const folderIds = await folderSelect.evaluate((el) =>
      [...el.options].map((o) => o.value).filter(Boolean),
    );
    if (folderIds.length < 3) {
      throw new Error(`Expected ≥3 projects, got ${folderIds.length}`);
    }

    // 50 project switches
    for (let i = 0; i < 50; i += 1) {
      const id = folderIds[i % folderIds.length];
      await folderSelect.selectOption(id);
      await waitNotSwitching(page, `project-${i}`, 45_000);
      report.projectSwitches += 1;
    }

    // 50 house switches
    for (let i = 0; i < 50; i += 1) {
      // Ensure we are on a folder with multiple houses periodically
      if (i % 10 === 0) {
        await folderSelect.selectOption(folderIds[0]);
        await waitNotSwitching(page, `project-reset-${i}`, 45_000);
      }
      const buttons = page.locator('[data-studio-shell="workspace-sidebar"] ul button');
      const count = await buttons.count();
      if (count === 0) throw new Error('No houses in list');
      await buttons.nth(i % count).click();
      await waitNotSwitching(page, `house-${i}`, 45_000);
      report.houseSwitches += 1;
    }

    report.freeze = 'none';
  } catch (error) {
    report.freeze = error instanceof Error ? error.message : String(error);
    await page.screenshot({ path: join(OUT, 'failure.png'), fullPage: true }).catch(() => {});
  }

  report.errors = errors.slice(0, 30);
  writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  if (report.freeze && report.freeze !== 'none') process.exit(1);
  if (report.create !== 'PASS') process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
