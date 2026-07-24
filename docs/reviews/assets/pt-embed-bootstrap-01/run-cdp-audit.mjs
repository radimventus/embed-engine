/**
 * PT-EMBED-BOOTSTRAP-01 — CDP audit (tolerates blocked main thread).
 * No product code changes. Audit only.
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

function stamp(extra = {}) {
  return { t: Date.now(), ...extra };
}

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await page.context().newCDPSession(page);

page.on("console", (msg) => {
  const row = stamp({ type: msg.type(), text: msg.text() });
  consoleLogs.push(row);
  console.log(`[console.${row.type}] ${row.text}`);
});
page.on("pageerror", (err) => {
  const text = String(err?.stack || err);
  pageErrors.push(stamp({ text }));
  console.log(`[pageerror] ${text}`);
});
page.on("request", (req) => {
  requests.push(
    stamp({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      phase: "request",
    }),
  );
});
page.on("requestfailed", (req) => {
  const row = stamp({
    url: req.url(),
    failure: req.failure()?.errorText ?? null,
    resourceType: req.resourceType(),
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
  if (
    row.status >= 400 ||
    /\.csv|house-package|media\/|embed\.iife|@fs\//.test(row.url)
  ) {
    console.log(`[HTTP ${row.status}] ${row.url}`);
  }
});

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForSelector(selector, { timeout: 25000 });
await page.waitForTimeout(800);

async function captureScreenshot(name) {
  try {
    const { data } = await cdp.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
    });
    fs.writeFileSync(path.join(outDir, name), Buffer.from(data, "base64"));
    console.log(`[screenshot-cdp] ${name}`);
    return true;
  } catch (error) {
    console.log(`[screenshot-cdp-fail] ${name}: ${String(error)}`);
    return false;
  }
}

async function axProbe() {
  try {
    const tree = await Promise.race([
      cdp.send("Accessibility.getFullAXTree"),
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error("ax-timeout-4s")), 4000),
      ),
    ]);
    const names = (tree.nodes || [])
      .map((n) => {
        const name = n.name?.value ?? "";
        const role = n.role?.value ?? "";
        return `${role}:${name}`.slice(0, 120);
      })
      .filter((s) => /client|studio|overlay|dialog|hero|načít|load|Připrav|error|alert/i.test(s));
    return { ok: true, matched: names.slice(0, 40), nodeCount: tree.nodes?.length ?? 0 };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

async function domSnapshotProbe() {
  try {
    const snap = await Promise.race([
      cdp.send("DOMSnapshot.captureSnapshot", {
        computedStyles: [],
        includeDOMRects: false,
        includePaintOrder: false,
      }),
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error("domsnap-timeout-4s")), 4000),
      ),
    ]);
    const strings = snap.strings || [];
    const interesting = strings.filter((s) =>
      /data-embed-overlay|data-client-studio-root|data-embed-root|data-builder-package|data-embed-hero|StudioLoading|bootstrap|Připravuji/i.test(
        s,
      ),
    );
    return {
      ok: true,
      interesting: [...new Set(interesting)].slice(0, 80),
      stringCount: strings.length,
    };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

const beforeDom = await page.evaluate((sel) => {
  const cta = document.querySelector(sel);
  return {
    heroCta: Boolean(cta),
    overlay: Boolean(document.querySelector("[data-embed-overlay]")),
    studioRoot: Boolean(document.querySelector("[data-client-studio-root]")),
    embedRoot: Boolean(document.querySelector("[data-embed-root]")),
    heroHostHtmlLen: document.querySelector("#embed-hero")?.innerHTML?.length ?? null,
    ctaText: cta?.textContent?.trim()?.slice(0, 80) ?? null,
  };
}, selector);
console.log("BEFORE_DOM", beforeDom);
await captureScreenshot(`01-before-${label}.png`);
const beforeAx = await axProbe();
const beforeSnap = await domSnapshotProbe();

// Install long-task + mutation recorder (runs until main thread dies).
await page.evaluate(() => {
  window.__PT_BOOTSTRAP_01 = {
    t0: performance.now(),
    clicks: 0,
    mutations: [],
    longTasks: [],
    marks: [],
  };
  const audit = window.__PT_BOOTSTRAP_01;
  try {
    const po = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        audit.longTasks.push({
          start: e.startTime,
          duration: e.duration,
        });
      }
    });
    po.observe({ type: "longtask", buffered: true });
  } catch {
    // ignore
  }
  const obs = new MutationObserver((records) => {
    for (const r of records) {
      for (const n of r.addedNodes) {
        if (!(n instanceof Element)) continue;
        const attrs = [
          "data-embed-overlay",
          "data-embed-overlay-mount",
          "data-client-studio-root",
          "data-embed-root",
          "data-builder-package-bootstrap-error",
        ]
          .filter((a) => n.hasAttribute(a) || n.querySelector?.(`[${a}]`))
          .join(",");
        if (attrs || n.matches?.("[data-embed-overlay], [data-client-studio-root]")) {
          audit.mutations.push({
            t: performance.now() - audit.t0,
            tag: n.tagName,
            attrs: attrs || "(match)",
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

// Prefer real pointer click; fall back to DOM dispatch if Playwright stalls.
const clickPromise = page
  .click(selector, { force: true, timeout: 2500, noWaitAfter: true })
  .then(() => "playwright-click-ok")
  .catch((e) => `playwright-click-fail:${String(e)}`);

await page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) throw new Error("CTA missing");
  window.__PT_BOOTSTRAP_01.clicks += 1;
  window.__PT_BOOTSTRAP_01.marks.push({
    t: performance.now() - window.__PT_BOOTSTRAP_01.t0,
    step: "pre-dispatch-click",
  });
  el.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, view: window }),
  );
  window.__PT_BOOTSTRAP_01.marks.push({
    t: performance.now() - window.__PT_BOOTSTRAP_01.t0,
    step: "post-dispatch-click-sync-return",
  });
}, selector);

const clickResult = await Promise.race([
  clickPromise,
  new Promise((r) => setTimeout(() => r("playwright-click-race-timeout"), 3000)),
]);
console.log("CLICK", clickResult);

const networkTimeline = [];
for (let i = 0; i < 28; i += 1) {
  await new Promise((r) => setTimeout(r, 250));
  const postReq = requests.slice(reqMark);
  const postRes = responses.slice(resMark);
  const row = {
    i,
    elapsedMs: Date.now() - tClick,
    requestCount: postReq.length,
    responseCount: postRes.length,
    csv: postRes
      .filter((r) => /\.csv(\?|$)/.test(r.url))
      .map((r) => `${r.status} ${r.url}`),
    failed: postRes
      .filter((r) => r.status >= 400)
      .map((r) => `${r.status} ${r.url}`),
    interestingReqs: postReq
      .filter((r) =>
        /\.csv|house-package|media\/|\.js(\?|$)|fonts\.google/.test(r.url),
      )
      .map((r) => r.url)
      .slice(0, 20),
  };
  networkTimeline.push(row);
  if (i % 4 === 0) console.log("NET", row);
}

const mainThread = await Promise.race([
  page.evaluate(() => {
    const audit = window.__PT_BOOTSTRAP_01;
    return {
      status: "responsive",
      audit,
      overlay: Boolean(document.querySelector("[data-embed-overlay]")),
      studioRoot: Boolean(document.querySelector("[data-client-studio-root]")),
      embedRoot: Boolean(document.querySelector("[data-embed-root]")),
      revealPending: Boolean(
        document.querySelector("[data-embed-reveal-pending]"),
      ),
      experienceActive: Boolean(
        document.querySelector("[data-embed-experience-active]"),
      ),
      bootstrapError:
        document.querySelector("[data-builder-package-bootstrap-error]")
          ?.textContent ?? null,
      loadingText:
        document.querySelector("[data-studio-loading]")?.textContent ?? null,
      roomCount: document.querySelectorAll("[data-room-id]").length,
      mountHtmlLen:
        document.querySelector("[data-embed-overlay-mount]")?.innerHTML
          ?.length ?? 0,
      objectId:
        document.querySelector("[data-embed-root]")?.dataset?.objectId ?? null,
    };
  }),
  new Promise((resolve) =>
    setTimeout(
      () => resolve({ status: "blocked-or-slow", waitedMs: 5000 }),
      5000,
    ),
  ),
]);
console.log("MAIN_THREAD", mainThread);

const afterAx = await axProbe();
const afterSnap = await domSnapshotProbe();
await captureScreenshot(`02-after-${label}.png`);

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
  beforeAx,
  beforeSnap,
  clickResult,
  mainThread,
  afterAx,
  afterSnap,
  networkTimeline,
  consoleAll: consoleLogs,
  consoleErrors: consoleLogs.filter((l) => l.type === "error"),
  pageErrors,
  requestFails,
  postClickRequests: postRequests,
  postClickResponses: postResponses,
  csvHits: postResponses.filter((r) => /\.csv(\?|$)/.test(r.url)),
  failedResponses: responses.filter((r) => r.status >= 400),
  firstFailedPostClick: firstFailed,
  runtimeConsole: consoleLogs.filter((l) =>
    /Embed Runtime|Runtime source|room count|Builder|launch|journey\.|fail|Error|bootstrap/i.test(
      l.text,
    ),
  ),
};

fs.writeFileSync(
  path.join(outDir, `audit-${label}.json`),
  JSON.stringify(report, null, 2),
);

console.log(
  "SUMMARY",
  JSON.stringify(
    {
      label,
      beforeDom,
      clickResult,
      mainThreadStatus: mainThread.status,
      overlayInteresting: afterSnap.interesting,
      csvHits: report.csvHits,
      firstFailed,
      consoleErrors: report.consoleErrors,
      pageErrors,
      runtimeConsole: report.runtimeConsole,
      postClickRequestCount: postRequests.length,
      postClickResponseCount: postResponses.length,
    },
    null,
    2,
  ),
);

await browser.close().catch(() => {});
