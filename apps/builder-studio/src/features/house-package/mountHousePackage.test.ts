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
  it('mounts a schema-only LIVE_EMPTY package in AUTHORING_DRAFT mode', async () => {
    const files = new Map<string, string>([
      ['/house-package/gallery.csv', 'order,room,file\n'],
      ['/house-package/rooms.csv', 'floor,room,name,area\n'],
      ['/house-package/videos.csv', 'order,room,provider,mediaId\n'],
    ]);

    const mount = await mountHousePackage({
      validationMode: 'AUTHORING_DRAFT',
      fetchText: async (url) => {
        const text = files.get(url);
        if (text === undefined) {
          throw new Error(`Missing draft file for ${url}`);
        }
        return text;
      },
      probeExists: async (url) => files.has(url),
    });

    assert.equal(mount.ok, true);
    assert.ok(mount.builderImport !== null);
    assert.deepEqual(mount.builderImport.rooms.rooms, []);
    assert.deepEqual(mount.builderImport.gallery.entries, []);
    assert.deepEqual(mount.builderImport.videos.entries, []);
    assert.deepEqual(mount.builderImport.floors.floors, []);
    assert.deepEqual(mount.builderImport.hero.entries, []);
  });

  it('keeps the default mount mode publish-strict', async () => {
    const files = new Map<string, string>([
      ['/house-package/gallery.csv', 'order,room,file\n'],
      ['/house-package/rooms.csv', 'floor,room,name,area\n'],
      ['/house-package/videos.csv', 'order,room,provider,mediaId\n'],
    ]);

    const mount = await mountHousePackage({
      fetchText: async (url) => files.get(url) ?? '',
      probeExists: async (url) => files.has(url),
    });

    assert.equal(mount.ok, false);
    assert.ok(mount.errors.some((error) => error.code === 'BP_MISSING_FILE'));
  });

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

describe('TASK-56I-minimal — VPD active package root', () => {
  it('loads VPD data from /house-packages/patrovy-5kk', async () => {
    const requested: string[] = [];

    const files = new Map<string, string>([
      ['/house-packages/patrovy-5kk/gallery.csv', 'order,room,file\n'],
      ['/house-packages/patrovy-5kk/rooms.csv', 'floor,room,name,area\n'],
      ['/house-packages/patrovy-5kk/videos.csv', 'order,room,provider,mediaId\n'],
      ['/house-packages/patrovy-5kk/manifest.json', '{}'],
    ]);

    const mount = await mountHousePackage({
      diskRoot: 'apps/client-studio/public/house-packages/patrovy-5kk',
      validationMode: 'AUTHORING_DRAFT',
      fetchText: async (url) => {
        requested.push(url);
        const value = files.get(url);
        if (value === undefined) {
          throw new Error(`Unexpected fetch: ${url}`);
        }
        return value;
      },
      probeExists: async () => false,
    });

    assert.equal(
      mount.packageRootLabel,
      '/house-packages/patrovy-5kk',
    );

    assert.equal(
      mount.canonicalDiskRoot,
      'apps/client-studio/public/house-packages/patrovy-5kk',
    );

    assert.deepEqual(
      requested.slice(0, 4).sort(),
      [
        '/house-packages/patrovy-5kk/gallery.csv',
        '/house-packages/patrovy-5kk/manifest.json',
        '/house-packages/patrovy-5kk/rooms.csv',
        '/house-packages/patrovy-5kk/videos.csv',
      ].sort(),
    );
  });
});
