import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  createDecisionSessionRuntime,
  createSystemClock,
} from '@embed-engine/runtime';

import {
  ensureBuilderPackageBootstrapped,
  getBuilderRuntimeHousePackage,
  resetBuilderPackageBootstrapForTests,
} from './builderPackageBootstrap';
import { projectSynchronizedExperience } from './synchronizedExperience';

const packagePublicRoot = '/house-packages/patrovy-5kk';
const packageDiskRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../public/house-packages/patrovy-5kk',
);

describe('AUTHORING_DRAFT package bootstrap', () => {
  it('projects the supplied placeholder hero, gallery, and floor plan', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input) => {
      const url = String(input);
      const relativePath = url.startsWith(`${packagePublicRoot}/`)
        ? url.slice(packagePublicRoot.length + 1)
        : '';
      if (relativePath.length === 0) {
        return new Response(null, { status: 404 });
      }
      try {
        return new Response(
          await readFile(path.join(packageDiskRoot, relativePath)),
          { status: 200 },
        );
      } catch {
        return new Response(null, { status: 404 });
      }
    };

    try {
      await ensureBuilderPackageBootstrapped(packagePublicRoot, {
        identity: {
          id: 'patrovy-5kk',
          title: 'PATROVÝ 5KK',
          reference: 'patrovy-5kk',
        },
      });
      const house = getBuilderRuntimeHousePackage();

      assert.equal(house.identity.id, 'patrovy-5kk');
      assert.equal(house.identity.title, 'PATROVÝ 5KK');
      assert.equal(house.media.find((asset) => asset.id === 'hero')?.url,
        `${packagePublicRoot}/media/hero/hero.png`);
      assert.equal(
        house.media.find((asset) => asset.type === 'floorplan')?.url,
        `${packagePublicRoot}/media/plans/p1.png`,
      );
      assert.equal(
        house.media.some((asset) => asset.url.includes('bungalov-4kk')),
        false,
      );

      const runtime = createDecisionSessionRuntime({
        housePackage: house,
        clock: createSystemClock(),
        now: 1,
      });
      const experience = projectSynchronizedExperience(runtime.getExperience()!);
      assert.equal(
        experience.context.hero.primaryMediaUrl,
        `${packagePublicRoot}/media/hero/hero.png`,
      );
      assert.equal(
        experience.context.floorPlan.src,
        `${packagePublicRoot}/media/plans/p1.png`,
      );
      assert.ok(experience.context.floorPlan.viewBoxWidth > 0);
      assert.ok(experience.context.floorPlan.viewBoxHeight > 0);
    } finally {
      globalThis.fetch = originalFetch;
      resetBuilderPackageBootstrapForTests();
    }
  });
});
