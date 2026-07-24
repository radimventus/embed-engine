import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir =
  process.env.OUT ||
  "/Users/radimventus/embed-engine/docs/reviews/assets/pt-embed-bootstrap-01";
const url =
  process.env.AUDIT_URL ||
  "http://127.0.0.1:8765/embed/audit-harness.html";

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleLogs = [];
const pageErrors = [];
const requestFails = [];
const responses = [];

page.on("console", (msg) => {
  consoleLogs.push({ type: msg.type(), text: msg.text(), t: Date.now() });
  console.log(`[console.${msg.type()}] ${msg.text()}`);
});
page.on("pageerror", (err) => {
  pageErrors.push(String(err));
  console.log(`[pageerror] ${err}`);
});
page.on("requestfailed", (req) => {
  requestFails.push({
    url: req.url(),
    failure: req.failure() ? req.failure().errorText : null,
    t: Date.now(),
  });
  console.log(`[requestfailed] ${req.url()}`);
});
page.on("response", (res) => {
  const row = { url: res.url(), status: res.status(), t: Date.now() };
  responses.push(row);
  if (
    row.status >= 400 ||
    /house-package|\.csv|embed\.iife|media\//.test(row.url)
  ) {
    console.log(`[HTTP ${row.status}] ${row.url}`);
  }
});

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForSelector("[data-embed-hero-cta]", { timeout: 20000 });
await page.waitForTimeout(500);

const before = await page.evaluate(() => ({
  heroCta: Boolean(document.querySelector("[data-embed-hero-cta]")),
  overlay: Boolean(document.querySelector("[data-embed-overlay]")),
  studioRoot: Boolean(document.querySelector("[data-client-studio-root]")),
}));
console.log("BEFORE", before);

const tClick = Date.now();
const respMark = responses.length;

// Fire-and-forget click; do not await Playwright action completion.
page
  .click("[data-embed-hero-cta]", { force: true, timeout: 2000, noWaitAfter: true })
  .then(() => console.log("playwright click resolved"))
  .catch((error) => console.log("playwright click error/timeout:", String(error)));

// Observe without depending on page main-thread evaluates initially.
const networkTimeline = [];
for (let i = 0; i < 24; i += 1) {
  await new Promise((r) => setTimeout(r, 250));
  const newest = responses.slice(respMark);
  networkTimeline.push({
    i,
    elapsedMs: Date.now() - tClick,
    responseCount: newest.length,
    csv: newest.filter((r) => /\.csv(\?|$)/.test(r.url)).map((r) => `${r.status} ${r.url}`),
    failed: newest.filter((r) => r.status >= 400).map((r) => `${r.status} ${r.url}`),
  });
  console.log("NET", networkTimeline[networkTimeline.length - 1]);
}

// Probe main thread: evaluate with timeout.
let mainThread = { status: "unknown" };
try {
  mainThread = await Promise.race([
    page.evaluate(() => {
      const mount = document.querySelector("[data-embed-overlay-mount]");
      return {
        status: "responsive",
        overlay: Boolean(document.querySelector("[data-embed-overlay]")),
        studioRoot: Boolean(document.querySelector("[data-client-studio-root]")),
        embedRoot: Boolean(document.querySelector("[data-embed-root]")),
        bootstrapError:
          document.querySelector("[data-builder-package-bootstrap-error]")
            ?.textContent ?? null,
        roomCount: document.querySelectorAll("[data-room-id]").length,
        mountLen: mount ? mount.innerHTML.length : 0,
        objectId:
          document.querySelector("[data-embed-root]")?.dataset?.objectId ?? null,
        bodyHasOverlayAttr: Boolean(
          document.body.querySelector("[data-embed-overlay]"),
        ),
      };
    }),
    new Promise((resolve) =>
      setTimeout(() => resolve({ status: "blocked-or-slow", waitedMs: 5000 }), 5000),
    ),
  ]);
} catch (error) {
  mainThread = { status: "evaluate-threw", error: String(error) };
}
console.log("MAIN_THREAD", mainThread);

try {
  await page.screenshot({
    path: path.join(outDir, "02-after-cta.png"),
    timeout: 3000,
  });
} catch (error) {
  console.log("screenshot after failed:", String(error));
}

const post = responses.filter((r) => r.t >= tClick);
const report = {
  url,
  before,
  mainThread,
  networkTimeline,
  consoleAll: consoleLogs,
  pageErrors,
  requestFails,
  csvHits: post.filter((r) => /\/(gallery|rooms|videos)\.csv/.test(r.url)),
  failedResponses: responses.filter((r) => r.status >= 400),
  postClickResponses: post,
};

fs.writeFileSync(path.join(outDir, "audit.json"), JSON.stringify(report, null, 2));
console.log("SUMMARY", JSON.stringify({
  pageErrors,
  consoleErrors: consoleLogs.filter((l) => l.type === "error").map((l) => l.text),
  runtimeLike: consoleLogs
    .filter((l) => /Embed Runtime|Runtime|room|Builder|launch|fail|Error/i.test(l.text))
    .map((l) => l.text),
  csvHits: report.csvHits,
  failedResponses: report.failedResponses,
  requestFails,
  mainThread,
}, null, 2));

await browser.close().catch(() => {});
