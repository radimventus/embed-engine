import assert from 'node:assert/strict';
import {
  mkdtemp,
  rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  FileCanonicalRegistryAuthorityRepository,
} from './canonicalRegistryAuthorityRepository';

test(
  'TASK-66VR-FIX-05 — dynamic canonical authority survives a fresh repository instance',
  async () => {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          'conis-canonical-registry-',
        ),
      );

    const previous =
      process.env.PLATFORM_API_STATE_DIR;

    process.env.PLATFORM_API_STATE_DIR =
      directory;

    try {
      const writer =
        new FileCanonicalRegistryAuthorityRepository();

      await writer.upsertAuthorityBundle({
        tenant: {
          id: 'tenant-fix05',
          name: 'Fix05',
          companyId: 'company-fix05',
          pilot: false,
          createdAt:
            '2026-08-22T00:00:00.000Z',
        },
        company: {
          id: 'company-fix05',
          name: 'Fix05',
          tenantId: 'tenant-fix05',
        },
        workspace: {
          id: 'workspace-fix05',
          companyId: 'company-fix05',
          name: 'Fix05 Workspace',
        },
        project: {
          id: 'project-fix05',
          companyId: 'company-fix05',
          workspaceId:
            'workspace-fix05',
          name: 'Fix05',
          slug: 'fix05',
          description: '',
        },
      });

      const fresh =
        new FileCanonicalRegistryAuthorityRepository();

      const snapshot =
        await fresh.readAuthoritySnapshot();

      assert.equal(
        snapshot.projects.some(
          (item) =>
            item.id === 'project-fix05',
        ),
        true,
      );

      assert.equal(
        snapshot.companies.some(
          (item) =>
            item.id === 'company-fix05',
        ),
        true,
      );

      assert.equal(
        snapshot.workspaces.some(
          (item) =>
            item.id === 'workspace-fix05',
        ),
        true,
      );

      assert.equal(
        snapshot.tenants.some(
          (item) =>
            item.id === 'tenant-fix05',
        ),
        true,
      );
    } finally {
      if (previous === undefined) {
        delete process.env
          .PLATFORM_API_STATE_DIR;
      } else {
        process.env
          .PLATFORM_API_STATE_DIR =
          previous;
      }

      await rm(
        directory,
        {
          recursive: true,
          force: true,
        },
      );
    }
  },
);
