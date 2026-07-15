import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DOCS = path.join(ROOT, 'docs');
const URL = process.env.CS_URL ?? 'http://127.0.0.1:4173/';
const WIREFRAME = path.join(DOCS, 'client-studio-wireframe-1600.png');

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

const renderPath = path.join(DOCS, 'cs-11-render-1600.png');
await page.screenshot({ path: renderPath, fullPage: true });

const wireB64 = fs.readFileSync(WIREFRAME).toString('base64');
const renderB64 = fs.readFileSync(renderPath).toString('base64');

const analysis = await page.evaluate(
  async ({ wireB64, renderB64, canvasBox }) => {
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

    const mkCtx = (img) => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return { ctx, data: ctx.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
    };

    const W = mkCtx(wire);
    const R = mkCtx(render);

    const isWarmFill = (r, g, b) => {
      return r > 210 && g > 190 && b > 130 && r - b > 25 && g - b > 10;
    };

    const isDarkBlue = (r, g, b) => r < 60 && g < 80 && b > 90 && b < 200;

    const isNearWhite = (r, g, b) => r > 235 && g > 235 && b > 235;

    const rowWarmRatio = (px, w, x0, x1, y) => {
      let warm = 0;
      for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 4;
        if (isWarmFill(px[i], px[i + 1], px[i + 2])) warm++;
      }
      return warm / (x1 - x0);
    };

    const findSidebarEnd = (px, w, h) => {
      for (let x = 0; x < Math.min(120, w); x++) {
        let dark = 0;
        for (let y = 20; y < Math.min(h, 200); y++) {
          const i = (y * w + x) * 4;
          if (isDarkBlue(px[i], px[i + 1], px[i + 2])) dark++;
        }
        if (dark < 5 && x > 20) return x;
      }
      return 48;
    };

    const wireSidebarEnd = findSidebarEnd(W.data, W.w, W.h);
    const wx0 = wireSidebarEnd;
    const wx1 = W.w;

    const findBlockEdge = (px, w, x0, x1, y0, y1, predicate, mode) => {
      if (mode === 'enter') {
        for (let y = y0; y < y1; y++) {
          let hit = 0;
          for (let x = x0; x < x1; x++) {
            const i = (y * w + x) * 4;
            if (predicate(px[i], px[i + 1], px[i + 2])) hit++;
          }
          if (hit / (x1 - x0) > 0.35) return y;
        }
      } else {
        for (let y = y1 - 1; y >= y0; y--) {
          let hit = 0;
          for (let x = x0; x < x1; x++) {
            const i = (y * w + x) * 4;
            if (predicate(px[i], px[i + 1], px[i + 2])) hit++;
          }
          if (hit / (x1 - x0) > 0.35) return y + 1;
        }
      }
      return null;
    };

    const findHeaderEnd = (px, w, x0, x1, y0, y1) => {
      for (let y = y0; y < y1; y++) {
        if (rowWarmRatio(px, w, x0, x1, y) > 0.25) return y;
      }
      return y0 + 72;
    };

    const findHeroEnd = (px, w, x0, x1, yStart, yLimit) => {
      for (let y = yStart; y < yLimit; y++) {
        if (rowWarmRatio(px, w, x0, x1, y) < 0.08) return y;
      }
      return yStart + 400;
    };

    const findNextWhiteBandEnd = (px, w, x0, x1, yStart, yLimit, minHeight = 40) => {
      let bandStart = null;
      for (let y = yStart; y < yLimit; y++) {
        const warm = rowWarmRatio(px, w, x0, x1, y);
        if (warm < 0.05) {
          if (bandStart == null) bandStart = y;
        } else if (bandStart != null && y - bandStart > minHeight) {
          return y;
        }
      }
      return bandStart != null ? bandStart + 80 : yStart + 80;
    };

    const findThinBand = (px, w, x0, x1, yStart, yLimit) => {
      for (let y = yStart; y < yLimit; y++) {
        let white = 0;
        for (let x = x0; x < x1; x++) {
          const i = (y * w + x) * 4;
          if (isNearWhite(px[i], px[i + 1], px[i + 2])) white++;
        }
        if (white / (x1 - x0) > 0.85) {
          for (let y2 = y; y2 < Math.min(y + 120, yLimit); y2++) {
            let w2 = 0;
            for (let x = x0; x < x1; x++) {
              const i = (y2 * w + x) * 4;
              if (isNearWhite(px[i], px[i + 1], px[i + 2])) w2++;
            }
            if (w2 / (x1 - x0) < 0.7) return y2;
          }
        }
      }
      return yStart + 80;
    };

    const findLargeSectionEnd = (px, w, x0, x1, yStart, yLimit) => {
      let inContent = false;
      for (let y = yStart; y < yLimit; y++) {
        const warm = rowWarmRatio(px, w, x0, x1, y);
        if (warm > 0.05 || !inContent) inContent = warm > 0.05 || inContent;
        if (inContent && warm < 0.02) {
          let blank = 0;
          for (let y2 = y; y2 < Math.min(y + 40, yLimit); y2++) {
            if (rowWarmRatio(px, w, x0, x1, y2) < 0.02) blank++;
          }
          if (blank > 30) return y;
        }
      }
      return yLimit;
    };

    const measureWire = () => {
      const headerEnd = findHeaderEnd(W.data, W.w, wx0, wx1, 0, 120);
      const heroEnd = findHeroEnd(W.data, W.w, wx0, wx1, headerEnd, headerEnd + 800);
      const heroContentEnd = findNextWhiteBandEnd(W.data, W.w, wx0, wx1, heroEnd, heroEnd + 300, 60);
      const socialEnd = findThinBand(W.data, W.w, wx0, wx1, heroContentEnd, heroContentEnd + 120);
      const explorerEnd = findLargeSectionEnd(W.data, W.w, wx0, wx1, socialEnd, W.h);
      const priorityStart = explorerEnd;
      return {
        headerEnd,
        heroEnd,
        heroContentEnd,
        socialEnd,
        explorerEnd,
        priorityStart,
      };
    };

    const measureRender = () => {
      const rx0 = cx;
      const rx1 = cx + cw;
      const headerEnd =
        findHeaderEnd(R.data, R.w, rx0, rx1, cy, cy + 120) - cy;
      const heroEnd =
        findHeroEnd(R.data, R.w, rx0, rx1, cy + headerEnd, cy + headerEnd + 800) - cy;
      const heroContentEnd =
        findNextWhiteBandEnd(R.data, R.w, rx0, rx1, cy + heroEnd, cy + heroEnd + 300, 60) - cy;
      const socialEnd =
        findThinBand(R.data, R.w, rx0, rx1, cy + heroContentEnd, cy + heroContentEnd + 120) - cy;
      const explorerEnd =
        findLargeSectionEnd(R.data, R.w, rx0, rx1, cy + socialEnd, cy + socialEnd + 900) - cy;
      const priorityStart = explorerEnd;
      return {
        headerEnd,
        heroEnd,
        heroContentEnd,
        socialEnd,
        explorerEnd,
        priorityStart,
      };
    };

    const wB = measureWire();
    const rB = measureRender();

    const horizontalTable = [
      ['Header end', wB.headerEnd, rB.headerEnd],
      ['Hero image end', wB.heroEnd, rB.heroEnd],
      ['Hero content end', wB.heroContentEnd, rB.heroContentEnd],
      ['Social Proof end', wB.socialEnd, rB.socialEnd],
      ['Property Explorer end', wB.explorerEnd, rB.explorerEnd],
      ['Priority Engine start', wB.priorityStart, rB.priorityStart],
    ].map(([boundary, wy, ry]) => ({
      boundary,
      wireframeY: wy,
      renderY: ry,
      delta: ry - wy,
    }));

    const colWarmRatio = (px, w, h, x, y0, y1) => {
      let warm = 0;
      for (let y = y0; y < y1; y++) {
        const i = (y * w + x) * 4;
        if (isWarmFill(px[i], px[i + 1], px[i + 2])) warm++;
      }
      return warm / (y1 - y0);
    };

    const findVerticalSplits = (px, w, x0, x1, y0, y1) => {
      const splits = [];
      let prev = colWarmRatio(px, w, w, x0, y0, y1);
      for (let x = x0 + 1; x < x1; x++) {
        const cur = colWarmRatio(px, w, w, x, y0, y1);
        if (Math.abs(cur - prev) > 0.18) splits.push({ x, delta: Math.abs(cur - prev) });
        prev = cur;
      }
      return splits.filter((s, i, a) => i === 0 || s.x - a[i - 1].x > 25);
    };

    const peY0 = wB.socialEnd;
    const peY1 = wB.explorerEnd;

    const wireVert = findVerticalSplits(W.data, W.w, wx0, wx1, peY0, peY1);
    const renderVert = findVerticalSplits(R.data, R.w, cx, cx + cw, cy + peY0, cy + peY1);

    const verticalTable = [
      {
        region: 'Property Explorer — gallery / room index split',
        wireframeX: wireVert[0]?.x != null ? wireVert[0].x - wx0 : null,
        renderX: renderVert[0] ? renderVert[0].x - cx : null,
      },
      {
        region: 'Property Explorer — room index / floorplan split',
        wireframeX: wireVert[1]?.x != null ? wireVert[1].x - wx0 : null,
        renderX: renderVert[1] ? renderVert[1].x - cx : null,
      },
      {
        region: 'Property Explorer — floorplan right edge',
        wireframeX: wx1 - wx0,
        renderX: cw,
        delta: 0,
      },
    ].map((row) => ({
      ...row,
      delta:
        row.renderX != null && row.wireframeX != null ? row.renderX - row.wireframeX : row.delta ?? null,
    }));

    const regionMass = (px, w, x0, y0, x1, y1, pred) => {
      let hit = 0;
      const total = (x1 - x0) * (y1 - y0);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * w + x) * 4;
          if (pred(px[i], px[i + 1], px[i + 2])) hit++;
        }
      }
      return { pixels: hit, bbox: { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 }, areaPct: (hit / total) * 100 };
    };

    const canvasArea = cw * ch;
    const massRow = (label, wx0l, wy0, wx1l, wy1, rx0l, ry0, rx1l, ry1, pred) => {
      const wM = regionMass(W.data, W.w, wx0 + wx0l, wy0, wx0 + wx1l, wy1, pred);
      const rM = regionMass(R.data, R.w, cx + rx0l, cy + ry0, cx + rx1l, cy + ry1, pred);
      return {
        label,
        wireframe: { ...wM, canvasPct: (wM.pixels / canvasArea) * 100 },
        render: { ...rM, canvasPct: (rM.pixels / canvasArea) * 100 },
      };
    };

    const masses = [
      massRow(
        'Hero image (warm fill)',
        0,
        wB.headerEnd,
        wx1 - wx0,
        wB.heroEnd,
        0,
        rB.headerEnd,
        cw,
        rB.heroEnd,
        isWarmFill,
      ),
      massRow(
        'Property Explorer (warm fill)',
        0,
        wB.socialEnd,
        wx1 - wx0,
        wB.explorerEnd,
        0,
        rB.socialEnd,
        cw,
        rB.explorerEnd,
        isWarmFill,
      ),
      massRow(
        'Priority cards (warm fill)',
        0,
        wB.explorerEnd,
        Math.floor((wx1 - wx0) * 0.55),
        Math.min(wB.explorerEnd + 180, W.h),
        0,
        rB.explorerEnd,
        Math.floor(cw * 0.55),
        rB.explorerEnd + 180,
        isWarmFill,
      ),
    ];

    const overlay = document.createElement('canvas');
    overlay.width = render.width;
    overlay.height = render.height;
    const octx = overlay.getContext('2d');
    octx.drawImage(render, 0, 0);
    octx.globalAlpha = 0.5;
    octx.drawImage(wire, cx - wx0, cy, wire.width, wire.height);
    octx.globalAlpha = 1;

    const drawH = (y, color, label) => {
      octx.strokeStyle = color;
      octx.lineWidth = 2;
      octx.beginPath();
      octx.moveTo(cx, cy + y);
      octx.lineTo(cx + cw, cy + y);
      octx.stroke();
    };

    for (const row of horizontalTable) {
      drawH(row.wireframeY, '#ff00ff', row.boundary);
      drawH(row.renderY, '#00ffff', row.boundary);
    }

    return {
      canvasBox: { x: cx, y: cy, w: cw, h: ch },
      wireframeAlign: { sidebarEnd: wx0, canvasWidthInWire: wx1 - wx0 },
      wireframeSize: { w: wire.width, h: wire.height },
      renderSize: { w: render.width, h: render.height },
      wireframeCoverage: `Wireframe covers canvas Y 0–${W.h}px (${((W.h / ch) * 100).toFixed(1)}% of full canvas height). FAQ, Audit, Footer are outside wireframe crop.`,
      horizontalTable,
      verticalTable,
      masses,
      overlayDataUrl: overlay.toDataURL('image/png'),
    };
  },
  { wireB64, renderB64, canvasBox },
);

const overlayPath = path.join(DOCS, 'cs-11-overlay.png');
fs.writeFileSync(overlayPath, Buffer.from(analysis.overlayDataUrl.split(',')[1], 'base64'));
delete analysis.overlayDataUrl;

fs.writeFileSync(path.join(DOCS, 'cs-11-pixel-report.json'), JSON.stringify(analysis, null, 2));
console.log(JSON.stringify(analysis, null, 2));

await browser.close();
