/**
 * CAP-CE-01 — Public Offer Experience architecture guards.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

function read(relative: string): string {
  return readFileSync(join(root, relative), 'utf8');
}

describe('CAP-CE-01 Public Offer Experience', () => {
  it('ships a public route and dedicated layout without Office Shell', () => {
    const app = read('src/OfferExperienceApp.tsx');
    const layout = read('src/components/OfferLayout.tsx');
    const pkg = read('package.json');
    const vite = read('vite.config.ts');

    assert.match(app, /OfferLayout/);
    assert.match(app, /OfferHero/);
    assert.match(app, /PackageSelection/);
    assert.match(app, /OfferSummary/);
    assert.match(app, /parseOfferSlugFromPath/);
    assert.match(layout, /data-offer-layout/);
    assert.doesNotMatch(app, /PlatformShell/);
    assert.doesNotMatch(app, /PlatformAccessRoot/);
    assert.doesNotMatch(app, /office-studio/);
    assert.doesNotMatch(layout, /platform-nav-rail/);
    assert.match(pkg, /@embed-engine\/offer-experience/);
    assert.match(vite, /4192/);
  });

  it('implements package selection, summary and confirm CTA', () => {
    const selection = read('src/components/PackageSelection.tsx');
    const summary = read('src/components/OfferSummary.tsx');
    const hero = read('src/components/OfferHero.tsx');
    const css = read('src/index.css');

    assert.match(selection, /offer-package-selection/);
    assert.match(summary, /Potvrdit objednávku/);
    assert.match(summary, /offer-confirm-cta/);
    assert.match(hero, /offer-logo/);
    assert.match(hero, /offer-hero-image/);
    assert.match(css, /--offer-gold-intense/);
    assert.match(css, /offer-shell__watermark/);
    assert.doesNotMatch(css, /platform-header/);
  });
});
