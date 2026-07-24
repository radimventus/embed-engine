/**
 * PT-BOOTSTRAP-READY-01 validation — Hero CTA → Runtime → Experience → Reveal
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir =
  "/Users/radimventus/embed-engine/docs/reviews/assets/pt-bootstrap-ready-01";
fs.mkdirSync(outDir, { recursive: true });

const url =
  process.env.AUDIT_URL || "http://127.0.0.1:8765/embed/audit-harness.html";
const selector = process.env.AUDIT_SELECTOR || "[data-embed-hero-cta]";
const label = process.env.AUDIT_LABEL || "harness";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleLogs = [];
const responses = [];

page.on("console", (m) => {
  consoleLogs.push({ type: m.type(), text: m.text() });
  console.log(`[console.${m.type()}] ${m.text().slice(0, 220)}`);
});
page.on("pageerror", (e) => console.log("[pageerror]", e));
page.on("response", (r) => {
  responses.push({ url: r.url(), status: r.status(), t: Date.now() });
  if (/\.csv|house-package/.test(r.url()) || r.status() >= 400) {
    console.log(`[HTTP ${r.status()}] ${r.url()}`);
  }
});

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForSelector(selector, { timeout: 25000 });
await page.screenshot({ path: path.join(outDir, `01-before-${label}.png`) });

const t0 = Date.now();
await page.click(selector, { timeout: 10000 });

let finalState = null;
for (let i = 0; i < 60; i += 1) {
  finalState = await page.evaluate(() => ({
    overlay: Boolean(document.querySelector("[data-embed-overlay]")),
    studio: Boolean(document.querySelector("[data-client-studio-root]")),
    rooms: document.querySelectorAll("[data-room-id]").length,
    experienceActive: Boolean(
      document.querySelector("[data-embed-experience-active]"),
    ),
    revealState:
      document.querySelector("[data-embed-overlay]")?.dataset?.embedRevealState ??
      document.querySelector("[data-embed-overlay-mount]")?.dataset
        ?.embedRevealState ??
      null,
    bootstrapError:
      document.querySelector("[data-builder-package-bootstrap-error]")
        ?.textContent ?? null,
    social: Boolean(document.querySelector("#social-proof")),
    loading: Boolean(document.querySelector("[data-studio-loading]")),
    mountLen:
      document.querySelector("[data-embed-overlay-mount]")?.innerHTML?.length ??
      0,
  }));
  if (
    finalState.bootstrapError ||
    ((finalState.rooms > 0 || finalState.social) &&
      (finalState.experienceActive ||
        finalState.revealState === "active" ||
        finalState.revealState === "degraded"))
  ) {
    break;
  }
  // Also accept Experience rendered even if reveal attr lags briefly
  if (finalState.rooms > 0 && finalState.social && i > 8) {
    break;
  }
  await page.waitForTimeout(250);
}

await page.screenshot({ path: path.join(outDir, `02-after-${label}.png`) });

const csv = responses.filter((r) => /\.csv/.test(r.url));
const runtimeLogs = consoleLogs.filter((l) =>
  /Runtime source|room count|journey\.started|Embed Runtime|error|fail/i.test(
    l.text,
  ),
);

const report = {
  label,
  url,
  elapsedMs: Date.now() - t0,
  finalState,
  csv,
  runtimeLogs,
  consoleErrors: consoleLogs.filter((l) => l.type === "error"),
};

fs.writeFileSync(
  path.join(outDir, `validate-${label}.json`),
  JSON.stringify(report, null, 2),
);
console.log("RESULT", JSON.stringify(report, null, 2));

const pass =
  Boolean(finalState?.overlay) &&
  Boolean(finalState?.studio) &&
  !finalState?.bootstrapError &&
  (finalState.rooms > 0 || finalState.social) &&
  csv.some((c) => c.status === 200) &&
  runtimeLogs.some((l) => /room count/.test(l.text));

await browser.close();
process.exit(pass ? 0 : 1);
