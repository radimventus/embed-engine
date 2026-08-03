import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const clientStudioRoot = join(here, '../../../../..');

function read(name: string): string {
  return readFileSync(join(here, name), 'utf8');
}

function readWalkthrough(name: string): string {
  return readFileSync(
    join(clientStudioRoot, 'src/features/walkthrough', name),
    'utf8',
  );
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Responsive Media Explorer (RCS-04)', () => {
  it('adds swipe gallery navigation without Decision / Runtime composition', () => {
    const main = read('MainMedia.tsx');
    const swipe = read('useMediaSwipeNavigation.ts');
    const walkthrough = stripComments(readWalkthrough('WalkthroughProvider.tsx'));

    assert.match(main, /useMediaSwipeNavigation/);
    assert.match(main, /selectMediaIndex/);
    assert.match(main, /data-media-swipe/);
    assert.match(main, /mobile:object-contain/);
    assert.match(swipe, /onSelectIndex/);
    assert.match(swipe, /SWIPE_MIN_DISTANCE_PX|48/);
    assert.equal(swipe.includes('ChangePriority'), false);
    assert.equal(swipe.includes('composeDecision'), false);
    assert.equal(walkthrough.includes('applyMediaOpened'), false);
  });

  it('keeps fluid touch thumbnails and fullscreen lightbox contracts', () => {
    const rail = read('ThumbnailRail.tsx');
    const lightbox = read('MediaLightbox.tsx');
    const nav = readWalkthrough('useThumbnailRailScroll.ts');
    const play = read('PlayControl.tsx');

    assert.match(rail, /ResizeObserver/);
    assert.match(rail, /MOBILE_VISIBLE_SLOTS|visibleSlots/);
    assert.match(rail, /min-h-11|h-11/);
    assert.match(rail, /touch-manipulation/);
    assert.match(nav, /visibleSlotCount/);
    assert.match(lightbox, /safe-area|100dvh/);
    assert.match(play, /touch-manipulation/);
    assert.equal(rail.includes('presentation-assets'), false);
  });
});
