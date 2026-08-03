import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  PRODUCTION_VALIDATION_WIDTHS_PX,
  resolveProductionViewportBand,
  resolveValidationBand,
} from './productionValidation';

const here = dirname(fileURLToPath(import.meta.url));
const clientStudioRoot = join(here, '../../../..');

function readSource(relativeFromClientStudio: string): string {
  return readFileSync(join(clientStudioRoot, relativeFromClientStudio), 'utf8');
}

describe('Mobile Production Readiness (RCS-06)', () => {
  it('maps pilot device widths to expected viewport bands', () => {
    assert.deepEqual([...PRODUCTION_VALIDATION_WIDTHS_PX], [
      360, 390, 430, 768, 1024, 1280, 1440,
    ]);

    assert.equal(resolveValidationBand(360), 'mobile');
    assert.equal(resolveValidationBand(390), 'mobile');
    assert.equal(resolveValidationBand(430), 'mobile');
    assert.equal(resolveValidationBand(768), 'tablet');
    assert.equal(resolveValidationBand(1024), 'tablet');
    assert.equal(resolveValidationBand(1280), 'desktop');
    assert.equal(resolveProductionViewportBand(1440), 'desktop');
  });

  it('lazy-loads rail media and coalesces resize/scroll work', () => {
    const rail = readSource(
      'src/features/client-studio/sections/MediaExplorer/ThumbnailRail.tsx',
    );
    const main = readSource(
      'src/features/client-studio/sections/MediaExplorer/MainMedia.tsx',
    );
    const scroll = readSource(
      'src/features/walkthrough/useThumbnailRailScroll.ts',
    );
    const active = readSource(
      'src/features/client-studio/foundation/useActiveSection.ts',
    );
    const journey = readSource(
      'src/features/client-studio/foundation/GuidedJourneyRoot.tsx',
    );
    const scheduler = readSource(
      'src/features/client-studio/foundation/scheduleOnAnimationFrame.ts',
    );
    const css = readSource('src/index.css');
    const header = readSource(
      'src/features/client-studio/ClientStudioHeader.tsx',
    );
    const html = readSource('index.html');

    assert.match(rail, /loading="lazy"/);
    assert.match(rail, /decoding="async"/);
    assert.match(rail, /preload="none"/);
    assert.match(rail, /createFrameScheduler/);
    assert.doesNotMatch(rail, /allow="autoplay; fullscreen"/);

    assert.match(main, /fetchPriority="high"/);
    assert.match(main, /decoding="async"/);

    assert.match(scroll, /requestAnimationFrame/);
    assert.match(active, /previous === bestId/);
    assert.match(journey, /createFrameScheduler/);
    assert.match(scheduler, /requestAnimationFrame/);

    assert.match(css, /overflow-x:\s*clip/);
    assert.match(css, /content-visibility:\s*auto/);
    assert.match(header, /safe-area-inset-top/);
    assert.match(html, /viewport-fit=cover/);
  });

  it('keeps Runtime and Decision Layer out of production polish', () => {
    const scheduler = readSource(
      'src/features/client-studio/foundation/scheduleOnAnimationFrame.ts',
    );
    assert.doesNotMatch(scheduler, /@embed-engine\/(runtime|decision|core)/);
    assert.doesNotMatch(scheduler, /DecisionSession|emitDecision/);
  });
});
