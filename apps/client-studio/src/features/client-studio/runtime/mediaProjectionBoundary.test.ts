import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { before, describe, it } from 'node:test';

import { installBuilderPackageRegistriesForTests, createTestBuilderRuntime } from './builderPackageTestInstall';
import { projectSynchronizedExperience } from './synchronizedExperience';

const here = dirname(fileURLToPath(import.meta.url));
const clientStudioRoot = join(here, '../../../..');

function readSource(relativeFromClientStudio: string): string {
  return readFileSync(join(clientStudioRoot, relativeFromClientStudio), 'utf8');
}

before(() => {
  installBuilderPackageRegistriesForTests();
});

describe('Media projection boundary (ED-DA-02)', () => {
  it('media UI modules do not import the presentation catalog', () => {
    const mediaModules = [
      'src/features/client-studio/sections/MediaExplorer/MainMedia.tsx',
      'src/features/client-studio/sections/MediaExplorer/ThumbnailRail.tsx',
      'src/features/client-studio/sections/Hero/HeroImage.tsx',
      'src/features/client-studio/sections/HouseNavigator/FloorPlan.tsx',
      'src/features/walkthrough/WalkthroughProvider.tsx',
    ];

    for (const relative of mediaModules) {
      const source = readSource(relative);
      assert.equal(
        source.includes('presentation-assets'),
        false,
        `${relative} must not import presentation-assets`,
      );
      assert.equal(
        source.includes('getPresentationAssets'),
        false,
        `${relative} must not call getPresentationAssets`,
      );
      assert.equal(
        source.includes('getMediaRoom'),
        false,
        `${relative} must not call getMediaRoom`,
      );
      assert.equal(
        source.includes('getHousePresentationAssets'),
        false,
        `${relative} must not call getHousePresentationAssets`,
      );
    }
  });

  it('media chrome does not emit MEDIA_OPENED semantic signals', () => {
    const source = readSource('src/features/walkthrough/WalkthroughProvider.tsx');
    assert.equal(source.includes('applyMediaOpened'), false);
    assert.equal(source.includes('MEDIA_OPENED'), false);
  });

  it('media projection never invents Decision Session semantics', () => {
    const runtime = createTestBuilderRuntime();
    runtime.dispatch({ type: 'SelectRoom', roomId: 'kitchen' }, 2);
    const base = runtime.getExperience()!;
    const synced = projectSynchronizedExperience(base);

    assert.deepEqual(synced.context.decision.terminal, base.context.decision.terminal);
    assert.deepEqual(synced.context.decision.ai, base.context.decision.ai);
    assert.deepEqual(synced.context.decision.outcome, base.context.decision.outcome);
    assert.deepEqual(synced.context.decision.story, base.context.decision.story);
    assert.deepEqual(synced.context.decision.moves, base.context.decision.moves);
  });
});
