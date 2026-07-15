import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const BASE = process.env.CS_URL ?? 'http://127.0.0.1:4173/';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

const cssNetwork = [];

page.on('response', async (response) => {
  const url = response.url();
  if (!url.includes('css') && !response.headers()['content-type']?.includes('css')) return;
  if (!url.includes('index.css') && !url.includes('/assets/') && !url.includes('fonts.googleapis')) return;
  let body = '';
  try {
    body = await response.text();
  } catch {
    body = '';
  }
  cssNetwork.push({
    url,
    status: response.status(),
    contentType: response.headers()['content-type'],
    sizeBytes: body.length,
    hasHHeroImage: body.includes('.h-hero-image'),
    heroRule: (body.match(/\.h-hero-image\s*\{[^}]*\}/)?.[0] ?? null),
  });
});

await page.goto(BASE, { waitUntil: 'networkidle' });

const report = await page.evaluate(() => {
  const el = document.querySelector('.h-hero-image');
  const p = el?.querySelector('p');
  const section = el?.closest('section');

  const cssomScan = () => {
    const hits = [];
    let lineCounter = 0;
    for (const sheet of document.styleSheets) {
      const href = sheet.href ?? '[inline-vite-injected]';
      let rules;
      try {
        rules = sheet.cssRules;
      } catch (e) {
        hits.push({ sheet: href, error: String(e) });
        continue;
      }
      for (let i = 0; i < rules.length; i++) {
        lineCounter++;
        const rule = rules[i];
        if (rule.selectorText?.includes('h-hero-image')) {
          hits.push({
            sheet: href,
            ruleIndex: i,
            approximateCssomLine: lineCounter,
            selector: rule.selectorText,
            cssText: rule.cssText,
            height: rule.style?.getPropertyValue('height'),
          });
        }
      }
    }
    return hits;
  };

  const cascadeFor = (node) => {
    if (!node) return null;
    const matched = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of rules) {
        if (rule.type !== CSSRule.STYLE_RULE) continue;
        try {
          if (node.matches(rule.selectorText)) {
            const h = rule.style.getPropertyValue('height');
            const imp = rule.style.getPropertyPriority('height');
            matched.push({
              selector: rule.selectorText,
              height: h || null,
              important: imp === 'important',
              cssText: rule.cssText.slice(0, 160),
            });
          }
        } catch {
          /* invalid selector for matches() */
        }
      }
    }
    return matched;
  };

  const stylesPanelSimulation = (node) => {
    const matched = cascadeFor(node);
    const heightRules = matched.filter((r) => r.height);
    return {
      allMatchedCount: matched.length,
      heightRules,
      computedHeight: node ? getComputedStyle(node).height : null,
      wouldShowInStylesPanel: heightRules.length
        ? heightRules
        : 'žádné pravidlo s height — Styles panel neukáže height',
    };
  };

  const consoleChecks = {
    el,
    elHeight: el ? getComputedStyle(el).height : null,
    elMinHeight: el ? getComputedStyle(el).minHeight : null,
    elMaxHeight: el ? getComputedStyle(el).maxHeight : null,
    elDisplay: el ? getComputedStyle(el).display : null,
    elClassName: el?.className ?? null,
    pHeight: p ? getComputedStyle(p).height : null,
    pLineHeight: p ? getComputedStyle(p).lineHeight : null,
    sectionHeight: section ? getComputedStyle(section).height : null,
  };

  const missingRuleExperiment = () => {
    const clone = el?.cloneNode(true);
    if (!clone) return null;
    clone.removeAttribute('class');
    clone.className = 'flex items-center justify-center';
    clone.style.visibility = 'hidden';
    clone.style.position = 'absolute';
    document.body.appendChild(clone);
    const h = getComputedStyle(clone).height;
    clone.remove();
    return {
      classesWithoutHeroToken: 'flex items-center justify-center',
      computedHeightWithoutRule: h,
      interpretation:
        h === '24px'
          ? '24px = výška textového obsahu (line-height text-base), NE spacing.section token'
          : `bez .h-hero-image pravidla: ${h}`,
    };
  };

  return {
    pageUrl: location.href,
    stylesheetLinks: [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href),
    styleTags: [...document.querySelectorAll('style')].map((s, i) => ({
      index: i,
      ruleCount: s.sheet?.cssRules?.length ?? 'blocked',
      dataViteDevId: s.getAttribute('data-vite-dev-id'),
    })),
    cssomHHeroImage: cssomScan(),
    cssomHasSelector: cssomScan().some((h) => h.selector === '.h-hero-image'),
    consoleChecks,
    divStylesPanel: stylesPanelSimulation(el),
    pStylesPanel: stylesPanelSimulation(p),
    sectionStylesPanel: stylesPanelSimulation(section),
    missingRuleExperiment: missingRuleExperiment(),
    boundingRects: {
      div: el?.getBoundingClientRect(),
      p: p?.getBoundingClientRect(),
      section: section?.getBoundingClientRect(),
    },
  };
});

report.networkCss = cssNetwork;

await page.screenshot({
  path: '/Users/radimventus/embed-engine/docs/cs-hero-forensic-browser.png',
  fullPage: false,
});

await browser.close();

writeFileSync(
  '/Users/radimventus/embed-engine/docs/cs-hero-forensic-browser.json',
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
