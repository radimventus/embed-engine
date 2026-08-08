/**
 * PT-PLAT-01 — Canonical Registry: seed status lock + published merge.
 */

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { listPublishedProjects } from '../project/projectRepository';
import { DEFAULT_PROJECTS } from './defaults';
import {
  getDefaultCompanyRegistry,
  isSeedProjectId,
  mergeProjects,
  resetCompanyRegistryExtras,
  setBuilderProjectStatus,
  upsertBuilderProject,
} from './companyRegistry';

describe('PT-PLAT-01 Canonical Registry', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
  });

  it('documents read order: defaults → extras → merge → published filter', () => {
    const merged = mergeProjects(DEFAULT_PROJECTS, []);
    assert.equal(merged.length, DEFAULT_PROJECTS.length);
    const published = listPublishedProjects();
    assert.ok(published.length >= DEFAULT_PROJECTS.length);
    assert.ok(published.every((project) => project.status === 'published'));
  });

  it('extras may patch seed metadata but never seed status', () => {
    upsertBuilderProject({
      id: 'villa-168',
      workspaceId: 'ac-modular-main',
      companyId: 'ac-modular',
      name: 'Villa 168 Relabel',
      packageRoot: 'apps/client-studio/public/house-package',
      status: 'draft',
      slug: 'villa-168',
      objectType: 'villa',
      description: 'Patched description',
    });

    const registry = getDefaultCompanyRegistry();
    const villa = registry.projects.find((item) => item.id === 'villa-168');
    assert.ok(villa);
    assert.equal(villa.status, 'published');
    assert.equal(villa.name, 'Villa 168 Relabel');
    assert.equal(villa.description, 'Patched description');

    const published = listPublishedProjects();
    assert.ok(published.some((item) => item.id === 'villa-168'));
    assert.ok(published.some((item) => item.id === 'harmony-124'));
    assert.ok(published.some((item) => item.id === 'family-98'));
  });

  it('mergeProjects keeps published defaults + published extras', () => {
    const merged = mergeProjects(DEFAULT_PROJECTS, [
      {
        id: 'villa-168',
        workspaceId: 'ac-modular-main',
        companyId: 'ac-modular',
        name: 'Override name',
        packageRoot: 'apps/client-studio/public/house-package',
        status: 'archived',
        slug: 'villa-168',
        objectType: 'villa',
        description: '',
      },
      {
        id: 'builder-extra-house',
        workspaceId: 'ac-modular-main',
        companyId: 'ac-modular',
        name: 'Extra Draft',
        packageRoot: 'apps/client-studio/public/house-package',
        status: 'draft',
        slug: 'builder-extra-house',
        objectType: 'villa',
        description: '',
      },
      {
        id: 'builder-published-house',
        workspaceId: 'ac-modular-main',
        companyId: 'ac-modular',
        name: 'Extra Published',
        packageRoot: 'apps/client-studio/public/house-package',
        status: 'published',
        slug: 'builder-published-house',
        objectType: 'villa',
        description: '',
      },
    ]);

    assert.equal(
      merged.find((item) => item.id === 'villa-168')?.status,
      'published',
    );
    assert.equal(
      merged.find((item) => item.id === 'villa-168')?.name,
      'Override name',
    );
    assert.equal(
      merged.find((item) => item.id === 'builder-extra-house')?.status,
      'draft',
    );
    assert.equal(
      merged.find((item) => item.id === 'builder-published-house')?.status,
      'published',
    );

    upsertBuilderProject(merged.find((item) => item.id === 'builder-extra-house')!);
    upsertBuilderProject(
      merged.find((item) => item.id === 'builder-published-house')!,
    );
    upsertBuilderProject(merged.find((item) => item.id === 'villa-168')!);

    const publishedIds = listPublishedProjects().map((item) => item.id);
    assert.ok(publishedIds.includes('villa-168'));
    assert.ok(publishedIds.includes('harmony-124'));
    assert.ok(publishedIds.includes('family-98'));
    assert.ok(publishedIds.includes('builder-published-house'));
    assert.equal(publishedIds.includes('builder-extra-house'), false);
  });

  it('setBuilderProjectStatus cannot demote seed projects', () => {
    assert.equal(isSeedProjectId('villa-168'), true);
    const after = setBuilderProjectStatus('villa-168', 'draft');
    assert.ok(after);
    assert.equal(
      after.projects.find((item) => item.id === 'villa-168')?.status,
      'published',
    );
    assert.ok(listPublishedProjects().some((item) => item.id === 'villa-168'));
  });

  it('explicit publish workflow still works for non-seed extras', () => {
    upsertBuilderProject({
      id: 'plat01-new-house',
      workspaceId: 'ac-modular-main',
      companyId: 'ac-modular',
      name: 'New',
      packageRoot: 'apps/client-studio/public/house-package',
      status: 'draft',
      slug: 'plat01-new-house',
      objectType: 'villa',
      description: '',
    });
    assert.equal(
      listPublishedProjects().some((item) => item.id === 'plat01-new-house'),
      false,
    );
    setBuilderProjectStatus('plat01-new-house', 'published');
    assert.ok(
      listPublishedProjects().some((item) => item.id === 'plat01-new-house'),
    );
  });
});
