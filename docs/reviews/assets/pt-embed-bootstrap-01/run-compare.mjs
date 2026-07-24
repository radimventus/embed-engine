import { chromium } from "playwright";
import fs from "fs";

const url = process.env.AUDIT_URL || "http://127.0.0.1:5180/";
const selector = process.env.AUDIT_SELECTOR || "#open-client-studio";
const outDir =
  "/Users/radimventus/embed-engine/docs/reviews/assets/pt-embed-bootstrap-01";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleLogs = [];
const responses = [];
page.on("console", (m) => {
  consoleLogs.push({ type: m.type(), text: m.text() });
  console.log(`[console.${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => console.log(`[pageerror] ${e}`));
page.on("response", (r) => {
  responses.push({ url: r.url(), status: r.status(), t: Date.now() });
  if (r.status() >= 400 || /\.csv|house-package/.test(r.url())) {
    console.log(`[HTTP ${r.status()}] ${r.url()}`);
  }
});

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForSelector(selector, { timeout: 20000 });
await page.waitForTimeout(500);
console.log("BEFORE", await page.evaluate((sel) => ({
  hasSel: Boolean(document.querySelector(sel)),
  overlay: Boolean(document.querySelector("[data-embed-overlay]")),
}), selector));

const t0 = Date.now();
const mark = responses.length;

// Dispatch without Playwright click protocol
await page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) throw new Error("missing selector");
  queueMicrotask(() => {
    el.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, view: window }),
    );
  });
}, selector);

for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 250));
  const slice = responses.slice(mark);
  console.log("NET", {
    i,
    ms: Date.now() - t0,
    n: slice.length,
    csv: slice.filter((x) => /\.csv/.test(x.url)).map((x) => x.status + " " + x.url),
  });
}

const mainThread = await Promise.race([
  page.evaluate(() => ({
    status: "responsive",
    overlay: Boolean(document.querySelector("[data-embed-overlay]")),
    studio: Boolean(document.querySelector("[data-client-studio-root]")),
    rooms: document.querySelectorAll("[data-room-id]").length,
    err:
      document.querySelector("[data-builder-package-bootstrap-error]")
        ?.textContent ?? null,
  })),
  new Promise((resolve) =>
    setTimeout(() => resolve({ status: "blocked-or-slow" }), 4000),
  ),
]);
console.log("MAIN", mainThread);
console.log(
  "ERRORS",
  consoleLogs.filter((l) => l.type === "error").map((l) => l.text),
);
fs.writeFileSync(
  `${outDir}/audit-compare.json`,
  JSON.stringify({ url, selector, mainThread, consoleLogs, responses: responses.slice(mark) }, null, 2),
);
await page.screenshot({ path: `${outDir}/02-after-cta.png`, timeout: 5000 }).catch((e) => console.log("ss", String(e)));
await browser.close();
