import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createBuilderPackageEvidence } from './builderPackageBootstrap';

describe('Builder package runtime evidence', () => {
  it('reports the active VPD package root and derived paths', () => {
    const evidence = createBuilderPackageEvidence({
      packagePublicRoot: '/house-packages/patrovy-5kk',
      heroRelativePath: 'media/hero/hero.png',
      registries: {
        gallery: { entries: [] },
        rooms: { rooms: [] },
      } as never,
      texts: { galleryCsv: 'gallery', roomsCsv: 'rooms', videosCsv: 'videos' },
    });

    assert.equal(evidence.packageRoot, '/house-packages/patrovy-5kk');
    assert.equal(
      evidence.galleryCsvPath,
      '/house-packages/patrovy-5kk/gallery.csv',
    );
    assert.equal(
      evidence.roomsCsvPath,
      '/house-packages/patrovy-5kk/rooms.csv',
    );
    assert.equal(
      evidence.videosCsvPath,
      '/house-packages/patrovy-5kk/videos.csv',
    );
    assert.equal(
      evidence.heroPath,
      '/house-packages/patrovy-5kk/media/hero/hero.png',
    );
  });
});
