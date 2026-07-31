import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildReleaseVerification,
  fingerprintHousePackageContent,
  PRODUCTION_RUNTIME_SOURCE,
} from './releaseVerification';

describe('releaseVerification (CAP-BLD-07)', () => {
  it('fingerprints HP content without mock checksums', () => {
    const a = fingerprintHousePackageContent({
      roomsCsv: 'a',
      galleryCsv: 'b',
      videosCsv: 'c',
      heroRelativePath: 'media/hero/hero.png',
      manifestVersion: '1',
    });
    const b = fingerprintHousePackageContent({
      roomsCsv: 'a',
      galleryCsv: 'b',
      videosCsv: 'c',
      heroRelativePath: 'media/hero/hero.png',
      manifestVersion: '1',
    });
    const c = fingerprintHousePackageContent({
      roomsCsv: 'changed',
      galleryCsv: 'b',
      videosCsv: 'c',
      heroRelativePath: 'media/hero/hero.png',
      manifestVersion: '1',
    });
    assert.equal(a, b);
    assert.notEqual(a, c);
    assert.match(a, /^fnv1a-/);
  });

  it('marks runtime aligned only for production projection source', () => {
    const ok = buildReleaseVerification({
      publishFingerprint: 'EMBED_RUNTIME_BUILD:abc@t',
      runtimeFingerprint: PRODUCTION_RUNTIME_SOURCE,
      housePackageFingerprint: 'fnv1a-1',
      buildTimestamp: '2026-07-31T12:00:00Z',
      housePackageVersion: '1',
      embedVersion: '0.1.0',
      previewOpen: true,
    });
    assert.equal(ok.runtimeAligned, true);
    assert.equal(ok.previewReady, true);

    const bad = buildReleaseVerification({
      ...ok,
      runtimeFingerprint: 'stub-adapter',
      previewOpen: false,
    });
    assert.equal(bad.runtimeAligned, false);
  });
});
