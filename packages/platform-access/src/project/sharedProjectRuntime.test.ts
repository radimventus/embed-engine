/**
 * PT-PDM-02 — Shared Project Runtime unit tests.
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';

import {
  resetCompanyRegistryExtras,
  DEFAULT_PROJECT_ID,
} from '../registry/companyRegistry';
import { packageRootToPublicUrl } from './packagePublicUrl';
import {
  deleteSharedProject,
  getSharedProject,
  listPublishedProjects,
  publishSharedProject,
  resetSharedProjectManifestsForTests,
  syncBuilderWorkspaceHouse,
  upsertBuilderSharedProject,
} from './projectRepository';
import { openProject, resolveActiveProjectView } from './projectRuntime';

describe('PT-PDM-02 Shared Project Runtime', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('maps packageRoot to public URL', () => {
    assert.equal(
      packageRootToPublicUrl('apps/client-studio/public/house-package'),
      '/house-package',
    );
    assert.equal(
      packageRootToPublicUrl(
        'apps/client-studio/public/house-packages/family-98',
      ),
      '/house-packages/family-98',
    );
  });

  it('lists published projects from Shared Repository', () => {
    const published = listPublishedProjects();
    assert.ok(published.length >= 3);
    assert.ok(published.every((project) => project.status === 'published'));
    assert.ok(published.every((project) => project.authorStudio === 'builder'));
    assert.ok(published.some((project) => project.id === DEFAULT_PROJECT_ID));
  });

  it('openProject returns runtime view with packagePublicRoot', () => {
    const view = openProject('villa-168');
    assert.ok(view);
    assert.equal(view.project.id, 'villa-168');
    assert.equal(view.packagePublicRoot, '/house-package');
    assert.equal(view.isPublished, true);
  });

  it('Builder upsert + publish is the sole authoring path', () => {
    const created = upsertBuilderSharedProject({
      id: 'builder-new-house',
      companyId: 'ac-modular',
      workspaceId: 'ac-modular-main',
      name: 'New House',
      packageRoot: 'apps/client-studio/public/house-package',
      status: 'draft',
      slug: 'builder-new-house',
      objectType: 'villa',
      description: 'Authored in Builder',
      logoLabel: 'Logo',
      heroLabel: 'Hero',
    });
    assert.equal(created.status, 'draft');
    assert.equal(
      listPublishedProjects().some((item) => item.id === 'builder-new-house'),
      false,
    );

    const published = publishSharedProject('builder-new-house');
    assert.ok(published);
    assert.equal(published.status, 'published');
    assert.ok(
      listPublishedProjects().some((item) => item.id === 'builder-new-house'),
    );

    assert.equal(deleteSharedProject('builder-new-house'), true);
    assert.equal(getSharedProject('builder-new-house'), null);
  });

  it('syncBuilderWorkspaceHouse writes Shared Repository', () => {
    const synced = syncBuilderWorkspaceHouse({
      id: 'synced-house',
      name: 'Synced',
      packageRoot: 'apps/client-studio/public/house-packages/harmony-124',
      companyId: 'ac-modular',
      status: 'ready',
      slug: 'synced-house',
      objectType: 'harmony',
      description: '',
    });
    assert.equal(synced.id, 'synced-house');
    assert.equal(getSharedProject('synced-house')?.name, 'Synced');
  });

  it('resolveActiveProjectView falls back to published default', () => {
    const view = resolveActiveProjectView(null);
    assert.ok(view);
    assert.equal(view.isPublished, true);
  });
});
