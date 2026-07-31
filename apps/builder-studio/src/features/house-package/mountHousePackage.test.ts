import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { mountHousePackage } from './mountHousePackage';

const here = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = join(
  here,
  '../../../../../packages/object-house/src/builder-package/fixtures/minimal-house-package',
);

function readFixture(relativePath: string): string {
  return readFileSync(join(fixtureRoot, relativePath), 'utf8');
}

describe('mountHousePackage (CAP-BLD-02)', () => {
  it('loads HP-002 via object-house registries (no mock project)', async () => {
    const files = new Map<string, string>([
      ['/house-package/gallery.csv', readFixture('gallery.csv')],
      ['/house-package/rooms.csv', readFixture('rooms.csv')],
      ['/house-package/videos.csv', readFixture('videos.csv')],
      [
        '/house-package/media/plans/p1.geometry.json',
        readFixture('media/plans/p1.geometry.json'),
      ],
      [
        '/house-package/media/plans/p2.geometry.json',
        readFixture('media/plans/p2.geometry.json'),
      ],
    ]);

    const mount = await mountHousePackage({
      fetchText: async (url) => {
        const text = files.get(url);
        if (text === undefined) {
          throw new Error(`Missing fixture for ${url}`);
        }
        return text;
      },
      probeExists: async (url) =>
        url.endsWith('media/hero/hero.webp') || files.has(url),
      now: () => new Date('2026-07-31T12:00:00.000Z'),
    });

    assert.equal(mount.ok, true);
    assert.equal(mount.errors.length, 0);
    assert.ok(mount.builderImport !== null);
    assert.equal(mount.builderImport.rooms.rooms.length, 4);
    assert.equal(mount.builderImport.gallery.entries.length, 3);
    assert.equal(mount.builderImport.videos.entries.length, 2);
    assert.equal(mount.builderImport.floors.floors.length, 2);
    assert.equal(mount.heroRelativePath, 'media/hero/hero.webp');
    assert.equal(mount.canonicalDiskRoot, 'apps/client-studio/public/house-package');
    assert.equal(
      mount.builderImport.manifest.packageFormat,
      'builder-house-package',
    );
  });
});
