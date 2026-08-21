import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  resetCompanyRegistryExtras,
  upsertBuilderProject,
} from '@embed-engine/platform-access';

import {
  canUseLegacyWorkspaceActivation,
  isBuilderAuthoredHouseForScope,
  requiresLegacyWorkspaceActivation,
  resolveBuilderActiveHouseId,
  runBuilderHouseActivation,
  shouldRecoverLegacyLiveEmptyHouse,
} from './useWorkspaceController';
import type { WorkspaceProject } from './workspaceRegistry';

function house(
  id: string,
  folderId: string,
  status: WorkspaceProject['status'] = 'draft',
): WorkspaceProject {
  return {
    id,
    name: id,
    packageRoot: '',
    companyId: 'dse',
    folderId,
    description: '',
    status,
    slug: id,
    objectType: 'house',
    metadata: '',
  };
}

describe('Builder shared active House publication', () => {
  it('awaits authoritative VPD → BUNGALOV scope authorization before mounting', async () => {
    let resolveAuthorization: (() => void) | undefined;
    const authorization = new Promise<void>((resolve) => {
      resolveAuthorization = resolve;
    });
    const events: string[] = [];

    const activation = runBuilderHouseActivation({
      prepareLocalScope: () => events.push('local:bungalov-4kk'),
      authorizeScope: async () => {
        events.push('authoritative:start');
        await authorization;
        events.push('authoritative:accepted');
      },
      mountHousePackage: async () => {
        events.push('mount:bungalov-4kk');
      },
    });

    await Promise.resolve();
    assert.deepEqual(events, ['local:bungalov-4kk', 'authoritative:start']);

    resolveAuthorization?.();
    await activation;
    assert.deepEqual(events, [
      'local:bungalov-4kk',
      'authoritative:start',
      'authoritative:accepted',
      'mount:bungalov-4kk',
    ]);
  });

  it('does not mount BUNGALOV when authoritative scope authorization rejects', async () => {
    const events: string[] = [];

    await assert.rejects(
      runBuilderHouseActivation({
        prepareLocalScope: () => events.push('local:bungalov-4kk'),
        authorizeScope: async () => {
          events.push('authoritative:start');
          throw new Error('House Package není pro tuto relaci povolen.');
        },
        mountHousePackage: async () => {
          events.push('mount:bungalov-4kk');
        },
      }),
      /House Package není pro tuto relaci povolen/,
    );

    assert.deepEqual(events, ['local:bungalov-4kk', 'authoritative:start']);
  });

  it('uses the Vite-only activation endpoint only in a development host', () => {
    assert.equal(canUseLegacyWorkspaceActivation(true), true);
    assert.equal(canUseLegacyWorkspaceActivation(false), false);
    assert.equal(
      requiresLegacyWorkspaceActivation(
        'legacy-live-empty',
        'apps/client-studio/public/house-packages/patrovy-5kk',
      ),
      true,
    );
  });

  it('CAP-VR38b — scopes canonical and authored Houses to their Project', () => {
    const dse = 'project-domy-s-energii';

    assert.equal(
      resolveBuilderActiveHouseId(
        'project-ac-modular',
        house('modern-4kk', 'project-ac-modular', 'published'),
      ),
      'modern-4kk',
    );
    assert.equal(
      resolveBuilderActiveHouseId(dse, house('patrovy-5kk', dse)),
      'patrovy-5kk',
    );
    assert.equal(
      resolveBuilderActiveHouseId(
        dse,
        house('family-98', 'project-ac-modular', 'published'),
      ),
      null,
    );
    assert.equal(resolveBuilderActiveHouseId(dse, null), null);
  });

  it('CAP-RG1R5 — reconciles only active Builder-authored draft Houses', () => {
    const dse = 'project-domy-s-energii';

    assert.equal(
      isBuilderAuthoredHouseForScope(dse, house('patrovy-5kk', dse)),
      true,
    );
    assert.equal(
      isBuilderAuthoredHouseForScope(
        dse,
        house('modern-4kk', dse, 'published'),
      ),
      false,
    );
    assert.equal(
      isBuilderAuthoredHouseForScope(
        dse,
        house('family-98', 'project-ac-modular'),
      ),
      false,
    );
  });

  it('recovers any in-scope authored draft without a House package root', () => {
    const dse = 'project-domy-s-energii';
    const legacyHouse = house('legacy-live-empty', dse);
    upsertBuilderProject({
      id: legacyHouse.id,
      workspaceId: 'dse-main',
      companyId: 'dse',
      name: legacyHouse.name,
      packageRoot: '',
      status: 'draft',
      slug: legacyHouse.slug,
      objectType: legacyHouse.objectType,
      description: '',
      dataMode: 'LIVE_EMPTY',
      canonicalProjectId: dse,
    });

    assert.equal(
      shouldRecoverLegacyLiveEmptyHouse(dse, legacyHouse),
      true,
    );
    assert.equal(
      shouldRecoverLegacyLiveEmptyHouse(
        dse,
        house('unbound-authored-draft', dse),
      ),
      true,
    );
    assert.equal(
      shouldRecoverLegacyLiveEmptyHouse(
        dse,
        house('modern-4kk', dse, 'published'),
      ),
      false,
    );
    assert.equal(
      shouldRecoverLegacyLiveEmptyHouse(
        dse,
        { ...legacyHouse, packageRoot: 'apps/client-studio/public/house-packages/legacy-live-empty' },
      ),
      false,
    );
    resetCompanyRegistryExtras();
  });

  it('rolls back the previous platform session when authoritative House switch fails', () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'useWorkspaceController.ts'),
      'utf8',
    );
    assert.match(source, /const previousSession = loadPlatformSession\(\)/);
    assert.match(source, /savePlatformSession\(previousSession\)/);
    assert.doesNotMatch(
      source,
      /prepareBuilderHouseScope\(\s*previousTarget/,
    );
  });
});
