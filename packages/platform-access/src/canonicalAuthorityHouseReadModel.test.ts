import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getDefaultCompanyRegistry,
  hydrateCanonicalRegistryFromAuthority,
  resetCompanyRegistryExtras,
} from './registry/companyRegistry';
import {
  getCanonicalHouse,
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


test('TASK-66VR-FIX-10 dynamic single House read', () => {
  resetCompanyRegistryExtras();

  hydrateCanonicalRegistryFromAuthority({
    tenants: [
      {
        id: 'tenant-fix10',
        name: 'FIX10',
        companyId: 'company-fix10',
        pilot: false,
        createdAt: '2026-08-23T00:00:00.000Z',
      },
    ],
    companies: [
      {
        id: 'company-fix10',
        name: 'FIX10',
        tenantId: 'tenant-fix10',
      },
    ],
    workspaces: [
      {
        id: 'workspace-fix10',
        companyId: 'company-fix10',
        name: 'FIX10 Workspace',
      },
    ],
    projects: [
      {
        id: 'project-fix10',
        companyId: 'company-fix10',
        workspaceId: 'workspace-fix10',
        name: 'FIX10 Project',
        slug: 'fix10-project',
        description: '',
      },
    ],
    houses: [
      {
        id: 'house-live-empty-fix10',
        canonicalProjectId: 'project-fix10',
        name: 'Prázdný dům FIX10',
        slug: 'house-live-empty-fix10',
        status: 'draft',
        objectType: 'house',
        dataMode: 'LIVE_EMPTY',
      },
      {
        id: 'house-reference-fix10',
        canonicalProjectId: 'project-fix10',
        name: 'BGV FIX10',
        slug: 'house-reference-fix10',
        packageRoot:
          'apps/client-studio/public/house-packages/bungalov-4kk',
        status: 'draft',
        objectType: 'house',
        dataMode: 'REFERENCE_DEMO',
      },
    ],
  });

  const listed = listCanonicalHouses('project-fix10');

  assert.deepEqual(
    listed
      .map((item) => item.house?.houseId)
      .filter((id): id is string => typeof id === 'string')
      .sort(),
    ['house-live-empty-fix10', 'house-reference-fix10'],
  );

  const liveEmpty =
    getCanonicalHouse('house-live-empty-fix10');

  assert.notEqual(liveEmpty, null);
  assert.equal(
    liveEmpty?.project.projectId,
    'project-fix10',
  );
  assert.equal(
    liveEmpty?.house?.houseId,
    'house-live-empty-fix10',
  );
  assert.equal(
    liveEmpty?.house?.dataMode,
    'LIVE_EMPTY',
  );

  const reference =
    getCanonicalHouse('house-reference-fix10');

  assert.notEqual(reference, null);
  assert.equal(
    reference?.project.projectId,
    'project-fix10',
  );
  assert.equal(
    reference?.house?.houseId,
    'house-reference-fix10',
  );
  assert.equal(
    reference?.house?.dataMode,
    'REFERENCE_DEMO',
  );

  assert.equal(
    getCanonicalHouse('house-does-not-exist-fix10'),
    null,
  );
});
