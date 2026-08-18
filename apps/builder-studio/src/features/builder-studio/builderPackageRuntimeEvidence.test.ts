import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createBuilderPackageRuntimeEvidence } from './builderPackageRuntimeEvidence';

describe('Builder package runtime evidence', () => {
  it('reports the resolved canonical VPD package root', () => {
    const payload = createBuilderPackageRuntimeEvidence({
      activeProjectId: 'project-domy-s-energii',
      activeHouseId:
        'draft-company-domy-s-energii-project-domy-s-energii-vas-prvni-dum-5kk',
      houseName: 'Váš první dům',
      houseStatus: 'draft',
      houseDataMode: 'LIVE_EMPTY',
      registryPackageRoot:
        'apps/client-studio/public/house-packages/patrovy-5kk',
      resolvedBuilderHousePackageRoot:
        'apps/client-studio/public/house-packages/patrovy-5kk',
      mountState: { status: 'loading' },
    });

    assert.equal(
      payload.resolvedBuilderHousePackageRoot,
      'apps/client-studio/public/house-packages/patrovy-5kk',
    );
    assert.equal(
      payload.registryPackageRoot,
      'apps/client-studio/public/house-packages/patrovy-5kk',
    );
  });
});
