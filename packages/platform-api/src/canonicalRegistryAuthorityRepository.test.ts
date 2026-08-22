import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  DEFAULT_CANONICAL_PROJECT_ID,
  DSE_CANONICAL_PROJECT_ID,
} from '@embed-engine/platform-access';

import {
  FileCanonicalRegistryAuthorityRepository,
  type CanonicalRegistryAuthorityBundle,
} from './canonicalRegistryAuthorityRepository';

function partnerX(): CanonicalRegistryAuthorityBundle {
  return {
    tenant: {
      id: 'tenant-x',
      name: 'Tenant X',
      companyId: 'company-x',
      pilot: false,
      createdAt: '2026-08-22T00:00:00.000Z',
    },
    company: {
      id: 'company-x',
      name: 'Company X',
      tenantId: 'tenant-x',
    },
    workspace: {
      id: 'workspace-x',
      companyId: 'company-x',
      name: 'Workspace X',
    },
    project: {
      id: 'project-x',
      companyId: 'company-x',
      workspaceId: 'workspace-x',
      name: 'Project X',
      slug: 'project-x',
      description: 'Dynamic canonical Project X.',
    },
  };
}

describe('FileCanonicalRegistryAuthorityRepository', () => {
  it('persists a dynamic canonical Project and resolves it after repository recreation', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'conis-canonical-authority-'));
    const statePath = join(dir, 'canonical-registry-extras.json');

    try {
      const first = new FileCanonicalRegistryAuthorityRepository(statePath);

      const persisted = await first.upsertAuthorityBundle(partnerX());

      assert.deepEqual(persisted, {
        tenantId: 'tenant-x',
        companyId: 'company-x',
        workspaceId: 'workspace-x',
        projectId: 'project-x',
      });

      const recreated =
        new FileCanonicalRegistryAuthorityRepository(statePath);

      assert.deepEqual(
        await recreated.resolveProjectAuthority('project-x'),
        persisted,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('keeps DSE and AC Modular source seeds authoritative', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'conis-canonical-seeds-'));
    const statePath = join(dir, 'canonical-registry-extras.json');

    try {
      const repository =
        new FileCanonicalRegistryAuthorityRepository(statePath);

      const ac =
        await repository.resolveProjectAuthority(
          DEFAULT_CANONICAL_PROJECT_ID,
        );

      const dse =
        await repository.resolveProjectAuthority(
          DSE_CANONICAL_PROJECT_ID,
        );

      assert.equal(ac?.projectId, DEFAULT_CANONICAL_PROJECT_ID);
      assert.equal(ac?.companyId, 'ac-modular');

      assert.equal(dse?.projectId, DSE_CANONICAL_PROJECT_ID);
      assert.equal(dse?.companyId, 'company-domy-s-energii');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('does not recognize a browser-only Project absent from server persistence', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'conis-canonical-browser-'));
    const statePath = join(dir, 'canonical-registry-extras.json');

    try {
      const repository =
        new FileCanonicalRegistryAuthorityRepository(statePath);

      assert.equal(
        await repository.resolveProjectAuthority('project-browser-only'),
        null,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects Workspace ownership mismatch', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'conis-canonical-workspace-'));
    const statePath = join(dir, 'canonical-registry-extras.json');

    try {
      const repository =
        new FileCanonicalRegistryAuthorityRepository(statePath);

      const input = partnerX();

      await assert.rejects(
        repository.upsertAuthorityBundle({
          ...input,
          workspace: {
            ...input.workspace,
            companyId: 'company-foreign',
          },
        }),
        /Workspace does not belong to Company/,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects forged Project company ownership', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'conis-canonical-company-'));
    const statePath = join(dir, 'canonical-registry-extras.json');

    try {
      const repository =
        new FileCanonicalRegistryAuthorityRepository(statePath);

      const input = partnerX();

      await assert.rejects(
        repository.upsertAuthorityBundle({
          ...input,
          project: {
            ...input.project,
            companyId: 'company-foreign',
          },
        }),
        /Project does not belong to Company/,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects forged Project workspace ownership', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'conis-canonical-project-workspace-'));
    const statePath = join(dir, 'canonical-registry-extras.json');

    try {
      const repository =
        new FileCanonicalRegistryAuthorityRepository(statePath);

      const input = partnerX();

      await assert.rejects(
        repository.upsertAuthorityBundle({
          ...input,
          project: {
            ...input.project,
            workspaceId: 'workspace-foreign',
          },
        }),
        /Project does not belong to Workspace/,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects Project ownership reassignment', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'conis-canonical-collision-'));
    const statePath = join(dir, 'canonical-registry-extras.json');

    try {
      const repository =
        new FileCanonicalRegistryAuthorityRepository(statePath);

      await repository.upsertAuthorityBundle(partnerX());

      await assert.rejects(
        repository.upsertAuthorityBundle({
          tenant: {
            id: 'tenant-y',
            name: 'Tenant Y',
            companyId: 'company-y',
            pilot: false,
            createdAt: '2026-08-22T00:00:00.000Z',
          },
          company: {
            id: 'company-y',
            name: 'Company Y',
            tenantId: 'tenant-y',
          },
          workspace: {
            id: 'workspace-y',
            companyId: 'company-y',
            name: 'Workspace Y',
          },
          project: {
            id: 'project-x',
            companyId: 'company-y',
            workspaceId: 'workspace-y',
            name: 'Hijacked Project X',
            slug: 'project-x',
            description: 'Must be rejected.',
          },
        }),
        /Canonical Project ownership cannot be changed/,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
