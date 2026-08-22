import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  getCanonicalProject,
  hydrateCanonicalRegistryFromAuthority,
  resetCompanyRegistryExtras,
  upsertBuilderCanonicalProject,
} from './index';

test(
  'TASK-66VR-FIX-05 — server authority hydrates a fresh browser Project projection',
  () => {
    resetCompanyRegistryExtras();

    try {
      hydrateCanonicalRegistryFromAuthority({
        tenants: [
          {
            id: 'tenant-profile-b',
            name: 'Profile B',
            companyId: 'company-profile-b',
            pilot: false,
            createdAt:
              '2026-08-22T00:00:00.000Z',
          },
        ],
        companies: [
          {
            id: 'company-profile-b',
            name: 'Profile B',
            tenantId: 'tenant-profile-b',
          },
        ],
        workspaces: [
          {
            id: 'workspace-profile-b',
            companyId: 'company-profile-b',
            name: 'Profile B Workspace',
          },
        ],
        projects: [
          {
            id: 'project-profile-b',
            companyId: 'company-profile-b',
            workspaceId: 'workspace-profile-b',
            name: 'Profile B',
            slug: 'profile-b',
            description: '',
          },
        ],
      });

      assert.equal(
        getCanonicalProject(
          'project-profile-b',
        )?.project.name,
        'Profile B',
      );
    } finally {
      resetCompanyRegistryExtras();
    }
  },
);


test(
  'TASK-66VR-FIX-06 — authoritative hydration removes a browser-local canonical Project orphan',
  () => {
    resetCompanyRegistryExtras();

    try {
      upsertBuilderCanonicalProject({
        id: 'project-browser-local-orphan',
        companyId: 'company-domy-s-energii',
        workspaceId: 'domy-s-energii-main',
        name: 'Browser Local Orphan',
        slug: 'browser-local-orphan',
        description: '',
      });

      assert.equal(
        getCanonicalProject(
          'project-browser-local-orphan',
        )?.project.name,
        'Browser Local Orphan',
      );

      hydrateCanonicalRegistryFromAuthority({
        tenants: [],
        companies: [],
        workspaces: [],
        projects: [],
      });

      assert.equal(
        getCanonicalProject(
          'project-browser-local-orphan',
        ),
        null,
      );
    } finally {
      resetCompanyRegistryExtras();
    }
  },
);
