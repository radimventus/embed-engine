import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../docs');
const URL = 'http://127.0.0.1:4173/';
const VIEWPORT = { width: 1600, height: 900 };
const WIREFRAME = path.join(DOCS, 'client-studio-wireframe-1600.png');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: VIEWPORT });
await page.goto(URL, { waitUntil: 'networkidle' });
await page.evaluate(() => {
  window.scrollTo(0, 0);
  document.querySelector('main')?.scrollTo(0, 0);
});
await page.waitForTimeout(300);

const data = await page.evaluate(() => {
  const canvas = document.querySelector('[data-desktop-canvas]');
  const header = canvas?.querySelector(':scope > header');
  const children = [...(canvas?.children ?? [])];
  const heroImage = children[1];
  const heroContent = children[2];
  const socialProof = children[3];

  const canvasRect = canvas.getBoundingClientRect();
  const rel = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      offsetTop: Math.round(r.top - canvasRect.top),
      offsetHeight: Math.round(r.height),
      offsetBottom: Math.round(r.bottom - canvasRect.top),
      computedHeight: getComputedStyle(el).height,
    };
  };

  const boundaries = {
    headerEnd: rel(header)?.offsetBottom ?? null,
    heroImageEnd: rel(heroImage)?.offsetBottom ?? null,
    heroContentEnd: rel(heroContent)?.offsetBottom ?? null,
    socialProofEnd: rel(socialProof)?.offsetBottom ?? null,
  };

  return {
    url: location.href,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    canvas: {
      left: Math.round(canvasRect.left),
      top: Math.round(canvasRect.top),
      width: Math.round(canvasRect.width),
      height: Math.round(canvasRect.height),
    },
    sections: {
      header: rel(header),
      heroImage: rel(heroImage),
      heroContent: rel(heroContent),
      socialProof: rel(socialProof),
    },
    boundaries,
  };
});

const renderPng = path.join(DOCS, 'r-01-evidence-render-1600x900.png');
await page.screenshot({ path: renderPng, fullPage: false });

const renderB64 = fs.readFileSync(renderPng).toString('base64');
const wireB64 = fs.readFileSync(WIREFRAME).toString('base64');

const artifacts = await page.evaluate(
  async ({ renderB64, wireB64, data }) => {
    const load = (b64, mime = 'image/png') =>
      new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = `data:${mime};base64,${b64}`;
      });

    const [render, wire] = await Promise.all([
      load(renderB64),
      load(wireB64, 'image/jpeg'),
    ]);

    const dark = (r, g, b) => r < 75 && g < 95 && b > 85;
    const findCanvasBounds = (ctx, w, h) => {
      let left = 0;
      for (let x = 0; x < w; x++) {
        let lightN = 0;
        for (let y = 50; y < 150; y++) {
          const p = ctx.getImageData(x, y, 1, 1).data;
          if (!dark(p[0], p[1], p[2])) lightN++;
        }
        if (lightN > 80) {
          left = x;
          break;
        }
      }
      let right = w - 1;
      for (let x = w - 1; x >= 0; x--) {
        let lightN = 0;
        for (let y = 50; y < 150; y++) {
          const p = ctx.getImageData(x, y, 1, 1).data;
          if (!dark(p[0], p[1], p[2])) lightN++;
        }
        if (lightN > 80) {
          right = x;
          break;
        }
      }
      return { left, right, canvasW: right - left + 1 };
    };

    const mk = (img) => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      return { c, ctx: c.getContext('2d'), w: c.width, h: c.height };
    };

    const W = mk(wire);
    const bounds = { left: 39, right: 1023, canvasW: 985 };

    const detectWireBoundaries = () => {
      const x0 = bounds.left;
      const x1 = bounds.right;
      const lines = [];
      let prev = null;
      for (let y = 0; y < W.h; y++) {
        let warm = 0;
        let light = 0;
        for (let x = x0; x <= x1; x++) {
          const p = W.ctx.getImageData(x, y, 1, 1).data;
          const lum = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
          if (p[0] > 198 && p[1] > 178 && p[2] > 115) warm++;
          if (lum > 235) light++;
        }
        const band = warm > (x1 - x0) * 0.2 ? 'warm' : light > (x1 - x0) * 0.5 ? 'light' : 'other';
        if (band !== prev) {
          if (prev === 'warm' || prev === 'light') lines.push(y);
          prev = band;
        }
      }
      const headerEnd = lines.find((y) => y > 40 && y < 120) ?? 58;
      const heroImageEnd = lines.find((y) => y > 200 && y < 400) ?? 345;
      const heroContentEnd = lines.find((y) => y > 400 && y < 520) ?? 473;
      const socialProofEnd = lines.find((y) => y > 480 && y < 560) ?? 530;
      return { headerEnd, heroImageEnd, heroContentEnd, socialProofEnd };
    };

    const wireBounds = {
      headerEnd: 58,
      heroImageEnd: 345,
      heroContentEnd: 473,
      socialProofEnd: 530,
    };
    const scale = data.canvas.width / bounds.canvasW;
    const wireCanvasY = (y) => Math.round(y * scale);

    const wireScaled = {
      headerEnd: wireCanvasY(wireBounds.headerEnd),
      heroImageEnd: wireCanvasY(wireBounds.heroImageEnd),
      heroContentEnd: wireCanvasY(wireBounds.heroContentEnd),
      socialProofEnd: wireCanvasY(wireBounds.socialProofEnd),
    };

    const deltas = {
      headerEnd: data.boundaries.headerEnd - wireScaled.headerEnd,
      heroImageEnd: data.boundaries.heroImageEnd - wireScaled.heroImageEnd,
      heroContentEnd: data.boundaries.heroContentEnd - wireScaled.heroContentEnd,
      socialProofEnd: data.boundaries.socialProofEnd - wireScaled.socialProofEnd,
    };

    const openingCropH = Math.max(data.boundaries.socialProofEnd + 20, wireScaled.socialProofEnd + 20);

    const cropWireOpening = () => {
      const c = document.createElement('canvas');
      c.width = bounds.canvasW;
      c.height = openingCropH;
      c.getContext('2d').drawImage(W.c, bounds.left, 0, bounds.canvasW, openingCropH, 0, 0, bounds.canvasW, openingCropH);
      return c;
    };

    const wireCrop = cropWireOpening();
    const scaledW = data.canvas.width;
    const scaledH = Math.round(openingCropH * scale);

    const scaleWire = () => {
      const c = document.createElement('canvas');
      c.width = scaledW;
      c.height = scaledH;
      c.getContext('2d').drawImage(wireCrop, 0, 0, bounds.canvasW, openingCropH, 0, 0, scaledW, scaledH);
      return c;
    };

    const wireScaledImg = scaleWire();

    const cropRenderOpening = () => {
      const c = document.createElement('canvas');
      c.width = data.canvas.width;
      c.height = scaledH;
      const sx = data.canvas.left;
      const sy = data.canvas.top;
      c.getContext('2d').drawImage(render, sx, sy, data.canvas.width, scaledH, 0, 0, data.canvas.width, scaledH);
      return c;
    };

    const renderOpening = cropRenderOpening();

    const sideBySide = () => {
      const pad = 24;
      const labelH = 28;
      const c = document.createElement('canvas');
      c.width = scaledW * 2 + pad * 3;
      c.height = scaledH + labelH + pad * 2;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#e5e5e5';
      ctx.font = '600 13px system-ui,sans-serif';
      ctx.fillText('Wireframe (reference)', pad, 18);
      ctx.fillText(`Live render — ${data.url}`, scaledW + pad * 2, 18);
      ctx.font = '400 11px ui-monospace,monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Viewport ${data.viewport.width}×${data.viewport.height}  |  scale wire ${bounds.canvasW}px → ${data.canvas.width}px`, pad, scaledH + labelH + pad + 14);
      ctx.drawImage(wireScaledImg, pad, labelH + pad);
      ctx.drawImage(renderOpening, scaledW + pad * 2, labelH + pad);
      return c;
    };

    const overlay50 = () => {
      const c = document.createElement('canvas');
      c.width = data.canvas.width;
      c.height = scaledH;
      const ctx = c.getContext('2d');
      ctx.drawImage(renderOpening, 0, 0);
      ctx.globalAlpha = 0.5;
      ctx.drawImage(wireScaledImg, 0, 0);
      ctx.globalAlpha = 1;
      return c;
    };

    const guides = () => {
      const c = document.createElement('canvas');
      c.width = data.canvas.width;
      c.height = scaledH;
      const ctx = c.getContext('2d');
      ctx.drawImage(renderOpening, 0, 0);
      ctx.globalAlpha = 0.5;
      ctx.drawImage(wireScaledImg, 0, 0);
      ctx.globalAlpha = 1;

      const lines = [
        { label: 'Header end', renderY: data.boundaries.headerEnd, wireY: wireScaled.headerEnd, delta: deltas.headerEnd },
        { label: 'Hero image end', renderY: data.boundaries.heroImageEnd, wireY: wireScaled.heroImageEnd, delta: deltas.heroImageEnd },
        { label: 'Hero content end', renderY: data.boundaries.heroContentEnd, wireY: wireScaled.heroContentEnd, delta: deltas.heroContentEnd },
        { label: 'Social Proof end', renderY: data.boundaries.socialProofEnd, wireY: wireScaled.socialProofEnd, delta: deltas.socialProofEnd },
      ];

      for (const line of lines) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(0, line.renderY);
        ctx.lineTo(c.width, line.renderY);
        ctx.stroke();

        ctx.strokeStyle = '#22c55e';
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(0, line.wireY);
        ctx.lineTo(c.width, line.wireY);
        ctx.stroke();
        ctx.setLineDash([]);

        const sign = line.delta >= 0 ? '+' : '';
        ctx.fillStyle = '#fff';
        ctx.fillRect(8, line.renderY + 4, 280, 18);
        ctx.fillStyle = '#111';
        ctx.font = '11px ui-monospace, monospace';
        ctx.fillText(`${line.label}  render ${line.renderY}px  wire ${line.wireY}px  Δ ${sign}${line.delta}px`, 12, line.renderY + 17);
      }

      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(8, scaledH - 52, 320, 44);
      ctx.fillStyle = '#fff';
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillText('Red solid = render boundary', 12, scaledH - 36);
      ctx.fillText('Green dashed = wireframe boundary', 12, scaledH - 22);
      ctx.fillText(`Scale: wire canvas ${bounds.canvasW}px → ${data.canvas.width}px`, 12, scaledH - 8);

      return c;
    };

    const toB64 = (c) => c.toDataURL('image/png').split(',')[1];

    return {
      wireFile: { w: W.w, h: W.h, canvasBounds: bounds, wireCanvasY: wireBounds },
      wireScaled,
      deltas,
      scale,
      b64: {
        sideBySide: toB64(sideBySide()),
        overlay50: toB64(overlay50()),
        guides: toB64(guides()),
      },
    };
  },
  { renderB64, wireB64, data },
);

await browser.close();

const evidence = {
  capturedAt: new Date().toISOString(),
  browserUrl: data.url,
  viewport: VIEWPORT,
  localhostInstance: URL,
  port5173Active: false,
  port4173Active: true,
  userBrowserConnected: 'Google Chrome → localhost:4173 (lsof at capture time)',
  sectionHeights: {
    header: { render: data.sections.header.offsetHeight, wireframeFile: 58, wireframeScaled: Math.round(58 * artifacts.scale) },
    heroImage: { render: data.sections.heroImage.offsetHeight, wireframeFile: 287, wireframeScaled: Math.round(287 * artifacts.scale) },
    heroContent: { render: data.sections.heroContent.offsetHeight, wireframeFile: 128, wireframeScaled: Math.round(128 * artifacts.scale) },
    socialProof: { render: data.sections.socialProof.offsetHeight, wireframeFile: 57, wireframeScaled: Math.round(57 * artifacts.scale) },
  },
  computedHeights: {
    header: data.sections.header,
    heroImage: data.sections.heroImage,
    heroContent: data.sections.heroContent,
    socialProof: data.sections.socialProof,
  },
  canvasRelativeBoundaries: data.boundaries,
  wireframeScaledBoundaries: artifacts.wireScaled,
  deltasPx: artifacts.deltas,
  wireframeDetection: artifacts.wireFile,
  scaleWireToRenderCanvas: artifacts.scale,
  files: {
    sideBySide: 'docs/r-01-evidence-side-by-side.png',
    overlay50: 'docs/r-01-evidence-overlay-50.png',
    guides: 'docs/r-01-evidence-guides.png',
    renderViewport: 'docs/r-01-evidence-render-1600x900.png',
  },
};

fs.writeFileSync(path.join(DOCS, 'r-01-evidence-side-by-side.png'), Buffer.from(artifacts.b64.sideBySide, 'base64'));
fs.writeFileSync(path.join(DOCS, 'r-01-evidence-overlay-50.png'), Buffer.from(artifacts.b64.overlay50, 'base64'));
fs.writeFileSync(path.join(DOCS, 'r-01-evidence-guides.png'), Buffer.from(artifacts.b64.guides, 'base64'));
fs.writeFileSync(path.join(DOCS, 'r-01-evidence.json'), JSON.stringify(evidence, null, 2));

console.log(JSON.stringify(evidence, null, 2));
