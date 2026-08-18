import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ensureBuilderPackageBootstrapped,
  getBuilderPackagePublicRoot,
  getBuilderRuntimeHousePackage,
  resetBuilderPackageBootstrapForTests,
} from './builderPackageBootstrap';
import { loadDurableHousePackageOverlay } from './durableHousePackageOverlay';

const seedRoot = '/house-packages/seed';
const stableMediaRoot =
  'https://api.conis.cz/public/house-packages/vpd-house';

const roomsCsv = `floor,room,name,area
p1,living-room,Obývací pokoj,30`;
const videosCsv = 'order,room,provider,mediaId\n';
const galleryCsv = 'order,room,file\n1,living-room,persisted.png\n';
const manifestJson = JSON.stringify({
  validationMode: 'AUTHORING_DRAFT',
  heroPath: 'media/hero/persisted-hero.png',
  heroRelativePath: 'media/hero/persisted-hero.png',
  floorPlans: 'not-authored',
});

describe('durable VPD House Package overlay', () => {
  it('uses persisted CSV and manifest with stable Platform API media URLs', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input) => {
      const url = String(input);
      const files: Record<string, string> = {
        [`${seedRoot}/rooms.csv`]: roomsCsv,
        [`${seedRoot}/gallery.csv`]: 'order,room,file\n1,living-room,seed.png\n',
        [`${seedRoot}/videos.csv`]: videosCsv,
      };
      return url in files
        ? new Response(files[url], { status: 200 })
        : new Response(null, { status: 404 });
    };

    try {
      await ensureBuilderPackageBootstrapped(
        seedRoot,
        {
          identity: {
            id: 'vpd-house',
            title: 'VPD house',
            reference: 'vpd-house',
          },
        },
        {
          files: { galleryCsv, manifestJson },
          mediaPublicRoot: stableMediaRoot,
        },
      );

      const house = getBuilderRuntimeHousePackage();
      assert.equal(
        house.media.find((asset) => asset.id === 'hero')?.url,
        `${stableMediaRoot}/media/hero/persisted-hero.png`,
      );
      assert.equal(
        house.media.find((asset) => asset.id.startsWith('gallery:'))?.url,
        `${stableMediaRoot}/media/gallery/persisted.png`,
      );
      assert.equal(getBuilderPackagePublicRoot(), stableMediaRoot);
    } finally {
      globalThis.fetch = originalFetch;
      resetBuilderPackageBootstrapForTests();
    }
  });

  it('keeps required floor geometry on the static seed when durable media exists', async () => {
    const originalFetch = globalThis.fetch;
    const requests: string[] = [];
    globalThis.fetch = async (input) => {
      const url = String(input);
      requests.push(url);
      const files: Record<string, string> = {
        [`${seedRoot}/rooms.csv`]: roomsCsv,
        [`${seedRoot}/gallery.csv`]: galleryCsv,
        [`${seedRoot}/videos.csv`]: videosCsv,
        [`${seedRoot}/media/plans/p1.geometry.json`]: JSON.stringify({
          schema: 'hp-003-floorplan-geometry',
          schemaVersion: '1.0',
          floorId: 'p1',
          viewBox: { width: 1, height: 1 },
          units: 'px',
          rooms: [],
        }),
      };
      return url in files
        ? new Response(files[url], { status: 200 })
        : new Response(null, { status: 404 });
    };

    try {
      await ensureBuilderPackageBootstrapped(
        seedRoot,
        { identity: { id: 'vpd-house', title: 'VPD house', reference: 'vpd-house' } },
        {
          files: {
            manifestJson: JSON.stringify({
              validationMode: 'AUTHORING_DRAFT',
              heroPath: 'media/hero/hero.png',
              floorPlans: 'placeholder',
            }),
          },
          mediaPublicRoot: stableMediaRoot,
        },
      );
      assert.ok(requests.includes(`${seedRoot}/media/plans/p1.geometry.json`));
      assert.equal(
        requests.some((url) => url.includes('/media/media/plans/')),
        false,
      );
    } finally {
      globalThis.fetch = originalFetch;
      resetBuilderPackageBootstrapForTests();
    }
  });

  it('keeps the seed package when no authenticated durable state exists', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(null, { status: 401 });

    try {
      const overlay = await loadDurableHousePackageOverlay('vpd-house');
      assert.equal(overlay, null);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('maps persisted state to its per-house stable media endpoint', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          houseId: 'vpd-house',
          updatedAt: '2026-08-18T08:00:00.000Z',
          files: { galleryCsv },
        }),
        { status: 200 },
      );

    try {
      const overlay = await loadDurableHousePackageOverlay('vpd-house');
      assert.deepEqual(overlay, {
        files: { galleryCsv },
        mediaPublicRoot: stableMediaRoot,
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
