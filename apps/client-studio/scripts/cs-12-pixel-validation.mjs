import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DOCS = path.join(ROOT, 'docs');
const WIREFRAME = path.join(DOCS, 'client-studio-wireframe-full.png');
const URL = process.env.CS_URL ?? 'http://127.0.0.1:4173/';

const WF = { left: 21, width: 536, height: 1024 };

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(URL, { waitUntil: 'networkidle' });
await page.evaluate(() => window.scrollTo(0, 0));

const canvasBox = await page.evaluate(() => {
  const c = document.querySelector('[data-desktop-canvas]');
  let x = 0;
  let y = 0;
  let node = c;
  while (node) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return { x, y, w: c.offsetWidth, h: c.offsetHeight };
});

const renderPath = path.join(DOCS, 'cs-12-render-1600.png');
await page.screenshot({ path: renderPath, fullPage: true });

const wireB64 = fs.readFileSync(WIREFRAME).toString('base64');
const renderB64 = fs.readFileSync(renderPath).toString('base64');

const analysis = await page.evaluate(
  async ({ wireB64, renderB64, canvasBox, WF }) => {
    const load = (b64) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = `data:image/png;base64,${b64}`;
      });

    const wire = await load(wireB64);
    const render = await load(renderB64);

    const cx = Math.round(canvasBox.x);
    const cy = Math.round(canvasBox.y);
    const cw = Math.round(canvasBox.w);
    const ch = Math.round(canvasBox.h);

    const mk = (img) => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return {
        data: ctx.getImageData(0, 0, c.width, c.height).data,
        w: c.width,
        h: img.height,
      };
    };
    const W = mk(wire);
    const R = mk(render);

    const wx0 = WF.left;
    const wx1 = WF.left + WF.width;
    const scale = cw / WF.width;

    const isWarm = (r, g, b) => r > 198 && g > 178 && b > 115 && r - b > 12;
    const isDarkBlue = (r, g, b) => r < 75 && g < 95 && b > 85 && b < 210;
    const isGold = (r, g, b) => r > 170 && g > 130 && b < 80;

    const rowMean = (px, w, x0, x1, y) => {
      let s = 0;
      let n = 0;
      for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 4;
        s += px[i] + px[i + 1] + px[i + 2];
        n++;
      }
      return s / (3 * n);
    };

    const rowWarm = (px, w, x0, x1, y) => {
      let c = 0;
      for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 4;
        if (isWarm(px[i], px[i + 1], px[i + 2])) c++;
      }
      return c / (x1 - x0);
    };

    const rowBlue = (px, w, x0, x1, y) => {
      let c = 0;
      for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 4;
        if (isDarkBlue(px[i], px[i + 1], px[i + 2])) c++;
      }
      return c / (x1 - x0);
    };

    const findHeroStart = () => {
      for (let y = 0; y < 120; y++) if (rowWarm(W.data, W.w, wx0, wx1, y) > 0.2) return y;
      return 32;
    };

    const findHeroEnd = (y0) => {
      for (let y = y0; y < y0 + 400; y++) if (rowWarm(W.data, W.w, wx0, wx1, y) < 0.08) return y;
      return y0 + 220;
    };

    const findBandEnd = (px, w, x0, x1, y0, maxH, test) => {
      for (let y = y0; y < y0 + maxH; y++) if (test(px, w, x0, x1, y)) return y;
      return y0 + maxH;
    };

    const wHeroStart = findHeroStart();
    const wHeroEnd = findHeroEnd(wHeroStart);
    const wHeroContentEnd = findBandEnd(
      W.data,
      W.w,
      wx0,
      wx1,
      wHeroEnd,
      120,
      (px, w, x0, x1, y) => rowWarm(px, w, x0, x1, y) < 0.03 && rowMean(px, w, x0, x1, y) > 240,
    );
    const wSocialEnd = findBandEnd(
      W.data,
      W.w,
      wx0,
      wx1,
      wHeroContentEnd,
      80,
      (px, w, x0, x1, y) => rowWarm(px, w, x0, x1, y) > 0.12,
    );
    const wPEEnd = findBandEnd(
      W.data,
      W.w,
      wx0,
      wx1,
      wSocialEnd,
      250,
      (px, w, x0, x1, y) => rowWarm(px, w, x0, x1, y) < 0.04 && y > wSocialEnd + 80,
    );
    const wPriorityEnd = findBandEnd(
      W.data,
      W.w,
      wx0,
      wx1,
      wPEEnd,
      200,
      (px, w, x0, x1, y) => rowBlue(px, w, x0, x1, y) < 0.05 && rowWarm(px, w, x0, x1, y) < 0.05,
    );
    const wFaqEnd = findBandEnd(
      W.data,
      W.w,
      wx0,
      wx1,
      wPriorityEnd,
      220,
      (px, w, x0, x1, y) => rowBlue(px, w, x0, x1, y) > 0.35,
    );
    const wAuditEnd = findBandEnd(
      W.data,
      W.w,
      wx0,
      wx1,
      wFaqEnd,
      250,
      (px, w, x0, x1, y) => rowBlue(px, w, x0, x1, y) < 0.1,
    );
    const wFooterEnd = WF.height;

    const wireBounds = {
      headerEnd: wHeroStart,
      heroEnd: wHeroEnd,
      heroContentEnd: wHeroContentEnd,
      socialEnd: wSocialEnd,
      peEnd: wPEEnd,
      priorityEnd: wPriorityEnd,
      faqEnd: wFaqEnd,
      auditEnd: wAuditEnd,
      footerEnd: wFooterEnd,
    };

    const mapWire = (y) => Math.round(y * scale);

    const rHeroStart = (() => {
      for (let y = cy; y < cy + 120; y++) if (rowMean(R.data, R.w, cx, cx + cw, y) < 252) return y - cy;
      return 72;
    })();

    const rHeroEnd = (() => {
      for (let y = cy + rHeroStart; y < cy + 900; y++)
        if (rowMean(R.data, R.w, cx, cx + cw, y) > 253 && rowMean(R.data, R.w, cx, cx + cw, y + 3) > 253)
          return y - cy;
      return 712;
    })();

    const findRenderEdge = (approx, scan = 80) => {
      let best = approx;
      let bd = 1e9;
      for (let y = cy + approx - scan; y < cy + approx + scan; y++) {
        const d = Math.abs(rowMean(R.data, R.w, cx, cx + cw, y) - rowMean(R.data, R.w, cx, cx + cw, y - 1));
        if (d > 8 && Math.abs(y - cy - approx) < bd) {
          bd = Math.abs(y - cy - approx);
          best = y - cy;
        }
      }
      return best;
    };

    const renderBounds = {
      headerEnd: rHeroStart,
      heroEnd: findRenderEdge(712, 60),
      heroContentEnd: findRenderEdge(875, 60),
      socialEnd: findRenderEdge(956, 60),
      peEnd: findRenderEdge(1748, 120),
      priorityEnd: findRenderEdge(2100, 120),
      faqEnd: findRenderEdge(2763, 120),
      auditEnd: findRenderEdge(3200, 120),
      footerEnd: ch,
    };

    const horizontalTable = [
      ['Header end', 'headerEnd'],
      ['Hero image end', 'heroEnd'],
      ['Hero content end', 'heroContentEnd'],
      ['Social Proof end', 'socialEnd'],
      ['Property Explorer end', 'peEnd'],
      ['Priority Engine end', 'priorityEnd'],
      ['FAQ + AI end', 'faqEnd'],
      ['Audit end', 'auditEnd'],
      ['Footer end', 'footerEnd'],
    ].map(([name, key]) => {
      const wy = wireBounds[key];
      const ry = renderBounds[key];
      const wCanvas = mapWire(wy);
      return {
        boundary: name,
        wireframeRawY: wy,
        wireframeCanvasY: wCanvas,
        renderCanvasY: ry,
        delta: ry - wCanvas,
        wireSectionH:
          key === 'headerEnd'
            ? wy
            : wy -
              wireBounds[
                {
                  heroEnd: 'headerEnd',
                  heroContentEnd: 'heroEnd',
                  socialEnd: 'heroContentEnd',
                  peEnd: 'socialEnd',
                  priorityEnd: 'peEnd',
                  faqEnd: 'priorityEnd',
                  auditEnd: 'faqEnd',
                  footerEnd: 'auditEnd',
                }[key]
              ],
      };
    });

    const yellowBlocks = (px, w, x0, x1, y0, y1) => {
      const blocks = [];
      let s = null;
      for (let x = x0; x < x1; x++) {
        let hit = 0;
        for (let y = y0; y < y1; y++) {
          const i = (y * w + x) * 4;
          if (isWarm(px[i], px[i + 1], px[i + 2])) hit++;
        }
        if (hit / (y1 - y0) > 0.12) {
          if (s == null) s = x;
        } else if (s != null) {
          blocks.push({ x0: s - x0, w: x - s });
          s = null;
        }
      }
      if (s != null) blocks.push({ x0: s - x0, w: x1 - s });
      return blocks;
    };

    const wPE = yellowBlocks(W.data, W.w, wx0, wx1, wSocialEnd, wPEEnd).map((b) => ({
      x0: Math.round(b.x0 * scale),
      w: Math.round(b.w * scale),
      pct: (b.w / WF.width) * 100,
    }));

    const colSplit = (px, w, x0, x1, y0, y1) => {
      const edges = [];
      let prev = rowMean(px, w, x0, x1, y0);
      for (let x = x0 + 1; x < x1; x++) {
        let m = 0;
        for (let y = y0; y < y1; y++) {
          const i = (y * w + x) * 4;
          m += px[i] + px[i + 1] + px[i + 2];
        }
        m /= (y1 - y0) * 3;
        if (Math.abs(m - prev) > 18) edges.push({ x: x - x0, d: Math.abs(m - prev) });
        prev = m;
      }
      return edges.filter((e, i, a) => i === 0 || e.x - a[i - 1].x > 30);
    };

    const verticalTable = [
      {
        region: 'Property Explorer — column splits',
        wireframe: colSplit(W.data, W.w, wx0, wx1, wSocialEnd, wPEEnd).map((e) => ({
          x: Math.round(e.x * scale),
          pct: ((e.x * scale) / cw) * 100,
        })),
        render: colSplit(R.data, R.w, cx, cx + cw, cy + renderBounds.socialEnd, cy + renderBounds.peEnd).map(
          (e) => ({ x: e.x, pct: (e.x / cw) * 100 }),
        ),
      },
      {
        region: 'FAQ + AI — center split',
        wireframe: [{ x: Math.round((WF.width / 2) * scale), pct: 50 }],
        render: colSplit(R.data, R.w, cx, cx + cw, cy + renderBounds.priorityEnd, cy + renderBounds.faqEnd).slice(
          0,
          1,
        ).map((e) => ({ x: e.x, pct: (e.x / cw) * 100 })),
      },
    ];

    const mass = (px, w, x0, y0, x1, y1, pred) => {
      let n = 0;
      const t = (x1 - x0) * (y1 - y0);
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++) {
          const i = (y * w + x) * 4;
          if (pred(px[i], px[i + 1], px[i + 2])) n++;
        }
      return { pixels: n, area: t, pct: (n / t) * 100, canvasPct: (n / (cw * ch)) * 100 };
    };

    const masses = [
      {
        label: 'Hero image band',
        wire: mass(W.data, W.w, wx0, wHeroStart, wx1, wHeroEnd, isWarm),
        render: mass(R.data, R.w, cx, cy + renderBounds.headerEnd, cx + cw, cy + renderBounds.heroEnd, (r, g, b) => rowMean(R.data, R.w, cx, cx + cw, cy + renderBounds.headerEnd) < 254 || isWarm(r, g, b)),
      },
      {
        label: 'Property Explorer warm placeholders',
        wire: mass(W.data, W.w, wx0, wSocialEnd, wx1, wPEEnd, isWarm),
        render: mass(R.data, R.w, cx, cy + renderBounds.socialEnd, cx + cw, cy + renderBounds.peEnd, isWarm),
      },
      {
        label: 'Audit dark-blue block',
        wire: mass(W.data, W.w, wx0, wFaqEnd, wx1, wAuditEnd, isDarkBlue),
        render: mass(R.data, R.w, cx, cy + renderBounds.faqEnd, cx + cw, cy + renderBounds.auditEnd, isDarkBlue),
      },
      {
        label: 'Gold CTA accents (Audit)',
        wire: mass(W.data, W.w, wx0, wFaqEnd, wx1, wAuditEnd, isGold),
        render: mass(R.data, R.w, cx, cy + renderBounds.faqEnd, cx + cw, cy + renderBounds.auditEnd, isGold),
      },
    ];

    const scaledWireH = WF.height * scale;
    const whitespace = {
      wireframeScaledTotalH: scaledWireH,
      renderCanvasH: ch,
      canvasHeightDelta: ch - scaledWireH,
      heroBandDelta:
        renderBounds.heroEnd - renderBounds.headerEnd - (mapWire(wHeroEnd) - mapWire(wHeroStart)),
      cumulativeFooterDelta: renderBounds.footerEnd - mapWire(wFooterEnd),
    };

    const overlay = document.createElement('canvas');
    overlay.width = render.width;
    overlay.height = render.height;
    const o = overlay.getContext('2d');
    o.drawImage(render, 0, 0);

    const crop = document.createElement('canvas');
    crop.width = WF.width;
    crop.height = WF.height;
    crop.getContext('2d').drawImage(wire, wx0, 0, WF.width, WF.height, 0, 0, WF.width, WF.height);

    o.globalAlpha = 0.5;
    o.drawImage(crop, cx, cy, cw, scaledWireH);
    o.globalAlpha = 1;

    for (const row of horizontalTable) {
      o.strokeStyle = '#ff00ff';
      o.lineWidth = 2;
      o.beginPath();
      o.moveTo(cx, cy + row.wireframeCanvasY);
      o.lineTo(cx + cw, cy + row.wireframeCanvasY);
      o.stroke();
      o.strokeStyle = '#00ffff';
      o.beginPath();
      o.moveTo(cx, cy + row.renderCanvasY);
      o.lineTo(cx + cw, cy + row.renderCanvasY);
      o.stroke();
    }

    return {
      canvasBox: { x: cx, y: cy, w: cw, h: ch },
      wireframeSource: { filePx: `${W.w}x${WF.height}`, canvasCrop: WF, logicalCanvasH: 2048 },
      alignment: {
        uniformScale: scale,
        scaledWireframeHeight: scaledWireH,
        topLeft: { x: cx, y: cy },
        note: 'Single uniform scale from wireframe canvas width → render canvas width. No per-section rescale.',
      },
      wireBoundsRaw: wireBounds,
      renderBoundsRaw: renderBounds,
      horizontalTable,
      verticalTable,
      propertyExplorerColumns: { wireframe: wPE },
      masses,
      whitespace,
      overlayDataUrl: overlay.toDataURL('image/png'),
    };
  },
  { wireB64, renderB64, canvasBox, WF },
);

const overlayPath = path.join(DOCS, 'cs-12-overlay-full.png');
fs.writeFileSync(overlayPath, Buffer.from(analysis.overlayDataUrl.split(',')[1], 'base64'));
delete analysis.overlayDataUrl;

const report = {
  sprint: 'CS-12',
  capturedAt: new Date().toISOString(),
  invalidates: 'CS-11 — used cropped wireframe (1024×1022, 29% canvas); conclusions about FAQ/Audit/Footer and cumulative drift beyond Y=1022 were unreliable',
  ...analysis,
  assets: {
    wireframe: WIREFRAME,
    render: renderPath,
    overlay: overlayPath,
  },
};

fs.writeFileSync(path.join(DOCS, 'cs-12-pixel-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

await browser.close();
