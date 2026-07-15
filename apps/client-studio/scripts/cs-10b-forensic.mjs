import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const PAGE_URL = process.argv[2] ?? 'http://localhost:5185';
const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../docs');

const TARGETS = [
  {
    key: 'heroImage',
    label: 'Hero Image',
    color: '#ff0000',
    measure: (c) => c.querySelector('.h-hero-image'),
    component: 'HeroImage',
    dom: 'div.h-hero-image',
  },
  {
    key: 'heroImageSection',
    label: 'Hero Image Section (wrapper)',
    color: '#ff6666',
    measure: (c) => c.querySelector('.h-hero-image')?.closest('section'),
    component: 'HeroImage',
    dom: 'section (wrapper)',
    hidden: true,
  },
  {
    key: 'heroContent',
    label: 'Hero Content',
    color: '#00aa00',
    measure: (c) => c.querySelector('.min-h-hero-content'),
    component: 'Hero',
    dom: 'section.min-h-hero-content',
  },
  {
    key: 'socialProof',
    label: 'Social Proof',
    color: '#0066ff',
    measure: (c) =>
      [...c.querySelectorAll('section')].find((s) => s.className.includes('grid-cols-3')),
    component: 'SocialProof',
    dom: 'section.grid-cols-3',
  },
  {
    key: 'gallery',
    label: 'Gallery',
    color: '#ff8800',
    measure: (c) => c.querySelector('.aspect-video'),
    component: 'MainMedia',
    dom: 'div.aspect-video',
  },
  {
    key: 'roomIndex',
    label: 'Room Index',
    color: '#9900ff',
    measure: (c) => c.querySelector('[aria-label="Room Index"]'),
    component: 'RoomIndex',
    dom: 'section[aria-label="Room Index"]',
  },
  {
    key: 'floorplan',
    label: 'Floorplan',
    color: '#00cccc',
    measure: (c) => c.querySelector('[aria-label="Floor Plan Explorer"] .aspect-square'),
    component: 'FloorPlan',
    dom: 'div.aspect-square',
  },
  {
    key: 'priorityCards',
    label: 'Priority Cards',
    color: '#ffcc00',
    measure: (c) => c.querySelector('[aria-label="Priority Engine"] .grid-cols-5'),
    component: 'PriorityCards',
    dom: 'div.grid-cols-5',
  },
  {
    key: 'priorityIntro',
    label: 'Priority Explanation',
    color: '#ff00ff',
    measure: (c) => {
      const grid = c.querySelector('[aria-label="Priority Engine"] .grid-cols-\\[52fr_48fr\\]');
      return grid?.children[1] ?? null;
    },
    component: 'IntroText',
    dom: 'IntroText column',
  },
  {
    key: 'faq',
    label: 'FAQ',
    color: '#006622',
    measure: (c) => c.querySelector('[aria-label="AI Advisor"] > .grid-cols-2 > div:first-child'),
    component: 'SuggestedQuestions',
    dom: 'SuggestedQuestions column',
  },
  {
    key: 'aiConversation',
    label: 'AI Conversation',
    color: '#003399',
    measure: (c) => c.querySelector('.min-h-ai-conversation'),
    component: 'Conversation',
    dom: 'div.min-h-ai-conversation',
  },
  {
    key: 'audit',
    label: 'Audit',
    color: '#111111',
    measure: (c) => c.querySelector('[aria-label="Audit and Lead Capture"]'),
    component: 'AuditLeadCapture',
    dom: 'section[aria-label="Audit and Lead Capture"]',
  },
];

function git(cmd) {
  try {
    return execSync(cmd, { cwd: path.resolve(OUT_DIR, '..'), encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(PAGE_URL, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-desktop-canvas]');

const canvasHeight = await page.locator('[data-desktop-canvas]').evaluate((el) => el.scrollHeight);
const viewportHeight = Math.min(canvasHeight + 48, 9000);
await page.setViewportSize({ width: 1600, height: viewportHeight });

const measured = await page.evaluate(() => {
  const canvas = document.querySelector('[data-desktop-canvas]');
  const canvasRect = canvas.getBoundingClientRect();

  const pick = (fn) => {
    const el = fn(canvas);
    if (!el) return { found: false };
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      found: true,
      tag: el.tagName.toLowerCase(),
      className: el.className,
      aria: el.getAttribute('aria-label'),
      offsetWidth: el.offsetWidth,
      offsetHeight: el.offsetHeight,
      computedWidth: cs.width,
      computedHeight: cs.height,
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
      transform: cs.transform,
      rect: {
        x: Math.round(rect.x - canvasRect.x),
        y: Math.round(rect.y - canvasRect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      },
    };
  };

  return {
    heroImage: pick((c) => c.querySelector('.h-hero-image')),
    heroContent: pick((c) => c.querySelector('.min-h-hero-content')),
    socialProof: pick((c) => [...c.querySelectorAll('section')].find((s) => s.className.includes('grid-cols-3'))),
    gallery: pick((c) => c.querySelector('.aspect-video')),
    roomIndex: pick((c) => c.querySelector('[aria-label="Room Index"]')),
    floorplan: pick((c) => c.querySelector('[aria-label="Floor Plan Explorer"] .aspect-square')),
    priorityCards: pick((c) => c.querySelector('[aria-label="Priority Engine"] .grid-cols-5')),
    priorityIntro: pick((c) => {
      const g = c.querySelector('[aria-label="Priority Engine"] .mt-section.grid');
      return g?.children[1] ?? null;
    }),
    faq: pick((c) => c.querySelector('[aria-label="AI Advisor"] > .grid-cols-2 > div:first-child')),
    aiConversation: pick((c) => c.querySelector('.min-h-ai-conversation')),
    audit: pick((c) => c.querySelector('[aria-label="Audit and Lead Capture"]')),
    heroSectionWrapper: pick((c) => c.querySelector('.h-hero-image')?.closest('section')),
  };
});

const forensic = await page.evaluate(() => {
  const canvas = document.querySelector('[data-desktop-canvas]');
  const canvasRect = canvas.getBoundingClientRect();

  function inspect(el) {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      dom: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\s+/).slice(0, 4).join('.') : ''),
      offsetWidth: el.offsetWidth,
      offsetHeight: el.offsetHeight,
      computedWidth: cs.width,
      computedHeight: cs.height,
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
      transform: cs.transform,
      clipPath: cs.clipPath,
      rect: {
        x: Math.round(rect.x - canvasRect.x),
        y: Math.round(rect.y - canvasRect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      },
    };
  }

  function parentChain(el) {
    const chain = [];
    let node = el;
    while (node && node !== document.body) {
      const cs = getComputedStyle(node);
      chain.push({
        tag: node.tagName.toLowerCase(),
        class: String(node.className || '').slice(0, 80),
        overflow: cs.overflow,
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
        transform: cs.transform,
        clipPath: cs.clipPath,
        height: cs.height,
        maxHeight: cs.maxHeight,
      });
      node = node.parentElement;
    }
    return chain;
  }

  const heroInner = canvas.querySelector('.h-hero-image');
  const heroSection = heroInner?.closest('section');

  return {
    canvas: {
      offsetWidth: canvas.offsetWidth,
      offsetHeight: canvas.offsetHeight,
      scrollHeight: canvas.scrollHeight,
      rect: { w: canvasRect.width, h: canvasRect.height },
    },
    viewport: { width: window.innerWidth, height: window.innerHeight },
    url: location.href,
    heroForensics: {
      inner: inspect(heroInner),
      sectionWrapper: inspect(heroSection),
      parentChainInner: parentChain(heroInner),
      parentChainSection: parentChain(heroSection),
    },
    timestamp: new Date().toISOString(),
  };
});

const screenshotB64 = await page.locator('[data-desktop-canvas]').screenshot({ type: 'png' }).then((b) => b.toString('base64'));

const wfPath = `${OUT_DIR}/client-studio-wireframe-1600.png`;
const wfB64 = fs.readFileSync(wfPath).toString('base64');

const boxes = TARGETS.filter((t) => !t.hidden).map((t) => {
  const m = measured[t.key];
  return {
    key: t.key,
    label: t.label,
    color: t.color,
    component: t.component,
    dom: t.dom,
    found: m?.found ?? false,
    rect: m?.rect,
    offsetWidth: m?.offsetWidth,
    offsetHeight: m?.offsetHeight,
    computedWidth: m?.computedWidth,
    computedHeight: m?.computedHeight,
    overflowX: m?.overflowX,
    overflowY: m?.overflowY,
    transform: m?.transform,
    sizeLabel: m?.found ? `${m.rect.w} × ${m.rect.h} px` : 'NOT FOUND',
  };
});

// Also include wrapper for report
const heroWrapper = measured.heroSectionWrapper;

await page.setContent('<canvas id="c"></canvas><canvas id="overlay"></canvas>');
const renderResult = await page.evaluate(({ screenshotB64, boxes, heroWrapper }) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.getElementById('c');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);

      ctx.font = '600 14px Inter, sans-serif';
      ctx.lineWidth = 3;

      for (const box of boxes) {
        if (!box.found) continue;
        const { x, y, w, h } = box.rect;
        ctx.strokeStyle = box.color;
        ctx.fillStyle = box.color + '22';
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
        const text = `${box.label}\n${box.sizeLabel}`;
        const lines = text.split('\n');
        const th = 18 * lines.length + 8;
        ctx.fillStyle = box.color;
        ctx.fillRect(x, Math.max(0, y - th), Math.max(160, ctx.measureText(box.label).width + 20), th);
        ctx.fillStyle = '#ffffff';
        lines.forEach((line, i) => ctx.fillText(line, x + 6, y - th + 16 + i * 18));
      }

      // Hero wrapper dashed
      if (heroWrapper?.found) {
        const { x, y, w, h } = heroWrapper.rect;
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
        ctx.fillStyle = '#ff0000';
        ctx.fillText(`Wrapper ${heroWrapper.rect.w}×${heroWrapper.rect.h}px`, x + 6, y + h + 16);
      }

      resolve({ w: c.width, h: c.height });
    };
    img.src = 'data:image/png;base64,' + screenshotB64;
  });
}, { screenshotB64, boxes, heroWrapper });

const overlayResult = await page.evaluate(({ screenshotB64, wfB64, boxes, heroWrapper }) => {
  return new Promise((resolve) => {
    const render = new Image();
    const wf = new Image();
    let n = 0;
    const done = () => {
      if (++n < 2) return;
      const outW = render.width;
      const outH = render.height;
      const c = document.getElementById('overlay');
      c.width = outW;
      c.height = outH + 40;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#eef0f2';
      ctx.fillRect(0, 0, c.width, c.height);

      // Wireframe top crop scaled to canvas width
      const wfCrop = { x: 48, y: 0, w: 974, h: Math.min(wf.height, outH) };
      ctx.globalAlpha = 0.45;
      ctx.drawImage(wf, wfCrop.x, wfCrop.y, wfCrop.w, wfCrop.h, 0, 0, outW, outH);
      ctx.globalAlpha = 1;
      ctx.drawImage(render, 0, 0);
      ctx.fillStyle = 'rgba(17,17,17,0.75)';
      ctx.font = '600 16px Inter, sans-serif';
      ctx.fillText('Overlay — wireframe (45%) + render + bounding boxes', 16, 24);

      ctx.font = '600 14px Inter, sans-serif';
      ctx.lineWidth = 3;
      for (const box of boxes) {
        if (!box.found) continue;
        const { x, y, w, h } = box.rect;
        ctx.strokeStyle = box.color;
        ctx.fillStyle = box.color + '33';
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
        const text = `${box.label}  ${box.sizeLabel}`;
        ctx.fillStyle = box.color;
        const tw = ctx.measureText(text).width + 12;
        ctx.fillRect(x, Math.max(26, y - 20), tw, 18);
        ctx.fillStyle = '#fff';
        ctx.fillText(text, x + 6, Math.max(40, y - 6));
      }
      if (heroWrapper?.found) {
        const { x, y, w, h } = heroWrapper.rect;
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
      }
      resolve({ w: c.width, h: c.height });
    };
    render.onload = done;
    wf.onload = done;
    render.src = 'data:image/png;base64,' + screenshotB64;
    wf.src = 'data:image/png;base64,' + wfB64;
  });
}, { screenshotB64, wfB64, boxes, heroWrapper });

const annotated = await page.evaluate(() => document.getElementById('c').toDataURL('image/png'));
const overlay = await page.evaluate(() => document.getElementById('overlay').toDataURL('image/png'));

fs.writeFileSync(`${OUT_DIR}/cs-10b-forensic-annotated.png`, Buffer.from(annotated.split(',')[1], 'base64'));
fs.writeFileSync(`${OUT_DIR}/cs-10b-forensic-overlay.png`, Buffer.from(overlay.split(',')[1], 'base64'));
fs.writeFileSync(`${OUT_DIR}/cs-10b-forensic-canvas-raw.png`, Buffer.from(screenshotB64, 'base64'));

const meta = {
  capturedAt: new Date().toISOString(),
  gitHead: git('git rev-parse HEAD'),
  gitCommitDate: git('git log -1 --format=%ci'),
  gitDirty: git('git status --porcelain').length > 0,
  gitDirtyFiles: git('git status --porcelain').split('\n').filter(Boolean).length,
  build: 'vite dev (HMR) — not production build',
  browserUrl: PAGE_URL,
  viewport: forensic.viewport,
  canvas: forensic.canvas,
  measured,
  boxes: boxes.map(({ key, label, color, component, dom, sizeLabel, rect, offsetWidth, offsetHeight, computedWidth, computedHeight, overflowX, overflowY, transform }) => ({
    key, label, color, component, dom, sizeLabel, rect, offsetWidth, offsetHeight, computedWidth, computedHeight, overflowX, overflowY, transform,
  })),
  heroForensics: forensic.heroForensics,
  renderDimensions: renderResult,
  overlayDimensions: overlayResult,
};

fs.writeFileSync(`${OUT_DIR}/cs-10b-forensic-meta.json`, JSON.stringify(meta, null, 2));
console.log(JSON.stringify(meta, null, 2));

await browser.close();
