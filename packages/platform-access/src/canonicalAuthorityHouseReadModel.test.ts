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
import {
  BUNGALOV_4KK_REFERENCE_SOURCE,
  BUNGALOV_4KK_REFERENCE_SOURCE_ID,
  deriveReferenceInstanceHouseId,
} from './reference/referenceSourceRegistry';
import { selectHouseOperationalCases } from './operations/selectHouseOperationalCases';
import { repairHistoricalReferenceAuthorityHouse } from './provisioning/defaultProjectHouses';
import {
  DEFAULT_CANONICAL_PROJECT_ID,
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_HISTORICAL_MODERN_4KK_HOUSE_ID,
} from './registry/defaults';

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

test('P0 restores historical durable reference materializations for every exact Project scope', () => {
  resetCompanyRegistryExtras();

  const companyId = 'company-reference-read';
  const workspaceId = 'workspace-reference-read';
  const projectA = 'project-reference-a';
  const projectB = 'project-reference-b';
  const houseA = deriveReferenceInstanceHouseId({
    sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
    companyId,
    projectId: projectA,
  });
  const houseB = deriveReferenceInstanceHouseId({
    sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
    companyId,
    projectId: projectB,
  });

  hydrateCanonicalRegistryFromAuthority({
    tenants: [
      {
        id: 'tenant-reference-read',
        name: 'Reference read',
        companyId,
        pilot: false,
        createdAt: '2026-09-16T00:00:00.000Z',
      },
    ],
    companies: [
      { id: companyId, name: 'Reference read', tenantId: 'tenant-reference-read' },
    ],
    workspaces: [
      { id: workspaceId, companyId, name: 'Reference read' },
    ],
    projects: [projectA, projectB].map((id) => ({
      id,
      companyId,
      workspaceId,
      name: id,
      slug: id,
      description: '',
    })),
    houses: [
      { id: houseA, canonicalProjectId: projectA, name: 'BUNGALOV A' },
      { id: houseB, canonicalProjectId: projectB, name: 'BUNGALOV B' },
    ],
  });

  const projectedA = listCanonicalHouses(projectA)[0]!;
  const projectedB = listCanonicalHouses(projectB)[0]!;
  for (const projected of [projectedA, projectedB]) {
    assert.equal(projected.house?.dataMode, 'REFERENCE_DEMO');
    assert.equal(projected.house?.objectType, 'reference-house');
    assert.equal(
      projected.house?.packageRoot,
      BUNGALOV_4KK_REFERENCE_SOURCE.packageRoot,
    );
    assert.deepEqual(projected.house?.referenceProvenance, {
      sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
      sourceVersion: BUNGALOV_4KK_REFERENCE_SOURCE.version,
    });
  }

  const casesA = selectHouseOperationalCases({
    companyId,
    projectId: projectA,
    houseId: houseA,
    houseName: projectedA.house!.name,
    dataMode: projectedA.house!.dataMode,
    durableLeads: [],
  });
  const casesB = selectHouseOperationalCases({
    companyId,
    projectId: projectB,
    houseId: houseB,
    houseName: projectedB.house!.name,
    dataMode: projectedB.house!.dataMode,
    durableLeads: [],
  });
  assert.equal(casesA.length, 3);
  assert.equal(casesB.length, 3);
  assert.ok(casesA.every((item) => item.projectId === projectA && item.houseId === houseA));
  assert.ok(casesB.every((item) => item.projectId === projectB && item.houseId === houseB));
  assert.equal(casesA.some((a) => casesB.some((b) => a.caseId === b.caseId)), false);
});

test('P0 historical repair is idempotent and preserves explicit or unproven durable semantics', () => {
  const scope = {
    companyId: 'company-repair',
    projectId: 'project-repair',
    workspaceId: 'workspace-repair',
  };
  const exactId = deriveReferenceInstanceHouseId({
    sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
    companyId: scope.companyId,
    projectId: scope.projectId,
  });
  const incomplete = {
    id: exactId,
    canonicalProjectId: scope.projectId,
    name: 'Historical reference',
  } as const;
  const repaired = repairHistoricalReferenceAuthorityHouse({
    house: incomplete,
    ...scope,
  });
  assert.deepEqual(
    repairHistoricalReferenceAuthorityHouse({ house: repaired, ...scope }),
    repaired,
  );
  assert.equal(repaired.dataMode, 'REFERENCE_DEMO');

  const explicitPartner = repairHistoricalReferenceAuthorityHouse({
    house: {
      ...incomplete,
      dataMode: 'LIVE_EMPTY',
      objectType: 'partner-house',
    },
    ...scope,
  });
  assert.equal(explicitPartner.dataMode, 'LIVE_EMPTY');
  assert.equal(explicitPartner.objectType, 'partner-house');
  assert.equal(explicitPartner.referenceProvenance, undefined);

  const unknown = repairHistoricalReferenceAuthorityHouse({
    house: {
      id: 'unknown-house',
      canonicalProjectId: scope.projectId,
      name: 'Unknown',
    },
    ...scope,
  });
  assert.equal(unknown.dataMode, undefined);
  assert.equal(unknown.referenceProvenance, undefined);

  const wrongProject = repairHistoricalReferenceAuthorityHouse({
    house: {
      id: exactId,
      canonicalProjectId: 'project-foreign',
      name: 'Foreign',
    },
    ...scope,
  });
  assert.equal(wrongProject.dataMode, undefined);
  assert.equal(wrongProject.referenceProvenance, undefined);

  const explicitReference = repairHistoricalReferenceAuthorityHouse({
    house: {
      ...incomplete,
      packageRoot: '/custom/reference-package',
      dataMode: 'REFERENCE_DEMO',
      objectType: 'reference-house',
      referenceProvenance: {
        sourceId: 'explicit-source',
        sourceVersion: 'v9',
      },
    },
    ...scope,
  });
  assert.equal(explicitReference.packageRoot, '/custom/reference-package');
  assert.deepEqual(explicitReference.referenceProvenance, {
    sourceId: 'explicit-source',
    sourceVersion: 'v9',
  });
});

test('P0 DSE exact published reference cannot be degraded by an incomplete durable row', () => {
  resetCompanyRegistryExtras();
  hydrateCanonicalRegistryFromAuthority({
    tenants: [],
    companies: [],
    workspaces: [],
    projects: [],
    houses: [
      {
        id: DSE_BUNGALOV_4KK_HOUSE_ID,
        canonicalProjectId: DSE_CANONICAL_PROJECT_ID,
        name: 'BUNGALOV 4KK durable',
      },
      {
        id: DSE_HISTORICAL_MODERN_4KK_HOUSE_ID,
        canonicalProjectId: DEFAULT_CANONICAL_PROJECT_ID,
        name: 'MODERN 4KK durable',
      },
    ],
  });

  const dse = listCanonicalHouses(DSE_CANONICAL_PROJECT_ID).find(
    (projection) => projection.house?.houseId === DSE_BUNGALOV_4KK_HOUSE_ID,
  );
  assert.equal(dse?.house?.dataMode, 'REFERENCE_DEMO');
  assert.equal(dse?.house?.objectType, 'reference-house');
  assert.equal(
    dse?.house?.packageRoot,
    BUNGALOV_4KK_REFERENCE_SOURCE.packageRoot,
  );
  assert.equal(
    getCanonicalHouse(DSE_BUNGALOV_4KK_HOUSE_ID)?.house?.dataMode,
    'REFERENCE_DEMO',
  );
  const acModular = getCanonicalHouse(DSE_HISTORICAL_MODERN_4KK_HOUSE_ID);
  assert.equal(acModular?.house?.dataMode, 'REFERENCE_DEMO');
  assert.equal(acModular?.house?.objectType, 'reference-house');
  assert.equal(acModular?.house?.packageRoot, '/canonical-houses/modern-4kk');
});
