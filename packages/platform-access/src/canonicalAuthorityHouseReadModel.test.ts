import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getDefaultCompanyRegistry,
  hydrateCanonicalRegistryFromAuthority,
  resetCompanyRegistryExtras,
} from './registry/companyRegistry';
import {
  listCanonicalHouses,
} from './projection/canonicalProjectProjection';

test('TASK-66VR-FIX-09 server House hydrates as a complete canonical projection', () => {
  resetCompanyRegistryExtras();

  hydrateCanonicalRegistryFromAuthority({
    tenants: [
      {
        id: 'tenant-fix09',
        name: 'FIX09',
        companyId: 'company-fix09',
        pilot: false,
        createdAt: '2026-08-23T00:00:00.000Z',
      },
    ],
    companies: [
      {
        id: 'company-fix09',
        name: 'FIX09',
        tenantId: 'tenant-fix09',
      },
    ],
    workspaces: [
      {
        id: 'workspace-fix09',
        companyId: 'company-fix09',
        name: 'FIX09 Workspace',
      },
    ],
    projects: [
      {
        id: 'project-fix09',
        companyId: 'company-fix09',
        workspaceId: 'workspace-fix09',
        name: 'FIX09 Project',
        slug: 'fix09-project',
        description: '',
      },
    ],
    houses: [
      {
        id: 'house-fix09',
        canonicalProjectId: 'project-fix09',
        name: 'FIX09 House',
        slug: 'fix09-house',
        packageRoot: '/house-packages/fix09',
        status: 'draft',
        objectType: 'family',
        dataMode: 'LIVE_EMPTY',
      },
    ],
  });

  assert.equal(
    getDefaultCompanyRegistry().houses.length,
    1,
  );

  const houses = listCanonicalHouses('project-fix09');
  assert.equal(houses.length, 1);

  const projection = houses[0]!;
  assert.equal(
    projection.partner.companyId,
    'company-fix09',
  );
  assert.equal(
    projection.project.projectId,
    'project-fix09',
  );
  assert.equal(
    projection.house?.houseId,
    'house-fix09',
  );
  assert.equal(
    projection.house?.packageRoot,
    '/house-packages/fix09',
  );
});
