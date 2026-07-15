import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../docs');
const URL = process.env.CS_URL ?? 'http://127.0.0.1:4173/';

const SECTIONS = [
  { name: 'ClientStudioHeader', selector: '[data-desktop-canvas] > header' },
  { name: 'HeroImage', selector: '[data-desktop-canvas] > section.border-b.bg-embed-status-warning\\/15' },
  {
    name: 'HeroContent',
    selector: '[data-desktop-canvas] > section.min-h-hero-content',
  },
  {
    name: 'SocialProof',
    selector: '[data-desktop-canvas] > section.grid-cols-3',
  },
  {
    name: 'PropertyExplorer',
    selector: '[data-desktop-canvas] > div.min-h-property-explorer',
  },
  {
    name: 'PriorityEngine',
    selector: '[data-desktop-canvas] > section[aria-label="Priority Engine"]',
  },
  { name: 'AIAdvisor', selector: '[data-desktop-canvas] > section[aria-label="AI Advisor"]' },
  {
    name: 'AuditLeadCapture',
    selector: '[data-desktop-canvas] > section[aria-label="Audit and Lead Capture"]',
  },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(URL, { waitUntil: 'networkidle' });

const report = await page.evaluate((sections) => {
  const canvas = document.querySelector('[data-desktop-canvas]');
  if (!canvas) throw new Error('Desktop Canvas not found');

  const canvasStyle = getComputedStyle(canvas);

  const relativeTop = (el) => {
    const canvasRect = canvas.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return Math.round(elRect.top - canvasRect.top + canvas.scrollTop);
  };

  const measure = (el, name) => {
    const cs = getComputedStyle(el);
    const domDesc = [
      el.tagName.toLowerCase(),
      el.id ? `#${el.id}` : '',
      el.getAttribute('aria-label') ? `[aria-label="${el.getAttribute('aria-label')}"]` : '',
      el.className ? `.${String(el.className).trim().split(/\s+/).slice(0, 2).join('.')}` : '',
    ].join('');

    return {
      componentName: name,
      domNode: domDesc,
      offsetTop: relativeTop(el),
      offsetHeight: el.offsetHeight,
      clientHeight: el.clientHeight,
      scrollHeight: el.scrollHeight,
      computedHeight: cs.height,
      computedMarginTop: cs.marginTop,
      computedMarginBottom: cs.marginBottom,
      computedPaddingTop: cs.paddingTop,
      computedPaddingBottom: cs.paddingBottom,
      borderTop: cs.borderTopWidth,
      borderBottom: cs.borderBottomWidth,
      boxSizing: cs.boxSizing,
    };
  };

  const canvasMetrics = {
    componentName: 'DesktopCanvas',
    domNode: 'div[data-desktop-canvas]',
    offsetTop: 0,
    offsetHeight: canvas.offsetHeight,
    clientHeight: canvas.clientHeight,
    scrollHeight: canvas.scrollHeight,
    computedHeight: canvasStyle.height,
    computedMarginTop: canvasStyle.marginTop,
    computedMarginBottom: canvasStyle.marginBottom,
    computedPaddingTop: canvasStyle.paddingTop,
    computedPaddingBottom: canvasStyle.paddingBottom,
    borderTop: canvasStyle.borderTopWidth,
    borderBottom: canvasStyle.borderBottomWidth,
    boxSizing: canvasStyle.boxSizing,
  };

  const measured = sections.map(({ name, selector }) => {
    const el = document.querySelector(selector);
    if (!el) return { componentName: name, error: `not found: ${selector}` };
    return measure(el, name);
  });

  const adjacency = [];
  for (let i = 0; i < measured.length - 1; i++) {
    const a = measured[i];
    const b = measured[i + 1];
    if (a.error || b.error) continue;
    const aEnd = a.offsetTop + a.offsetHeight;
    const gap = b.offsetTop - aEnd;
    adjacency.push({
      from: a.componentName,
      to: b.componentName,
      previousEnd: aEnd,
      nextStart: b.offsetTop,
      gapPx: gap,
      flush: gap === 0,
    });
  }

  const contentChildren = [...canvas.children];
  const unnamedGaps = [];
  for (let i = 0; i < contentChildren.length - 1; i++) {
    const a = contentChildren[i];
    const b = contentChildren[i + 1];
    const aTop = relativeTop(a);
    const bTop = relativeTop(b);
    const aEnd = aTop + a.offsetHeight;
    const gap = bTop - aEnd;
    if (gap !== 0) {
      unnamedGaps.push({
        between: `${a.tagName}${a.className ? '.' + String(a.className).split(' ')[0] : ''} → ${b.tagName}${b.className ? '.' + String(b.className).split(' ')[0] : ''}`,
        gapPx: gap,
      });
    }
  }

  const firstChild = contentChildren[0];
  const lastChild = contentChildren[contentChildren.length - 1];
  const paddingTopSpace = firstChild ? relativeTop(firstChild) : 0;
  const lastEnd = lastChild ? relativeTop(lastChild) + lastChild.offsetHeight : 0;
  const paddingBottomSpace = canvas.clientHeight - lastEnd;

  const sumChildOffsetHeights = measured
    .filter((m) => !m.error)
    .reduce((s, m) => s + m.offsetHeight, 0);

  const sumCheck = {
    canvasOffsetHeight: canvas.offsetHeight,
    canvasClientHeight: canvas.clientHeight,
    canvasScrollHeight: canvas.scrollHeight,
    sumSectionOffsetHeights: sumChildOffsetHeights,
    canvasPaddingTop: parseFloat(canvasStyle.paddingTop) || 0,
    canvasPaddingBottom: parseFloat(canvasStyle.paddingBottom) || 0,
    canvasBorderTop: parseFloat(canvasStyle.borderTopWidth) || 0,
    canvasBorderBottom: parseFloat(canvasStyle.borderBottomWidth) || 0,
    paddingTopSpaceBeforeFirstChild: paddingTopSpace,
    paddingBottomSpaceAfterLastChild: paddingBottomSpace,
    expectedContentHeight:
      canvas.clientHeight -
      paddingTopSpace -
      (paddingBottomSpace > 0 ? paddingBottomSpace : 0),
    deltaOffsetHeightVsSumSections:
      canvas.offsetHeight -
      sumChildOffsetHeights -
      paddingTopSpace -
      Math.max(0, paddingBottomSpace) -
      (parseFloat(canvasStyle.borderTopWidth) || 0) -
      (parseFloat(canvasStyle.borderBottomWidth) || 0),
    deltaClientHeightVsSumSectionsAndPadding:
      canvas.clientHeight - sumChildOffsetHeights - paddingTopSpace - paddingBottomSpace,
  };

  const discrepancyElements = [];
  if (sumCheck.deltaClientHeightVsSumSectionsAndPadding !== 0) {
    contentChildren.forEach((child, i) => {
      discrepancyElements.push({
        index: i,
        tag: child.tagName,
        className: child.className,
        ariaLabel: child.getAttribute('aria-label'),
        offsetTop: relativeTop(child),
        offsetHeight: child.offsetHeight,
      });
    });
    discrepancyElements.push({
      note: 'DesktopCanvas padding/border',
      paddingTop: canvasStyle.paddingTop,
      paddingBottom: canvasStyle.paddingBottom,
      borderTop: canvasStyle.borderTopWidth,
      borderBottom: canvasStyle.borderBottomWidth,
    });
  }

  const allCanvasChildren = contentChildren.map((el, i) => ({
    index: i,
    tag: el.tagName,
    ariaLabel: el.getAttribute('aria-label'),
    classSnippet: String(el.className).slice(0, 80),
    ...measure(el, `canvas-child-${i}`),
  }));

  return {
    canvas: canvasMetrics,
    sections: measured,
    allCanvasChildren,
    adjacency,
    unnamedGaps,
    sumCheck,
    discrepancyElements,
    verification: {
      sumEqualsCanvas:
        sumCheck.deltaClientHeightVsSumSectionsAndPadding === 0 &&
        paddingTopSpace === sumCheck.canvasPaddingTop &&
        paddingBottomSpace === sumCheck.canvasPaddingBottom,
      noUnnamedVerticalSpace:
        adjacency.every((a) => a.flush) &&
        unnamedGaps.length === 0 &&
        paddingTopSpace === sumCheck.canvasPaddingTop &&
        paddingBottomSpace === sumCheck.canvasPaddingBottom,
      eachStartsWherePreviousEnds: adjacency.every((a) => a.flush),
    },
  };
}, SECTIONS);

report.capturedAt = new Date().toISOString();
report.url = URL;

fs.writeFileSync(path.join(DOCS, 'cs-13-react-geometry.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

await browser.close();
