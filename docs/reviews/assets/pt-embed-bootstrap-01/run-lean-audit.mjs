/**
 * PT-EMBED-BOOTSTRAP-01 — lean audit (no CDP AX/snapshot — those can wedge Chrome).
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir =
  process.env.OUT ||
  "/Users/radimventus/embed-engine/docs/reviews/assets/pt-embed-bootstrap-01";
const url = process.env.AUDIT_URL || "http://127.0.0.1:8765/embed/audit-harness.html";
const selector = process.env.AUDIT_SELECTOR || "[data-embed-hero-cta]";
const label = process.env.AUDIT_LABEL || "harness";

fs.mkdirSync(outDir, { recursive: true });

const consoleLogs = [];
const pageErrors = [];
const requestFails = [];
const responses = [];
const requests = [];
const stamp = (extra = {}) => ({ t: Date.now(), ...extra });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on("console", (msg) => {
  const row = stamp({ type: msg.type(), text: msg.text() });
  consoleLogs.push(row);
  console.log(`[console.${row.type}] ${row.text}`);
});
page.on("pageerror", (err) => {
  pageErrors.push(stamp({ text: String(err?.stack || err) }));
  console.log(`[pageerror] ${err}`);
});
page.on("request", (req) => {
  requests.push(
    stamp({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
    }),
  );
});
page.on("requestfailed", (req) => {
  const row = stamp({
    url: req.url(),
    failure: req.failure()?.errorText ?? null,
  });
  requestFails.push(row);
  console.log(`[requestfailed] ${row.failure} ${row.url}`);
});
page.on("response", (res) => {
  const row = stamp({
    url: res.url(),
    status: res.status(),
    resourceType: res.request().resourceType(),
  });
  responses.push(row);
  if (row.status >= 400 || /\.csv|house-package|favicon|robots/.test(row.url)) {
    console.log(`[HTTP ${row.status}] ${row.url}`);
  }
});

console.log("GOTO", url);
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForSelector(selector, { timeout: 25000 });
await page.waitForTimeout(600);

const beforeDom = await page.evaluate((sel) => ({
  heroCta: Boolean(document.querySelector(sel)),
  overlay: Boolean(document.querySelector("[data-embed-overlay]")),
  studioRoot: Boolean(document.querySelector("[data-client-studio-root]")),
  embedRoot: Boolean(document.querySelector("[data-embed-root]")),
  ctaText: document.querySelector(sel)?.textContent?.trim()?.slice(0, 80) ?? null,
}), selector);
console.log("BEFORE_DOM", beforeDom);

try {
  await page.screenshot({
    path: path.join(outDir, `01-before-${label}.png`),
    timeout: 8000,
  });
  console.log("SHOT before ok");
} catch (e) {
  console.log("SHOT before fail", String(e));
}

await page.evaluate(() => {
  window.__PT = { t0: performance.now(), marks: [], mutations: [] };
  const obs = new MutationObserver((records) => {
    for (const r of records) {
      for (const n of r.addedNodes) {
        if (!(n instanceof Element)) continue;
        const hit = [
          "data-embed-overlay",
          "data-embed-overlay-mount",
          "data-client-studio-root",
          "data-embed-root",
          "data-builder-package-bootstrap-error",
        ].some((a) => n.hasAttribute(a));
        if (hit) {
          window.__PT.mutations.push({
            t: performance.now() - window.__PT.t0,
            tag: n.tagName,
            attrs: [...n.attributes].map((a) => a.name).filter((n) => n.startsWith("data-")),
            htmlLen: n.innerHTML?.length ?? 0,
          });
        }
      }
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
});

const tClick = Date.now();
const reqMark = requests.length;
const resMark = responses.length;

// Sync-return probe: does click handler return to the caller?
const dispatchResult = await Promise.race([
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { ok: false, reason: "missing" };
    window.__PT.marks.push({ t: performance.now() - window.__PT.t0, step: "before-click" });
    el.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, view: window }),
    );
    window.__PT.marks.push({ t: performance.now() - window.__PT.t0, step: "after-click-sync" });
    return {
      ok: true,
      marks: window.__PT.marks,
      mutationsSync: window.__PT.mutations.slice(),
      overlayNow: Boolean(document.querySelector("[data-embed-overlay]")),
      studioNow: Boolean(document.querySelector("[data-client-studio-root]")),
      mountHtmlLen:
        document.querySelector("[data-embed-overlay-mount]")?.innerHTML?.length ?? 0,
    };
  }, selector),
  new Promise((resolve) =>
    setTimeout(
      () => resolve({ ok: false, reason: "dispatch-evaluate-blocked-8s" }),
      8000,
    ),
  ),
]);
console.log("DISPATCH", JSON.stringify(dispatchResult, null, 2));

const networkTimeline = [];
for (let i = 0; i < 24; i += 1) {
  await new Promise((r) => setTimeout(r, 250));
  const postReq = requests.slice(reqMark);
  const postRes = responses.slice(resMark);
  const row = {
    i,
    elapsedMs: Date.now() - tClick,
    requestCount: postReq.length,
    responseCount: postRes.length,
    csv: postRes.filter((r) => /\.csv/.test(r.url)).map((r) => `${r.status} ${r.url}`),
    failed: postRes.filter((r) => r.status >= 400).map((r) => `${r.status} ${r.url}`),
    urls: postReq.map((r) => r.url).slice(0, 30),
  };
  networkTimeline.push(row);
  if (i === 0 || i === 3 || i === 11 || i === 23) console.log("NET", row);
}

const mainThread = await Promise.race([
  page.evaluate(() => ({
    status: "responsive",
    marks: window.__PT?.marks ?? null,
    mutations: window.__PT?.mutations ?? null,
    overlay: Boolean(document.querySelector("[data-embed-overlay]")),
    studioRoot: Boolean(document.querySelector("[data-client-studio-root]")),
    embedRoot: Boolean(document.querySelector("[data-embed-root]")),
    bootstrapError:
      document.querySelector("[data-builder-package-bootstrap-error]")
        ?.textContent ?? null,
    loading:
      document.querySelector("[data-studio-loading]")?.textContent ?? null,
    roomCount: document.querySelectorAll("[data-room-id]").length,
    mountHtmlLen:
      document.querySelector("[data-embed-overlay-mount]")?.innerHTML?.length ?? 0,
    objectId:
      document.querySelector("[data-embed-root]")?.dataset?.objectId ?? null,
  })),
  new Promise((resolve) =>
    setTimeout(() => resolve({ status: "blocked-or-slow", waitedMs: 5000 }), 5000),
  ),
]);
console.log("MAIN_THREAD", mainThread);

try {
  await page.screenshot({
    path: path.join(outDir, `02-after-${label}.png`),
    timeout: 5000,
  });
  console.log("SHOT after ok");
} catch (e) {
  console.log("SHOT after fail", String(e));
}

const postResponses = responses.filter((r) => r.t >= tClick);
const postRequests = requests.filter((r) => r.t >= tClick);
const firstFailed =
  postResponses.find((r) => r.status >= 400) ||
  requestFails.find((r) => r.t >= tClick) ||
  null;

const report = {
  label,
  url,
  selector,
  beforeDom,
  dispatchResult,
  mainThread,
  networkTimeline,
  consoleAll: consoleLogs,
  consoleErrors: consoleLogs.filter((l) => l.type === "error"),
  pageErrors,
  requestFails,
  failedResponses: responses.filter((r) => r.status >= 400),
  postClickRequests: postRequests,
  postClickResponses: postResponses,
  csvHits: postResponses.filter((r) => /\.csv/.test(r.url)),
  firstFailedPostClick: firstFailed,
  runtimeConsole: consoleLogs.filter((l) =>
    /Embed Runtime|Runtime source|room count|Builder|launch|journey\.|fail|Error|bootstrap/i.test(
      l.text,
    ),
  ),
};

fs.writeFileSync(path.join(outDir, `audit-${label}.json`), JSON.stringify(report, null, 2));
console.log(
  "SUMMARY",
  JSON.stringify(
    {
      label,
      beforeDom,
      dispatchOk: dispatchResult.ok,
      dispatchReason: dispatchResult.reason ?? null,
      overlayAtDispatch: dispatchResult.overlayNow ?? null,
      studioAtDispatch: dispatchResult.studioNow ?? null,
      mountHtmlLenAtDispatch: dispatchResult.mountHtmlLen ?? null,
      mainThreadStatus: mainThread.status,
      csvHits: report.csvHits.length,
      postClickRequests: postRequests.length,
      firstFailed,
      consoleErrors: report.consoleErrors,
      pageErrors,
      runtimeConsole: report.runtimeConsole,
    },
    null,
    2,
  ),
);

await browser.close().catch(() => {});
