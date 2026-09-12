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

  it('persists houses across repository instance recreation (restart durability)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'conis-house-durability-'));
    const statePath = join(dir, 'canonical-registry-extras.json');

    try {
      const repoA = new FileCanonicalRegistryAuthorityRepository(statePath);
      await repoA.upsertAuthorityBundle({
        tenant: { id: 'tenant-test', companyId: 'company-test', name: 'Test Tenant' },
        company: { id: 'company-test', tenantId: 'tenant-test', name: 'Test Company' },
        workspace: { id: 'workspace-test', companyId: 'company-test', name: 'Test Workspace' },
        project: { id: 'project-test', companyId: 'company-test', workspaceId: 'workspace-test', name: 'Test Project' },
      });
      await repoA.upsertHouseAuthority({
        id: 'house-durability-1',
        canonicalProjectId: 'project-test',
        name: 'DURABLE HOUSE 1',
        packageRoot: '/packages/durable-1',
        status: 'draft',
      });

      // Instance B nad stejným souborem (simulace restartu procesu)
      const repoB = new FileCanonicalRegistryAuthorityRepository(statePath);
      const snapshot = await repoB.readAuthoritySnapshot();

      const found = snapshot.houses.find((h) => h.id === 'house-durability-1');
      assert.ok(found !== undefined, 'House must exist after repository recreation');
      assert.equal(found?.canonicalProjectId, 'project-test');
      assert.equal(found?.name, 'DURABLE HOUSE 1');
      assert.equal(found?.packageRoot, '/packages/durable-1');
      assert.equal(found?.status, 'draft');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

});

it('archives and restores Project metadata durably without changing identity or Houses', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-project-edit-'));
  const path = join(dir, 'registry.json');
  try {
    const repo = new FileCanonicalRegistryAuthorityRepository(path);
    await repo.upsertAuthorityBundle(partnerX());
    const before = await repo.readAuthoritySnapshot();
    const input = {name: 'Nový název projektu', description: 'Popis', status: 'archived', metadata: 'Poznámka'};
    const updated = await repo.updateProjectMetadata('project-x', input);
    assert.equal(updated.status, 'archived');
    assert.equal(updated.name, input.name);
    assert.equal(updated.slug, partnerX().project.slug);
    assert.equal(updated.companyId, partnerX().project.companyId);
    const after = await new FileCanonicalRegistryAuthorityRepository(path).readAuthoritySnapshot();
    assert.equal(after.projects.find(x => x.id === 'project-x')!.status, 'archived');
    const {hydrateCanonicalRegistryFromAuthority, getCanonicalProject, resetCompanyRegistryExtras, applyDurableProjectConfigs} = await import('@embed-engine/platform-access');
    try {
      for (const privacyUrl of [null, 'https://example.com/privacy']) {
        resetCompanyRegistryExtras();
        applyDurableProjectConfigs([{projectId: 'project-x', privacyUrl}]);
        hydrateCanonicalRegistryFromAuthority(after);
        const dialogProject = getCanonicalProject('project-x')!.project;
        assert.equal(dialogProject.status, 'archived');
        assert.equal(dialogProject.name, input.name);
        assert.equal(dialogProject.metadata, input.metadata);
        assert.equal(dialogProject.privacyUrl, privacyUrl ?? undefined);
      }
    } finally { resetCompanyRegistryExtras(); }

    assert.deepEqual(after.houses, before.houses);
    assert.deepEqual(after.companies, before.companies);
    await repo.updateProjectMetadata('project-x', {...input, status: 'ready'});
    assert.equal((await repo.readAuthoritySnapshot()).projects.find(x => x.id === 'project-x')!.status, 'ready');
    await assert.rejects(repo.updateProjectMetadata('project-x', {...input, status: 'deleted'}));
    await assert.rejects(repo.updateProjectMetadata('project-x', {...input, name: ' '}));
    await assert.rejects(repo.updateProjectMetadata('missing', input));
  } finally { await rm(dir, {recursive: true, force: true}); }
});

it('metadata HTTP write requires admin and persists the same Project id', async () => {
  const {createPlatformApiServer} = await import('./index');
  const dir = await mkdtemp(join(tmpdir(), 'conis-project-http-'));
  const repo = new FileCanonicalRegistryAuthorityRepository(join(dir, 'registry.json'));
  await repo.upsertAuthorityBundle(partnerX());
  const sessions = {resolve: async (token: string) => token === 'admin'
    ? {user: {roles: ['conis-admin']}} : token === 'manager' ? {user: {roles: ['manager']}} : null};
  const server = createPlatformApiServer(undefined, undefined, undefined, undefined, undefined, sessions as never,
    undefined, undefined, undefined, undefined, undefined, undefined, undefined, repo);
  try {
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const url = `http://127.0.0.1:${address.port}/public/auth/canonical-project-authority`;
    const configResponse = await fetch(`http://127.0.0.1:${address.port}/public/projects/project-x/config`);
    assert.equal(configResponse.status, 200);
    assert.equal((await configResponse.json() as {projectId: string}).projectId, 'project-x');
    const missing = await fetch(`http://127.0.0.1:${address.port}/public/projects/missing/config`);
    assert.equal(missing.status, 404);
    const body = JSON.stringify({projectId: 'project-x', name: 'Projekt X upravený', description: '', status: 'archived', metadata: '', companyId: 'forged'});
    for (const [token, expected] of [['missing', 401], ['manager', 403], ['admin', 200]] as const) {
      const response = await fetch(url, {method: 'PATCH', body, headers: {'content-type': 'application/json', cookie: `__Host-conis_partner_session=${token}`}});
      assert.equal(response.status, expected);
    }
    const saved = (await repo.readAuthoritySnapshot()).projects.find(x => x.id === 'project-x')!;
    assert.equal(saved.status, 'archived');
    assert.equal(saved.companyId, 'company-x');
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
    await rm(dir, {recursive: true, force: true});
  }
});
