import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildPersistFiles,
  mergeHeroIntoManifestJson,
  readHeroRelativePathFromManifest,
} from './buildPersistFiles';
import type { HousePackageWorkingContent } from './validateHousePackageWorking';

const baseline: HousePackageWorkingContent = {
  roomsCsv: 'floor,room,name,area\np1,kitchen,Kuchyně,14\n',
  galleryCsv: 'order,room,file\n1,kitchen,11.webp\n',
  videosCsv: 'order,room,provider,mediaId\n',
  manifestJson: '{\n  "version": "1"\n}\n',
  heroRelativePath: 'media/hero/hero.png',
};

describe('buildPersistFiles (CAP-BLD-04)', () => {
  it('includes only dirty HP files', () => {
    const working = {
      ...baseline,
      roomsCsv: 'floor,room,name,area\np1,kitchen,Kuchyně XL,14\n',
    };
    const { files, dirty } = buildPersistFiles(baseline, working);
    assert.deepEqual([...dirty].sort(), ['plans', 'rooms']);
    assert.equal(typeof files.roomsCsv, 'string');
    assert.equal(files.galleryCsv, undefined);
    assert.equal(files.videosCsv, undefined);
    assert.equal(files.manifestJson, undefined);
  });

  it('merges hero metadata into manifest.json when hero dirty', () => {
    const working = {
      ...baseline,
      heroRelativePath: 'media/hero/hero.webp',
    };
    const { files, dirty } = buildPersistFiles(baseline, working);
    assert.ok(dirty.includes('hero'));
    assert.equal(typeof files.manifestJson, 'string');
    assert.equal(
      readHeroRelativePathFromManifest(files.manifestJson ?? null),
      'media/hero/hero.webp',
    );
    assert.match(
      mergeHeroIntoManifestJson(baseline.manifestJson, 'media/hero/hero.webp'),
      /heroRelativePath/,
    );
  });
});
