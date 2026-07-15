import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:4173/';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(URL, { waitUntil: 'networkidle' });

const result = await page.evaluate(() => {
  const el = document.querySelector('.h-hero-image');
  let cssRuleExists = false;
  let cssRuleText = null;

  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText === '.h-hero-image') {
          cssRuleExists = true;
          cssRuleText = rule.cssText;
        }
      }
    } catch {
      /* cross-origin */
    }
  }

  return {
    locationHref: location.href,
    cssRuleExists,
    cssRuleText,
    computedHeight: el ? getComputedStyle(el).height : null,
    elementFound: !!el,
  };
});

await browser.close();

console.log(JSON.stringify(result, null, 2));
process.exit(
  result.cssRuleExists && result.computedHeight === '640px' ? 0 : 1,
);
