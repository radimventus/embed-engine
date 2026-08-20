import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { FileProjectConfigRepository } from './projectConfigRepository';

test('FileProjectConfigRepository upserts and reads privacyUrl', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-project-config-'));
  const statePath = join(dir, 'project-config.json');

  try {
    const repository = new FileProjectConfigRepository(statePath);
    const saved = await repository.upsert({
      projectId: 'project-domy-s-energii',
      privacyUrl: 'https://partner.example/privacy',
    });

    assert.equal(saved.projectId, 'project-domy-s-energii');
    assert.equal(saved.privacyUrl, 'https://partner.example/privacy');

    const readback = await repository.get('project-domy-s-energii');
    assert.deepEqual(readback, saved);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileProjectConfigRepository survives a fresh instance over the same state path', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-project-config-fresh-'));
  const statePath = join(dir, 'project-config.json');

  try {
    const first = new FileProjectConfigRepository(statePath);
    await first.upsert({
      projectId: 'project-a',
      privacyUrl: 'https://a.example/privacy',
    });

    const fresh = new FileProjectConfigRepository(statePath);
    const restored = await fresh.get('project-a');
    assert.equal(restored?.privacyUrl, 'https://a.example/privacy');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileProjectConfigRepository updates and clears privacyUrl', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-project-config-update-'));
  const statePath = join(dir, 'project-config.json');

  try {
    const repository = new FileProjectConfigRepository(statePath);
    await repository.upsert({
      projectId: 'project-a',
      privacyUrl: 'https://a.example/privacy',
    });
    const updated = await repository.upsert({
      projectId: 'project-a',
      privacyUrl: 'https://a.example/privacy-v2',
    });
    assert.equal(updated.privacyUrl, 'https://a.example/privacy-v2');

    const cleared = await repository.upsert({
      projectId: 'project-a',
      privacyUrl: '',
    });
    assert.equal(cleared.privacyUrl, null);
    assert.equal((await repository.get('project-a'))?.privacyUrl, null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileProjectConfigRepository rejects invalid privacy URLs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-project-config-invalid-'));
  const statePath = join(dir, 'project-config.json');

  try {
    const repository = new FileProjectConfigRepository(statePath);
    await assert.rejects(
      () =>
        repository.upsert({
          projectId: 'project-a',
          privacyUrl: 'http://insecure.example/privacy',
        }),
      /Invalid project privacy URL/,
    );
    await assert.rejects(
      () =>
        repository.upsert({
          projectId: 'project-a',
          privacyUrl: '/relative',
        }),
      /Invalid project privacy URL/,
    );
    await assert.rejects(
      () =>
        repository.upsert({
          projectId: 'project-a',
          privacyUrl: 'javascript:alert(1)',
        }),
      /Invalid project privacy URL/,
    );
    await assert.rejects(
      () =>
        repository.upsert({
          projectId: '',
          privacyUrl: 'https://ok.example/privacy',
        }),
      /Invalid project configuration/,
    );
    assert.equal(await repository.get('project-a'), null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileProjectConfigRepository ignores invalid persisted records', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-project-config-corrupt-'));
  const statePath = join(dir, 'project-config.json');

  try {
    await writeFile(
      statePath,
      JSON.stringify({
        projects: [
          { projectId: 'project-a', privacyUrl: 'http://bad.example' },
          { projectId: 'project-b', privacyUrl: 'https://good.example/privacy' },
        ],
      }),
    );
    const repository = new FileProjectConfigRepository(statePath);
    assert.equal(await repository.get('project-a'), null);
    assert.equal(
      (await repository.get('project-b'))?.privacyUrl,
      'https://good.example/privacy',
    );
    const raw = await readFile(statePath, 'utf8');
    assert.match(raw, /project-b/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileProjectConfigRepository does not store Company identity', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-project-config-identity-'));
  const statePath = join(dir, 'project-config.json');

  try {
    const repository = new FileProjectConfigRepository(statePath);
    await repository.upsert({
      projectId: 'project-domy-s-energii',
      privacyUrl: 'https://dse.example/privacy',
    });
    const raw = JSON.parse(await readFile(statePath, 'utf8')) as {
      projects: readonly Record<string, unknown>[];
    };
    assert.equal(raw.projects.length, 1);
    assert.deepEqual(Object.keys(raw.projects[0] ?? {}).sort(), [
      'privacyUrl',
      'projectId',
    ]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
