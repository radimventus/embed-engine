import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { prepareInitialScrollMedia } from './initialScrollMediaReadiness';

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

  it('marks lazy photo thumbnails for pre-animation decode readiness', () => {
    const rail = read('ThumbnailRail.tsx');
    const deferredWistia = read('DeferredWistia.tsx');
    const readiness = read('initialScrollMediaReadiness.ts');

    assert.match(rail, /data-initial-scroll-media="true"/);
    assert.match(deferredWistia, /data-initial-scroll-media="true"/);
    assert.match(rail, /loading="lazy"/);
    assert.match(rail, /decoding="sync"/);
    assert.match(readiness, /image\.complete && image\.naturalWidth > 0/);
    assert.match(readiness, /image\.decode\(\)/);
    assert.doesNotMatch(readiness, /addEventListener\(['"]load/);
  });

  it('settles readiness only after loaded decodes and ignores unloaded lazy images', async () => {
    let releaseDecode: (() => void) | undefined;
    let loadedDecodeCalls = 0;
    let unloadedDecodeCalls = 0;
    const loaded = {
      complete: true,
      naturalWidth: 220,
      loading: 'lazy',
      decode: () => {
        loadedDecodeCalls += 1;
        return new Promise<void>((resolve) => {
          releaseDecode = resolve;
        });
      },
    };
    const unloaded = {
      complete: false,
      naturalWidth: 0,
      loading: 'lazy',
      decode: () => {
        unloadedDecodeCalls += 1;
        return Promise.resolve();
      },
    };
    let eagerDecodeCalls = 0;
    let releaseEagerDecode: (() => void) | undefined;
    const eager = {
      complete: false,
      naturalWidth: 0,
      loading: 'eager',
      decode: () => {
        eagerDecodeCalls += 1;
        return new Promise<void>((resolve) => {
          releaseEagerDecode = resolve;
        });
      },
    };
    const root = {
      querySelectorAll: () => [loaded, unloaded, eager],
    } as unknown as ParentNode;
    let ready = false;
    const preparation = prepareInitialScrollMedia(root).then(() => {
      ready = true;
    });

    await Promise.resolve();
    assert.equal(ready, false);
    assert.equal(loadedDecodeCalls, 1);
    assert.equal(unloadedDecodeCalls, 0);
    assert.equal(eagerDecodeCalls, 1);

    assert.ok(releaseDecode);
    releaseDecode();
    await Promise.resolve();
    assert.equal(ready, false);
    assert.ok(releaseEagerDecode);
    releaseEagerDecode();
    await preparation;
    assert.equal(ready, true);
  });
});
