import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  hydrateCanonicalRegistryFromAuthority,
  resetCompanyRegistryExtras,
  listCanonicalHouses,
  listCanonicalProjects,
} from './index';

test('TASK 66 — Session A assigns Reference House to Project P -> Fresh Session B/C reads same durable assignment', () => {
  // 1. Reset client state
  resetCompanyRegistryExtras();

  // 2. Server authority state with Project P and assigned Reference House H (e.g. BUNGALOV 4KK or MODERN 4KK)
  const serverAuthoritySnapshot = {
    tenants: [],
    companies: [{ id: 'company-dse', name: 'DSE', slug: 'dse' }],
    workspaces: [],
    projects: [
      {
        id: 'project-dse-main',
        projectId: 'project-dse-main',
        companyId: 'company-dse',
        name: 'DSE Projekt',
        code: 'DSE',
        status: 'active',
        createdAt: '2026-01-01',
      },
      {
        id: 'project-other',
        projectId: 'project-other',
        companyId: 'company-dse',
        name: 'Other Projekt',
        code: 'OTH',
        status: 'active',
        createdAt: '2026-01-01',
      }
    ],
    houses: [
      {
        id: 'house-bungalov-4kk',
        canonicalProjectId: 'project-dse-main',
        name: 'BUNGALOV 4KK',
        status: 'draft',
      },
      {
        id: 'house-vas-prvni-dum',
        canonicalProjectId: 'project-dse-main',
        name: 'Váš první dům',
        status: 'draft',
      }
    ]
  };

  // 3. Act: Fresh Session B / Incognito hydrates directly from Server Authority
  hydrateCanonicalRegistryFromAuthority(serverAuthoritySnapshot as any);

  // 4. Assert: Assigned Reference Houses are immediately visible under Project P
  const dseHouses = listCanonicalHouses('project-dse-main');
  assert.equal(dseHouses.length, 2, 'Project P must contain exactly the 2 assigned reference houses');
  assert.ok(dseHouses.some((h: any) => (h.id || h.house?.id) === 'house-bungalov-4kk'), 'BUNGALOV 4KK must be present');
  assert.ok(dseHouses.some((h: any) => (h.id || h.house?.id) === 'house-vas-prvni-dum'), 'Váš první dům must be present');

  // 5. Assert: Project isolation - Other project does not see these houses
  const otherHouses = listCanonicalHouses('project-other');
  assert.equal(otherHouses.length, 0, 'Project isolation: Project Q must have 0 houses');
});
