import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resetCompanyRegistryExtras,
  upsertBuilderProject,
} from '@embed-engine/platform-access';

import {
  isBuilderAuthoredHouseForScope,
  resolveBuilderActiveHouseId,
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
  it('CAP-VR38b — scopes canonical and authored Houses to their Project', () => {
    const dse = 'project-domy-s-energii';

    assert.equal(
      resolveBuilderActiveHouseId(
        dse,
        house('modern-4kk', dse, 'published'),
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
});
