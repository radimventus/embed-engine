import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const BASE = process.env.CS_URL ?? 'http://127.0.0.1:4173/';

const report = {
  url: BASE,
  timestamp: new Date().toISOString(),
  cssRequests: [],
  cssom: { selectorFound: false, rules: [] },
  console: {},
  element: null,
  verdict: null,
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('response', async (response) => {
  const url = response.url();
  const ct = response.headers()['content-type'] ?? '';
  if (ct.includes('text/css') || url.endsWith('.css') || url.includes('.css?')) {
    let body = '';
    try {
      body = await response.text();
    } catch {
      body = '[could not read body]';
    }
    const hasRule = body.includes('.h-hero-image');
    const ruleMatch = body.match(/\.h-hero-image\s*\{[^}]*\}/g);
    report.cssRequests.push({
      url,
      status: response.status(),
      contentType: ct,
      sizeBytes: body.length,
      containsHHeroImage: hasRule,
      ruleBlocks: ruleMatch ?? [],
    });
  }
});

await page.goto(BASE, { waitUntil: 'networkidle' });

report.console = await page.evaluate(() => {
  const el = document.querySelector('.h-hero-image');
  const out = {
    element: el
      ? {
          tagName: el.tagName,
          className: el.className,
          inlineStyle: el.getAttribute('style'),
        }
      : null,
    computed: el
      ? {
          height: getComputedStyle(el).height,
          minHeight: getComputedStyle(el).minHeight,
          maxHeight: getComputedStyle(el).maxHeight,
          display: getComputedStyle(el).display,
        }
      : null,
    cssom: {
      selectorFound: false,
      matchingRules: [],
      allStylesheetHrefs: [],
    },
  };

  for (const sheet of document.styleSheets) {
    let href = sheet.href ?? '[inline]';
    out.cssom.allStylesheetHrefs.push(href);
    let rules;
    try {
      rules = sheet.cssRules;
    } catch (e) {
      out.cssom.matchingRules.push({
        sheet: href,
        error: String(e),
      });
      continue;
    }
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (rule.selectorText && rule.selectorText.includes('h-hero-image')) {
        out.cssom.selectorFound = true;
        out.cssom.matchingRules.push({
          sheet: href,
          index: i,
          selector: rule.selectorText,
          cssText: rule.cssText,
          style: rule.style ? Object.fromEntries([...rule.style].map((p) => [p, rule.style.getPropertyValue(p)])) : null,
        });
      }
    }
  }

  if (el) {
    const matched = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of rules) {
        if (rule.type === CSSRule.STYLE_RULE && el.matches(rule.selectorText)) {
          const height = rule.style.getPropertyValue('height');
          if (height || rule.selectorText.includes('h-hero') || rule.selectorText === '*') {
            matched.push({
              selector: rule.selectorText,
              height: height || null,
              cssText: rule.cssText.slice(0, 200),
            });
          }
        }
      }
    }
    out.matchedRulesWithHeight = matched.filter((r) => r.height);
    out.allMatchedSelectors = matched.map((m) => m.selector);
  }

  return out;
});

report.element = report.console.element;
report.cssom = report.console.cssom;

const height = report.console.computed?.height;
const selectorFound = report.cssom.selectorFound;
const cssHasRule = report.cssRequests.some((r) => r.containsHHeroImage);

if (!selectorFound && !cssHasRule) {
  report.verdict = 'A';
  report.verdictDetail = '.h-hero-image není součástí CSS načteného browserem.';
} else if (selectorFound && height && height !== '640px' && height !== '40rem') {
  const px = parseFloat(height);
  if (px === 24 || height === '24px') {
    report.verdict = 'B_or_missing';
    report.verdictDetail = `Computed height je ${height} přestože CSSOM má pravidlo — kontrola přepsání.`;
  }
} else if (cssHasRule && !selectorFound) {
  report.verdict = 'C';
  report.verdictDetail = 'CSS soubor obsahuje .h-hero-image ale CSSOM ne — jiný bundle nebo CORS.';
}

await page.screenshot({ path: '/Users/radimventus/embed-engine/docs/cs-hero-cssom-audit.png', fullPage: false });
await browser.close();

writeFileSync('/Users/radimventus/embed-engine/docs/cs-hero-cssom-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
