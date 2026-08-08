import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  resolveBuilderActiveHouseId,
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
});
