import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveBuilderHousePackageRoot } from './resolveBuilderHousePackageRoot';

describe('BuilderStudioApp VPD package binding', () => {
  it('mounts the populated VPD draft package even though its identity is canonical', () => {
    assert.equal(
      resolveBuilderHousePackageRoot(
        {
          packageRoot:
            'apps/client-studio/public/house-packages/patrovy-5kk',
          status: 'draft',
        },
        {},
      ),
      'apps/client-studio/public/house-packages/patrovy-5kk',
    );
  });

  it('continues to leave canonical published Houses on the existing path', () => {
    assert.equal(
      resolveBuilderHousePackageRoot(
        {
          packageRoot:
            'apps/client-studio/public/house-packages/bungalov-4kk',
          status: 'published',
        },
        {},
      ),
      null,
    );
  });
});
